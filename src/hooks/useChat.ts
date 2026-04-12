import { useState, useCallback } from 'react';
import { ChatMessage, Conversation, ExplanationFormat } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

const generateId = () => crypto.randomUUID();

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createConversation = useCallback((firstMessage: string) => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : ''),
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    format: ExplanationFormat = 'summary',
    language: string = 'en'
  ) => {
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(content);
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
    ));

    setIsLoading(true);

    // Get current messages for context
    const currentConv = conversations.find(c => c.id === convId);
    const history = currentConv ? currentConv.messages : [];
    const allMessages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    let assistantContent = '';

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/policy-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages, format, language }),
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const assistantId = generateId();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setConversations(prev => prev.map(c => {
                if (c.id !== convId) return c;
                const msgs = [...c.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg?.role === 'assistant' && lastMsg.id === assistantId) {
                  msgs[msgs.length - 1] = { ...lastMsg, content: assistantContent };
                } else {
                  msgs.push({
                    id: assistantId,
                    role: 'assistant',
                    content: assistantContent,
                    format,
                    timestamp: new Date(),
                  });
                }
                return { ...c, messages: msgs };
              }));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ Sorry, I couldn't process that request. ${err.message || 'Please try again.'}`,
        timestamp: new Date(),
      };
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, errorMsg] } : c
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, conversations, createConversation]);

  const newChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  return {
    conversations,
    activeConversation,
    isLoading,
    sendMessage,
    newChat,
    selectConversation,
  };
}
