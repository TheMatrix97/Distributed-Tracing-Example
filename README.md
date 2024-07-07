# Distributed Tracing Example

This repository contains the base code to implement Tracing observability with `OpenTelemetry`

Check the Grafana guide for more info:
(https://grafana.com/blog/2021/09/23/intro-to-distributed-tracing-with-tempo-opentelemetry-and-grafana-cloud/)

## Solution

```bash
# Install the Library Otel autoinstrumentation

cd ./services/dogs/ && npm install --save @opentelemetry/api  @opentelemetry/auto-instrumentations-node && rm -rf node_modules

cd ../inventory && npm install --save @opentelemetry/api  @opentelemetry/auto-instrumentations-node && rm -rf node_modules

cd ../kennels && npm install --save @opentelemetry/api  @opentelemetry/auto-instrumentations-node && rm -rf node_modules

# Add environment variables in docker-compose.yml to send the traces to the collector

# Modify the Package.json to use the auto-instrumentation library

sed -i 's/node src\/index.js/node --require @opentelemetry\/auto-instrumentations-node\/register src\/index.js/' ./services/dogs/package.json

sed -i 's/node src\/index.js/node --require @opentelemetry\/auto-instrumentations-node\/register src\/index.js/' ./services/inventory/package.json

sed -i 's/node src\/index.js/node --require @opentelemetry\/auto-instrumentations-node\/register src\/index.js/' ./services/kennels/package.json
```

```yaml
# Add the following environment variables on each microservice container. Don't forget to replace the service name
environment:
- OTEL_SERVICE_NAME=<NAME_SERVICE>
- OTEL_TRACES_EXPORTER=otlp
- OTEL_EXPORTER_OTLP_ENDPOINT=collector:4317
- OTEL_NODE_RESOURCE_DETECTORS=env,host,os
- OTEL_EXPORTER_OTLP_PROTOCOL=grpc 
- OTEL_EXPORTER_OTLP_INSECURE=true
```

* Recreate the containers

```bash
docker compose up -d --force-recreate --build
```