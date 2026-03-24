# Debugging & Troubleshooting Technical Capabilities Reference

> Sources:
> - `sample/error-diagnostics/agents/error-detective.md`
> - `sample/debugging-toolkit/agents/debugger.md`
> - `sample/distributed-debugging/agents/` (various)

## Error Analysis

### Log Analysis
- **Pattern extraction**: Regex for error messages, stack traces
- **Timeline reconstruction**: Correlate errors with events
- **Anomaly detection**: Spike identification, baseline deviation
- **Tools**: Elasticsearch, Splunk, Loki, CloudWatch Logs

### Stack Trace Analysis
| Language | Key Patterns |
|----------|--------------|
| JavaScript | async traces, Promise rejection |
| Python | traceback, exception chaining |
| Java | cause chains, thread dumps |
| Go | goroutine stacks, panic recovery |
| Rust | backtrace, panic info |

### Error Correlation
- Cross-service error tracking
- Deployment correlation (errors after releases)
- Cascading failure identification
- Error rate change detection

## Debugging Process

### Systematic Approach
1. **Capture**: Error message, stack trace, reproduction steps
2. **Isolate**: Identify failure location
3. **Hypothesize**: Form theories about root cause
4. **Test**: Validate hypotheses with evidence
5. **Fix**: Implement minimal fix
6. **Verify**: Confirm solution works
7. **Prevent**: Add tests, monitoring

### Evidence Collection
- Error logs with timestamps
- Request/response traces
- Database query logs
- Network traces
- Memory/CPU profiles

## Distributed System Debugging

### Tracing
| Tool | Use Case |
|------|----------|
| Jaeger | Distributed tracing |
| Zipkin | Request flow visualization |
| OpenTelemetry | Standardized instrumentation |
| X-Ray | AWS service tracing |

### Common Issues
- Network partitions
- Race conditions
- Deadlocks
- Memory leaks
- Connection pool exhaustion
- Database contention

### Debugging Techniques
- Correlation IDs across services
- Request replay
- Traffic shadowing
- Canary comparison
- A/B debugging

## Database Debugging

### Query Analysis
- EXPLAIN plans
- Slow query logs
- Lock contention detection
- Connection pool monitoring

### Common Issues
- N+1 queries
- Missing indexes
- Lock escalation
- Deadlocks
- Connection exhaustion

## Frontend Debugging

### Browser DevTools
- Console errors
- Network waterfall
- Performance timeline
- Memory snapshots

### Common Issues
- JavaScript errors
- Layout thrashing
- Memory leaks
- Render blocking resources

## Backend Debugging

### Server-Side
- Application logs
- Process monitoring
- Thread/goroutine analysis
- Memory profiling

### API Issues
- Request validation failures
- Authentication errors
- Rate limiting
- Timeout configuration

## Production Debugging

### Safe Practices
- Read-only investigation first
- Feature flags for fixes
- Staged rollouts
- Rollback readiness

### Tools
| Category | Tools |
|----------|-------|
| APM | DataDog, New Relic, Dynatrace |
| Logging | ELK, Loki, Splunk |
| Tracing | Jaeger, Zipkin, X-Ray |
| Profiling | Pyroscope, async-profiler |

## Root Cause Analysis

### 5 Whys Technique
- Ask "why" repeatedly to find root cause
- Document findings
- Identify systemic issues

### Fishbone Diagram
- Categories: People, Process, Technology, Environment
- Identify contributing factors
- Prioritize investigation areas

### Post-Incident Review
- Timeline reconstruction
- Contributing factors
- Action items
- Prevention measures

## Prevention Strategies

### Monitoring
- Error rate alerting
- Latency monitoring
- Resource utilization
- Custom business metrics

### Testing
- Chaos engineering
- Load testing
- Failure injection
- Integration testing

### Code Quality
- Static analysis
- Code review
- Type safety
- Defensive programming

## Error Handling Patterns

### Best Practices
- Specific exception types
- Meaningful error messages
- Error context preservation
- Graceful degradation

### Anti-Patterns
- Silent failures
- Generic catch-all
- Swallowed exceptions
- Unhelpful messages

## Debugging Resources

### Documentation
- Runbooks for common issues
- Architecture diagrams
- Dependency maps
- Service health dashboards

### Automation
- Automated log analysis
- Alert correlation
- Self-healing systems
- Auto-remediation scripts
