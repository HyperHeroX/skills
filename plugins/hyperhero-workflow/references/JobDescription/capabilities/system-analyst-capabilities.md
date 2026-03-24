# System Analyst Technical Capabilities Reference

> Sources:
> - `sample/c4-architecture/agents/c4-context.md`
> - `sample/c4-architecture/agents/c4-container.md`
> - `sample/business-analytics/agents/business-analyst.md`

## System Context Analysis (C4 Model)

- **System identification**: Define system boundary and capabilities
- **System descriptions**: Short/long descriptions of purpose
- **System scope**: Inside vs outside system boundary
- **Business context**: Problem definition, business value
- **High-level capabilities**: Feature documentation

## Persona & User Identification

- **Persona identification**: All user types interacting with system
- **Role definition**: Responsibilities, access levels
- **Actor identification**: Human users + programmatic users (APIs, services)
- **User characteristics**: Needs, goals, interaction patterns
- **User journey mapping**: Key features mapped to personas

## Feature Documentation

- **Feature identification**: High-level system features
- **Feature descriptions**: Purpose, users, relationships
- **Feature prioritization**: Business value, urgency
- **Feature-user mapping**: Personas to features matrix
- **Feature dependencies**: Relationship analysis

## User Journey Mapping

- **Journey identification**: Key user journeys per feature
- **Journey steps**: Step-by-step documentation
- **Journey visualization**: Flow diagrams, swimlanes
- **Programmatic journeys**: External system integrations
- **Touchpoint documentation**: System interaction points

## External System Documentation

- **Dependency identification**: All external systems/services
- **Integration types**: API, events, file transfer, webhooks
- **Dependency analysis**: Critical path, failure impact
- **Data flows**: In/out data documentation
- **SLA requirements**: Availability, latency expectations

## Architecture Diagrams (C4 Model)

- **Context diagrams**: System, users, external systems
- **Container diagrams**: Deployment architecture
- **Component diagrams**: Logical structure
- **Code diagrams**: Class/module level (when needed)
- **Mermaid notation**: Diagram generation

## Requirements Engineering

- **Functional requirements**: Feature specifications
- **Non-functional requirements**: Performance, security, scalability
- **Constraints identification**: Technical, business, regulatory
- **Assumptions documentation**: Explicit assumption tracking
- **Dependencies documentation**: System and feature dependencies

## Business Process Analysis

- **Process mapping**: Current state, future state
- **Workflow analysis**: Bottlenecks, optimization opportunities
- **Use case development**: Actors, preconditions, flows, postconditions
- **Process mining**: Data-driven workflow analysis
- **Automation identification**: Manual vs automated processes

## Data Flow Analysis

- **Data flow diagrams**: Sources, transformations, destinations
- **Data dictionary**: Entity definitions, relationships
- **Data lifecycle**: Creation, storage, archival, deletion
- **Data governance**: Ownership, quality, security classification
- **Privacy analysis**: PII identification, GDPR/compliance

## Stakeholder Communication

- **Technical to non-technical translation**: Accessibility
- **Executive summaries**: High-level impact documentation
- **Visual communication**: Diagrams, charts, tables
- **Documentation structure**: Navigable, searchable, versioned
- **Change management**: Impact analysis, migration planning

## Quality Attributes Analysis

- **Scalability**: Growth projections, capacity planning
- **Performance**: Response time, throughput requirements
- **Security**: Threat modeling, access control requirements
- **Reliability**: Availability targets, disaster recovery
- **Maintainability**: Technical debt, upgrade paths

## System Integration Analysis

- **API contracts**: Request/response specifications
- **Event-driven integration**: Event schemas, pub/sub patterns
- **Synchronous vs asynchronous**: Pattern selection
- **Error handling**: Retry strategies, fallback mechanisms
- **Monitoring requirements**: Health checks, alerting
