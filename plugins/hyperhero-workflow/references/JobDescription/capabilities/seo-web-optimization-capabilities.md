# SEO & Web Optimization Technical Capabilities Reference

> Sources:
> - `sample/seo-technical-optimization/agents/seo-structure-architect.md`
> - `sample/accessibility-compliance/agents/ui-visual-validator.md`

---

## Content Structure & SEO Architecture

### Header Tag Hierarchy
- **H1**: One per page, matching main topic
- **H2**: Main sections with keyword variations
- **H3**: Subsections with related terms
- **Logical nesting**: Maintain proper hierarchy

### Content Organization
- Topical theme clusters (siloing)
- Parent/child page relationships
- Contextual internal linking
- Table of contents structure

### URL Structure
- Clean, descriptive URLs
- Keyword inclusion
- Proper categorization
- XML sitemap priorities

## Schema Markup

### High-Impact Schemas
| Schema Type | Use Case |
|-------------|----------|
| Article/BlogPosting | Blog content, news |
| FAQ | Question-answer sections |
| HowTo | Step-by-step guides |
| Review/AggregateRating | Product/service reviews |
| Organization | Company information |
| LocalBusiness | Location-based businesses |
| BreadcrumbList | Navigation path |
| Product | E-commerce items |

### Implementation
- JSON-LD format (recommended)
- Microdata fallback
- Testing with Google Rich Results Test
- Monitoring in Search Console

## Featured Snippet Optimization

### Format Strategies
| Snippet Type | Format |
|--------------|--------|
| List snippets | Numbered/bulleted lists |
| Table snippets | Comparison tables |
| Definition | Concise paragraph answers |
| Steps | Step-by-step formatting |

### Content Formatting
- Clear, scannable structure
- Concise answers (40-60 words for paragraphs)
- Logical flow for lists
- Headers as questions

## Internal Linking

### Strategy
- Contextual relevance
- Anchor text optimization
- Hub and spoke model
- Silo maintenance

### Implementation
- Related posts/pages
- Breadcrumb navigation
- Footer links
- In-content links

---

## Visual & Accessibility Validation

### Visual Testing Tools
| Tool | Purpose |
|------|---------|
| Chromatic | Storybook visual regression |
| Percy | Cross-browser comparison |
| Applitools | AI-powered validation |
| BackstopJS | Visual regression framework |
| Playwright | Cross-browser visual testing |

### Design System Compliance
- Component library verification
- Design token accuracy
- Brand consistency
- Typography validation
- Color palette compliance

### Accessibility (WCAG 2.1/2.2)
| Area | Requirements |
|------|--------------|
| Color contrast | 4.5:1 normal text, 3:1 large text |
| Focus indicators | Visible focus states |
| Text scaling | Readable at 200% zoom |
| Keyboard navigation | Full keyboard access |
| Screen readers | Semantic HTML, ARIA labels |

### Cross-Platform Validation
- Responsive breakpoints
- Mobile-first implementation
- PWA visual compliance
- Print stylesheet verification

---

## Core Web Vitals

### Metrics
| Metric | Target | Description |
|--------|--------|-------------|
| LCP | <2.5s | Largest Contentful Paint |
| FID | <100ms | First Input Delay |
| CLS | <0.1 | Cumulative Layout Shift |
| INP | <200ms | Interaction to Next Paint |

### Optimization Techniques
- Image optimization (WebP, AVIF)
- Lazy loading
- Critical CSS
- JavaScript deferral
- Font loading optimization

---

## Technical SEO

### Crawlability
- robots.txt configuration
- Meta robots tags
- Canonical URLs
- Hreflang for i18n

### Performance
- Page speed optimization
- Mobile-first indexing
- HTTPS enforcement
- Core Web Vitals compliance

### Monitoring
- Google Search Console
- Bing Webmaster Tools
- Crawl error tracking
- Index coverage reports

---

## Visual QA Process

### Validation Checklist
- [ ] Cross-browser consistency
- [ ] Responsive breakpoint behavior
- [ ] Dark mode/theme support
- [ ] Loading state visuals
- [ ] Error state handling
- [ ] Animation smoothness
- [ ] Accessibility compliance
- [ ] Design system adherence

### Testing Methodology
1. Objective visual observation
2. Goal-based verification
3. Measurement validation
4. Cross-platform consistency
5. Edge case analysis
6. Accessibility assessment

### CI/CD Integration
- Automated screenshot comparison
- Visual regression in PR workflows
- Accessibility scanning
- Performance impact analysis
