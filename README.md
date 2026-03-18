<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Kali's Marketing Agent</h3>

  <p align="center">
    OpenClaw-powered marketing automation for campaign management, content creation, and lead tracking.
    <br />
    <a href="https://codeberg.org/tylerdotai/kali-marketing-agent"><strong>View on Codeberg »</strong></a>
    <br />
    <br />
    Built for Kali (FTW DAO) — Marketing Manager
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
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

**Built for:** Kali (FTW DAO) — Marketing Manager

**What it does:**
- 📅 Plan and execute full marketing campaigns
- ✍️ Generate social media content (Instagram, Facebook, TikTok)
- 📧 Build email nurture sequences
- 👥 Track leads through pipeline stages
- 🎨 Connect to Canva for design generation

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- MacBook (macOS 12+)
- OpenClaw installed
- Telegram account (for notifications)
- Canva account (for design)
- Gmail or iCloud email

### Installation

1. **Install OpenClaw**
   ```sh
   brew install openclaw
   # OR download from https://openclaw.ai
   ```

2. **Clone this repository**
   ```sh
   git clone ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git
   cd kali-marketing-agent
   ```

3. **Copy skills to OpenClaw**
   ```sh
   cp -r campaign-manager ~/.openclaw/skills/
   cp -r lead-tracker ~/.openclaw/skills/
   ```

4. **Configure services**
   - Connect Telegram: `openclaw configure channels`
   - Add Canva API token (see SETUP.md)
   - Verify Reminders access

5. **Test the setup**
   ```sh
   # Test campaign creation
   "Create a campaign brief for our tattoo shop reopening"
   
   # Test lead tracking
   "Add new lead - Kali, marketing manager at FTW DAO"
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

### Content Creation
```
User: Write 5 Instagram posts for skincare brand launch
Agent: Generates platform-specific posts with hashtags and design requests
```

### Email Sequences
```
User: Create a welcome email sequence for new subscribers
Agent: Generates 5-email nurture sequence with subject lines and CTAs
```

### Quick Commands
| Command | Action |
|---------|--------|
| `new lead: [name]` | Create lead + reminder |
| `[name] status [stage]` | Update pipeline stage |
| `content for [topic]` | Generate content plan |
| `campaign [name]` | Create campaign brief |

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Campaign Manager skill
- [x] Lead Tracker skill
- [x] Email sequence templates
- [x] Social post templates
- [x] Setup guide
- [ ] Canva MCP integration
- [ ] Gmail API integration
- [ ] LinkedIn MCP integration
- [ ] Analytics dashboard
- [ ] Custom skill builder

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Unlicense License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

**Tyler Delano** — [@tylerdotai](https://twitter.com/tylerdotai)

**Kali** — FTW DAO

Project Link: https://codeberg.org/tylerdotai/kali-marketing-agent

<p align="right">(<a href="#readme-top">back to top</a>)</p>
