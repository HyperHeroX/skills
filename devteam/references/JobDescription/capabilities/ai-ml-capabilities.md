# AI/ML Engineering Technical Capabilities Reference

> Sources:
> - `sample/llm-application-dev/agents/ai-engineer.md`
> - `sample/llm-application-dev/agents/prompt-engineer.md`
> - `sample/llm-application-dev/agents/vector-database-engineer.md`
> - `sample/machine-learning-ops/agents/mlops-engineer.md`
> - `sample/data-engineering/agents/data-engineer.md`

## LLM Integration & Model Management

- **Commercial models**: OpenAI GPT series, Claude Opus/Sonnet/Haiku, Google Gemini
- **Open-source models**: Llama 3.x, Mixtral, Qwen, DeepSeek
- **Local deployment**: Ollama, vLLM, TGI (Text Generation Inference)
- **Model serving**: TorchServe, MLflow, BentoML, KServe
- **Multi-model orchestration**: Model routing, fallback strategies, A/B testing
- **Cost optimization**: Model selection, caching, token optimization

## Advanced RAG Systems

- **Vector databases**: Pinecone, Qdrant, Weaviate, Chroma, Milvus, pgvector
- **Embedding models**: Voyage AI, OpenAI text-embedding-3, Cohere, BGE
- **Chunking strategies**: Semantic, recursive, sliding window, document-aware
- **Hybrid search**: Vector + BM25 fusion, Reciprocal Rank Fusion (RRF)
- **Reranking**: Cross-encoder models, Cohere rerank, BGE reranker
- **Query understanding**: Expansion, decomposition, routing
- **Advanced patterns**: GraphRAG, HyDE, RAG-Fusion, self-RAG

## Agent Frameworks & Orchestration

- **LangChain/LangGraph**: StateGraph, durable execution, complex workflows
- **LlamaIndex**: Data-centric AI, advanced retrieval
- **Multi-agent**: CrewAI, AutoGen, Claude Agent SDK
- **Memory systems**: Checkpointers, short/long-term, vector-based memory
- **Tool integration**: Web search, code execution, API calls, database queries
- **Evaluation**: LangSmith, Phoenix, Weights & Biases

## Prompt Engineering & Optimization

### Advanced Techniques
- **Reasoning**: Chain-of-thought (CoT), tree-of-thoughts, self-consistency
- **Few-shot learning**: In-context learning optimization, examples curation
- **Meta-prompting**: Auto-prompting, prompt compression, optimization
- **Constitutional AI**: Self-correction, alignment, critique-and-revise

### Model-Specific Optimization
- **OpenAI**: Function calling, structured outputs, JSON mode
- **Claude**: XML structuring, tool use, computer use, context optimization
- **Open source**: Model-specific formatting, special tokens

### Production Prompt Systems
- **Template management**: Dynamic injection, conditional logic, versioning
- **RAG integration**: Context compression, relevance filtering, citations
- **Agent prompting**: Role definition, multi-agent protocols, tool selection

## Vector Search & Embeddings

### Database Selection
| Database | Best For |
|----------|----------|
| Pinecone | Managed serverless, auto-scaling |
| Qdrant | High-performance, complex filtering |
| Weaviate | GraphQL API, hybrid search |
| Milvus | Distributed, GPU acceleration |
| pgvector | PostgreSQL integration |
| Chroma | Lightweight, local development |

### Index Configuration
- **HNSW**: High recall, adjustable M and efConstruction
- **IVF**: Large-scale, nlist/nprobe tuning
- **Product Quantization (PQ)**: Memory optimization for billions of vectors
- **Scalar Quantization**: INT8/FP16 for reduced memory

### Embedding Best Practices
- Chunk size: 500-1000 tokens with 10-20% overlap
- Match embedding dimensions to use case (512-3072)
- Domain-specific models for code, legal, finance
- Monitor embedding drift over time

## MLOps & Pipeline Management

### ML Pipeline Orchestration
- **Kubeflow Pipelines**: Kubernetes-native workflows
- **Apache Airflow**: Complex DAG-based orchestration
- **Prefect/Dagster**: Modern dataflow, asset management
- **Cloud-native**: AWS SageMaker, Azure ML, Vertex AI Pipelines

### Experiment Tracking & Model Registry
- **MLflow**: End-to-end lifecycle, model registry
- **Weights & Biases**: Experiment tracking, optimization
- **DVC**: Data and model versioning
- **Model lineage**: Governance, approval workflows

### Cloud MLOps Stacks
| AWS | Azure | GCP |
|-----|-------|-----|
| SageMaker | Azure ML | Vertex AI |
| EMR | Databricks | Dataproc |
| S3 + Lake Formation | ADLS Gen2 | BigQuery + GCS |
| CloudWatch | Application Insights | Cloud Monitoring |

## Data Engineering Integration

### Modern Data Stack
- **Lakehouse**: Delta Lake, Apache Iceberg, Apache Hudi
- **Warehouses**: Snowflake, BigQuery, Redshift, Databricks SQL
- **Streaming**: Apache Kafka, Pulsar, Flink, Kinesis
- **Orchestration**: Airflow, Prefect, Dagster

### Feature Engineering
- **Feature stores**: Feast, Tecton, AWS Feature Store
- **Real-time features**: Streaming feature computation
- **Feature versioning**: DVC, lakeFS
- **Data validation**: Great Expectations

## AI Safety & Governance

- **Content moderation**: Custom classifiers, OpenAI Moderation API
- **Prompt injection**: Detection and prevention
- **PII protection**: Detection, redaction, anonymization
- **Bias detection**: Model bias, mitigation techniques
- **Compliance**: GDPR, HIPAA considerations for AI systems
- **Audit trails**: Model governance, decision logging

## Production AI Systems

- **Serving**: FastAPI, async processing, load balancing
- **Streaming**: Real-time inference, response streaming
- **Caching**: Semantic caching, embedding caching, memoization
- **Resilience**: Rate limiting, circuit breakers, fallbacks
- **Observability**: Logging, tracing, metrics (LangSmith, Phoenix)
- **Testing**: Unit tests, adversarial inputs, A/B testing

## Multimodal AI

- **Vision**: GPT-4V, Claude Vision, LLaVA, CLIP
- **Audio**: Whisper (STT), ElevenLabs (TTS)
- **Document AI**: OCR, table extraction, LayoutLM
- **Cross-modal**: Unified embeddings, multimodal reasoning
