---
name: kali-crm
version: 1.0.0
description: |
  Lightweight CRM for tracking leads through pipeline stages.
  Use when: managing leads, tracking sales pipeline, logging activities,
  generating reports, or any sales/lead management tasks.
triggers:
  - "crm"
  - "lead"
  - "pipeline"
  - "sales"
  - "prospect"
  - "client"
---

# Kali CRM - Agent Interface

A SQLite-based CRM API for managing leads across GNB Global and SaltHaus businesses.

## Authentication

Include header: `X-API-Key: your-api-key`

## Base URL

```
http://localhost:8765/api
```

## API Endpoints

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List all leads |
| POST | `/leads` | Create a lead |
| GET | `/leads/{id}` | Get lead details |
| PUT | `/leads/{id}` | Update a lead |
| DELETE | `/leads/{id}` | Delete a lead |
| POST | `/leads/{id}/stage` | Move lead to stage |
| POST | `/leads/{id}/activity` | Log activity |
| GET | `/leads/{id}/activities` | Get lead activities |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get recent activities |

### Stats & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats |
| GET | `/analytics` | Full analytics |
| GET | `/analytics/conversions` | Stage conversion rates |
| GET | `/analytics/sources` | Lead source analysis |
| GET | `/analytics/business` | Business split |
| GET | `/analytics/trends` | Trend data |
| GET | `/analytics/activity` | Activity summary |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Lead Stages

Pipeline stages in order:
```
new → contacted → qualified → proposal → negotiation → won/lost
```

## Quick Add Lead

```
POST /api/quick-add
Body: {"text": "New lead from event - John Smith, Acme Corp"}
```

## Usage Examples

### Create a Lead
```bash
curl -X POST http://localhost:8765/api/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"name": "John Smith", "company": "Acme Corp", "source": "LinkedIn"}'
```

### Move Lead to Stage
```bash
curl -X POST http://localhost:8765/api/leads/1/stage?new_stage=qualified
```

### Log Activity
```bash
curl -X POST http://localhost:8765/api/leads/1/activity \
  -H "Content-Type: application/json" \
  -d '{"activity_type": "email", "description": "Sent intro email"}'
```

### Search Leads
```bash
curl "http://localhost:8765/api/leads?search=acme"
```

## Business Types

- `gnb` - GNB Global (weather protection systems)
- `salthaus` - SaltHaus Group (consulting)

## Response Format

All responses are JSON. Success responses:
```json
{"id": 1, "name": "John", ...}
```

Error responses:
```json
{"detail": "Error message"}
```

## Rate Limits

No rate limits for local use. Use responsibly.

## Notes

- All data stored locally in SQLite
- Soft delete (leads marked deleted, not removed)
- Activities auto-logged for stage changes
- Pipeline value = sum of estimated_value in active stages
