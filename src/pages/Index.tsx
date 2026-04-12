import { useRef, useEffect, useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessageBubble } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { WelcomeScreen } from '@/components/WelcomeScreen';

const Index = () => {
  const {
    conversations,
    activeConversation,
    isLoading,
    sendMessage,
    newChat,
    selectConversation
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ smooth scroll
  useEffect(() => {
    if (activeConversation?.messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  const handleSuggestion = (query: string) => {
    sendMessage(query, 'summary', 'en');
  };

  // ✅ CLEAR CHAT FUNCTION (with confirm)
  const handleClearChat = () => {
    const confirmClear = window.confirm("Clear all messages?");
    if (confirmClear) {
      newChat();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0c29] text-white">

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-56 flex flex-col gap-4 p-4 bg-white/[0.06] border-r border-white/10 backdrop-blur-2xl">

          <button
            onClick={newChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110"
          >
            <Sparkles className="w-4 h-4" />
            New Chat
          </button>

          <p className="text-[10px] uppercase text-white/30">Recent</p>

          <div className="flex-1 overflow-y-auto space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg text-white/60 hover:bg-white/10"
              >
                {conv.title}
              </button>
            ))}
          </div>

        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-[52px] flex items-center px-5 gap-3 bg-white/[0.05] border-b border-white/10">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>

          <h2 className="text-sm">
            {activeConversation?.title || 'AI Policy Simplifier'}
          </h2>

          {/* ✅ CLEAR CHAT BUTTON */}
          <button
            onClick={handleClearChat}
            className="ml-auto px-3 py-1 text-xs rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition"
          >
            Clear Chat
          </button>

        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 flex flex-col items-center">

          {/* Welcome Screen */}
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <WelcomeScreen onSuggestionClick={handleSuggestion} />
          )}

          {/* Chat Messages */}
          {activeConversation && activeConversation.messages.length > 0 && (
            <div className="w-full max-w-2xl space-y-3">
              {activeConversation.messages.map(msg => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="text-white/50 text-sm">Typing...</div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-[#0f0c29] border-t border-white/10 px-5 py-3">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>

      </div>
    </div>
  );
};

export default Index;