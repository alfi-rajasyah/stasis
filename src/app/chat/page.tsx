import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-6 py-8 pb-20 max-w-2xl">
      <div className="glass rounded-xl border p-12 text-center space-y-4">
        <MessageSquare size={40} className="mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">Coming in Sprint 3</p>
      </div>
    </div>
  );
}
