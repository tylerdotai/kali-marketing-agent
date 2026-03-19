// CRM Command Widget - Embedded version
// This gets injected into the main page

document.write(`
<style>
/* Widget styles - uses CRM CSS variables */
.command-widget-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
    z-index: 9998;
}

.command-widget-toggle:hover {
    transform: scale(1.05);
    background: var(--accent-hover);
}

.command-widget-panel {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 380px;
    max-width: calc(100vw - 48px);
    height: 520px;
    max-height: calc(100vh - 140px);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    display: none;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    overflow: hidden;
}

.command-widget-panel.open {
    display: flex;
    animation: slideUp 0.25s ease;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.command-widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-subtle);
}

.command-widget-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.command-widget-title svg {
    color: var(--accent);
}

.command-widget-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
}

.command-widget-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.command-widget-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.command-widget-message {
    display: flex;
    flex-direction: column;
    max-width: 85%;
}

.command-widget-message.user {
    align-self: flex-end;
}

.command-widget-message.bot {
    align-self: flex-start;
}

.command-widget-content {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
}

.command-widget-message.user .command-widget-content {
    background: var(--accent);
    color: white;
    border-bottom-right-radius: 4px;
}

.command-widget-message.bot .command-widget-content {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
}

.command-widget-content p {
    margin: 0;
}

.command-widget-content ul {
    margin: 8px 0;
    padding-left: 20px;
}

.command-widget-content li {
    margin: 4px 0;
    font-size: 13px;
}

.command-widget-time {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    padding: 0 4px;
}

.command-widget-typing {
    display: flex;
    gap: 4px;
    padding: 4px 0;
}

.command-widget-typing span {
    width: 8px;
    height: 8px;
    background: var(--text-muted);
    border-radius: 50%;
    animation: typingAnim 1.4s infinite;
}

.command-widget-typing span:nth-child(2) { animation-delay: 0.2s; }
.command-widget-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingAnim {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
}

.command-widget-input-container {
    display: flex;
    gap: 8px;
    padding: 16px;
    border-top: 1px solid var(--border-subtle);
}

.command-widget-input {
    flex: 1;
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 24px;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
}

.command-widget-input:focus {
    border-color: var(--accent);
}

.command-widget-input::placeholder {
    color: var(--text-muted);
}

.command-widget-send {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    transition: all 0.15s;
}

.command-widget-send:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
}

.command-widget-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 480px) {
    .command-widget-panel {
        width: calc(100vw - 32px);
        bottom: 90px;
        right: 16px;
    }
}
</style>

<button class="command-widget-toggle" id="widgetToggleBtn" onclick="toggleCommandWidget()">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span class="command-widget-badge" id="widgetBadge" style="display:none">0</span>
</button>

<div class="command-widget-panel" id="commandWidgetPanel">
    <div class="command-widget-header">
        <div class="command-widget-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Command Center</span>
        </div>
        <button class="command-widget-close" onclick="toggleCommandWidget()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <div class="command-widget-messages" id="widgetMessages">
        <div class="command-widget-message bot">
            <div class="command-widget-content">
                <p>Hello! I'm your CRM assistant. I can help you:</p>
                <ul>
                    <li>"Add a lead: John Smith, Acme Corp"</li>
                    <li>"Move lead 5 to qualified"</li>
                    <li>"Show me all leads from LinkedIn"</li>
                    <li>"Stats" or "Dashboard"</li>
                </ul>
                <p>Type a command or question below.</p>
            </div>
            <span class="command-widget-time">Just now</span>
        </div>
    </div>

    <div class="command-widget-input-container">
        <input type="text" class="command-widget-input" id="widgetInput" 
               placeholder="Type a command..." 
               onkeypress="if(event.key==='Enter') sendWidgetMessage()">
        <button class="command-widget-send" onclick="sendWidgetMessage()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
        </button>
    </div>
</div>
`);

let widgetOpen = false;

function toggleCommandWidget() {
    const panel = document.getElementById('commandWidgetPanel');
    widgetOpen = !widgetOpen;
    if (widgetOpen) {
        panel.classList.add('open');
        document.getElementById('widgetInput').focus();
    } else {
        panel.classList.remove('open');
    }
}

