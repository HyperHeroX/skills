# Backend Engineer Technical Capabilities Reference

> Source: Adapted from `sample/backend-development/agents/backend-architect.md`

## API Design & Patterns

- **RESTful APIs**: Resource modeling, HTTP methods, status codes, versioning strategies
- **GraphQL APIs**: Schema design, resolvers, mutations, subscriptions, DataLoader patterns
- **gRPC Services**: Protocol Buffers, streaming patterns (unary, server, client, bidirectional)
- **WebSocket APIs**: Real-time communication, connection management, scaling patterns
- **API versioning**: URL versioning, header versioning, content negotiation, deprecation strategies
- **Pagination strategies**: Offset, cursor-based, keyset pagination
- **Batch operations**: Bulk endpoints, batch mutations, transaction handling

## Authentication & Authorization

- **OAuth 2.0**: Authorization flows, grant types, token management
- **OpenID Connect**: Authentication layer, ID tokens, user info endpoint
- **JWT**: Token structure, claims, signing, validation, refresh tokens
- **API keys**: Key generation, rotation, rate limiting, quotas
- **RBAC**: Role-based access control, permission models, hierarchies
- **Session management**: Session storage, distributed sessions, session security

## Security Patterns

- **Input validation**: Schema validation, sanitization, allowlisting
- **Rate limiting**: Token bucket, leaky bucket, sliding window, distributed rate limiting
- **CORS**: Cross-origin policies, preflight requests, credential handling
- **CSRF protection**: Token-based, SameSite cookies, double-submit patterns
- **SQL injection prevention**: Parameterized queries, ORM usage, input validation
- **Secrets management**: Vault, AWS Secrets Manager, environment variables

## Resilience & Fault Tolerance

- **Circuit breaker**: Hystrix, resilience4j, failure detection, state management
- **Retry patterns**: Exponential backoff, jitter, retry budgets, idempotency
- **Timeout management**: Request timeouts, connection timeouts, deadline propagation
- **Bulkhead pattern**: Resource isolation, thread pools, connection pools
- **Health checks**: Liveness, readiness, startup probes, deep health checks
- **Idempotency**: Idempotent operations, duplicate detection, request IDs

## Observability & Monitoring

- **Logging**: Structured logging, log levels, correlation IDs, log aggregation
- **Metrics**: Application metrics, RED metrics (Rate, Errors, Duration), custom metrics
- **Tracing**: Distributed tracing, OpenTelemetry, Jaeger, Zipkin, trace context
- **Performance monitoring**: Response times, throughput, error rates, SLIs/SLOs
- **Alerting**: Threshold-based, anomaly detection, alert routing

## Data Integration Patterns

- **Data access layer**: Repository pattern, DAO pattern, unit of work
- **ORM integration**: Entity Framework, SQLAlchemy, Prisma, TypeORM
- **Database transaction management**: ACID, distributed transactions, sagas
- **Connection pooling**: Pool sizing, connection lifecycle
- **Data consistency**: Strong vs eventual consistency, CAP theorem trade-offs

## Caching Strategies

- **Cache layers**: Application cache, API cache, CDN cache
- **Cache technologies**: Redis, Memcached, in-memory caching
- **Cache patterns**: Cache-aside, read-through, write-through, write-behind
- **Cache invalidation**: TTL, event-driven invalidation, cache tags

## Performance Optimization

- **Query optimization**: N+1 prevention, batch loading, DataLoader pattern
- **Connection pooling**: Database connections, HTTP clients, resource management
- **Async operations**: Non-blocking I/O, async/await, parallel processing
- **Response compression**: gzip, Brotli, compression strategies

## Testing Strategies

- **Unit testing**: Service logic, business rules, edge cases
- **Integration testing**: API endpoints, database integration, external services
- **Contract testing**: API contracts, consumer-driven contracts, schema validation
- **Load testing**: Performance testing, stress testing, capacity planning
- **Security testing**: Penetration testing, vulnerability scanning, OWASP Top 10

## API Documentation & Developer Experience

- **OpenAPI 3.1+**: Specification authoring, contract-driven development
- **AsyncAPI**: Event-driven and real-time API documentation
- **Interactive docs**: Swagger UI, Redoc, Stoplight Studio
- **SDK generation**: Multi-language client libraries, Postman collections
- **Authentication docs**: OAuth 2.0/OIDC flows, API key management, JWT handling
- **Developer portals**: Information architecture, onboarding, analytics
- **Version management**: Migration guides, deprecation notices, changelogs

## Threat Modeling & Security Design

- **STRIDE analysis**: Threat identification per component
- **Attack tree construction**: Critical path analysis
- **Data flow diagram analysis**: Trust boundaries, entry points
- **Security requirement extraction**: From threats to requirements
- **Risk prioritization**: CVSS scoring, business impact assessment
- **Mitigation strategy design**: Control mapping, defense in depth
