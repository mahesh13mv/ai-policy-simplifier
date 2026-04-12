import { POPULAR_POLICIES } from '@/types/chat';
import { Landmark, Sparkles } from 'lucide-react';

interface Props {
  onSuggestionClick: (query: string) => void;
}

export function WelcomeScreen({ onSuggestionClick }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Landmark className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
        Policy Simplifier
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Understand complex government policies in simple language. Ask anything about GST, NEP, RTI, and more.
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Sparkles className="h-4 w-4" />
        <span>Try asking about</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {POPULAR_POLICIES.map(policy => (
          <button
            key={policy}
            onClick={() => onSuggestionClick(policy)}
            className="suggestion-chip"
          >
            {policy}
          </button>
        ))}
      </div>
    </div>
  );
}
