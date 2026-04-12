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
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile default closed

  // ✅ smooth scroll
  useEffect(() => {
    if (activeConversation?.messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  const handleSuggestion = (query: string) => {
    sendMessage(query, 'summary', 'en');
  };

  // ✅ CLEAR CHAT FUNCTION
  const handleClearChat = () => {
    const confirmClear = window.confirm("Clear all messages?");
    if (confirmClear) {
      newChat();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0c29] text-white">

      {/* ✅ Sidebar */}
      <aside
        className={`
          fixed md:static z-40 top-0 left-0 h-full w-[75%] max-w-[260px]
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300
          flex flex-col gap-4 p-4 bg-white/[0.06]
          border-r border-white/10 backdrop-blur-2xl
        `}
      >

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
              onClick={() => {
                selectConversation(conv.id);
                setSidebarOpen(false); // auto close on mobile
              }}
              className="w-full text-left text-xs px-3 py-2 rounded-lg text-white/60 hover:bg-white/10"
            >
              {conv.title}
            </button>
          ))}
        </div>

      </aside>

      {/* ✅ Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ Main */}
      <div className="flex-1 flex flex-col w-full">

        {/* ✅ Header */}
        <header className="h-[52px] flex items-center px-3 md:px-5 gap-3 bg-white/[0.05] border-b border-white/10">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>

          <h2 className="text-xs md:text-sm truncate">
            {activeConversation?.title || 'AI Policy Simplifier'}
          </h2>

          <button
            onClick={handleClearChat}
            className="ml-auto px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition"
          >
            Clear
          </button>

        </header>

        {/* ✅ Content */}
        <div className="flex-1 overflow-y-auto px-3 md:px-5 pt-4 md:pt-6 pb-28 md:pb-24 flex flex-col items-center">

          {/* Welcome */}
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <WelcomeScreen onSuggestionClick={handleSuggestion} />
          )}

          {/* Messages */}
          {activeConversation && activeConversation.messages.length > 0 && (
            <div className="w-full max-w-full md:max-w-2xl space-y-3">
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

        {/* ✅ Input (FIXED for mobile) */}
        <div className="fixed md:sticky bottom-0 left-0 w-full bg-[#0f0c29] border-t border-white/10 px-3 md:px-5 py-2 md:py-3 z-20">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>

      </div>
    </div>
  );
};

export default Index;