# CI/CD Engineer Technical Capabilities Reference

> Source: Adapted from `sample/cicd-automation/agents/deployment-engineer.md` and `devops-troubleshooter.md`

## Modern CI/CD Platforms

- **GitHub Actions**: Advanced workflows, reusable actions, self-hosted runners, security scanning
- **GitLab CI/CD**: Pipeline optimization, DAG pipelines, multi-project pipelines
- **Azure DevOps**: YAML pipelines, template libraries, environment approvals, release gates
- **Jenkins**: Pipeline as Code, Blue Ocean, distributed builds, plugin ecosystem
- **Platform-specific**: AWS CodePipeline, GCP Cloud Build, Tekton, Argo Workflows

## GitOps & Continuous Deployment

- **GitOps tools**: ArgoCD, Flux v2, Jenkins X, advanced configuration patterns
- **Repository patterns**: App-of-apps, mono-repo vs multi-repo, environment promotion
- **Automated deployment**: Progressive delivery, automated rollbacks, deployment policies
- **Configuration management**: Helm, Kustomize, Jsonnet for environment-specific configs
- **Secret management**: External Secrets Operator, Sealed Secrets, vault integration

## Container Technologies

- **Docker mastery**: Multi-stage builds, BuildKit, security best practices, image optimization
- **Alternative runtimes**: Podman, containerd, CRI-O, gVisor for enhanced security
- **Image management**: Registry strategies, vulnerability scanning, image signing
- **Build tools**: Buildpacks, Bazel, Nix, ko for Go applications
- **Security**: Distroless images, non-root users, minimal attack surface

## Kubernetes Deployment Patterns

- **Deployment strategies**: Rolling updates, blue/green, canary, A/B testing
- **Progressive delivery**: Argo Rollouts, Flagger, feature flags integration
- **Resource management**: Resource requests/limits, QoS classes, priority classes
- **Service mesh**: Istio, Linkerd traffic management for deployments

## Advanced Deployment Strategies

- **Zero-downtime deployments**: Health checks, readiness probes, graceful shutdowns
- **Database migrations**: Automated schema migrations, backward compatibility
- **Feature flags**: LaunchDarkly, Flagr, custom implementations
- **Traffic management**: Load balancer integration, DNS-based routing
- **Rollback strategies**: Automated rollback triggers, manual rollback procedures

## Security & Compliance

- **Secure pipelines**: Secret management, RBAC, pipeline security scanning
- **Supply chain security**: SLSA framework, Sigstore, SBOM generation
- **Vulnerability scanning**: Container scanning, dependency scanning, license compliance
- **Policy enforcement**: OPA/Gatekeeper, admission controllers, security policies
- **Compliance**: SOX, PCI-DSS, HIPAA pipeline compliance requirements

## Observability & Monitoring

- **Logging platforms**: ELK Stack, Loki/Grafana, Fluentd/Fluent Bit
- **APM solutions**: DataDog, New Relic, Dynatrace, AppDynamics
- **Metrics & monitoring**: Prometheus, Grafana, InfluxDB, VictoriaMetrics
- **Distributed tracing**: Jaeger, Zipkin, AWS X-Ray, OpenTelemetry
- **Pipeline monitoring**: Build metrics, deployment success rates, MTTR tracking

## Container & Kubernetes Debugging

- **kubectl mastery**: Advanced debugging commands, resource inspection
- **Container runtime debugging**: Docker, containerd, CRI-O, runtime-specific issues
- **Pod troubleshooting**: Init containers, sidecar issues, resource constraints, networking
- **Service mesh debugging**: Istio, Linkerd, Consul Connect traffic and security issues
- **Kubernetes networking**: CNI troubleshooting, service discovery, ingress issues

## Performance & Resource Analysis

- **System performance**: CPU, memory, disk I/O, network utilization analysis
- **Application profiling**: Memory leaks, CPU hotspots, garbage collection issues
- **Resource constraints**: OOMKilled containers, CPU throttling, disk space issues
- **Scaling issues**: Auto-scaling problems, resource bottlenecks, capacity planning

## Infrastructure Integration

- **Infrastructure as Code**: Terraform, CloudFormation, Pulumi integration
- **Environment management**: Environment provisioning, teardown, resource optimization
- **Multi-cloud deployment**: Cross-cloud deployment strategies, cloud-agnostic patterns
- **Scaling**: Auto-scaling integration, capacity planning, resource optimization

## Platform Engineering

- **Developer platforms**: Self-service deployment, developer portals, backstage integration
- **Pipeline templates**: Reusable pipeline templates, organization-wide standards
- **Documentation**: Automated documentation, deployment guides, troubleshooting
- **Training**: Developer onboarding, best practices dissemination
