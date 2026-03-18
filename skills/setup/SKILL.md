---
name: setup
description: |
  Check and configure required API keys for the marketing agent.
  Use when: setting up for the first time, adding new API keys, troubleshooting connections.
triggers:
  - "setup"
  - "configure"
  - "api key"
  - "install"
  - "check setup"
---

# Marketing Agent Setup

## Quick Start

Welcome! This agent needs a few API keys to be fully functional. Let's check what you have and what you're missing.

## Required API Keys

### 1. Canva API Token (REQUIRED)
**Why:** Creates social media graphics and marketing designs automatically.

**Get yours:**
1. Go to https://www.canva.com/developers/
2. Create a new integration
3. Copy the API token

**Configure:**
```
openclaw config set CANVA_API_TOKEN <your-token>
```

### 2. iCloud Email or Gmail (OPTIONAL)
**Why:** Send email newsletters and follow-up sequences.

**Option A - iCloud:**
1. Go to https://appleid.apple.com/app-passwords
2. Generate an app-specific password
3. Run: `himalaya account add icloud`

**Option B - Gmail:**
1. Go to https://console.cloud.google.com/
2. Enable Gmail API
3. Create OAuth credentials
4. Configure gmail skill

## Check Current Status

Run this to see what's configured:
```bash
openclaw config get | grep -E "CANVA|GMAIL|ICLOUD"
```

## After Setup

Once configured, try:
- "Create a campaign brief for GNB Global"
- "Add a new lead from the FTW DAO meetup"
- "Write 5 LinkedIn posts for our weather protection systems"

## Troubleshooting

### "Skill not found"
Run: `openclaw skills list` to see installed skills

### "API connection failed"
Verify your API token is correct and hasn't expired

### "Permission denied"
Make sure you've approved the skill in OpenClaw settings

## Need Help?

Contact Tyler @tylerdotai on Telegram
