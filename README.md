<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://codeberg.org/tylerdotai/kali-marketing-agent">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Kali's Marketing Agent</h3>

  <p align="center">
    OpenClaw-powered marketing automation for campaign management, content creation, and lead tracking — tailored for construction, infrastructure, and consulting industries.
    <br />
    <a href="https://codeberg.org/tylerdotai/kali-marketing-agent"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://codeberg.org/tylerdotai/kali-marketing-agent">View Codeberg</a>
    &middot;
    <a href="https://github.com/tylerdotai/kali-marketing-agent/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/tylerdotai/kali-marketing-agent/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Kali's Marketing Agent is an OpenClaw-powered automation system designed for marketing managers. It handles campaign planning, content creation, lead tracking, and email nurture sequences — all from a MacBook.

**Built for:** Kali O'Campo — Business Development Manager @ GNB Global Inc., Owner @ The SaltHaus Group

**Her Industries:**
- Construction & Infrastructure (GNB Global — weather protection systems)
- Energy & Renewables
- SMB Consulting (SaltHaus — Fractional CMO services)

**Core Features:**
- 📅 Plan and execute full marketing campaigns
- ✍️ Generate social media content (Instagram, Facebook, LinkedIn)
- 📧 Build email nurture sequences
- 👥 Track leads through pipeline stages
- 🎨 Connect to Canva for design generation
- 🔍 Research construction/infrastructure industry trends
- 📊 Lightweight SQLite CRM for lead management

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [OpenClaw](https://openclaw.ai)
* [FastAPI](https://fastapi.tiangolo.com)
* [SQLite](https://sqlite.org)
* [Canva](https://canva.com)



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- MacBook (macOS 12+)
- OpenClaw installed
- Telegram account (for notifications)
- Canva account (for design)
- Docker (for CRM app)

### Installation

1. **Clone this repository**
   ```sh
   git clone ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git
   cd kali-marketing-agent
   ```

2. **Run the bootstrap installer**
   ```sh
   bash bootstrap.sh
   ```

3. **Add your API keys**
   ```sh
   openclaw config set CANVA_API_TOKEN <your-canva-token>
   ```

4. **Start the CRM app** (optional but recommended)
   ```sh   cd apps/crm
   docker-compose up -d
   # Open http://localhost:8765
   ```

5. **Test the setup**
   ```sh   # Create a campaign brief
   "Create a campaign brief for GNB Global"   
   # Add a new lead
   "New lead from event - John Smith, Acme Corp"
   # Generate social posts
   "Write 5 LinkedIn posts for our weather protection systems"
   ```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE -->
## Usage

### Campaign Manager
```
User: Create a campaign for product launch
Agent: Generates full campaign plan with timeline, content calendar, reminders
```

### Lead Tracking
```
User: New lead from FTW DAO - Kali, marketing for crypto startup
Agent: Creates lead card, sets follow-up reminders, tracks pipeline stage
```

### CRM App
Access the lightweight CRM at `http://localhost:8765` after starting with Docker:
- Pipeline view (New → Contacted → Qualified → Proposal → Negotiation → Won/Lost)
- Lead management with contact info and activity logging
- Quick add via natural language

### Social Content Creation
```
User: Write 5 Instagram posts for skincare brand launch
Agent: Generates platform-specific posts with hashtags and design requests
```

### Quick Commands
| Command | Action |
|---------|--------|
| `new lead: [name]` | Create lead + reminder |
| `[name] status [stage]` | Update pipeline stage |
| `content for [topic]` | Generate content plan |
| `campaign [name]` | Create campaign brief |
| `quick-add [text]` | Natural language lead creation |

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

#### Skills
- [x] Campaign Manager skill
- [x] Lead Tracker skill
- [x] Social Post generator
- [x] Email Nurture sequences
- [x] Research skill
- [x] Setup assistant

#### Apps
- [x] Kali CRM (SQLite-based pipeline tracking)

#### Coming Soon
- [ ] Canva MCP integration
- [ ] Gmail API integration
- [ ] LinkedIn MCP integration
- [ ] Analytics dashboard
- [ ] Client onboarding flow
- [ ] Proposal templates

See the [open issues](https://codeberg.org/tylerdotai/kali-marketing-agent/issues) for full list.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Unlicense License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

**Tyler Delano** — [@tylerdotai](https://twitter.com/tylerdotai)

**Kali O'Campo** — [@itsmskali](https://linkedin.com/in/itsmskali)

Project Link: https://codeberg.org/tylerdotai/kali-marketing-agent

<p align="right">(<a href="#readme-top">back to top</a>)</p>
