---
name: canva
description: |
  Generate marketing designs via Canva MCP server.
  Use when: creating social posts, designing graphics, generating campaign visuals,
  creating Instagram/Facebook/LinkedIn content, or any design request.
triggers:
  - "canva"
  - "design"
  - "graphic"
  - "create image"
  - "social post"
  - "visual"
---

# Canva Design Integration

Generate professional marketing designs automatically via the Canva MCP server.

## Setup

### 1. Get Canva API Token
1. Go to https://www.canva.com/developers/
2. Create a new integration
3. Copy the API token

### 2. Configure the MCP Server

**Option A: mcporter (Recommended)**
```bash
# Add the Canva MCP server via mcporter
mcporter server add canva \
  --type npm \
  --package @iflow-mcp/mattcoatsworth-canva-mcp-server \
  --auth CANVA_API_TOKEN=<your-token>
```

**Option B: Manual**
```bash
npm install -g @iflow-mcp/mattcoatsworth-canva-mcp-server
export CANVA_API_TOKEN=<your-token>
```

### 3. Test Connection
```
"Canva: List my designs"
```

## Usage

### Design Requests

```
User: Create an Instagram post announcing our product launch

Agent → Canva MCP → Generates design → Returns design link/file
```

### Supported Operations

| Operation | Description |
|-----------|-------------|
| `create_design` | Create a new design from template |
| `list_designs` | List your existing designs |
| `get_design` | Get design details |
| `export_design` | Export design as PNG/PDF |
| `upload_media` | Upload images to Canva |
| `search_templates` | Search Canva templates |

### Design Types

| Platform | Size |
|----------|------|
| Instagram Post | 1080×1080px |
| Instagram Story | 1080×1920px |
| Facebook Post | 1200×630px |
| LinkedIn Post | 1200×627px |
| Twitter Post | 1600×900px |

## Example Prompts

### Social Post
```
"Create an Instagram post for our tattoo shop reopening.
Theme: Bold, black ink aesthetic. Text: 'WE'RE BACK 🔥'
Size: 1080x1080"
```

### Campaign Graphic
```
"Design a Facebook cover image for GNB Global.
Theme: Construction/industrial, weather protection.
Colors: Blue and white. Text: 'Weather Protection for Construction'"
```

### Event Flyer
```
"Create an event flyer for our FTW DAO meetup.
Theme: Tech/Web3. Size: 1080x1080.
Include: Date, location, 'RSVP Now' CTA"
```

## Troubleshooting

### "Connection failed"
- Verify your CANVA_API_TOKEN is correct
- Run `mcporter servers list` to check status
- Restart mcporter: `killall mcporter && mcporter serve`

### "Permission denied"
- Canva API requires approval for some features
- Check https://www.canva.com/developers/ for your app permissions

### "Design not found"
- Designs are created in your Canva account
- Check https://www.canva.com/designs/

## Notes

- Canva MCP uses the official Canva API
- Free tier has limited API calls/month
- All designs are saved to your Canva account
