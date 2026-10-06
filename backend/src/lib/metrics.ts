import promClient from 'prom-client';

promClient.collectDefaultMetrics();

export const metrics = promClient;
