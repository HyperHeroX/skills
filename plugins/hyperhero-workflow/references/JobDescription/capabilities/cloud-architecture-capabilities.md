# Cloud Architecture Technical Capabilities Reference

> Sources:
> - `sample/cloud-infrastructure/agents/cloud-architect.md`
> - `sample/cloud-infrastructure/agents/kubernetes-architect.md`

## Cloud Platform Expertise

### AWS
- **Compute**: EC2, Lambda, ECS, EKS, Fargate
- **Storage**: S3, EBS, EFS, FSx
- **Database**: RDS, DynamoDB, Aurora, ElastiCache
- **Networking**: VPC, Route 53, CloudFront, API Gateway
- **Security**: IAM, KMS, Secrets Manager, Security Hub
- **IaC**: CloudFormation, CDK

### Azure
- **Compute**: Virtual Machines, Functions, Container Apps, AKS
- **Storage**: Blob Storage, Files, Managed Disks
- **Database**: SQL Database, Cosmos DB, Cache for Redis
- **Networking**: Virtual Network, Load Balancer, Application Gateway
- **Security**: Active Directory, Key Vault, Defender
- **IaC**: ARM templates, Bicep

### GCP
- **Compute**: Compute Engine, Cloud Functions, Cloud Run, GKE
- **Storage**: Cloud Storage, Persistent Disk, Filestore
- **Database**: Cloud SQL, Firestore, Bigtable, Memorystore
- **Networking**: VPC, Cloud CDN, Cloud Load Balancing
- **Security**: IAM, Secret Manager, Security Command Center
- **IaC**: Cloud Deployment Manager

## Infrastructure as Code

### Terraform/OpenTofu
- **Module design**: Reusable, composable modules
- **State management**: Remote state, state locking
- **Workspaces**: Environment separation
- **Provider configuration**: Multi-provider setups

### Native IaC
| Cloud | Tool | Language |
|-------|------|----------|
| AWS | CDK | TypeScript, Python, Java, C# |
| Azure | Bicep | Domain-specific |
| GCP | Config Connector | Kubernetes-native |

### GitOps
- **ArgoCD**: Kubernetes GitOps
- **Flux**: CNCF GitOps toolkit
- **Atlantis**: Terraform pull request automation
- **Spacelift**: Cloud-agnostic IaC management

### Policy as Code
- **OPA/Rego**: Open Policy Agent
- **Sentinel**: HashiCorp policy framework
- **Checkov**: Infrastructure security scanning
- **tfsec**: Terraform security scanner

## Cost Optimization & FinOps

### Cost Monitoring
- **AWS**: Cost Explorer, Budgets, Cost Anomaly Detection
- **Azure**: Cost Management, Advisor
- **GCP**: Cost Management, Recommender
- **Third-party**: CloudHealth, Kubecost, Infracost

### Optimization Strategies
- **Compute**: Reserved instances, savings plans, spot/preemptible
- **Storage**: Lifecycle policies, intelligent tiering
- **Network**: Data transfer optimization, CDN usage
- **Database**: Right-sizing, reserved capacity

### FinOps Practices
- Tagging strategies for cost allocation
- Chargeback/showback models
- Budget alerts and anomaly detection
- TCO modeling and comparison

## Architecture Patterns

### Microservices
- **Service mesh**: Istio, Linkerd, Consul Connect
- **API Gateway**: Kong, AWS API Gateway, Apigee
- **Service discovery**: Consul, CoreDNS
- **Communication**: gRPC, REST, async messaging

### Serverless
- **Compute**: Lambda, Azure Functions, Cloud Functions
- **Orchestration**: Step Functions, Durable Functions, Workflows
- **Event sources**: API Gateway, queues, streams
- **Cold start optimization**: Provisioned concurrency, warm-up

### Event-Driven
- **Message queues**: SQS, Service Bus, Pub/Sub
- **Event streaming**: Kafka, Kinesis, Event Hubs
- **Patterns**: CQRS, Event Sourcing, Saga
- **Integration**: EventBridge, Logic Apps, Cloud Tasks

## Security & Compliance

### Zero Trust Architecture
- Identity-based access control
- Network micro-segmentation
- Encryption at rest and in transit
- Continuous verification

### IAM Best Practices
- Least privilege principle
- Role-based access control (RBAC)
- Service accounts and workload identity
- Cross-account access patterns

### Compliance Frameworks
| Framework | Focus |
|-----------|-------|
| SOC 2 | Service organization controls |
| HIPAA | Healthcare data protection |
| PCI DSS | Payment card security |
| GDPR | Data privacy |
| FedRAMP | US government cloud |

### Security Automation
- SAST/DAST in CI/CD
- Infrastructure security scanning
- Vulnerability management
- Runtime protection

## Scalability & Performance

### Auto-Scaling
- Horizontal Pod Autoscaler (HPA)
- Vertical Pod Autoscaler (VPA)
- Cluster Autoscaler
- Predictive scaling

### Load Balancing
- Application Load Balancer (L7)
- Network Load Balancer (L4)
- Global load balancing
- SSL/TLS termination

### Caching Strategies
- **CDN**: CloudFront, Azure CDN, Cloud CDN
- **In-memory**: Redis, Memcached
- **Application**: Local caching, API response caching

### Database Scaling
- Read replicas
- Sharding strategies
- Connection pooling
- Multi-region replication

## Disaster Recovery

### Multi-Region Strategies
| Pattern | RPO | RTO | Cost |
|---------|-----|-----|------|
| Backup & Restore | Hours | Hours | Low |
| Pilot Light | Minutes | 10-30 min | Medium |
| Warm Standby | Minutes | Minutes | Medium-High |
| Active-Active | Near-zero | Near-zero | High |

### Backup Strategies
- Point-in-time recovery
- Cross-region replication
- Automated backup testing
- Immutable backups

### Chaos Engineering
- Fault injection testing
- Game days
- Resilience scoring
- Automated recovery validation

## Kubernetes Architecture

### Cluster Design
- Control plane HA
- Node pool strategies
- Namespace organization
- Resource quotas and limits

### Networking
- CNI plugins (Calico, Cilium, AWS VPC CNI)
- Network policies
- Ingress controllers
- Service mesh integration

### Security
- Pod security standards
- RBAC configuration
- Secret management
- Image scanning

### Observability
- Prometheus metrics
- ELK/Loki logging
- Jaeger/Tempo tracing
- Alertmanager

## Emerging Technologies

### Edge Computing
- Edge functions (CloudFlare Workers, Lambda@Edge)
- IoT architectures
- 5G integration
- Edge Kubernetes (k3s, KubeEdge)

### Sustainability
- Carbon footprint optimization
- Green cloud practices
- Region selection for renewable energy
- Workload scheduling for efficiency
