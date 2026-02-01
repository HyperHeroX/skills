# Performance Engineering Technical Capabilities Reference

> Source: `sample/performance-testing-review/agents/performance-engineer.md`

## Modern Observability

### Distributed Tracing
- **OpenTelemetry**: Cross-service correlation, trace context propagation
- **APM platforms**: DataDog, New Relic, Dynatrace, Honeycomb, Jaeger
- **Log correlation**: Structured logging, distributed log tracing

### Metrics & Monitoring
- **Time-series**: Prometheus, InfluxDB, Grafana
- **SLI/SLO tracking**: Service level indicators and objectives
- **Alerting**: Anomaly detection, proactive alerts

### Real User Monitoring (RUM)
- User experience tracking
- Core Web Vitals monitoring
- Session replay and heatmaps

## Application Profiling

### CPU Profiling
- Flame graphs
- Call stack analysis
- Hotspot identification

### Memory Profiling
- Heap analysis
- Garbage collection tuning
- Memory leak detection

### Language-Specific Profiling
| Language | Tools |
|----------|-------|
| JVM | JProfiler, VisualVM, async-profiler |
| Python | cProfile, memory_profiler, py-spy |
| Node.js | v8-profiler, clinic.js |
| Go | pprof, go tool trace |
| Rust | cargo-flamegraph, perf |

### Cloud Profiling
- AWS X-Ray
- Azure Application Insights
- GCP Cloud Profiler

## Load Testing

### Testing Tools
| Tool | Best For |
|------|----------|
| k6 | Modern, scriptable, CI/CD integration |
| JMeter | Traditional, GUI-based, extensive plugins |
| Gatling | Scala DSL, detailed reports |
| Locust | Python-based, distributed |
| Artillery | YAML config, easy setup |

### Testing Patterns
- **API testing**: REST, GraphQL, WebSocket
- **Browser testing**: Puppeteer, Playwright
- **Chaos engineering**: Chaos Monkey, Gremlin
- **Scalability testing**: Breaking point analysis

### Performance Gates
- Automated pass/fail criteria
- CI/CD integration
- Regression detection
- Baseline management

## Multi-Tier Caching

### Application Layer
- In-memory caching
- Computed value caching
- Session caching

### Distributed Cache
| Solution | Use Case |
|----------|----------|
| Redis | General purpose, pub/sub |
| Memcached | Simple key-value |
| Hazelcast | In-memory data grid |

### CDN & Edge
- CloudFlare, CloudFront, Azure CDN
- Edge caching strategies
- Cache invalidation patterns

### Browser Caching
- HTTP cache headers
- Service workers
- Offline-first strategies

## Frontend Optimization

### Core Web Vitals
| Metric | Target | Optimization |
|--------|--------|--------------|
| LCP | <2.5s | Critical resource loading |
| FID | <100ms | JavaScript optimization |
| CLS | <0.1 | Layout stability |

### Resource Optimization
- Image optimization (WebP, AVIF)
- Lazy loading
- Critical CSS extraction
- Code splitting

### Network Optimization
- HTTP/2, HTTP/3
- Resource hints (preload, prefetch)
- Bundle optimization

## Backend Optimization

### API Performance
- Response time optimization
- Efficient pagination
- Bulk operations
- Response compression

### Database Performance
| Area | Techniques |
|------|------------|
| Queries | Index optimization, query rewriting |
| Connections | Connection pooling, prepared statements |
| Caching | Query result caching, read replicas |
| Batch | Bulk inserts, batch processing |

### Concurrency
- Thread pool tuning
- Async/await patterns
- Resource locking strategies

## Distributed System Performance

### Service Mesh
- Istio, Linkerd performance tuning
- Traffic management
- Circuit breakers

### Message Queues
- Kafka optimization
- RabbitMQ tuning
- Throughput vs latency tradeoffs

### Load Balancing
- Traffic distribution strategies
- Health checks
- Failover optimization

## Cloud Optimization

### Auto-Scaling
- Horizontal Pod Autoscaler (HPA)
- Vertical Pod Autoscaler (VPA)
- Cluster autoscaling policies

### Serverless
- Cold start optimization
- Memory allocation tuning
- Concurrent execution limits

### Cost-Performance Balance
- Right-sizing instances
- Reserved capacity planning
- Spot/preemptible instances

## Performance Analytics

### Business Impact
- Performance-revenue correlation
- Conversion optimization
- User journey analysis

### Performance Budgets
- Resource budgets
- Timing budgets
- Metric tracking

### Competitive Analysis
- Industry benchmarking
- Performance comparison

## Testing Strategy

### Continuous Performance
- Automated regression testing
- Trend analysis
- Baseline comparisons

### Production Profiling
- Continuous profiling
- A/B performance testing
- Feature flag impact

### Capacity Planning
- Load testing automation
- Scaling validation
- Breaking point identification
