// Kali CRM - Main Application JavaScript

const API = '/api';
let currentLeads = [];
let currentDetailLead = null;
let currentFilters = { search: '', business: '', source: '' };

// =====================================
// INITIALIZATION
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    initManifest();
    loadStats();
    loadLeads();
    loadActivities();
    setupEventListeners();
    startDataRefresh();
});

function initManifest() {
    if (typeof Manifest !== 'undefined') {
        Manifest.subscribe((state) => {
            renderThoughts(state.agent.thoughts);
            renderDrafts(Manifest.getDrafts());
            updateUndoButton();
        });
    }
}

function setupEventListeners() {
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) addBtn.addEventListener('click', () => showAddModal());
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
            loadLeads();
        });
    }
    
    const filterBusiness = document.getElementById('filterBusiness');
    if (filterBusiness) {
        filterBusiness.addEventListener('change', (e) => {
            currentFilters.business = e.target.value;
            loadLeads();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            handleUndo();
        }
        if (e.key === 'Escape') {
            closeModal();
            closeDetailModal();
        }
    });
}

function startDataRefresh() {
    setInterval(() => {
        loadStats();
        loadLeads();
        loadActivities();
    }, 30000);
}

// =====================================
// VIEW SWITCHING
// =====================================

function setView(view) {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    const title = document.getElementById('viewTitle');
    if (title) title.textContent = view.charAt(0).toUpperCase() + view.slice(1);
    
    const pipelineView = document.getElementById('pipelineView');
    const analyticsView = document.getElementById('analyticsView');
    if (pipelineView) pipelineView.style.display = view === 'pipeline' ? '' : 'none';
    if (analyticsView) analyticsView.style.display = view === 'analytics' ? '' : 'none';
    
    if (typeof Manifest !== 'undefined') {
        Manifest.setState({ canvas: { activeView: view } });
    }
}

function focusSearch() {
    const input = document.getElementById('searchInput');
    if (input) input.focus();
}

// =====================================
// API HELPERS
// =====================================

