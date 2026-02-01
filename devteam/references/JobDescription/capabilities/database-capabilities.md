# Database Architect Technical Capabilities Reference

> Source: Adapted from `sample/database-design/agents/database-architect.md`

## Technology Selection & Evaluation

- **Relational databases**: PostgreSQL, MySQL, MariaDB, SQL Server, Oracle
- **NoSQL databases**: MongoDB, DynamoDB, Cassandra, CouchDB, Redis, Couchbase
- **Time-series databases**: TimescaleDB, InfluxDB, ClickHouse, QuestDB
- **NewSQL databases**: CockroachDB, TiDB, Google Spanner, YugabyteDB
- **Graph databases**: Neo4j, Amazon Neptune, ArangoDB
- **Search engines**: Elasticsearch, OpenSearch, Meilisearch, Typesense
- **Decision frameworks**: Consistency vs availability trade-offs, CAP theorem implications
- **Hybrid architectures**: Polyglot persistence, multi-database strategies

## Data Modeling & Schema Design

- **Conceptual modeling**: Entity-relationship diagrams, domain modeling
- **Logical modeling**: Normalization (1NF-5NF), denormalization strategies, dimensional modeling
- **Physical modeling**: Storage optimization, data type selection, partitioning strategies
- **Relational design**: Table relationships, foreign keys, constraints, referential integrity
- **NoSQL design patterns**: Document embedding vs referencing, data duplication strategies
- **Schema evolution**: Versioning strategies, backward/forward compatibility
- **Temporal data**: Slowly changing dimensions, event sourcing, audit trails
- **Multi-tenancy**: Shared schema, database per tenant, schema per tenant trade-offs

## Normalization vs Denormalization

- **Normalization benefits**: Data consistency, update efficiency, storage optimization
- **Denormalization strategies**: Read performance optimization, reduced JOIN complexity
- **Trade-off analysis**: Write vs read patterns, consistency requirements
- **Hybrid approaches**: Selective denormalization, materialized views
- **OLTP vs OLAP**: Transaction processing vs analytical workload optimization
- **Dimensional modeling**: Star schema, snowflake schema, fact and dimension tables

## Indexing Strategy & Design

- **Index types**: B-tree, Hash, GiST, GIN, BRIN, bitmap, spatial indexes
- **Composite indexes**: Column ordering, covering indexes, index-only scans
- **Partial indexes**: Filtered indexes, conditional indexing, storage optimization
- **Full-text search**: Text search indexes, ranking strategies
- **JSON indexing**: JSONB GIN indexes, expression indexes, path-based indexes
- **Index planning**: Query pattern analysis, index selectivity, cardinality considerations
- **Index maintenance**: Bloat management, statistics updates, rebuild strategies

## Query Design & Optimization

- **Query patterns**: Read-heavy, write-heavy, analytical, transactional patterns
- **JOIN strategies**: INNER, LEFT, RIGHT, FULL joins, cross joins, semi/anti joins
- **Subquery optimization**: Correlated subqueries, derived tables, CTEs
- **Window functions**: Ranking, running totals, moving averages
- **Aggregation patterns**: GROUP BY optimization, HAVING clauses, cube/rollup
- **Batch operations**: Bulk inserts, batch updates, upsert patterns

## Caching Architecture

- **Cache layers**: Application cache, query cache, object cache, result cache
- **Cache strategies**: Cache-aside, write-through, write-behind, refresh-ahead
- **Cache invalidation**: TTL strategies, event-driven invalidation
- **Distributed caching**: Redis Cluster, cache partitioning, cache consistency
- **Materialized views**: Database-level caching, incremental refresh

## Scalability & Performance Design

- **Vertical scaling**: Resource optimization, instance sizing, performance tuning
- **Horizontal scaling**: Read replicas, load balancing, connection pooling
- **Partitioning strategies**: Range, hash, list, composite partitioning
- **Sharding design**: Shard key selection, resharding strategies
- **Replication patterns**: Master-slave, master-master, multi-region replication
- **Consistency models**: Strong consistency, eventual consistency, causal consistency

## Migration Planning & Strategy

- **Migration approaches**: Big bang, trickle, parallel run, strangler pattern
- **Zero-downtime migrations**: Online schema changes, rolling deployments
- **Data migration**: ETL pipelines, data validation, consistency checks
- **Schema versioning**: Migration tools (Flyway, Liquibase, Alembic, Prisma)
- **Rollback planning**: Backup strategies, data snapshots, recovery procedures

## Transaction Design & Consistency

- **ACID properties**: Atomicity, consistency, isolation, durability requirements
- **Isolation levels**: Read uncommitted, read committed, repeatable read, serializable
- **Transaction patterns**: Unit of work, optimistic locking, pessimistic locking
- **Distributed transactions**: Two-phase commit, saga patterns, compensating transactions
- **Eventual consistency**: BASE properties, conflict resolution, version vectors

## Security & Compliance

- **Access control**: Role-based access (RBAC), row-level security, column-level security
- **Encryption**: At-rest encryption, in-transit encryption, key management
- **Data masking**: Dynamic data masking, anonymization, pseudonymization
- **Audit logging**: Change tracking, access logging, compliance reporting
- **Compliance patterns**: GDPR, HIPAA, PCI-DSS, SOC2 compliance architecture
- **Data retention**: Retention policies, automated cleanup, legal holds

## Disaster Recovery & High Availability

- **Backup strategies**: Full, incremental, differential backups, backup rotation
- **Point-in-time recovery**: Transaction log backups, continuous archiving
- **High availability**: Active-passive, active-active, automatic failover
- **RPO/RTO planning**: Recovery point objectives, recovery time objectives
- **Multi-region**: Geographic distribution, disaster recovery regions
