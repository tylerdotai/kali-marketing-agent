/**
 * Agent Sidecar - The Command Center
 * 
 * Features:
 * - Visible "thinking" process
 * - Draft state proposals
 * - Undo functionality
 * - Deep links to leads
 * - Agent reasoning visible to human
 */

class AgentSidecar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.api = '/api';
        this.manifest = window.Manifest;
        
        this.init();
        this.subscribeToManifest();
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="sidecar">
                <div class="sidecar-header">
                    <div class="sidecar-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>Agent</span>
                    </div>
                    <div class="sidecar-actions">
                        <button class="sidecar-btn" id="undoBtn" title="Undo (Ctrl+Z)" ${this.manifest.getState().undoStack.length === 0 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 7v6h6"/>
                                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                            </svg>
                        </button>
                        <button class="sidecar-btn" id="clearBtn" title="Clear">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="sidecar-thoughts" id="sidecarThoughts">
                    <div class="thought-placeholder">
                        <span class="thought-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                            </svg>
                        </span>
                        <span>Agent ready. Type a command or wait for agent suggestions.</span>
                    </div>
                </div>
                
                <div class="sidecar-drafts" id="sidecarDrafts"></div>
                
                <div class="sidecar-input">
                    <input type="text" id="sidecarInput" placeholder="Command or describe what you need...">
                    <button class="sidecar-send" id="sidecarSend">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }
    
    attachEvents() {
        document.getElementById('sidecarSend').addEventListener('click', () => this.sendCommand());
        document.getElementById('sidecarInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand();
        });
        document.getElementById('undoBtn').addEventListener('click', () => this.handleUndo());
        document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());
        
        // Keyboard shortcut for undo
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.handleUndo();
            }
        });
    }
    
    subscribeToManifest() {
        this.manifest.subscribe((state) => {
            this.renderThoughts(state.agent.thoughts);
            this.renderDrafts(this.manifest.getDrafts());
            
            // Update undo button
            const undoBtn = document.getElementById('undoBtn');
            if (undoBtn) {
                undoBtn.disabled = state.undoStack.length === 0;
            }
        });
    }
    
    renderThoughts(thoughts) {
        const container = document.getElementById('sidecarThoughts');
        if (!container) return;
        
        if (thoughts.length === 0) {
            container.innerHTML = `
                <div class="thought-placeholder">
                    <span class="thought-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4"/>
                            <path d="M12 8h.01"/>
                        </svg>
                    </span>
                    <span>Agent ready. Type a command.</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = thoughts.map(t => `
            <div class="thought ${t.type} ${t.completed ? 'completed' : ''}">
                <div class="thought-header">
                    <span class="thought-type">${this.getThoughtIcon(t.type)}</span>
                    <span class="thought-time">${this.formatTime(t.timestamp)}</span>
                </div>
                <div class="thought-text">${this.escapeHtml(t.text)}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }
    
    renderDrafts(drafts) {
        const container = document.getElementById('sidecarDrafts');
        if (!container) return;
        
        if (drafts.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="drafts-header">
                <span>Proposed Changes</span>
                <button class="drafts-accept-all" onclick="agentSidecar.acceptAllDrafts()">Accept All</button>
            </div>
            <div class="drafts-list">
                ${drafts.map(d => `
                    <div class="draft-item" data-key="${d.key}">
                        <div class="draft-content">
                            <strong>${this.getDraftLabel(d.key)}</strong>
                            <div class="draft-value">${this.escapeHtml(JSON.stringify(d.value))}</div>
                        </div>
                        <div class="draft-actions">
                            <button class="draft-accept" onclick="agentSidecar.acceptDraft('${d.key}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </button>
                            <button class="draft-reject" onclick="agentSidecar.rejectDraft('${d.key}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getThoughtIcon(type) {
        const icons = {
            thinking: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
            action: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            result: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        };
        return icons[type] || icons.thinking;
    }
    
    getDraftLabel(key) {
        const labels = {
            'lead:stage': 'Move Lead',
            'lead:value': 'Update Value',
            'lead:status': 'Change Status',
            'lead:note': 'Add Note'
        };
        return labels[key] || key;
    }
    
    formatTime(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async sendCommand() {
        const input = document.getElementById('sidecarInput');
        const command = input.value.trim();
        if (!command) return;
        
        input.value = '';
        
        // Add user command as thought
        this.manifest.addThought(command, 'action');
        
        // Process via agent
        await this.processCommand(command);
    }
    
    async processCommand(command) {
        const cmd = command.toLowerCase();
        
        // Add thinking indicator
        const thoughtId = this.manifest.addThought('Processing command...', 'thinking');
        
        try {
            let result;
            
            // Parse and execute command
            if (cmd.includes('add') && cmd.includes('lead') || cmd.startsWith('new lead')) {
                const parsed = this.parseLeadText(command);
                this.manifest.addThought(`Creating lead: ${parsed.name}`, 'thinking');
                result = await this.apiCall('/leads', 'POST', parsed);
                this.manifest.completeThought(thoughtId);
                this.manifest.addThought(`Created lead "${parsed.name}" at ${parsed.company || 'N/A'}`, 'result');
                this.refreshData();
                
            } else if (cmd.match(/move.*lead.*to/) || cmd.match(/lead.*stage/)) {
                const match = command.match(/lead\s*#?(\d+).*?(new|contacted|qualified|proposal|negotiation|won|lost)/i);
                if (match) {
                    const [_, leadId, stage] = match;
                    this.manifest.addThought(`Moving lead #${leadId} to ${stage}...`, 'thinking');
                    await this.apiCall(`/leads/${leadId}/stage?new_stage=${stage}`, 'POST');
                    this.manifest.completeThought(thoughtId);
                    this.manifest.addThought(`Lead #${leadId} moved to ${stage}`, 'result');
                    this.manifest.highlightElement(`lead-${leadId}`);
                    this.refreshData();
                }
                
            } else if (cmd.includes('show') || cmd.includes('list') || cmd.includes('find') || cmd.includes('search')) {
                const leads = await this.apiCall('/leads');
                this.manifest.completeThought(thoughtId);
                const leadList = leads.slice(0, 5).map(l => 
                    `• <a href="#" onclick="event.preventDefault();Manifest.selectLead(${l.id})">${l.name}</a> (${l.company || 'No co'})`
                ).join('<br>');
                this.manifest.addThought(`Found ${leads.length} leads:\n${leadList}`, 'result');
                
            } else if (cmd.includes('stat') || cmd.includes('dashboard')) {
                const stats = await this.apiCall('/stats');
                this.manifest.completeThought(thoughtId);
                this.manifest.addThought(`Pipeline: $${this.formatMoney(stats.pipeline_value)} | Won: $${this.formatMoney(stats.won_value)} | Total: ${stats.total_leads} leads`, 'result');
                
            } else if (cmd.includes('help')) {
                this.manifest.completeThought(thoughtId);
                this.manifest.addThought(`Commands:\n• "Add lead: John Smith, Acme Corp"\n• "Move lead #5 to qualified"\n• "Show leads"\n• "Stats"\n• "Delete lead #3"`, 'result');
                
            } else {
                // Default: try quick add
                this.manifest.addThought('Interpreting as quick add...', 'thinking');
                await this.apiCall('/quick-add', 'POST', { text: command });
                this.manifest.completeThought(thoughtId);
                this.manifest.addThought(`Processed: "${command}"`, 'result');
                this.refreshData();
            }
            
        } catch (error) {
            this.manifest.completeThought(thoughtId);
            this.manifest.addThought(`Error: ${error.message}`, 'error');
        }
    }
    
    parseLeadText(text) {
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
    
    async apiCall(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const res = await fetch(this.api + endpoint, options);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
    
    refreshData() {
        // Trigger data refresh in main app
        if (typeof loadLeads === 'function') loadLeads();
        if (typeof loadStats === 'function') loadStats();
        if (typeof loadActivities === 'function') loadActivities();
    }
    
    formatMoney(num) {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toString();
    }
    
    handleUndo() {
        const prev = this.manifest.undo();
        if (prev) {
            this.manifest.addThought('Undid last action', 'result');
            this.refreshData();
        }
    }
    
    handleClear() {
        this.manifest.clearThoughts();
        this.renderThoughts([]);
    }
    
    acceptDraft(key) {
        this.manifest.commitDraft(key);
        this.manifest.addThought(`Accepted change to ${key}`, 'result');
        this.refreshData();
    }
    
    rejectDraft(key) {
        this.manifest.rejectDraft(key);
        this.manifest.addThought(`Rejected change to ${key}`, 'result');
    }
    
    acceptAllDrafts() {
        const drafts = this.manifest.getDrafts();
        drafts.forEach(d => this.manifest.commitDraft(d.key));
        this.manifest.addThought(`Accepted ${drafts.length} changes`, 'result');
        this.refreshData();
    }
}

// Initialize
let agentSidecar;
document.addEventListener('DOMContentLoaded', () => {
    agentSidecar = new AgentSidecar('agentSidecar');
});
