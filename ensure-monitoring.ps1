# QueueLess Monitoring Link Automation
$HostIP = (Get-NetIPAddress -InterfaceAlias "*Ethernet*", "*Wi-Fi*" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "169.*" -and $_.IPAddress -notlike "172.24.*" } | Select-Object -ExpandProperty IPAddress -First 1)

if (-not $HostIP) {
    $HostIP = "192.168.2.129"
}

Write-Host "Detected Host IP: $HostIP" -ForegroundColor Cyan
wsl -d docker-desktop -u root /bin/sh /mnt/host/c/Users/ashki/Desktop/ASDND-MPR/monitoring/link-prom.sh $HostIP
