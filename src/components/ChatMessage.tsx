import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType, FORMAT_LABELS } from '@/types/chat';
import { Bot, User } from 'lucide-react';

interface Props {
  message: ChatMessageType;
}

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {message.format && !isUser && (
          <span className="format-badge bg-primary/10 text-primary mb-2 inline-block">
            {FORMAT_LABELS[message.format]}
          </span>
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
