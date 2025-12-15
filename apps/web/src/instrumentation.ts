import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'lecopro-web',
    attributes: {
      'deployment.environment': process.env.NODE_ENV || 'development',
    },
  });
}
