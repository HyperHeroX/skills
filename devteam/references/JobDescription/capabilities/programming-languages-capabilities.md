# Programming Languages Technical Capabilities Reference

> Sources:
> - `sample/shell-scripting/agents/bash-pro.md`
> - `sample/python-development/agents/python-pro.md`
> - `sample/javascript-typescript/agents/typescript-pro.md`

---

## Bash & Shell Scripting

### Defensive Programming
- **Strict mode**: `set -Eeuo pipefail` with error trapping
- **Variable quoting**: Prevent word splitting and globbing
- **Safe iteration**: Arrays over `for f in $(ls)`
- **Input validation**: `${VAR:?message}` for required vars
- **Temp file handling**: `mktemp` with cleanup traps

### Best Practices
- **Portability**: POSIX compliance, GNU vs BSD handling
- **Conditionals**: `[[ ]]` for Bash, `[ ]` for POSIX
- **Output**: `printf` over `echo` for reliability
- **Argument parsing**: `getopts` with usage functions
- **Idempotency**: Support dry-run modes

### Modern Bash (5.x)
- **Parameter operators**: `${var@U}`, `${var@L}`, `${var@Q}`
- **Array handling**: `readarray`, `mapfile`
- **Version checking**: `BASH_VERSINFO` array
- **NUL-safe patterns**: `find -print0 | while IFS= read -r -d ''`

### Quality Tools
- **ShellCheck**: Static analysis
- **shfmt**: Formatting
- **bats-core**: Testing framework
- **shdoc**: Documentation generation

### CI/CD Integration
- GitHub Actions shellcheck integration
- Pre-commit hooks configuration
- Matrix testing across Bash versions
- Container-based reproducible testing

---

## Python (3.12+)

### Modern Features
- **Type hints**: Generics, Protocol, Literal types
- **Pattern matching**: `match` statements (3.10+)
- **Async/await**: asyncio, aiohttp, trio
- **Dataclasses**: `@dataclass` decorator, Pydantic
- **Context managers**: `with` statement, `contextlib`

### Modern Tooling
| Tool | Purpose |
|------|---------|
| **uv** | Fast package manager (2024+) |
| **ruff** | All-in-one linter (replaces black, isort, flake8) |
| **mypy/pyright** | Static type checking |
| **pytest** | Testing framework |
| **pyproject.toml** | Modern project configuration |

### Performance
- **Profiling**: cProfile, py-spy, memory_profiler
- **Async I/O**: For I/O-bound operations
- **Multiprocessing**: For CPU-bound tasks
- **Caching**: functools.lru_cache, Redis

### Web Frameworks
- **FastAPI**: High-performance APIs, auto docs
- **Django 5.x**: Full-featured web apps
- **Flask**: Lightweight services
- **SQLAlchemy 2.0+**: Async ORM support

### Data Science Stack
- **NumPy/Pandas**: Data manipulation
- **Matplotlib/Plotly**: Visualization
- **Scikit-learn**: Machine learning
- **Jupyter**: Interactive development

### Best Practices
- PEP 8 compliance
- Type hints throughout (>90% coverage)
- Comprehensive error handling
- Extensive tests with pytest
- Standard library first

---

## TypeScript

### Advanced Type System
- **Generics**: Generic functions, classes, constraints
- **Conditional types**: `T extends U ? X : Y`
- **Mapped types**: `Record`, `Partial`, `Required`, `Pick`, `Omit`
- **Utility types**: `ReturnType`, `Parameters`, `Awaited`
- **Template literal types**: String type manipulation

### Strict Configuration
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noUncheckedIndexedAccess": true
}
```

### Type Inference
- Prefer inference when clear
- Explicit annotations for complex types
- Type guards for narrowing
- Discriminated unions for variants

### Decorators & Metadata
- Class decorators
- Method decorators
- Property decorators
- Reflect metadata API

### Module Organization
- ES Modules (ESM)
- Namespace patterns
- Barrel exports (index.ts)
- Declaration files (.d.ts)

### Framework Integration
- **React**: JSX types, hooks typing
- **Node.js**: @types/node, Express typing
- **Next.js**: App router types
- **Prisma**: Type-safe ORM

### Quality Tools
- **ESLint**: @typescript-eslint
- **Prettier**: Code formatting
- **Jest/Vitest**: Testing with type assertions
- **TSDoc**: Documentation comments

---

## Cross-Language Best Practices

### Code Quality
| Practice | Bash | Python | TypeScript |
|----------|------|--------|------------|
| Linting | ShellCheck | ruff | ESLint |
| Formatting | shfmt | ruff | Prettier |
| Testing | bats | pytest | Jest/Vitest |
| Type safety | N/A | mypy | tsc |

### Documentation
- Inline comments for complex logic
- Function/method documentation
- Usage examples
- README with setup instructions

### Error Handling
- Specific error types/codes
- Meaningful error messages
- Graceful degradation
- Logging and monitoring

### Security
- Input validation
- Sanitization
- Secrets management
- Dependency scanning
