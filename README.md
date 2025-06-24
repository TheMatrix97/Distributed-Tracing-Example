# Distributed Tracing Example

This repository contains the base code to implement Tracing observability with `OpenTelemetry`

Check the Grafana guide for more info:
(https://grafana.com/blog/2021/09/23/intro-to-distributed-tracing-with-tempo-opentelemetry-and-grafana-cloud/)

## Load testing

Run the load test with k6 and Docker:

```bash
docker run -it --rm -v $PWD/obs/load_test.js:/scripts/load_test.js --network kennels_net  grafana/k6:latest run /scripts/load_test.js
```