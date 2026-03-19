/**
 * CRM Frontend Application
 * Vanilla JS, no dependencies
 */

const API = '/api';
const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];

// State
let currentLeads = [];
let currentDetailLead = null;
let searchTimeout = null;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    loadPipeline();
    loadStats();
    
    // Native scroll is handled by CSS
    setupSwipeGestures();
});

// ============ VIEW SWITCHING ============

function setView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    document.getElementById('pipelineView').style.display = view === 'pipeline' ? '' : 'none';
    document.getElementById('analyticsView').classList.toggle('active', view === 'analytics');
    
    if (view === 'analytics') {
        loadStats();
    }
}

// ============ API ============

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

// ============ DATA LOADING ============

async function loadPipeline() {
    // Fetch both pipeline data and leads in parallel
    const [pipelineData, leads] = await Promise.all([
        api('/pipeline'),
        api('/leads')
    ]);
    if (!pipelineData) return;
    
    // Store leads globally for filtering
    currentLeads = leads || [];
    
    renderPipeline(pipelineData);
}

async function loadStats() {
    const data = await api('/stats');
    if (!data) return;
    renderStats(data);
}

async function loadLead(id) {
    return await api('/leads/' + id);
}

async function loadLeadActivities(id) {
    return await api('/leads/' + id + '/activities');
}

// ============ RENDER ============

