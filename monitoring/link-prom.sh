#!/bin/sh
# Auto-link script for Prometheus in Docker to Windows host
HOST_IP=$1
if [ -z "$HOST_IP" ]; then
    HOST_IP="192.168.2.129"
fi

PROM_PID=$(pgrep -f "bin/prometheus" | head -n 1)
DOCKERD_PID=$(pgrep -f "dockerd" | head -n 1)

if [ -z "$PROM_PID" ]; then
    echo "Prometheus is not running."
    exit 1
fi

echo "Prometheus PID: $PROM_PID"
echo "Dockerd PID: $DOCKERD_PID"

# Ensure veth pair exists
if ! ip link show veth-wsl >/dev/null 2>&1; then
    chroot /proc/$DOCKERD_PID/root /sbin/ip link add veth-wsl type veth peer name veth-prom
    chroot /proc/$DOCKERD_PID/root /sbin/ip link set dev veth-prom netns $PROM_PID
    ip addr add 10.200.0.1/24 dev veth-wsl
    ip link set dev veth-wsl up
    nsenter -t $PROM_PID -n ip addr add 10.200.0.2/24 dev veth-prom
    nsenter -t $PROM_PID -n ip link set dev veth-prom up
fi

sysctl -w net.ipv4.ip_forward=1 >/dev/null

# Clean & set NAT
chroot /proc/$DOCKERD_PID/root /sbin/iptables -t nat -F PREROUTING
chroot /proc/$DOCKERD_PID/root /sbin/iptables -t nat -F POSTROUTING
chroot /proc/$DOCKERD_PID/root /sbin/iptables -t nat -A PREROUTING -i veth-wsl -p tcp --dport 3000 -j DNAT --to-destination $HOST_IP:3000
chroot /proc/$DOCKERD_PID/root /sbin/iptables -t nat -A POSTROUTING -o eth0 -p tcp --dport 3000 -j MASQUERADE

# Update /etc/hosts in Prometheus
if ! grep -q "10.200.0.1 host.docker.internal" /proc/$PROM_PID/root/etc/hosts; then
    echo "10.200.0.1 host.docker.internal backend" >> /proc/$PROM_PID/root/etc/hosts
fi

kill -HUP $PROM_PID
echo "SUCCESS: Prometheus connected to $HOST_IP:3000"
