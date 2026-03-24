# Code Review & Modernization Technical Capabilities Reference

> Sources:
> - `sample/git-pr-workflows/agents/code-reviewer.md`
> - `sample/framework-migration/agents/legacy-modernizer.md`

---

## AI-Powered Code Analysis

### Modern Tools
- **AI review**: Trag, Bito, Codiga, GitHub Copilot
- **Pattern matching**: Natural language custom rules
- **Context-aware**: LLM-based code analysis
- **Automated PR**: Analysis and comment generation

### Static Analysis
| Tool | Focus |
|------|-------|
| SonarQube | Code quality, technical debt |
| CodeQL | Security vulnerabilities |
| Semgrep | Pattern-based analysis |
| Snyk | Dependency vulnerabilities |
| Bandit | Python security |

## Security Code Review

### OWASP Top 10
- Injection prevention
- Broken authentication
- Sensitive data exposure
- XML external entities
- Broken access control
- Security misconfiguration
- Cross-site scripting (XSS)
- Insecure deserialization
- Component vulnerabilities
- Insufficient logging

### Security Patterns
- Input validation and sanitization
- Authentication and authorization
- Cryptographic implementation
- Secrets and credential management
- API security and rate limiting
- Container security review

## Performance Analysis

### Common Issues
- N+1 query detection
- Memory leak identification
- Resource management
- Caching strategy review
- Connection pooling config

### Optimization Areas
- Async programming patterns
- Load testing integration
- Microservices performance
- Cloud-native optimization

## Configuration Review

### Infrastructure
- Kubernetes manifests
- Terraform/CloudFormation
- CI/CD pipelines
- Environment configurations

### Security
- Production config security
- Database connection pools
- Secrets management
- Monitoring configuration

## Code Quality

### Principles
- Clean Code adherence
- SOLID principles
- Design pattern consistency
- Code duplication detection

### Metrics
- Cyclomatic complexity
- Technical debt assessment
- Maintainability index
- Test coverage

## Team Collaboration

### Process
- PR workflow optimization
- Code review checklists
- Team coding standards
- Documentation standards

### Feedback
- Constructive tone
- Teaching orientation
- Actionable suggestions
- Code examples

---

## Legacy Modernization

### Migration Strategies
| Pattern | Description |
|---------|-------------|
| Strangler Fig | Gradual replacement |
| Anti-Corruption Layer | Isolate legacy |
| Feature Flags | Gradual rollout |
| Parallel Run | Side-by-side validation |

### Common Migrations
- **Frontend**: jQuery → React/Vue
- **Backend**: Java 8 → 17, Python 2 → 3
- **Database**: Stored procs → ORM
- **Architecture**: Monolith → Microservices

### Migration Process
1. Assess current state
2. Add test coverage
3. Create compatibility layer
4. Implement new code
5. Run parallel validation
6. Gradual traffic shift
7. Deprecate old code

### Risk Mitigation
- Backward compatibility
- Feature flags
- Rollback procedures
- Breaking change documentation

### Technical Debt
- Dependency updates
- Security patches
- Framework upgrades
- Code refactoring

---

## Review Checklist

### Security
- [ ] Input validation
- [ ] Authentication/authorization
- [ ] Secrets handling
- [ ] SQL injection prevention
- [ ] XSS protection

### Performance
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Resource management
- [ ] Async patterns

### Quality
- [ ] Test coverage
- [ ] Error handling
- [ ] Logging/monitoring
- [ ] Documentation

### Deployment
- [ ] Feature flags
- [ ] Rollback plan
- [ ] Configuration review
- [ ] Breaking changes documented

---

## CI/CD Integration

### Quality Gates
- Automated testing
- Code coverage thresholds
- Static analysis pass
- Security scan pass

### Automation
- GitHub Actions
- GitLab CI/CD
- Jenkins pipelines
- Custom webhooks

### Metrics
- Review time tracking
- Issue detection rate
- Technical debt trends
- Team performance
