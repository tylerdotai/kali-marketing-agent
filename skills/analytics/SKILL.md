---
name: analytics
description: |
  Analytics and reporting for lead pipeline and campaign performance.
  Use when: reporting, pipeline analysis, lead stats, conversion metrics.
triggers:
  - "analytics"
  - "report"
  - "stats"
  - "dashboard"
  - "metrics"
  - "pipeline analysis"
---

# Analytics Dashboard

View pipeline analytics and campaign performance at http://localhost:8765/analytics

## Dashboard Sections

### 1. Pipeline Overview
- Total leads by stage
- Average time in each stage
- Conversion rates between stages

### 2. Lead Sources
- Which channels bring the most leads
- Source-to-close rates
- Cost per lead by source

### 3. Business Split
- GNB Global vs SaltHaus leads
- Revenue by business unit
- Pipeline value by business

### 4. Recent Activity
- Leads added (7/30/90 days)
- Activities logged
- Follow-ups due

### 5. Trends
- Leads added over time
- Stage progression over time
- Pipeline value trends

## Quick Stats Commands

| Command | Output |
|---------|--------|
| `show stats` | Total leads, pipeline value, won value |
| `leads by stage` | Count in each pipeline stage |
| `top sources` | Best lead conversion sources |
| `pipeline report` | Full pipeline summary |
| `weekly leads` | Leads added this week |

## Access

Dashboard runs at: http://localhost:8765/analytics

Updated every 30 seconds from CRM database.
