#!/bin/bash
#
# Kali's Marketing Agent - Bootstrap Installer
# Run this after installing OpenClaw to set up everything
#

set -e

REPO_URL="ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git"
SKILLS_DIR="$HOME/.openclaw/skills"
WORK_DIR="/tmp/kali-marketing-agent-install"

echo "🚀 Installing Kali's Marketing Agent"
echo "=================================="
echo ""

# Step 1: Clone/pull repo
echo "📥 Fetching latest from Codeberg..."
if [ -d "$WORK_DIR" ]; then
    cd "$WORK_DIR" && git pull origin main
else
    git clone "$REPO_URL" "$WORK_DIR"
fi

# Step 2: Install skills
echo ""
echo "📦 Installing skills..."
for skill in skills/*/; do
    skill_name=$(basename "$skill")
    dest="$SKILLS_DIR/$skill_name"
    
    if [ -d "$dest" ]; then
        echo "  ↻ $skill_name (already installed, skipping)"
    else
        cp -r "$skill" "$dest"
        echo "  ✅ $skill_name"
    fi
done

# Step 3: Install client profile
echo ""
echo "👤 Installing client profile..."
cp manifest.json "$HOME/.openclaw/clients/kali-marketing-agent.json" 2>/dev/null || \
mkdir -p "$HOME/.openclaw/clients" && \
cp manifest.json "$HOME/.openclaw/clients/kali-marketing-agent.json"
echo "  ✅ Client profile installed"

# Step 4: Check for required API keys
echo ""
echo "🔑 API Key Setup"
echo "----------------"

check_key() {
    local key_name=$1
    local key_file="$HOME/.openclaw/.env"
    
    if grep -q "$key_name=" "$key_file" 2>/dev/null; then
        echo "  ✅ $key_name is configured"
        return 0
    else
        echo "  ⚠️  $key_name not found"
        return 1
    fi
}

# Check existing keys
check_key "CANVA_API_TOKEN" || echo "    → Set with: openclaw config set CANVA_API_TOKEN <token>"

echo ""
echo "=================================="
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Set required API keys:"
echo "   openclaw config set CANVA_API_TOKEN <your-canva-token>"
echo ""
echo "2. Test the agent:"
echo "   'Create a campaign brief for GNB Global'"
echo ""
echo "3. For full setup guide, see SETUP.md"
echo ""
echo "Questions? Contact Tyler @tylerdotai"
