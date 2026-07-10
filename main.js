/* =============================================
   ZUPER ZTORE - Website Configuration
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    const config = {
        // Cloudflare Worker API
        apiEndpoint: 'https://ai-assistant.mnsibkhan.workers.dev',
        model: '@cf/meta/llama-3.2-3b-instruct',
        
        // Branding
        companyName: 'Zuper Ztore',
        theme: 'light',
        position: 'bottom-right',
        
        // AI Settings
        systemPrompt: `You are Zappy, the friendly AI shopping assistant for Zuper Ztore (https://www.zuperztore.com). 
        Your personality is enthusiastic, helpful, and knowledgeable about our products. 
        
        KEY PRODUCT KNOWLEDGE:
        - FASHION: Vintage Cigarette Case ($10), Polaroid Sunglasses ($30, 10% off), Tommy Hilfiger Watch ($19.99), Infantry MDC Minimalist Watch ($25, 10% off), Megalith Chronograph Watch ($25, 10% off)
        - ELECTRONICS: Olympus LS-12 Linear PCM Recorder ($80, 10% off), Phones & Accessories
        - BOOKS: Various books & eBooks with up to 15% off
        - OUTDOOR: Ultralight Stove ($5)
        - DEALS: Books (15% off), Gadgets (20% off best sellers)

        YOUR ROLE:
        1. Greet shoppers warmly and ask how you can help
        2. Suggest products based on their interests
        3. Mention current deals and discounts
        4. Keep responses concise (2-3 sentences) but enthusiastic
        5. Use emojis occasionally (🕶️, ⌚, 📚, 💻)`,
        
        maxTokens: 500,
        temperature: 0.7,
        enableHistory: true,
        maxHistoryLength: 20,
        
        // Welcome & Quick Replies
        initialMessage: '👋 Hi there! I\'m Zappy, your Zuper Ztore shopping assistant! Looking for fashion, electronics, books, or something special? I\'m here to help you find the perfect item! 🛍️',
        quickReplies: [
            { text: "Show me watches ⌚", msg: "What watches do you have?" },
            { text: "Fashion deals 🕶️", msg: "What fashion items are on sale?" },
            { text: "Book recs 📚", msg: "Can you recommend some books?" },
            { text: "Best electronics 💻", msg: "What electronics do you sell?" },
            { text: "Current deals 🏷️", msg: "What are the current deals and discounts?" }
        ]
    };
    
    // Initialize the chat assistant
    window.chatAssistant = new ChatAssistant(config);
    console.log('🛍️ Zuper Ztore Assistant (Zappy) initialized!');
});
