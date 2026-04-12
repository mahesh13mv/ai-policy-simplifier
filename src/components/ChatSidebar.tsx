import { MessageSquarePlus, History } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ conversations, activeId, onSelect, onNewChat }: ChatSidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={onNewChat} className="w-full gap-2" variant="default">
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <History className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                conv.id === activeId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {conv.title}
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          
        </p>
      </div>
    </aside>
  );
}
