/* =============================================
   ZUPER ZTORE AI ASSISTANT - Core Class
   ============================================= */

class ChatAssistant {
    constructor(config = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || 'https://ai-assistant.mnsibkhan.workers.dev',
            model: config.model || '@cf/meta/llama-3.2-3b-instruct',
            systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
            maxTokens: config.maxTokens || 500,
            temperature: config.temperature || 0.7,
            theme: config.theme || 'light',
            position: config.position || 'bottom-right',
            initialMessage: config.initialMessage || '👋 Hello! How can I help you today?',
            companyName: config.companyName || 'Assistant',
            enableHistory: config.enableHistory !== undefined ? config.enableHistory : true,
            maxHistoryLength: config.maxHistoryLength || 20,
            quickReplies: config.quickReplies || [
                { text: "Help", msg: "What can you help me with?" },
                { text: "Services", msg: "What services do you offer?" },
                { text: "Contact", msg: "How can I contact you?" }
            ]
        };
        
        this.messages = [];
        this.isOpen = false;
        this.isLoading = false;
        this.unreadCount = 0;
        
        if (this.config.enableHistory) {
            this.loadHistory();
        }
        
        this.init();
    }
    
    // =============================================
    // INITIALIZATION
    // =============================================
    
    init() {
        this.createUI();
        this.bindEvents();
        
        if (this.messages.length === 0) {
            setTimeout(() => {
                this.addMessage(this.config.initialMessage, 'bot');
            }, 500);
        } else {
            this.messages.forEach(msg => {
                if (msg.role !== 'system') {
                    this.addMessageToUI(msg.content, msg.role === 'user' ? 'user' : 'bot', true);
                }
            });
        }
    }
    
    // =============================================
    // UI CREATION
    // =============================================
    
    createUI() {
        const container = document.createElement('div');
        container.id = 'chat-assistant-container';
        container.innerHTML = `
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <div class="chat-header-avatar">🤖</div>
                        <div class="chat-header-info">
                            <h3>${this.config.companyName}</h3>
                            <div class="status">
                                <span class="status-dot"></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button id="clear-history" title="Clear chat">🗑️</button>
                        <button id="close-window">✕</button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="empty-state" id="empty-state">
                        <div style="font-size:48px;margin-bottom:12px;">💬</div>
                        <h4>Start a conversation</h4>
                        <p style="font-size:13px;margin:0;">Ask me anything!</p>
                    </div>
                </div>
                <div class="quick-replies" id="quick-replies">
                    ${this.config.quickReplies.map(qr => 
                        `<button class="quick-reply-btn" data-msg="${this.escapeHtml(qr.msg)}">${this.escapeHtml(qr.text)}</button>`
                    ).join('')}
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" id="chat-input" placeholder="Type your message..." maxlength="1000" />
                        <span class="input-char-count" id="char-count">0/1000</span>
                    </div>
                    <button id="send-btn">Send</button>
                </div>
            </div>
            <button class="chat-toggle-btn" id="chat-toggle-btn">
                <span class="chat-icon">💬</span>
                <span class="close-icon">✕</span>
                <span class="unread-badge" id="unread-badge">0</span>
            </button>
        `;
        
        document.body.appendChild(container);
        
        // Store references
        this.window = document.getElementById('chat-window');
        this.messagesContainer = document.getElementById('chat-messages');
        this.emptyState = document.getElementById('empty-state');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.toggleBtn = document.getElementById('chat-toggle-btn');
        this.closeBtn = document.getElementById('close-window');
        this.clearBtn = document.getElementById('clear-history');
        this.charCount = document.getElementById('char-count');
        this.unreadBadge = document.getElementById('unread-badge');
        this.quickReplies = document.querySelectorAll('.quick-reply-btn');
        
        // Apply theme
        if (this.config.theme === 'dark') {
            this.window.classList.add('dark');
        }
    }
    
    // =============================================
    // EVENT BINDING
    // =============================================
    
    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.input.addEventListener('input', () => {
            const count = this.input.value.length;
            this.charCount.textContent = `${count}/1000`;
            this.charCount.style.color = count > 900 ? '#ff4757' : '#999';
        });
        
        this.quickReplies.forEach(btn => {
            btn.addEventListener('click', () => {
                this.input.value = btn.dataset.msg;
                this.sendMessage();
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.closeChat();
        });
    }
    
    // =============================================
    // CHAT CONTROLS
    // =============================================
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.window.classList.add('open');
        this.toggleBtn.classList.add('active');
        this.isOpen = true;
        this.unreadCount = 0;
        this.unreadBadge.classList.remove('show');
        setTimeout(() => this.input.focus(), 300);
        this.scrollToBottom();
    }
    
    closeChat() {
        this.window.classList.remove('open');
        this.toggleBtn.classList.remove('active');
        this.isOpen = false;
    }
    
    // =============================================
    // MESSAGE HANDLING
    // =============================================
    
    addMessage(text, sender, skipHistory = false) {
        this.addMessageToUI(text, sender);
        
        if (!skipHistory && this.config.enableHistory) {
            const role = sender === 'user' ? 'user' : 'assistant';
            this.messages.push({ role, content: text });
            this.saveHistory();
        }
    }
    
    addMessageToUI(text, sender, skipAnimation = false) {
        this.emptyState.style.display = 'none';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (!skipAnimation) {
            messageDiv.style.animation = 'messageIn 0.3s ease';
        }
        
        messageDiv.innerHTML = `
            ${this.escapeHtml(text)}
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        if (!this.isOpen && sender === 'bot') {
            this.unreadCount++;
            this.unreadBadge.textContent = this.unreadCount;
            this.unreadBadge.classList.add('show');
        }
    }
    
    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // =============================================
    // SEND MESSAGE & API CALL
    // =============================================
    
    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isLoading) return;
        
        this.addMessage(text, 'user');
        this.input.value = '';
        this.charCount.textContent = '0/1000';
        this.input.disabled = true;
        this.sendBtn.disabled = true;
        this.isLoading = true;
        
        this.addTypingIndicator();
        
        try {
            const response = await this.callAI(text);
            this.removeTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            if (error.message.includes('5028')) {
                errorMessage = 'The AI model is temporarily unavailable. Please try again later.';
            } else if (error.message.includes('limit')) {
                errorMessage = 'I have reached my daily usage limit. Please try again tomorrow.';
            }
            this.addMessage(errorMessage, 'bot');
            console.error('Chat error:', error);
        }
        
        this.input.disabled = false;
        this.sendBtn.disabled = false;
        this.isLoading = false;
        this.input.focus();
    }
    
    async callAI(userMessage) {
        const history = this.messages.slice(-10);
        const messages = [
            { role: 'system', content: this.config.systemPrompt },
            ...history
        ];
        
        try {
            const response = await fetch(`${this.config.apiEndpoint}/ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }
            
            return data.response || 'No response received';
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }
    
    // =============================================
    // HISTORY MANAGEMENT
    // =============================================
    
    clearHistory() {
        if (confirm('Clear all chat history?')) {
            this.messages = [];
            this.messagesContainer.innerHTML = '';
            this.emptyState.style.display = 'flex';
            this.saveHistory();
            this.addMessage(this.config.initialMessage, 'bot');
        }
    }
    
    saveHistory() {
        try {
            const history = {
                messages: this.messages.slice(-this.config.maxHistoryLength),
                timestamp: Date.now()
            };
            localStorage.setItem('chat_history', JSON.stringify(history));
        } catch (e) {
            // Silently fail
        }
    }
    
    loadHistory() {
        try {
            const data = localStorage.getItem('chat_history');
            if (data) {
                const history = JSON.parse(data);
                if (Date.now() - history.timestamp < 7 * 24 * 60 * 60 * 1000) {
                    this.messages = history.messages || [];
                }
            }
        } catch (e) {
            this.messages = [];
        }
    }
}