function escapeHtmlWidget(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

async function sendWidgetMessage() {
    const input = document.getElementById('widgetInput');
    const message = input.value.trim();
    if (!message) return;

    addWidgetMessage(message, 'user');
    input.value = '';

    const typingId = 'typing-' + Date.now();
    addWidgetTyping(typingId);

    try {
        const response = await processWidgetCommand(message);
        removeWidgetTyping(typingId);
        addWidgetMessage(response, 'bot');
        
        if (response.refresh) {
            if (typeof loadLeads === 'function') loadLeads();
            if (typeof loadStats === 'function') loadStats();
            if (typeof loadActivities === 'function') loadActivities();
        }
    } catch (error) {
        removeWidgetTyping(typingId);
        addWidgetMessage('Error: ' + error.message, 'bot');
    }
}

async function processWidgetCommand(command) {
    const cmd = command.toLowerCase();

    // Add Lead
    if (cmd.includes('add') && cmd.includes('lead') || cmd.startsWith('new lead')) {
        const parsed = parseWidgetLead(command);
        const result = await widgetApi('/leads', {
            method: 'POST',
            body: JSON.stringify(parsed)
        });
        return { message: `Created lead "${parsed.name}".`, refresh: true };
    }

    // Move Stage
    const stageMatch = command.match(/lead\s*(\d+).*?(new|contacted|qualified|proposal|negotiation|won|lost)/i);
    if (stageMatch) {
        const [, leadId, stage] = stageMatch;
        await widgetApi(`/leads/${leadId}/stage?new_stage=${stage}`, { method: 'POST' });
        return { message: `Moved lead #${leadId} to ${stage}.`, refresh: true };
    }

    // Show leads
    if (cmd.includes('show') || cmd.includes('list') || cmd.includes('find') || cmd.includes('search')) {
        const leads = await widgetApi('/leads');
        const leadList = leads.slice(0, 10).map(l => 
            `• ${l.name} (${l.company || 'No co'}) - ${l.stage}`
        ).join('\n');
        return { message: `Found ${leads.length} leads:\n${leadList || 'None yet'}` };
    }

    // Stats
    if (cmd.includes('stat') || cmd.includes('dashboard') || cmd.includes('pipeline')) {
        const stats = await widgetApi('/stats');
        return { message: `Pipeline: $${formatNumber(stats.pipeline_value)} | Won: $${formatNumber(stats.won_value)} | Total: ${stats.total_leads} leads` };
    }

    // Quick add
    if (cmd.includes('from')) {
        await widgetApi('/quick-add', { method: 'POST', body: JSON.stringify({ text: command }) });
        return { message: `Added lead from input.`, refresh: true };
    }

    // Delete lead
    const delMatch = command.match(/delete.*lead\s*(\d+)/i);
    if (delMatch) {
        await widgetApi(`/leads/${delMatch[1]}`, { method: 'DELETE' });
        return { message: `Deleted lead #${delMatch[1]}.`, refresh: true };
    }

    // Help
    if (cmd.includes('help') || cmd === '?') {
        return { message: `Commands:\n• "Add lead: John Smith, Acme Corp"\n• "Move lead 5 to qualified"\n• "Show all leads"\n• "Delete lead 3"\n• "Stats"\n• Or just describe naturally!` };
    }

    // Default - try quick add
    await widgetApi('/quick-add', { method: 'POST', body: JSON.stringify({ text: command }) });
    return { message: `Processed: "${command}"`, refresh: true };
}

function parseWidgetLead(text) {
    const result = { name: '', company: null, source: null, business_type: 'gnb' };
    const match = text.match(/lead[:\s]+([^,]+),?\s*([^,]+)?/i);
    if (match) {
        result.name = match[1].trim();
        result.company = match[2]?.trim() || null;
    } else {
        result.name = text.replace(/add|lead|new|from/gi, '').trim();
    }
    const sources = ['linkedin', 'event', 'referral', 'website', 'cold call', 'email'];
    for (const src of sources) {
        if (text.toLowerCase().includes(src)) {
            result.source = src.charAt(0).toUpperCase() + src.slice(1);
            break;
        }
    }
    if (text.toLowerCase().includes('consulting') || text.toLowerCase().includes('salthaus')) {
        result.business_type = 'salthaus';
    }
    return result;
}

function addWidgetMessage(content, type) {
    const messages = document.getElementById('widgetMessages');
    const msg = document.createElement('div');
    msg.className = `command-widget-message ${type}`;
    msg.innerHTML = `
        <div class="command-widget-content"><p>${escapeHtmlWidget(content)}</p></div>
        <span class="command-widget-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function addWidgetTyping(id) {
    const messages = document.getElementById('widgetMessages');
    const msg = document.createElement('div');
    msg.className = 'command-widget-message bot';
    msg.id = id;
    msg.innerHTML = `
        <div class="command-widget-content">
            <div class="command-widget-typing"><span></span><span></span><span></span></div>
        </div>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function removeWidgetTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function widgetApi(endpoint, options = {}) {
    const res = await fetch('/api' + endpoint, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num?.toString() || '0';
}
