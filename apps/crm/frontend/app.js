// Kali's CRM - Frontend JavaScript

const API = '/api';
let currentLeads = [];
let currentDetailLead = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadLeads();
    loadActivities();
    refreshData();
});

// Refresh data every 30 seconds
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
    
    document.getElementById('totalLeads').textContent = stats.total_leads;
    document.getElementById('pipelineValue').textContent = '$' + (stats.pipeline_value || 0).toLocaleString();
    document.getElementById('wonValue').textContent = '$' + (stats.won_value || 0).toLocaleString();
    document.getElementById('recentActivity').textContent = stats.recent_activities;
}

// Load Leads
async function loadLeads() {
    const filter = document.getElementById('businessFilter').value;
    currentLeads = await api(`/leads${filter ? '?business_type=' + filter : ''}`);
    renderPipeline();
}

// Load Activities
async function loadActivities() {
    const activities = await api('/activities?days=7');
    if (!activities) return;
    renderActivities(activities);
}

// Render Pipeline
function renderPipeline() {
    const stages = [
        { id: 'new', name: '🆕 New' },
        { id: 'contacted', name: '📧 Contacted' },
        { id: 'qualified', name: '✅ Qualified' },
        { id: 'proposal', name: '📄 Proposal' },
        { id: 'negotiation', name: '🤝 Negotiation' },
        { id: 'won', name: '🎉 Won' },
        { id: 'lost', name: '❌ Lost' }
    ];
    
    const pipeline = document.getElementById('pipeline');
    pipeline.innerHTML = stages.map(stage => {
        const stageLeads = currentLeads.filter(l => l.stage === stage.id);
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

// Render Lead Card
function renderLeadCard(lead) {
    const source = lead.source ? `<span class="lead-source">${lead.source}</span>` : '';
    const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : '';
    const businessBadge = `<span class="business-badge ${lead.business_type}">${lead.business_type.toUpperCase()}</span>`;
    
    return `
        <div class="lead-card ${lead.business_type} ${lead.stage}" onclick="showLeadDetail(${lead.id})">
            <div class="lead-name">${escapeHtml(lead.name)}</div>
            ${lead.company ? `<div class="lead-company">${escapeHtml(lead.company)}</div>` : ''}
            <div class="lead-meta">
                ${source || businessBadge}
                ${value ? `<span class="lead-value">${value}</span>` : ''}
            </div>
        </div>
    `;
}

// Render Activities
function renderActivities(activities) {
    const list = document.getElementById('activityList');
    
    if (activities.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div>No recent activity</div>';
        return;
    }
    
    list.innerHTML = activities.map(act => {
        const icon = getActivityIcon(act.activity_type);
        const time = formatTime(act.created_at);
        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${escapeHtml(act.description || act.activity_type)}</div>
                    ${act.lead_name ? `<div class="activity-lead">${escapeHtml(act.lead_name)}${act.lead_company ? ' @ ' + escapeHtml(act.lead_company) : ''}</div>` : ''}
                    <div class="activity-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(type) {
    const icons = {
        'created': '➕',
        'stage_change': '🔄',
        'email': '📧',
        'call': '📞',
        'meeting': '🤝',
        'note': '📝',
        'task': '✅'
    };
    return icons[type] || '📌';
}

// Modal Functions
function showAddModal(lead = null) {
    document.getElementById('modalTitle').textContent = lead ? 'Edit Lead' : 'Add New Lead';
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
        await api(`/leads/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    } else {
        await api('/leads', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    closeModal();
    loadLeads();
    loadStats();
}

function showQuickAdd() {
    document.getElementById('quickAddText').value = '';
    document.getElementById('quickAddModal').classList.add('active');
    document.getElementById('quickAddText').focus();
}

function closeQuickAdd() {
    document.getElementById('quickAddModal').classList.remove('active');
}

async function doQuickAdd(event) {
    event.preventDefault();
    const text = document.getElementById('quickAddText').value;
    if (!text.trim()) return;
    
    await api('/quick-add', {
        method: 'POST',
        body: JSON.stringify({ text })
    });
    
    closeQuickAdd();
    loadLeads();
    loadStats();
}

// Lead Detail
async function showLeadDetail(id) {
    const lead = await api(`/leads/${id}`);
    if (!lead) return;
    
    currentDetailLead = lead;
    const activities = await api(`/leads/${id}/activities`);
    
    const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : '—';
    const followup = lead.next_followup ? formatDate(lead.next_followup) : '—';
    const created = formatDate(lead.created_at);
    
    document.getElementById('detailTitle').textContent = lead.name;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-header">
            <div>
                <div class="detail-name">${escapeHtml(lead.name)}</div>
                <div class="detail-company">${escapeHtml(lead.company || 'No company')}</div>
            </div>
            <div class="detail-actions">
                <button class="btn btn-secondary btn-small" onclick="editLead()">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCurrentLead()">Delete</button>
            </div>
        </div>
        
        <div class="detail-grid">
            <div class="detail-item">
                <label>Email</label>
                <span>${escapeHtml(lead.email || '—')}</span>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <span>${escapeHtml(lead.phone || '—')}</span>
            </div>
            <div class="detail-item">
                <label>Source</label>
                <span>${escapeHtml(lead.source || '—')}</span>
            </div>
            <div class="detail-item">
                <label>Business</label>
                <span class="business-badge ${lead.business_type}">${lead.business_type.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <label>Estimated Value</label>
                <span>${value}</span>
            </div>
            <div class="detail-item">
                <label>Next Follow-up</label>
                <span>${followup}</span>
            </div>
            <div class="detail-item">
                <label>Created</label>
                <span>${created}</span>
            </div>
            <div class="detail-item">
                <label>Last Contacted</label>
                <span>${lead.last_contacted ? formatDate(lead.last_contacted) : 'Never'}</span>
            </div>
        </div>
        
        ${lead.notes ? `
        <div class="detail-section">
                <h3>Notes</h3>
                <p>${escapeHtml(lead.notes)}</p>
            </div>
        ` : ''}
        
        <div class="detail-section">
            <h3>Move Stage</h3>
            <div class="stage-select">
                ${['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => `
                    <button class="stage-btn ${lead.stage === s ? 'active' : ''}" onclick="moveToStage('${s}')">
                        ${s === 'new' ? '🆕' : s === 'contacted' ? '📧' : s === 'qualified' ? '✅' : s === 'proposal' ? '📄' : s === 'negotiation' ? '🤝' : s === 'won' ? '🎉' : '❌'}
                        ${s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Log Activity</h3>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button class="btn btn-secondary btn-small" onclick="logActivity('email', 'Sent email')">📧 Email</button>
                <button class="btn btn-secondary btn-small" onclick="logActivity('call', 'Phone call')">📞 Call</button>
                <button class="btn btn-secondary btn-small" onclick="logActivity('meeting', 'Meeting')">🤝 Meeting</button>
                <button class="btn btn-secondary btn-small" onclick="logActivity('note', 'Added note')">📝 Note</button>
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
                `).join('') : '<p style="color: var(--gray-500);">No activity yet</p>'}
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
        closeDetailModal();
        showAddModal(currentDetailLead);
    }
}

async function deleteCurrentLead() {
    if (!currentDetailLead) return;
    if (!confirm(`Delete ${currentDetailLead.name}? This cannot be undone.`)) return;
    
    await api(`/leads/${currentDetailLead.id}`, { method: 'DELETE' });
    closeDetailModal();
    loadLeads();
    loadStats();
}

async function moveToStage(stage) {
    if (!currentDetailLead) return;
    await api(`/leads/${currentDetailLead.id}/stage?new_stage=${stage}`, { method: 'POST' });
    showLeadDetail(currentDetailLead.id);
    loadLeads();
    loadStats();
}

async function logActivity(type, description) {
    if (!currentDetailLead) return;
    await api(`/leads/${currentDetailLead.id}/activity`, {
        method: 'POST',
        body: JSON.stringify({ activity_type: type, description })
    });
    showLeadDetail(currentDetailLead.id);
    loadActivities();
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
        closeQuickAdd();
    }
});
