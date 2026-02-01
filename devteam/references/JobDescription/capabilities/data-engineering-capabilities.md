# Data Engineering Technical Capabilities Reference

> Sources:
> - `sample/data-engineering/agents/data-engineer.md`
> - `sample/data-engineering/agents/backend-architect.md`
> - `sample/machine-learning-ops/agents/mlops-engineer.md`

## Modern Data Stack & Architecture

- **Lakehouse**: Delta Lake, Apache Iceberg, Apache Hudi
- **Cloud warehouses**: Snowflake, BigQuery, Redshift, Databricks SQL
- **Data lakes**: AWS S3, Azure ADLS Gen2, GCS with intelligent tiering
- **Modern stack**: Fivetran/Airbyte + dbt + Snowflake/BigQuery + BI tools
- **Data mesh**: Domain-driven data ownership, data products
- **Real-time OLAP**: Apache Pinot, ClickHouse, Apache Druid
- **Query engines**: Presto/Trino, Spark SQL, Databricks Runtime

## Batch Processing & ETL/ELT

- **Apache Spark**: Catalyst optimizer, columnar processing, 4.0 features
- **dbt Core/Cloud**: Transformations, version control, testing
- **Apache Airflow**: Complex DAGs, custom operators, dynamic generation
- **Cloud ETL**: AWS Glue, Azure Data Factory, Google Dataflow
- **Python processing**: pandas, Polars, Ray for distributed computing
- **Data validation**: Great Expectations, custom validators
- **Data discovery**: Apache Atlas, DataHub, Amundsen

## Real-Time Streaming

- **Apache Kafka**: Event streaming, Confluent Platform
- **Apache Pulsar**: Geo-replicated messaging, multi-tenancy
- **Stream processing**: Apache Flink, Kafka Streams, Spark Streaming
- **Cloud streaming**: AWS Kinesis, Azure Event Hubs, GCP Pub/Sub
- **CDC (Change Data Capture)**: Debezium, real-time replication
- **Windowing**: Tumbling, sliding, session windows
- **Schema evolution**: Compatibility management, schema registry

## Workflow Orchestration

- **Apache Airflow**: Custom operators, dynamic DAG generation
- **Prefect**: Modern orchestration, dynamic workflows
- **Dagster**: Asset-based orchestration, materialization
- **Cloud workflows**: Azure Data Factory, AWS Step Functions
- **CI/CD integration**: GitHub Actions, GitLab CI for data pipelines
- **Kubernetes-native**: Argo Workflows, CronJobs
- **Monitoring**: Pipeline health, failure recovery, alerting

## Data Modeling & Warehousing

- **Dimensional modeling**: Star schema, snowflake schema
- **Data vault**: Enterprise DW, hubs, links, satellites
- **Wide tables (OBT)**: Analytics-optimized denormalization
- **SCD (Slowly Changing Dimensions)**: Type 1, 2, 3 strategies
- **Partitioning**: Range, hash, list partitioning strategies
- **Clustering**: Co-location for query optimization
- **Incremental loading**: CDC, merge patterns, idempotency

## Cloud Data Platforms

### AWS Data Stack
| Service | Purpose |
|---------|---------|
| S3 | Data lake with lifecycle policies |
| Glue | Serverless ETL, schema discovery |
| Redshift | Data warehouse, Spectrum for S3 queries |
| EMR | Big data processing, Spark clusters |
| Kinesis | Real-time streaming, analytics |
| Lake Formation | Data lake governance, security |
| Athena | Serverless SQL on S3 |

### Azure Data Stack
| Service | Purpose |
|---------|---------|
| ADLS Gen2 | Hierarchical data lake |
| Synapse Analytics | Unified analytics platform |
| Data Factory | Cloud-native data integration |
| Databricks | Collaborative analytics, ML |
| Stream Analytics | Real-time processing |
| Purview | Data governance, catalog |

### GCP Data Stack
| Service | Purpose |
|---------|---------|
| Cloud Storage | Object storage, data lake |
| BigQuery | Serverless DW with ML |
| Dataflow | Stream and batch processing |
| Composer | Managed Airflow |
| Pub/Sub | Messaging, event ingestion |
| Dataproc | Managed Spark clusters |

## Data Quality & Governance

- **Quality frameworks**: Great Expectations, dbt tests
- **Data lineage**: DataHub, Apache Atlas, Collibra
- **Data catalog**: Metadata management, discovery
- **Privacy compliance**: GDPR, CCPA, HIPAA considerations
- **Data masking**: Anonymization, pseudonymization
- **Access control**: RBAC, row-level security
- **Schema management**: Evolution, compatibility, versioning

## Performance & Optimization

- **Query optimization**: Explain plans, indexing strategies
- **Partitioning**: Optimize for common query patterns
- **Caching**: Materialized views, result caching
- **Resource management**: Auto-scaling, spot instances
- **Compression**: Columnar formats (Parquet, ORC)
- **Cost optimization**: Storage tiering, compute scheduling

## Database Technologies

- **Relational**: PostgreSQL, MySQL, SQL Server
- **NoSQL**: MongoDB, Cassandra, DynamoDB
- **Time-series**: InfluxDB, TimescaleDB
- **Graph**: Neo4j, Amazon Neptune
- **Search**: Elasticsearch, OpenSearch
- **Vector**: Pinecone, Qdrant (for AI applications)
- **CDC/Replication**: Cross-database synchronization

## Infrastructure & DevOps

- **IaC**: Terraform, CloudFormation, Bicep
- **Containers**: Docker, Kubernetes for data apps
- **CI/CD**: Data pipeline automation, testing
- **Version control**: Code, schemas, configurations
- **Environment management**: Dev, staging, prod separation
- **Monitoring**: Prometheus, Grafana, ELK stack
- **Disaster recovery**: Backups, replication, failover

## Data Security

- **Encryption**: At rest, in transit (TLS)
- **IAM**: Identity management, service accounts
- **Network security**: VPC, private endpoints
- **Audit logging**: Compliance reporting automation
- **Data classification**: Sensitivity labeling
- **Privacy techniques**: Differential privacy, k-anonymity
