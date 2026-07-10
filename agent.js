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
        <!-- ✅ FIXED: Removed the close icon from toggle button -->
        <button class="chat-toggle-btn" id="chat-toggle-btn">
            <span class="chat-icon">💬</span>
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