function renderPipeline(data) {
    const pipeline = document.getElementById('pipeline');
    
    // Save scroll position before re-render
    const scrollLeft = pipeline.scrollLeft;
    
    pipeline.innerHTML = data.stages.map(stage => {
        const leads = currentLeads.filter(l => l.stage === stage.id);
        
        return `
            <div class="pipeline-stage">
                <div class="stage-header" data-stage="${stage.id}">
                    <span class="stage-name">${stage.name}</span>
                    <span class="stage-count">${stage.count}</span>
                </div>
                <div class="stage-leads">
                    ${stage.count === 0 ? `
                        <div class="stage-empty">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v4M12 16h.01"/>
                            </svg>
                            <span>No leads</span>
                        </div>
                    ` : ''}
                    ${currentLeads.filter(l => l.stage === stage.id).map(lead => renderLeadCard(lead)).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Restore scroll position after re-render
    pipeline.scrollLeft = scrollLeft;
}

function renderLeadCard(lead) {
    return `
        <div class="lead-card" data-stage="${lead.stage}" onclick="openLeadDetail(${lead.id})">
            <div class="stage-indicator"></div>
            <div class="lead-name">${escapeHtml(lead.name)}</div>
            ${lead.company ? `<div class="lead-company">${escapeHtml(lead.company)}</div>` : ''}
            ${lead.value ? `<div class="lead-value">$${formatNumber(lead.value)}</div>` : ''}
            <div class="lead-actions" onclick="event.stopPropagation()">
                ${lead.email ? `
                    <a href="mailto:${escapeHtml(lead.email)}" class="btn btn-icon" title="Email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                    </a>
                ` : ''}
                ${lead.phone ? `
                    <a href="tel:${escapeHtml(lead.phone)}" class="btn btn-icon" title="Call">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                    </a>
                ` : ''}
                <button class="btn btn-icon" onclick="logActivityQuick(${lead.id}, 'note')" title="Add Note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderStats(stats) {
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total_leads}</div>
            <div class="stat-label">Total Leads</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">$${formatNumber(stats.total_value)}</div>
            <div class="stat-label">Pipeline Value</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">$${formatNumber(stats.won_value)}</div>
            <div class="stat-label">Won Value</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(stats.conversion_rate * 100)}%</div>
            <div class="stat-label">Win Rate</div>
        </div>
    `;
    
    // Stage breakdown
    api('/pipeline').then(data => {
        if (!data) return;
        
        const maxCount = Math.max(...data.stages.map(s => s.count), 1);
        
        document.getElementById('stageBreakdown').innerHTML = `
            <h3>Pipeline Breakdown</h3>
            ${data.stages.map(stage => `
                <div class="stage-row">
                    <span class="stage-row-label">${stage.name}</span>
                    <div class="stage-row-bar">
                        <div class="stage-row-fill" data-stage="${stage.id}" style="width: ${(stage.count / maxCount) * 100}%"></div>
                    </div>
                    <span class="stage-row-value">${stage.count}</span>
                </div>
            `).join('')}
        `;
    });
}

// ============ LEAD DETAIL ============

async function openLeadDetail(id) {
    const lead = await loadLead(id);
    if (!lead) return;
    
    currentDetailLead = lead;
    const activities = await loadLeadActivities(id);
    
    document.getElementById('detailName').textContent = lead.name;
    document.getElementById('detailCompany').textContent = lead.company || 'No company';
    
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-section">
            <div class="detail-fields">
                ${lead.email ? `
                    <div class="detail-field">
                        <label>Email</label>
                        <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>
                    </div>
                ` : ''}
                ${lead.phone ? `
                    <div class="detail-field">
                        <label>Phone</label>
                        <a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>
                    </div>
                ` : ''}
                ${lead.source ? `
                    <div class="detail-field">
                        <label>Source</label>
                        <span>${escapeHtml(lead.source)}</span>
                    </div>
                ` : ''}
                <div class="detail-field">
                    <label>Value</label>
                    <span style="color: var(--success); font-weight: 600;">
                        ${lead.value ? '$' + formatNumber(lead.value) : '—'}
                    </span>
                </div>
            </div>
        </div>
        
        ${lead.notes ? `
            <div class="detail-section">
                <h3>Notes</h3>
                <div class="notes-box">${escapeHtml(lead.notes)}</div>
            </div>
        ` : ''}
        
        <div class="detail-section">
            <h3>Move Stage</h3>
            <div class="stage-selector">
                ${STAGES.map(s => `
                    <button class="stage-btn ${lead.stage === s ? 'active' : ''}" 
                            data-stage="${s}"
                            onclick="moveStage(${lead.id}, '${s}')">
                        ${s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Log Activity</h3>
            <div class="log-activity">
                <button class="btn btn-secondary btn-small" onclick="logActivityQuick(${lead.id}, 'call')">Call</button>
                <button class="btn btn-secondary btn-small" onclick="logActivityQuick(${lead.id}, 'email')">Email</button>
                <button class="btn btn-secondary btn-small" onclick="logActivityQuick(${lead.id}, 'meeting')">Meeting</button>
                <button class="btn btn-secondary btn-small" onclick="logActivityQuick(${lead.id}, 'note')">Note</button>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Activity History</h3>
            <div class="activity-list">
                ${activities.length === 0 ? '<p style="color: var(--text-muted)">No activity yet</p>' : ''}
                ${activities.map(a => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            ${getActivityIcon(a.type)}
                        </div>
                        <div class="activity-content">
                            <div class="activity-type">${a.type.replace('_', ' ')}</div>
                            ${a.description ? `<div class="activity-desc">${escapeHtml(a.description)}</div>` : ''}
                            <div class="activity-time">${formatTime(a.created_at)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <button class="btn btn-secondary" onclick="editLead(${lead.id})" style="width: 100%;">
                Edit Lead
            </button>
            <button class="btn btn-secondary" onclick="deleteLeadConfirm(${lead.id})" style="width: 100%; margin-top: 8px; color: var(--danger);">
                Delete Lead
            </button>
        </div>
    `;
    
    document.getElementById('detailPanel').classList.add('active');
    document.getElementById('detailOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    document.getElementById('detailPanel').classList.remove('active');
    document.getElementById('detailOverlay').classList.remove('active');
    document.body.style.overflow = '';
    currentDetailLead = null;
}

// ============ LEAD OPERATIONS ============

function showAddModal(lead = null) {
    document.getElementById('modalTitle').textContent = lead ? 'Edit Lead' : 'New Lead';
    document.getElementById('leadId').value = lead?.id || '';
    document.getElementById('leadName').value = lead?.name || '';
    document.getElementById('leadCompany').value = lead?.company || '';
    document.getElementById('leadEmail').value = lead?.email || '';
    document.getElementById('leadPhone').value = lead?.phone || '';
    document.getElementById('leadSource').value = lead?.source || '';
    document.getElementById('leadValue').value = lead?.value || '';
    document.getElementById('leadNotes').value = lead?.notes || '';
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
        value: parseFloat(document.getElementById('leadValue').value) || null,
        notes: document.getElementById('leadNotes').value || null
    };
    
    let result;
    if (id) {
        result = await api('/leads/' + id, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Lead updated');
    } else {
        result = await api('/leads', { method: 'POST', body: JSON.stringify(data) });
        showToast('Lead created');
    }
    
    if (result) {
        closeModal();
        await refreshData();
    }
}

async function editLead(id) {
    const lead = await loadLead(id);
    if (lead) {
        closeDetail();
        showAddModal(lead);
    }
}

async function deleteLeadConfirm(id) {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    
    const result = await api('/leads/' + id, { method: 'DELETE' });
    if (result) {
        closeDetail();
        showToast('Lead deleted');
        await refreshData();
    }
}

async function moveStage(id, newStage) {
    const result = await api('/leads/' + id + '/stage', {
        method: 'POST',
        body: JSON.stringify({ stage: newStage })
    });
    
    if (result) {
        showToast('Stage updated');
        await refreshData();
        openLeadDetail(id); // Refresh detail view
    }
}

async function logActivityQuick(id, type) {
    const description = prompt(`Log ${type}:`, '');
    if (description === null) return;
    
    const result = await api('/leads/' + id + '/activity', {
        method: 'POST',
        body: JSON.stringify({ type, description })
    });
    
    if (result) {
        showToast('Activity logged');
        openLeadDetail(id); // Refresh detail view
    }
}

// ============ SEARCH ============

function focusSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.add('active');
    document.getElementById('searchInput').focus();
}

function handleSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        currentLeads = await api('/leads?search=' + encodeURIComponent(value));
        renderPipelineFromLeads();
    }, 300);
}

async function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchBar').classList.remove('active');
    currentLeads = await api('/leads');
    renderPipelineFromLeads();
}

// ============ HELPERS ============

async function refreshData() {
    currentLeads = await api('/leads');
    await loadPipeline();
    await loadStats();
}

function renderPipelineFromLeads() {
    const data = { stages: STAGES.map(s => ({ id: s, name: s.charAt(0).toUpperCase() + s.slice(1), count: currentLeads.filter(l => l.stage === s).length })) };
    renderPipeline(data);
}

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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    // Handle both ISO format (with T) and space-separated format
    const normalized = dateStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr; // fallback to raw string
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function getActivityIcon(type) {
    const icons = {
        'call': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        'email': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        'meeting': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        'note': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        'stage_change': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
    };
    return icons[type] || icons.note;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Close modals on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetail();
        closeModal();
    }
});


