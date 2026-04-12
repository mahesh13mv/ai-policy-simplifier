export type ExplanationFormat = 'summary' | 'detailed' | 'bullets' | 'eli10';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  format?: ExplanationFormat;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export const FORMAT_LABELS: Record<ExplanationFormat, string> = {
  summary: '📝 Summary',
  detailed: '📖 Detailed',
  bullets: '🔹 Key Points',
  eli10: '🧒 ELI10',
};

export const POPULAR_POLICIES = [
  "What is GST?",
  "Explain NEP 2020",
  "What is RTI Act?",
  "Explain Ayushman Bharat",
  "What is MGNREGA?",
  "Explain Digital India",
  "What is Make in India?",
  "Explain Startup India",
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];
