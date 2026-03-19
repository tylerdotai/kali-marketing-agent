/**
 * Kali CRM - Agent-First State Management
 * The Manifest is the single source of truth for UI state.
 */

const Manifest = {
    state: {
        version: '1.0.0',
        lastUpdated: null,
        canvas: {
            activeView: 'pipeline',
            filters: { search: '', business: '', source: '' },
            selectedLeadId: null,
            highlightedElement: null
        },
        drafts: {},
        undoStack: [],
        agent: {
            thinking: false,
            thoughts: [],
            lastAction: null
        }
    },
    listeners: [],
    
    subscribe(fn) {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    },
    
    notify() {
        this.state.lastUpdated = new Date().toISOString();
        this.listeners.forEach(fn => fn(this.state));
    },
    
    getState() { return this.state; },
    
    setState(updates) {
        const prev = JSON.stringify(this.state);
        this.deepMerge(this.state, updates);
        this.state.undoStack.push({ state: JSON.parse(prev), timestamp: Date.now() });
        if (this.state.undoStack.length > 50) this.state.undoStack.shift();
        this.notify();
    },
    
    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    },
    
    undo() {
        if (this.state.undoStack.length === 0) return null;
        const prev = this.state.undoStack.pop();
        this.state = prev.state;
        this.notify();
        return prev.state;
    },
    
    addDraft(key, value, agentId = 'agent') {
        this.state.drafts[key] = { value, agentId, timestamp: Date.now(), committed: false };
        this.notify();
    },
    
    commitDraft(key) {
        if (this.state.drafts[key]) {
            this.state.drafts[key].committed = true;
            delete this.state.drafts[key];
            this.notify();
        }
    },
    
    rejectDraft(key) {
        delete this.state.drafts[key];
        this.notify();
    },
    
    getDrafts() {
        return Object.entries(this.state.drafts).map(([key, draft]) => ({ key, ...draft }));
    },
    
    addThought(text, type = 'thinking') {
        const thought = { id: Date.now() + '-' + Math.random().toString(36).substr(2, 9), text, type, timestamp: Date.now() };
        this.state.agent.thoughts.push(thought);
        if (this.state.agent.thoughts.length > 20) this.state.agent.thoughts.shift();
        this.notify();
        return thought.id;
    },
    
    completeThought(id) {
        const t = this.state.agent.thoughts.find(t => t.id === id);
        if (t) { t.completed = true; this.notify(); }
    },
    
    clearThoughts() {
        this.state.agent.thoughts = [];
        this.notify();
    },
    
    highlightElement(elementId, duration = 2000) {
        this.state.canvas.highlightedElement = elementId;
        this.notify();
        setTimeout(() => {
            if (this.state.canvas.highlightedElement === elementId) {
                this.state.canvas.highlightedElement = null;
                this.notify();
            }
        }, duration);
    },
    
    setView(view) {
        this.state.canvas.activeView = view;
        this.notify();
    },
    
    selectLead(id) {
        this.state.canvas.selectedLeadId = id;
        this.notify();
    }
};

window.Manifest = Manifest;
