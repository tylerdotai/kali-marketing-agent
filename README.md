# Kali's Marketing Agent

**Self-installing bootstrap kit for Kali's OpenClaw marketing agent.**

---

## 🚀 Quick Install

When you install OpenClaw on Kali's MacBook, run:

```bash
# Point to this repo
git clone ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git
cd kali-marketing-agent

# Run bootstrap
bash bootstrap.sh
```

The bootstrap script will:
1. Clone this repo
2. Install all skills to `~/.openclaw/skills/`
3. Set up the client profile
4. Check for required API keys

---

## 📦 What's Included

### Skills (5)
| Skill | Purpose |
|-------|---------|
| `campaign-manager` | Plan and execute full campaigns |
| `lead-tracker` | Track leads through pipeline stages |
| `social-post` | Generate platform-specific social content |
| `email-nurture` | Build email nurture sequences |
| `research` | Competitor and market research |

### Setup
| File | Purpose |
|------|---------|
| `bootstrap.sh` | One-command installer |
| `manifest.json` | Skill registry and config specs |
| `setup/` | Setup assistant skill |

### Templates & Workflows
| File | Purpose |
|------|---------|
| `workflows/content-creation.md` | Content pipeline |
| `workflows/lead-nurturing.md` | Lead follow-up flow |
| `templates/social-post.md` | Post templates |

---

## 🔑 API Keys Needed

| Key | Required | Get It |
|-----|----------|--------|
| **CANVA_API_TOKEN** | ✅ Yes | https://www.canva.com/developers/ |
| **Gmail API** | Optional | https://console.cloud.google.com/ |
| **iCloud password** | Optional | https://appleid.apple.com/app-passwords |

After bootstrap, configure keys:
```bash
openclaw config set CANVA_API_TOKEN <token>
```

---

## 👤 Client Profile

Built for **Kali O'Campo**:
- **GNB Global Inc.** — Weather protection systems for construction
- **The SaltHaus Group** — Fractional CMO consulting
- **Industries:** Construction, Infrastructure, Energy, SMB Consulting
- **Location:** Grapevine, Texas

See `KALI.md` for full profile.

---

## 📋 After Install Checklist

- [ ] Run `bash bootstrap.sh`
- [ ] Add Canva API token: `openclaw config set CANVA_API_TOKEN <token>`
- [ ] (Optional) Configure email
- [ ] Test: "Create a campaign brief for GNB Global"
- [ ] Connect Telegram for notifications
- [ ] Join FTW DAO community

---

## 🆘 Support

**Tyler Delano** — @tylerdotai on Telegram

---

## Repository Structure

```
kali-marketing-agent/
├── README.md
├── manifest.json          # Skill registry
├── bootstrap.sh           # One-command installer
├── KALI.md               # Client profile
├── SETUP.md              # Detailed setup guide
├── skills/
│   ├── campaign-manager/
│   ├── lead-tracker/
│   ├── social-post/
│   ├── email-nurture/
│   ├── research/
│   └── setup/
├── workflows/
│   ├── content-creation.md
│   └── lead-nurturing.md
└── templates/
    └── social-post.md
```
