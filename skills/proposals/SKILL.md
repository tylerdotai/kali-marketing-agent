---
name: proposals
description: |
  Generate proposal documents for GNB Global and SaltHaus consulting services.
  Use when: creating proposals, one-pagers, case studies, pricing packages, client presentations.
triggers:
  - "proposal"
  - "one-pager"
  - "case study"
  - "pricing"
  - "quote"
  - "SOW"
  - "statement of work"
---

# Proposal Templates

Generate professional proposals, one-pagers, and case studies for GNB Global and SaltHaus.

## Templates

### GNB Global
- `gnb-one-pager.md` — One-page overview for GNB weather protection systems
- `gnb-case-study.md` — Case study template for construction projects

### SaltHaus Consulting
- `salthaus-proposal.md` — Full consulting proposal
- `salthaus-pricing.md` — Pricing package layouts
- `salthaus-case-study.md` — Consulting case study template

## Quick Commands

| Command | Output |
|---------|--------|
| `gnb proposal [company]` | GNB one-pager for [company] |
| `salthaus proposal [client]` | Full proposal for [client] |
| `case study [company]` | Case study for [company] |
| `pricing [service]` | Pricing table for [service] |

## Usage

```
User: Create a one-pager for ABC Construction
Agent: Fills in gnb-one-pager.md template with ABC's info, outputs Markdown
Agent: Optionally creates Canva design from the content
```

## Customization

Each template has variables to fill:
- `[Client Name]`
- `[Company]`
- `[Project Type]`
- `[Timeline]`
- `[Investment]`

Agent will ask for required info if not provided.
