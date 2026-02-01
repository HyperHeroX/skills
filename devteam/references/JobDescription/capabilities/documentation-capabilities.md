# Documentation & Technical Writing Capabilities Reference

> Sources:
> - `sample/code-documentation/agents/docs-architect.md`
> - `sample/code-documentation/agents/code-reviewer.md`
> - `sample/code-documentation/agents/tutorial-engineer.md`

## Technical Documentation Architecture

- **Codebase analysis**: Code structure, patterns, architectural decisions
- **System thinking**: Big picture documentation with detailed explanations
- **Information architecture**: Organizing complex information into navigable structures
- **Visual communication**: Architectural diagrams, flowcharts, sequence diagrams
- **Documentation types**: Technical manuals, API docs, ebooks, onboarding guides

## Documentation Process

### Discovery Phase
- Analyze codebase structure and dependencies
- Identify key components and relationships
- Extract design patterns and architectural decisions
- Map data flows and integration points

### Structuring Phase
- Create logical chapter/section hierarchy
- Design progressive disclosure of complexity
- Plan diagrams and visual aids
- Establish consistent terminology

### Writing Phase
- Executive summary and overview first
- High-level architecture to implementation details
- Include rationale for design decisions
- Add code examples with thorough explanations

## Key Documentation Sections

1. **Executive Summary**: One-page stakeholder overview
2. **Architecture Overview**: System boundaries, components, interactions
3. **Design Decisions**: Rationale behind architectural choices
4. **Core Components**: Deep dive into major modules/services
5. **Data Models**: Schema design and data flow
6. **Integration Points**: APIs, events, external dependencies
7. **Deployment Architecture**: Infrastructure and operations
8. **Performance Characteristics**: Bottlenecks, optimizations, benchmarks
9. **Security Model**: Auth, authorization, data protection
10. **Appendices**: Glossary, references, specifications

## Documentation Best Practices

- Always explain the "why" behind design decisions
- Use concrete examples from actual codebase
- Create mental models for system understanding
- Document current state and evolutionary history
- Include troubleshooting guides and common pitfalls
- Provide reading paths for different audiences

## Output Formats

- **Length**: Comprehensive documents (10-100+ pages)
- **Depth**: Bird's-eye view to implementation specifics
- **Style**: Technical but accessible, progressive complexity
- **Format**: Structured chapters, sections, cross-references
- **Visuals**: Architectural, sequence, and flowchart diagrams

## Markdown Documentation Standards

- Clear heading hierarchy (H1-H6)
- Code blocks with syntax highlighting
- Tables for structured data
- Bullet points for lists
- Blockquotes for important notes
- Links to relevant code files (file_path:line_number format)

## API Documentation

- OpenAPI/Swagger specification authoring
- Request/response examples with realistic data
- Error codes and handling documentation
- Authentication and authorization flows
- Rate limiting and quota documentation
- SDK and client library documentation

## Code Comments & Inline Documentation

- JSDoc/TSDoc for JavaScript/TypeScript
- Docstrings for Python
- Javadoc for Java
- XML documentation for C#
- Self-documenting code principles
- When to comment vs when to refactor

## Diagram Types

- **C4 Model**: Context, Container, Component, Code diagrams
- **Sequence diagrams**: Interaction flows between components
- **Entity-relationship diagrams**: Data model visualization
- **Flowcharts**: Process and decision flows
- **Architecture diagrams**: System topology and deployment
- **State diagrams**: Component lifecycle and transitions
