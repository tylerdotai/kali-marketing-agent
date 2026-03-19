// Kali CRM - Premium Frontend JavaScript

const API = '/api';
let currentLeads = [];
let currentDetailLead = null;
let currentFilters = { search: '', business: '', source: '' };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadLeads();
    loadActivities();
    loadSourceFilters();
    setupEventListeners();
    refreshData();
});

function setupEventListeners() {
    document.getElementById('addLeadBtn').addEventListener('click', () => showAddModal());
    document.getElementById('searchBtn').addEventListener('click', () => {
        document.getElementById('searchInput').focus();
    });
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        document.getElementById('clearSearch').style.display = e.target.value ? 'flex' : 'none';
        loadLeads();
    });
    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        currentFilters.search = '';
        document.getElementById('clearSearch').style.display = 'none';
        loadLeads();
    });
    document.getElementById('filterBusiness').addEventListener('change', (e) => {
        currentFilters.business = e.target.value;
        loadLeads();
    });
    document.getElementById('viewAllActivity')?.addEventListener('click', () => {
        loadActivities(30); // Load more activities
    });
    document.getElementById('filterSource').addEventListener('change', () => loadLeads());
}

function refreshData() {
    setInterval(() => {
        loadStats();
        loadLeads();
        loadActivities();
    }, 30000);
}

