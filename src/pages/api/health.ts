import type { NextApiRequest, NextApiResponse } from 'next';

type HealthStatus = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    server: 'operational';
  };
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    services: {
      server: 'operational',
    },
  };

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.status(200).json(status);
}

