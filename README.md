<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://codeberg.org/tylerdotai/kali-marketing-agent">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Kali's Marketing Agent</h3>

  <p align="center">
    OpenClaw-powered marketing automation for GNB Global and SaltHaus Group.
    <br />
    <a href="https://codeberg.org/tylerdotai/kali-marketing-agent"><strong>View on Codeberg »</strong></a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#setup">Setup</a></li>
    <li><a href="#skills">Skills</a></li>
    <li><a href="#apps">Apps</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#support">Support</a></li>
  </ol>
</details>



<!-- ABOUT -->
## About

This is Kali's personal marketing agent — configured for her two businesses:

| Business | Description |
|----------|-------------|
| **GNB Global** | Weather protection systems for construction companies |
| **SaltHaus Group** | Fractional CMO and strategic consulting for SMBs |

The agent handles campaign planning, content creation, lead tracking, email sequences, and proposal generation — all from her MacBook.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- SETUP -->
## Setup

### Prerequisites

- MacBook (macOS 12+)
- OpenClaw installed
- Telegram account
- Canva account
- Docker (for CRM app)

### Installation

1. **Clone the repo**
   ```sh
   git clone ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git
   cd kali-marketing-agent
   ```

2. **Run bootstrap**
   ```sh
   bash bootstrap.sh
   ```

3. **Add API keys**
   ```sh
   openclaw config set CANVA_API_TOKEN <your-canva-token>
   ```

4. **Start the CRM** (optional but recommended)
   ```sh
   cd apps/crm
   docker-compose up -d
   ```

See [SETUP.md](./SETUP.md) for detailed instructions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- SKILLS -->
## Skills

| Skill | Description |
|-------|-------------|
| **campaign-manager** | Plan and execute full marketing campaigns |
| **lead-tracker** | Track leads through pipeline stages |
| **social-post** | Generate platform-specific social content |
| **email-nurture** | Build email nurture sequences |
| **research** | Competitor and market research |
| **canva** | Generate designs via Canva MCP |
| **linkedin** | Manage LinkedIn via browser |
| **onboarding** | Client onboarding workflows |
| **proposals** | Generate proposals and one-pagers |
| **analytics** | Pipeline analytics and reporting |
| **setup** | Setup assistant and configuration |

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- APPS -->
## Apps

### Kali CRM
Lightweight SQLite CRM for tracking leads across GNB Global and SaltHaus.

**Start:** `cd apps/crm && docker-compose up -d`

**Access:** http://localhost:8765

**Features:**
- Pipeline view (New → Won/Lost)
- Lead management with activity logging
- Quick add via natural language
- Analytics dashboard at /analytics

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE -->
## Usage

### Examples

**Create a campaign:**
```
"Create a campaign for GNB Global's new weather enclosure product"
```

**Add a lead:**
```
"New lead from event - John Smith, Acme Construction"
```

**Generate content:**
```
"Write 5 LinkedIn posts for our construction clients"
```

**Create a proposal:**
```
"Generate a one-pager for ABC Construction Company"
```

**Track pipeline:**
```
"Show me all qualified leads"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- SUPPORT -->
## Support

**Tyler Delano** — [@tylerdotai](https://twitter.com/tylerdotai)

For setup help or questions about this agent.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
