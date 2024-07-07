# Distributed Tracing Example

This repository contains the base code to implement Tracing observability with `OpenTelemetry`

Check the Grafana guide for more info:
(https://grafana.com/blog/2021/09/23/intro-to-distributed-tracing-with-tempo-opentelemetry-and-grafana-cloud/)


## Obs base stack

```yaml
name: kennels_stack
volumes:
  grafana_data: {}
  tempo_data: {}

networks:
  kennels_net:
    external: true

services:  
  collector: # Exposes 4317 (grpc) and 4318 (http)
    image: otel/opentelemetry-collector:latest
    command: '--config /etc/otel-config.yaml'
    volumes:
      - ./obs/otel-config.yaml:/etc/otel-config.yaml
    networks:
      - kennels_net
  grafana:
    image: grafana/grafana:10.4.2
    restart: unless-stopped
    ports:
      - 3000:3000
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_DISABLE_LOGIN_FORM=true
      - GF_FEATURE_TOGGLES_ENABLE=traceqlEditor traceQLStreaming metricsSummary
    networks:
      - kennels_net
  
  tempo:
    image: grafana/tempo:latest
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./obs/tempo.yaml:/etc/tempo.yaml
      - tempo_data:/var/tempo
    ports:
      - "14268:14268"  # jaeger ingest
      - "3200:3200"   # tempo
      - "9095:9095" # tempo grpc
      - "4317:4317"  # otlp grpc
      - "4318:4318"  # otlp http
      - "9411:9411"   # zipkin
    networks:
      - kennels_net
  prometheus:
    image: prom/prometheus:v2.34.0
    restart: unless-stopped
    volumes:
      - ./obs/prometheus.yaml:/etc/prometheus/prometheus.yaml
    ports:
      - "9090:9090"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--enable-feature=remote-write-receiver"
    networks:
      - kennels_net
```

## Add the configs

```bash
sudo rm -rf obs && mkdir obs
```
`otel-config`

```bash
cat << EOF > obs/otel-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
  otlphttp:
    endpoint: http://tempo:4318
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp, debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
EOF
```
`tempo.yaml`

```bash
cat << EOF > obs/tempo.yaml
stream_over_http_enabled: true
server:
  http_listen_port: 3200
  log_level: info

query_frontend:
  search:
    duration_slo: 5s
    throughput_bytes_slo: 1.073741824e+09
  trace_by_id:
    duration_slo: 5s

distributor:
  receivers:                           # this configuration will listen on all ports and protocols that tempo is capable of.
    jaeger:                            # the receives all come from the OpenTelemetry collector.  more configuration information can
      protocols:                       # be found there: https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver
        thrift_http:                   #
        grpc:                          # for a production deployment you should only enable the receivers you need!
        thrift_binary:
        thrift_compact:
    zipkin:
    otlp:
      protocols:
        http:
        grpc:
    opencensus:

ingester:
  max_block_duration: 5m               # cut the headblock when this much time passes. this is being set for demo purposes and should probably be left alone normally

compactor:
  compaction:
    block_retention: 1h                # overall Tempo trace retention. set for demo purposes

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: docker-compose
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://prometheus:9090/api/v1/write
        send_exemplars: true
  traces_storage:
    path: /var/tempo/generator/traces

storage:
  trace:
    backend: local                     # backend configuration to use
    wal:
      path: /var/tempo/wal             # where to store the the wal locally
    local:
      path: /var/tempo/blocks

overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics, local-blocks] # enables metrics generator
EOF
```
`prometheus.yaml`

```bash
cat << EOF > obs/prometheus.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"

    static_configs:
      - targets: ["localhost:9090"]
EOF
```