import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

// Only initialize if endpoint is configured
const isOtelEnabled = !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (isOtelEnabled) {
  const traceExporter = new OTLPTraceExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  });

  const sdk = new NodeSDK({
    serviceName: 'lecopro-api',
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Instrument HTTP requests (incoming & outgoing)
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        // Instrument Express/NestJS
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
        // Instrument PostgreSQL queries
        '@opentelemetry/instrumentation-pg': {
          enabled: true,
        },
        // Disable noisy instrumentations
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OTEL SDK shut down successfully'))
      .catch((error) => console.error('Error shutting down OTEL SDK', error))
      .finally(() => process.exit(0));
  });

  console.log('OpenTelemetry tracing initialized - sending to:', OTEL_EXPORTER_OTLP_ENDPOINT);
}

export {};
