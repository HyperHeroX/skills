# API Design Technical Capabilities Reference

> Source: `sample/api-scaffolding/agents/graphql-architect.md`

## GraphQL Architecture

### Federation & Schema
- **Apollo Federation v2**: Subgraph design
- **GraphQL Fusion**: Composite schemas
- **Schema composition**: Gateway configuration
- **Schema registry**: Governance and versioning

### Schema Design
- Schema-first development (SDL)
- Interface and union types
- Relay specification compliance
- Connection patterns (pagination)
- Custom scalar types
- Input validation

### Performance
| Technique | Purpose |
|-----------|---------|
| DataLoader | N+1 query resolution |
| APQ | Automatic persisted queries |
| Response caching | Field/query level |
| Complexity analysis | Query cost limiting |
| Batching | Request deduplication |

### Security
- Field-level authorization
- JWT validation
- RBAC implementation
- Rate limiting
- Introspection security
- CORS configuration

### Real-Time
- WebSocket subscriptions
- Server-Sent Events
- Live queries
- Event-driven integration
- Subscription filtering

### Tooling
| Tool | Purpose |
|------|---------|
| Apollo Server | GraphQL server |
| Apollo Studio | Management |
| Pothos/Nexus | Schema builders |
| Prisma | Database integration |
| Hasura | Database-first |
| GraphQL Code Generator | Type generation |

---

## REST API Design

### RESTful Principles
- Resource-oriented design
- HTTP method semantics
- Status code usage
- HATEOAS (hypermedia)

### Best Practices
- Versioning (URL, header, query)
- Pagination (cursor, offset)
- Filtering and sorting
- Field selection (sparse fieldsets)
- Bulk operations

### Documentation
- OpenAPI/Swagger specification
- API Blueprint
- Postman collections
- Interactive documentation

### Error Handling
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {"field": "email", "message": "Invalid format"}
    ]
  }
}
```

---

## gRPC

### Protocol Buffers
- Message definition
- Service contracts
- Code generation
- Versioning strategies

### Features
- Streaming (unary, server, client, bidirectional)
- Metadata headers
- Deadline propagation
- Load balancing

### Performance
- Binary serialization
- HTTP/2 multiplexing
- Connection pooling
- Compression

---

## API Security

### Authentication
| Method | Use Case |
|--------|----------|
| JWT | Stateless auth |
| OAuth 2.0 | Third-party access |
| API Keys | Simple integration |
| mTLS | Service-to-service |

### Authorization
- RBAC (Role-based access)
- ABAC (Attribute-based)
- Scopes and permissions
- Field-level security

### Protection
- Rate limiting
- Throttling
- Input validation
- CORS configuration
- HTTPS enforcement

---

## API Gateway

### Features
- Request routing
- Load balancing
- Authentication
- Rate limiting
- Caching
- Logging/monitoring

### Solutions
| Gateway | Platform |
|---------|----------|
| Kong | Self-hosted, cloud |
| AWS API Gateway | AWS |
| Azure API Management | Azure |
| Google Apigee | GCP |
| NGINX | Self-hosted |

---

## API Testing

### Testing Types
- Unit tests (resolvers, handlers)
- Integration tests
- Contract tests
- Load tests
- Security tests

### Tools
- Postman
- Insomnia
- k6 (load testing)
- Pact (contract testing)
- OWASP ZAP (security)

---

## API Versioning

### Strategies
| Strategy | Example | Pros |
|----------|---------|------|
| URL path | /v2/users | Clear, cacheable |
| Header | Accept-Version: 2 | Clean URLs |
| Query | ?version=2 | Easy testing |

### Breaking Changes
- Deprecation warnings
- Migration guides
- Sunset headers
- Backward compatibility

---

## API Performance

### Optimization
- Caching (CDN, Redis)
- Compression (gzip, brotli)
- Connection pooling
- Query optimization
- Pagination

### Monitoring
- Request latency
- Error rates
- Throughput
- Cache hit rates
- SLI/SLO tracking