// API Helpers
async function api(endpoint, options = {}) {
    try {
        const res = await fetch(`${API}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return res.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

// Load Stats
async function loadStats() {
    const stats = await api('/stats');
    if (!stats) return;
    
    document.getElementById('totalLeadsHeader').textContent = `${stats.total_leads} lead${stats.total_leads !== 1 ? 's' : ''}`;
    document.getElementById('statTotal').textContent = stats.total_leads;
    document.getElementById('statPipeline').textContent = '$' + formatNumber(stats.pipeline_value || 0);
    document.getElementById('statWon').textContent = '$' + formatNumber(stats.won_value || 0);
    document.getElementById('statActivities').textContent = stats.recent_activities;
}

// Load Leads
async function loadLeads() {
    const params = new URLSearchParams();
    if (currentFilters.business) params.append('business_type', currentFilters.business);
    if (currentFilters.source) params.append('source', currentFilters.source);
    if (currentFilters.search) params.append('search', currentFilters.search);
    
    const query = params.toString();
    currentLeads = await api(`/leads${query ? '?' + query : ''}`);
    renderPipeline();
}

function loadSourceFilters() {
    // This would ideally come from the API, but for now we'll populate dynamically
    const select = document.getElementById('filterSource');
    // Sources will be populated as leads are loaded
}

// Render Pipeline
function renderPipeline() {
    const stages = [
        { id: 'new', name: 'New' },
        { id: 'contacted', name: 'Contacted' },
        { id: 'qualified', name: 'Qualified' },
        { id: 'proposal', name: 'Proposal' },
        { id: 'negotiation', name: 'Negotiation' },
        { id: 'won', name: 'Won' },
        { id: 'lost', name: 'Lost' }
    ];
    
    // Filter by search if set
    let filteredLeads = currentLeads || [];
    if (currentFilters.search) {
        const search = currentFilters.search.toLowerCase();
        filteredLeads = filteredLeads.filter(l => 
            (l.name && l.name.toLowerCase().includes(search)) ||
            (l.company && l.company.toLowerCase().includes(search)) ||
            (l.email && l.email.toLowerCase().includes(search)) ||
            (l.notes && l.notes.toLowerCase().includes(search))
        );
    }
    
    const pipeline = document.getElementById('pipeline');
    pipeline.innerHTML = stages.map(stage => {
        const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
        return `
            <div class="pipeline-stage">
                <div class="stage-header">
                    <span class="stage-name">${stage.name}</span>
                    <span class="stage-count">${stageLeads.length}</span>
                </div>
                <div class="stage-leads">
                    ${stageLeads.map(lead => renderLeadCard(lead)).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderLeadCard(lead) {
    const source = lead.source ? `<span class="lead-source">${escapeHtml(lead.source)}</span>` : '';
    const value = lead.estimated_value ? `$${formatNumber(lead.estimated_value)}` : '';
    const businessLabel = lead.business_type === 'gnb' ? 'GNB' : 'SaltHaus';
    
    return `
        <div class="lead-card" onclick="showLeadDetail(${lead.id})">
            <div class="lead-card-header">
                <div>
                    <div class="leadName">${escapeHtml(lead.name)}</div>
                    ${lead.company ? `<div class="lead-company">${escapeHtml(lead.company)}</div>` : ''}
                </div>
                ${value ? `<span class="lead-value">${value}</span>` : ''}
            </div>
            <div class="lead-meta">
                ${source ? `<span class="lead-badge">${escapeHtml(lead.source)}</span>` : ''}
                <span class="lead-badge ${lead.business_type}">${businessLabel}</span>
            </div>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}

// Load Activities
async function loadActivities(limit = 10) {
    const activities = await api(`/activities?days=7`);
    if (!activities || !Array.isArray(activities)) return;
    renderActivities(activities.slice(0, limit));
}

function renderActivities(activities) {
    const list = document.getElementById('activityList');
    
    if (activities.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No recent activity</p></div>';
        return;
    }
    
    list.innerHTML = activities.map(act => {
        const icon = getActivityIcon(act.activity_type);
        const time = formatTime(act.created_at);
        let leadInfo = act.lead_name ? `<strong>${escapeHtml(act.lead_name)}</strong>` : '';
        if (act.lead_company) leadInfo += ` <span style="color: var(--text-muted)">@ ${escapeHtml(act.lead_company)}</span>`;
        
        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${leadInfo} <span style="color: var(--text-muted)">- ${escapeHtml(act.description || act.activity_type)}</span></div>
                    <div class="activity-meta">
                        <span class="activity-time">${time}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(type) {
    const icons = {
        'created': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
        'stage_change': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
        'email': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        'call': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        'meeting': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        'note': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
    };
    return icons[type] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}

// Modal Functions
function showAddModal(lead = null) {
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
        await api(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Lead updated', 'success');
    } else {
        await api('/leads', { method: 'POST', body: JSON.stringify(data) });
        showToast('Lead created', 'success');
    }
    
    closeModal();
    loadLeads();
    loadStats();
}

// Lead Detail
async function showLeadDetail(id) {
    const lead = await api(`/leads/${id}`);
    if (!lead) return;
    
    currentDetailLead = lead;
    const activities = await api(`/leads/${id}/activities`);
    
    const value = lead.estimated_value ? `$${formatNumber(lead.estimated_value)}` : '—';
    const followup = lead.next_followup ? formatDate(lead.next_followup) : '—';
    const created = formatDate(lead.created_at);
    const lastContact = lead.last_contacted ? formatDate(lead.last_contacted) : 'Never';
    const stageLabel = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' }[lead.stage] || lead.stage;
    
    document.getElementById('detailTitle').textContent = lead.name;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-header">
            <div>
                <div class="detail-name">${escapeHtml(lead.name)}</div>
                <div class="detail-company">${escapeHtml(lead.company || 'No company')}</div>
            </div>
            <div class="detail-actions">
                <button class="btn btn-secondary" onclick="editLead()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteCurrentLead()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                </button>
            </div>
        </div>
        
        <div class="detail-grid">
            <div class="detail-item">
                <label>Email</label>
                <span>${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color: var(--accent)">${escapeHtml(lead.email)}</a>` : '—'}</span>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <span>${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color: var(--accent)">${escapeHtml(lead.phone)}</a>` : '—'}</span>
            </div>
            <div class="detail-item">
                <label>Source</label>
                <span>${escapeHtml(lead.source || '—')}</span>
            </div>
            <div class="detail-item">
                <label>Business</label>
                <span class="lead-badge ${lead.business_type}">${lead.business_type === 'gnb' ? 'GNB Global' : 'SaltHaus'}</span>
            </div>
            <div class="detail-item">
                <label>Estimated Value</label>
                <span style="color: var(--success); font-weight: 600;">${value}</span>
            </div>
            <div class="detail-item">
                <label>Follow-up</label>
                <span>${followup}</span>
            </div>
            <div class="detail-item">
                <label>Created</label>
                <span>${created}</span>
            </div>
            <div class="detail-item">
                <label>Last Contact</label>
                <span>${lastContact}</span>
            </div>
        </div>
        
        ${lead.notes ? `
        <div class="detail-section">
            <h3>Notes</h3>
            <div class="notes-content">${escapeHtml(lead.notes)}</div>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h3>Move Stage</h3>
            <div class="stage-select">
                ${['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => `
                    <button class="stage-btn ${lead.stage === s ? 'active' : ''}" onclick="moveToStage('${s}')">
                        ${s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Log Activity</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="openQuickActivity()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    Add Activity
                </button>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Activity History</h3>
            <div class="activity-detail-list">
                ${activities && activities.length > 0 ? activities.map(a => `
                    <div class="activity-detail-item">
                        <div class="activity-icon">${getActivityIcon(a.activity_type)}</div>
                        <div>
                            <div>${escapeHtml(a.description || a.activity_type)}</div>
                            <div class="activity-time">${formatTime(a.created_at)}</div>
                        </div>
                    </div>
                `).join('') : '<p style="color: var(--text-muted); padding: 12px;">No activity yet</p>'}
            </div>
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailLead = null;
}

function editLead() {
    if (currentDetailLead) {
        const leadToEdit = { ...currentDetailLead };  // Copy before closing
        closeDetailModal();
        showAddModal(leadToEdit);
    }
}

async function deleteCurrentLead() {
    if (!currentDetailLead) return;
    if (!confirm(`Delete ${currentDetailLead.name}? This cannot be undone.`)) return;
    
    await api(`/leads/${currentDetailLead.id}`, { method: 'DELETE' });
    closeDetailModal();
    loadLeads();
    loadStats();
    showToast('Lead deleted', 'success');
}

async function moveToStage(stage) {
    if (!currentDetailLead) return;
    await api(`/leads/${currentDetailLead.id}/stage?new_stage=${stage}`, { method: 'POST' });
    showLeadDetail(currentDetailLead.id);
    loadLeads();
    loadStats();
    showToast('Stage updated', 'success');
}

// Quick Activity
function openQuickActivity() {
    document.getElementById('quickActivityNote').value = '';
    document.getElementById('quickActivityModal').classList.add('active');
}

function closeQuickActivity() {
    document.getElementById('quickActivityModal').classList.remove('active');
}

async function logQuickActivity(type, defaultDesc) {
    if (!currentDetailLead) return;
    const note = document.getElementById('quickActivityNote').value || defaultDesc;
    await api(`/leads/${currentDetailLead.id}/activity`, {
        method: 'POST',
        body: JSON.stringify({ activity_type: type, description: note })
    });
    closeQuickActivity();
    showLeadDetail(currentDetailLead.id);
    loadActivities();
    showToast('Activity logged', 'success');
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Utilities
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailModal();
        closeQuickActivity();
    }
});
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

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}
