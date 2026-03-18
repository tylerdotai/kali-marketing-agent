# Setup Guide for Kali's Marketing Agent

## Prerequisites
- MacBook (macOS 12+)
- Terminal access
- Canva account
- Gmail or iCloud email
- Telegram (for notifications)

---

## Step 1: Install OpenClaw

### Option A: Download (Recommended)
1. Go to https://openclaw.ai
2. Download OpenClaw for macOS
3. Install the application
4. Follow the setup wizard

### Option B: Homebrew
```bash
brew install openclaw
openclaw setup
```

---

## Step 2: Initial Configuration

### Connect Telegram
```bash
openclaw configure channels
# Select Telegram and follow prompts
```

### Verify Reminders Access
```bash
# OpenClaw will request Reminders access on first use
# Approve when prompted
```

---

## Step 3: Get API Keys

### Canva API
1. Go to https://www.canva.com/developers/
2. Create new integration
3. Copy API token
4. Save somewhere secure

### Gmail (Optional - for email campaigns)
1. Enable Gmail API at console.cloud.google.com
2. Create OAuth credentials
3. Or use App Passwords for basic IMAP/SMTP

### iCloud Email (Alternative)
Use existing iCloud email with Himalaya CLI:
```bash
# Already configured on Tyler's setup
# For Kali, she can use personal iCloud
```

---

## Step 4: Install Skills

### Copy skills to OpenClaw:
```bash
# From this repository
cp -r campaign-manager ~/.openclaw/skills/
cp -r lead-tracker ~/.openclaw/skills/

# Or use the skill creator
openclaw skill install ./campaign-manager
openclaw skill install ./lead-tracker
```

### Verify Skills
```bash
openclaw skills list
# Should show campaign-manager and lead-tracker
```

---

## Step 5: Test the Setup

### Test 1: Campaign Brief
```
You: Create a campaign brief for our tattoo shop reopening

Agent: Should generate full campaign plan with timeline,
       content calendar, and reminder setup
```

### Test 2: Lead Tracking
```
You: Add new lead - Kali, marketing manager at FTW DAO

Agent: Creates lead card and follow-up reminders
```

### Test 3: Social Posts
```
You: Write 3 Instagram posts for a skincare brand launch

Agent: Generates platform-specific posts with hashtags
```

---

## Step 6: Connect with Tyler

When ready for advanced features:
- Tyler can set up custom MCP servers
- Connect to enterprise tools (HubSpot, Mailchimp)
- Build custom skills for specific workflows

---

## Troubleshooting

### "OpenClaw not found"
```bash
# Add to PATH
echo 'export PATH="/Applications/OpenClaw.app/Contents/MacOS:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "Reminders access denied"
Go to System Preferences → Privacy → Reminders → Enable OpenClaw

### "Canva connection failed"
Verify API token is correct and hasn't expired

---

## Next Steps After Setup

1. ✅ Complete this setup guide
2. ✅ Run test commands
3. ✅ Join the FTW DAO community
4. 📅 Schedule onboarding call with Tyler
5. 🚀 Start first real campaign

---

Questions? Reach out to Tyler @tylerdotai on Telegram.