async function api(endpoint, options = {}) {
    try {
        const res = await fetch(API + endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    } catch (err) {
        console.error('API Error:', err);
        showToast('Error: ' + err.message, 'error');
        return null;
    }
}

// =====================================
// DATA LOADING
// =====================================

async function loadStats() {
    const stats = await api('/stats');
    if (!stats) return;
    
    const totalEl = document.getElementById('totalLeadsHeader');
    const statTotalEl = document.getElementById('statTotal');
    const statPipelineEl = document.getElementById('statPipeline');
    const statWonEl = document.getElementById('statWon');
    const statActivitiesEl = document.getElementById('statActivities');
    
    if (totalEl) totalEl.textContent = stats.total_leads + ' leads';
    if (statTotalEl) statTotalEl.textContent = stats.total_leads;
    if (statPipelineEl) statPipelineEl.textContent = '$' + formatNumber(stats.pipeline_value || 0);
    if (statWonEl) statWonEl.textContent = '$' + formatNumber(stats.won_value || 0);
    if (statActivitiesEl) statActivitiesEl.textContent = stats.recent_activities;
}

async function loadLeads() {
    const params = new URLSearchParams();
    if (currentFilters.business) params.append('business_type', currentFilters.business);
    if (currentFilters.source) params.append('source', currentFilters.source);
    if (currentFilters.search) params.append('search', currentFilters.search);
    
    const query = params.toString();
    currentLeads = await api('/leads' + (query ? '?' + query : ''));
    if (currentLeads === null) return;
    renderPipeline();
}

async function loadActivities() {
    const activities = await api('/activities?days=7');
    if (!activities || !Array.isArray(activities)) return;
    renderActivities(activities.slice(0, 10));
}

// =====================================
// RENDER: PIPELINE
// =====================================

function renderPipeline() {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const stageNames = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
    
    const pipeline = document.getElementById('pipelineView');
    if (!pipeline) return;
    
    pipeline.innerHTML = stages.map(stage => {
        const stageLeads = (currentLeads || []).filter(l => l.stage === stage);
        return '<div class="pipeline-stage">' +
            '<div class="stage-header"><span class="stage-name">' + stageNames[stage] + '</span><span class="stage-count">' + stageLeads.length + '</span></div>' +
            '<div class="stage-leads">' + stageLeads.map(lead => renderLeadCard(lead)).join('') + '</div>' +
        '</div>';
    }).join('');
}

function renderLeadCard(lead) {
    const value = lead.estimated_value ? '$' + formatNumber(lead.estimated_value) : '';
    const businessLabel = lead.business_type === 'gnb' ? 'GNB' : 'SaltHaus';
    
    return '<div class="lead-card ' + lead.business_type + '" id="lead-' + lead.id + '" onclick="showLeadDetail(' + lead.id + ')">' +
        '<div class="lead-card-header">' +
            '<div><div class="lead-name">' + escapeHtml(lead.name) + '</div>' +
            (lead.company ? '<div class="lead-company">' + escapeHtml(lead.company) + '</div>' : '') +
            '</div>' +
            (value ? '<span class="lead-value">' + value + '</span>' : '') +
        '</div>' +
        '<div class="lead-meta">' +
            (lead.source ? '<span class="lead-badge">' + escapeHtml(lead.source) + '</span>' : '') +
            '<span class="lead-badge ' + lead.business_type + '">' + businessLabel + '</span>' +
        '</div>' +
    '</div>';
}

// =====================================
// RENDER: ACTIVITIES
// =====================================

function renderActivities(activities) {
    const list = document.getElementById('activityList');
    if (!list) return;
    
    if (!activities || activities.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No recent activity</p></div>';
        return;
    }
    
    list.innerHTML = activities.map(act => {
        const icon = getActivityIcon(act.activity_type);
        const time = formatTime(act.created_at);
        let leadInfo = '';
        if (act.lead_name) {
            leadInfo = '<strong>' + escapeHtml(act.lead_name) + '</strong>';
            if (act.lead_company) leadInfo += ' <span style="color: var(--text-muted)">@ ' + escapeHtml(act.lead_company) + '</span>';
        }
        
        return '<div class="activity-item">' +
            '<div class="activity-icon">' + icon + '</div>' +
            '<div class="activity-content">' +
                '<div class="activity-text">' + leadInfo + ' <span style="color: var(--text-muted)">- ' + escapeHtml(act.description || act.activity_type) + '</span></div>' +
                '<div class="activity-meta"><span class="activity-time">' + time + '</span></div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function getActivityIcon(type) {
    const icons = {
        'created': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
        'stage_change': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>',
        'email': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        'call': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        'meeting': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        'note': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };
    return icons[type] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}

// =====================================
// MODALS: ADD/EDIT LEAD
// =====================================

function showAddModal(lead) {
    document.getElementById('modalTitle').textContent = lead ? 'Edit Lead' : 'Add Lead';
    document.getElementById('leadId').value = lead?.id || '';
    document.getElementById('leadName').value = lead?.name || '';
    document.getElementById('leadCompany').value = lead?.company || '';
    document.getElementById('leadEmail').value = lead?.email || '';
    document.getElementById('leadPhone').value = lead?.phone || '';
    document.getElementById('leadSource').value = lead?.source || '';
    document.getElementById('leadBusiness').value = lead?.business_type || 'gnb';
    document.getElementById('leadValue').value = lead?.estimated_value || '';
    document.getElementById('leadNotes').value = lead?.notes || '';
    document.getElementById('leadFollowup').value = '';
    document.getElementById('leadModal').classList.add('active');
}

function closeModal() {
    document.getElementById('leadModal').classList.remove('active');
}

async function saveLead(event) {
    event.preventDefault();
    
    const id = document.getElementById('leadId').value;
    const data = {
        name: document.getElementById('leadName').value,
        company: document.getElementById('leadCompany').value || null,
        email: document.getElementById('leadEmail').value || null,
        phone: document.getElementById('leadPhone').value || null,
        source: document.getElementById('leadSource').value || null,
        business_type: document.getElementById('leadBusiness').value,
        notes: document.getElementById('leadNotes').value || null,
        estimated_value: parseFloat(document.getElementById('leadValue').value) || null,
        next_followup: document.getElementById('leadFollowup').value || null
    };
    
    if (id) {
        await api('/leads/' + id, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Lead updated', 'success');
        addAgentThought('Updated lead: ' + data.name, 'result');
    } else {
        await api('/leads', { method: 'POST', body: JSON.stringify(data) });
        showToast('Lead created', 'success');
        addAgentThought('Created lead: ' + data.name, 'result');
    }
    
    closeModal();
    loadLeads();
    loadStats();
}

// =====================================
// MODALS: LEAD DETAIL
// =====================================

async function showLeadDetail(id) {
    const lead = await api('/leads/' + id);
    if (!lead) return;
    
    currentDetailLead = lead;
    const activities = await api('/leads/' + id + '/activities');
    
    const value = lead.estimated_value ? '$' + formatNumber(lead.estimated_value) : '—';
    const followup = lead.next_followup ? formatDate(lead.next_followup) : '—';
    const created = formatDate(lead.created_at);
    const lastContact = lead.last_contacted ? formatDate(lead.last_contacted) : 'Never';
    
    document.getElementById('detailTitle').textContent = lead.name;
    document.getElementById('detailContent').innerHTML = 
        '<div class="detail-header">' +
            '<div>' +
                '<div class="detail-name">' + escapeHtml(lead.name) + '</div>' +
                '<div class="detail-company">' + escapeHtml(lead.company || 'No company') + '</div>' +
            '</div>' +
            '<div class="detail-actions">' +
                '<button class="btn btn-secondary" onclick="editLead()">Edit</button>' +
                '<button class="btn btn-danger" onclick="deleteCurrentLead()">Delete</button>' +
            '</div>' +
        '</div>' +
        '<div class="detail-grid">' +
            '<div class="detail-item"><label>Email</label><span>' + (lead.email ? '<a href="mailto:' + escapeHtml(lead.email) + '" style="color: var(--accent)">' + escapeHtml(lead.email) + '</a>' : '—') + '</span></div>' +
            '<div class="detail-item"><label>Phone</label><span>' + (lead.phone ? '<a href="tel:' + escapeHtml(lead.phone) + '" style="color: var(--accent)">' + escapeHtml(lead.phone) + '</a>' : '—') + '</span></div>' +
            '<div class="detail-item"><label>Source</label><span>' + escapeHtml(lead.source || '—') + '</span></div>' +
            '<div class="detail-item"><label>Business</label><span class="lead-badge ' + lead.business_type + '">' + (lead.business_type === 'gnb' ? 'GNB Global' : 'SaltHaus') + '</span></div>' +
            '<div class="detail-item"><label>Value</label><span style="color: var(--success); font-weight: 600;">' + value + '</span></div>' +
            '<div class="detail-item"><label>Follow-up</label><span>' + followup + '</span></div>' +
            '<div class="detail-item"><label>Created</label><span>' + created + '</span></div>' +
            '<div class="detail-item"><label>Last Contact</label><span>' + lastContact + '</span></div>' +
        '</div>' +
        (lead.notes ? '<div class="detail-section"><h3>Notes</h3><div class="notes-content">' + escapeHtml(lead.notes) + '</div></div>' : '') +
        '<div class="detail-section"><h3>Move Stage</h3><div class="stage-select">' +
            ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => 
                '<button class="stage-btn ' + (lead.stage === s ? 'active' : '') + '" onclick="moveToStage(\'' + s + '\')">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>'
            ).join('') +
        '</div></div>' +
        '<div class="detail-section"><h3>Log Activity</h3>' +
            '<div style="display: flex; gap: 8px; flex-wrap: wrap;">' +
                '<button class="btn btn-secondary" onclick="logActivity(\'email\', \'Sent email\')">Email</button>' +
                '<button class="btn btn-secondary" onclick="logActivity(\'call\', \'Phone call\')">Call</button>' +
                '<button class="btn btn-secondary" onclick="logActivity(\'meeting\', \'Meeting\')">Meeting</button>' +
                '<button class="btn btn-secondary" onclick="logActivity(\'note\', \'Added note\')">Note</button>' +
            '</div>' +
        '</div>' +
        '<div class="detail-section"><h3>Activity History</h3><div class="activity-detail-list">' +
            (activities && activities.length > 0 ? activities.map(a => 
                '<div class="activity-detail-item"><div class="activity-icon">' + getActivityIcon(a.activity_type) + '</div><div>' + escapeHtml(a.description || a.activity_type) + '<div class="activity-time">' + formatTime(a.created_at) + '</div></div></div>'
            ).join('') : '<p style="color: var(--text-muted); padding: 12px;">No activity yet</p>') +
        '</div></div>';
    
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailLead = null;
}

function editLead() {
    if (currentDetailLead) {
        closeDetailModal();
        showAddModal(currentDetailLead);
    }
}

async function deleteCurrentLead() {
    if (!currentDetailLead) return;
    if (!confirm('Delete ' + currentDetailLead.name + '? This cannot be undone.')) return;
    
    await api('/leads/' + currentDetailLead.id, { method: 'DELETE' });
    closeDetailModal();
    loadLeads();
    loadStats();
    showToast('Lead deleted', 'success');
    addAgentThought('Deleted lead: ' + currentDetailLead.name, 'result');
}

async function moveToStage(stage) {
    if (!currentDetailLead) return;
    await api('/leads/' + currentDetailLead.id + '/stage?new_stage=' + stage, { method: 'POST' });
    showLeadDetail(currentDetailLead.id);
    loadLeads();
    loadStats();
    if (typeof Manifest !== 'undefined') {
        Manifest.highlightElement('lead-' + currentDetailLead.id);
    }
    showToast('Stage updated', 'success');
    addAgentThought('Moved lead to ' + stage, 'result');
}

async function logActivity(type, description) {
    if (!currentDetailLead) return;
    await api('/leads/' + currentDetailLead.id + '/activity', {
        method: 'POST',
        body: JSON.stringify({ activity_type: type, description })
    });
    showLeadDetail(currentDetailLead.id);
    loadActivities();
    showToast('Activity logged', 'success');
}

// =====================================
// AGENT SIDECAR FUNCTIONS
// =====================================

function addAgentThought(text, type) {
    if (typeof Manifest !== 'undefined') {
        Manifest.addThought(text, type || 'thinking');
    }
}

function clearThoughts() {
    if (typeof Manifest !== 'undefined') {
        Manifest.clearThoughts();
    }
}

function handleUndo() {
    if (typeof Manifest !== 'undefined') {
        const prev = Manifest.undo();
        if (prev) {
            loadLeads();
            loadStats();
            addAgentThought('Undid last action', 'result');
        }
    }
}

function updateUndoButton() {
    const btn = document.getElementById('undoBtn');
    if (btn && typeof Manifest !== 'undefined') {
        btn.disabled = Manifest.getState().undoStack.length === 0;
    }
}

function renderThoughts(thoughts) {
    const container = document.getElementById('sidecarThoughts');
    if (!container) return;
    
    if (!thoughts || thoughts.length === 0) {
        container.innerHTML = '<div class="thought-placeholder"><span class="thought-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span>Agent ready. Type a command.</span></div>';
        return;
    }
    
    container.innerHTML = thoughts.map(t => 
        '<div class="thought ' + t.type + ' ' + (t.completed ? 'completed' : '') + '">' +
            '<div class="thought-header">' +
                '<span class="thought-type">' + getThoughtIcon(t.type) + '</span>' +
                '<span class="thought-time">' + formatTimeShort(t.timestamp) + '</span>' +
            '</div>' +
            '<div class="thought-text">' + escapeHtml(t.text) + '</div>' +
        '</div>'
    ).join('');
    
    container.scrollTop = container.scrollHeight;
}

function renderDrafts(drafts) {
    const container = document.getElementById('sidecarDrafts');
    if (!container) return;
    
    if (!drafts || drafts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<div class="drafts-header"><span>Proposed Changes</span><button class="drafts-accept-all" onclick="acceptAllDrafts()">Accept All</button></div>' +
        '<div class="drafts-list">' + drafts.map(d => 
            '<div class="draft-item" data-key="' + d.key + '">' +
                '<div class="draft-content"><strong>' + getDraftLabel(d.key) + '</strong><div class="draft-value">' + escapeHtml(JSON.stringify(d.value)) + '</div></div>' +
                '<div class="draft-actions">' +
                    '<button class="draft-accept" onclick="acceptDraft(\'' + d.key + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>' +
                    '<button class="draft-reject" onclick="rejectDraft(\'' + d.key + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
                '</div>' +
            '</div>'
        ).join('') + '</div>';
}

function getThoughtIcon(type) {
    const icons = {
        'thinking': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        'action': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>',
        'result': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        'error': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };
    return icons[type] || icons.thinking;
}

function getDraftLabel(key) {
    const labels = { 'lead:stage': 'Move Lead', 'lead:value': 'Update Value', 'lead:status': 'Change Status', 'lead:note': 'Add Note' };
    return labels[key] || key;
}

function acceptDraft(key) {
    if (typeof Manifest !== 'undefined') {
        Manifest.commitDraft(key);
        loadLeads();
        addAgentThought('Accepted change', 'result');
    }
}

function rejectDraft(key) {
    if (typeof Manifest !== 'undefined') {
        Manifest.rejectDraft(key);
        addAgentThought('Rejected change', 'result');
    }
}

function acceptAllDrafts() {
    if (typeof Manifest !== 'undefined') {
        const drafts = Manifest.getDrafts();
        drafts.forEach(d => Manifest.commitDraft(d.key));
        loadLeads();
        addAgentThought('Accepted ' + drafts.length + ' changes', 'result');
    }
}

// =====================================
// AGENT COMMAND PROCESSING
// =====================================

function handleSidecarKeypress(event) {
    if (event.key === 'Enter') {
        sendSidecarCommand();
    }
}

async function sendSidecarCommand() {
    const input = document.getElementById('sidecarInput');
    const command = input.value.trim();
    if (!command) return;
    
    input.value = '';
    addAgentThought(command, 'action');
    await processCommand(command);
}

async function processCommand(command) {
    const cmd = command.toLowerCase();
    
    try {
        // Add lead
        if ((cmd.includes('add') && cmd.includes('lead')) || cmd.startsWith('new lead')) {
            const parsed = parseLeadText(command);
            addAgentThought('Creating lead: ' + parsed.name, 'thinking');
            await api('/leads', { method: 'POST', body: JSON.stringify(parsed) });
            addAgentThought('Created lead "' + parsed.name + '"', 'result');
            loadLeads();
            loadStats();
            return;
        }
        
        // Move stage
        const stageMatch = command.match(/lead\s*#?(\d+).*?(new|contacted|qualified|proposal|negotiation|won|lost)/i);
        if (stageMatch) {
            const leadId = stageMatch[1];
            const stage = stageMatch[2];
            addAgentThought('Moving lead #' + leadId + ' to ' + stage + '...', 'thinking');
            await api('/leads/' + leadId + '/stage?new_stage=' + stage, { method: 'POST' });
            if (typeof Manifest !== 'undefined') {
                Manifest.highlightElement('lead-' + leadId);
            }
            addAgentThought('Moved lead #' + leadId + ' to ' + stage, 'result');
            loadLeads();
            loadStats();
            return;
        }
        
        // Show leads
        if (cmd.includes('show') || cmd.includes('list') || cmd.includes('find') || cmd.includes('search')) {
            const leads = await api('/leads');
            const leadList = leads.slice(0, 10).map(l => '• ' + l.name + ' (' + (l.company || 'No co') + ') - ' + l.stage).join('\n');
            addAgentThought('Found ' + leads.length + ' leads:\n' + leadList, 'result');
            return;
        }
        
        // Stats
        if (cmd.includes('stat') || cmd.includes('dashboard')) {
            const stats = await api('/stats');
            addAgentThought('Pipeline: $' + formatNumber(stats.pipeline_value) + ' | Won: $' + formatNumber(stats.won_value) + ' | Total: ' + stats.total_leads + ' leads', 'result');
            return;
        }
        
        // Delete
        const delMatch = command.match(/delete.*lead\s*#?(\d+)/i);
        if (delMatch) {
            addAgentThought('Deleting lead #' + delMatch[1] + '...', 'thinking');
            await api('/leads/' + delMatch[1], { method: 'DELETE' });
            addAgentThought('Deleted lead #' + delMatch[1], 'result');
            loadLeads();
            loadStats();
            return;
        }
        
        // Help
        if (cmd.includes('help') || cmd === '?') {
            addAgentThought('Commands:\n• "Add lead: John Smith, Acme Corp"\n• "Move lead #5 to qualified"\n• "Show leads"\n• "Stats"\n• "Delete lead #3"', 'result');
            return;
        }
        
        // Default: quick add
        addAgentThought('Processing: "' + command + '"', 'thinking');
        await api('/quick-add', { method: 'POST', body: JSON.stringify({ text: command }) });
        addAgentThought('Added lead from input', 'result');
        loadLeads();
        loadStats();
        
    } catch (error) {
        addAgentThought('Error: ' + error.message, 'error');
    }
}

function parseLeadText(text) {
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

// =====================================
// SEARCH & FILTER
// =====================================

function handleSearch(value) {
    currentFilters.search = value;
    loadLeads();
}

function handleFilter() {
    currentFilters.business = document.getElementById('filterBusiness').value;
    loadLeads();
}

// =====================================
// EXPORT
// =====================================

async function exportData() {
    const leads = await api('/leads');
    if (!leads) return;
    
    const csv = ['ID,Name,Company,Email,Phone,Source,Stage,Business,Value,Created'];
    leads.forEach(l => {
        csv.push([l.id, l.name, l.company || '', l.email || '', l.phone || '', l.source || '', l.stage, l.business_type, l.estimated_value || '', l.created_at].join(','));
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-leads-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported ' + leads.length + ' leads', 'success');
    addAgentThought('Exported ' + leads.length + ' leads to CSV', 'result');
}

// =====================================
// UTILITIES
// =====================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return formatDate(dateStr);
}

function formatTimeShort(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success') + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailModal();
    }
});
