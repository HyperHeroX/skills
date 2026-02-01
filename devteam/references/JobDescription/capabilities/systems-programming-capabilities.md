# Systems Programming Technical Capabilities Reference

> Sources:
> - `sample/systems-programming/agents/rust-pro.md`
> - `sample/systems-programming/agents/golang-pro.md`
> - `sample/jvm-languages/agents/java-pro.md`

---

## Rust (1.75+)

### Modern Features
- **Const generics**: Compile-time computed values
- **GATs**: Generic Associated Types
- **Pattern matching**: Advanced destructuring, guards
- **Macros**: Procedural and declarative

### Ownership & Memory
- **Borrowing**: References, lifetimes, move semantics
- **Smart pointers**: Box, Rc, Arc, RefCell, Mutex
- **Zero-cost abstractions**: No runtime overhead
- **Custom allocators**: Memory pool management

### Async Programming
- **Tokio runtime**: Async/await, streams
- **Channels**: mpsc, broadcast, watch
- **Web frameworks**: axum, warp, actix-web
- **gRPC**: tonic

### Performance
- **SIMD**: portable-simd
- **Lock-free**: Atomic operations
- **Profiling**: cargo-flamegraph, perf
- **Cross-compilation**: Embedded targets

### Ecosystem
| Tool | Purpose |
|------|---------|
| Cargo | Package manager |
| Clippy | Linting |
| Rustfmt | Formatting |
| criterion.rs | Benchmarking |
| proptest | Property testing |

### Safety
- Explicit unsafe blocks
- FFI with bindgen
- Safety invariant documentation

---

## Go (1.21+)

### Modern Features
- **Generics**: Type parameters, constraints
- **Workspaces**: Multi-module development
- **slog**: Structured logging (1.21+)
- **Error wrapping**: fmt.Errorf %w

### Concurrency
- **Goroutines**: Lifecycle management
- **Channels**: Fan-in/out, worker pools, pipelines
- **Context**: Cancellation, timeouts
- **Sync**: Mutexes, WaitGroups, atomics

### Architecture
- **Clean/Hexagonal**: Go idioms
- **Microservices**: Service mesh integration
- **Event-driven**: Message queues
- **DI**: Wire framework

### Performance
- **Profiling**: pprof, go tool trace
- **GC tuning**: GOGC, memory optimization
- **Connection pooling**: Database, HTTP
- **Benchmarks**: testing.B

### Web Services
| Framework | Use Case |
|-----------|----------|
| net/http | Standard library |
| Gin | HTTP routing |
| Fiber | High-performance |
| gRPC | Protocol buffers |
| gqlgen | GraphQL |

### Tooling
- **golangci-lint**: Linting aggregator
- **staticcheck**: Static analysis
- **Air**: Hot reloading
- **Mockery/gomock**: Mocking

---

## Java (21+)

### Modern Features
- **Virtual threads**: Project Loom massive concurrency
- **Pattern matching**: Switch, instanceof
- **Records**: Immutable data carriers
- **Sealed classes**: Controlled inheritance
- **Text blocks**: Multi-line strings

### Concurrency
- **Virtual threads**: Lightweight concurrency
- **Structured concurrency**: Reliable patterns
- **CompletableFuture**: Async composition
- **Scoped values**: Thread-local optimization

### Spring Ecosystem
| Component | Purpose |
|-----------|---------|
| Spring Boot 3.x | Application framework |
| Spring WebFlux | Reactive web |
| Spring Data JPA | Database access |
| Spring Security 6 | Authentication/authorization |
| Spring Cloud | Microservices |
| Spring Native | GraalVM compilation |

### JVM Performance
- **GraalVM**: Native image, fast startup
- **GC options**: G1, ZGC, Parallel GC
- **Profiling**: JProfiler, VisualVM, async-profiler
- **JMH**: Microbenchmarking

### Enterprise Patterns
- **Microservices**: Spring Cloud
- **DDD**: Domain-driven design
- **CQRS**: Event sourcing
- **Resilience4j**: Circuit breaker

### Testing
| Tool | Purpose |
|------|---------|
| JUnit 5 | Unit testing |
| Mockito | Mocking |
| Testcontainers | Integration testing |
| Spring Cloud Contract | Contract testing |
| Gatling | Performance testing |
| JaCoCo | Coverage |

---

## Cross-Language Comparison

### Performance Characteristics
| Aspect | Rust | Go | Java |
|--------|------|-----|------|
| Memory | Manual (safe) | GC | GC |
| Startup | Fast | Fast | Slow (JIT) / Fast (GraalVM) |
| Concurrency | Async/Tokio | Goroutines | Virtual threads |
| Binary size | Small | Medium | Large |
| Learning curve | Steep | Gentle | Medium |

### Best Use Cases
| Language | Ideal For |
|----------|-----------|
| **Rust** | Systems programming, performance-critical, WebAssembly, embedded |
| **Go** | Cloud services, CLI tools, microservices, DevOps tools |
| **Java** | Enterprise apps, large teams, existing ecosystem, Spring projects |

### Error Handling
| Language | Pattern |
|----------|---------|
| Rust | Result<T, E>, Option<T>, ? operator |
| Go | Multiple return values (value, error) |
| Java | Exceptions, checked/unchecked |

### Concurrency Models
| Language | Primary Model |
|----------|---------------|
| Rust | Ownership + async/await + channels |
| Go | Goroutines + channels + sync |
| Java | Virtual threads + CompletableFuture |

---

## Common Patterns

### Production Readiness
- Graceful shutdown handling
- Health check endpoints
- Structured logging
- Metrics and tracing
- Configuration management
- Secret handling

### Testing Strategy
- Unit tests with mocking
- Integration tests with containers
- Property-based testing
- Benchmark tests
- Coverage tracking

### Build & CI/CD
- Reproducible builds
- Static analysis
- Security scanning
- Multi-stage Docker builds
- Cross-platform compilation
