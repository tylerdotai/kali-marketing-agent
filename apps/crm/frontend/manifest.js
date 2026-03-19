/**
 * Kali CRM - Agent-First State Management
 * 
 * The Manifest is the single source of truth for UI state.
 * The agent reads it, modifies it via API, and the UI re-renders.
 */

const Manifest = {
    // State tree - this is what controls the entire UI
    state: {
        version: '1.0.0',
        lastUpdated: null,
        
        // Canvas layout
        canvas: {
            activeView: 'pipeline', // pipeline | analytics | settings
            filters: { search: '', business: '', source: '' },
            selectedLeadId: null,
            highlightedElement: null
        },
        
        // Draft changes (agent-proposed, not yet committed)
        drafts: {},
        
        // Undo stack
        undoStack: [],
        
        // Agent session
        agent: {
            thinking: false,
            thoughts: [], // Array of {id, text, timestamp, type}
            lastAction: null
        }
    },

    // Subscribe to state changes
    listeners: [],
    
    subscribe(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    },
    
    notify() {
        this.state.lastUpdated = new Date().toISOString();
        this.listeners.forEach(fn => fn(this.state));
    },
    
    // Get current state
    getState() {
        return this.state;
    },
    
    // Update state and notify
    setState(updates) {
        const prevState = JSON.stringify(this.state);
        
        // Deep merge updates
        this.deepMerge(this.state, updates);
        
        // Push to undo stack
        this.pushUndo(prevState);
        
        // Notify subscribers
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
    
    // Undo stack
    pushUndo(state) {
        this.state.undoStack.push({
            state: JSON.parse(state),
            timestamp: Date.now()
        });
        // Keep max 50 undo states
        if (this.state.undoStack.length > 50) {
            this.state.undoStack.shift();
        }
    },
    
    undo() {
        if (this.state.undoStack.length === 0) return null;
        const prev = this.state.undoStack.pop();
        this.state = prev.state;
        this.notify();
        return prev.state;
    },
    
    // Draft management
    addDraft(key, value, agentId = 'agent') {
        this.state.drafts[key] = {
            value,
            agentId,
            timestamp: Date.now(),
            committed: false
        };
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
        return Object.entries(this.state.drafts).map(([key, draft]) => ({
            key,
            ...draft
        }));
    },
    
    // Agent thoughts
    addThought(text, type = 'thinking') {
        const thought = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            text,
            type, // 'thinking' | 'action' | 'result' | 'error'
            timestamp: Date.now()
        };
        this.state.agent.thoughts.push(thought);
        
        // Keep max 20 thoughts
        if (this.state.agent.thoughts.length > 20) {
            this.state.agent.thoughts.shift();
        }
        
        this.notify();
        return thought.id;
    },
    
    completeThought(id) {
        const thought = this.state.agent.thoughts.find(t => t.id === id);
        if (thought) {
            thought.completed = true;
            this.notify();
        }
    },
    
    clearThoughts() {
        this.state.agent.thoughts = [];
        this.notify();
    },
    
    // Highlight element (for visual telemetry)
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
    
    // Navigation
    setView(view) {
        this.state.canvas.activeView = view;
        this.notify();
    },
    
    selectLead(id) {
        this.state.canvas.selectedLeadId = id;
        this.notify();
    }
};

// Export for use
window.Manifest = Manifest;
