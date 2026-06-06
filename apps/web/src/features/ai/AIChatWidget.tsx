import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your URDIGIX Solutions AI Assistant. Ask me anything about your clients, projects, or tasks.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let replyText = "I'm sorry, I don't have that data available from the API yet, but I can help you track project budgets and tasks!";
      const prompt = input.toLowerCase();

      if (prompt.includes('project') || prompt.includes('active')) {
        replyText = 'Currently, you have 86 active projects. The project with the highest budget is "Mobile Banking App" for HDFC Bank (budget: ₹25,00,000, progress: 42%).';
      } else if (prompt.includes('client') || prompt.includes('tata')) {
        replyText = 'You have 128 total clients. Tata Consultancy Services has 8 active projects and is one of your key billing accounts.';
      } else if (prompt.includes('budget') || prompt.includes('revenue')) {
        replyText = 'Your annual billing revenue is ₹1,51,00,000 against operation costs of ₹74,00,000, yielding a net profit margin of ₹77,00,000.';
      } else if (prompt.includes('task') || prompt.includes('completed')) {
        replyText = 'You have 256 total tasks, of which 128 are Completed (50%), 68 are In Progress (27%), 45 are Pending (18%), and 15 are On Hold (5%).';
      }

      const aiMsg: Message = {
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 active:scale-95 transition-all duration-200"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[480px] flex flex-col justify-between border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-scaleIn !p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-primary-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 animate-pulse-slow" />
              <span className="font-extrabold text-sm tracking-wide">URDIGIX AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-primary-700 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 max-w-[80%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 font-semibold">{msg.time}</span>
              </div>
            ))}
            {loading && (
              <div className="self-start flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-250 dark:border-slate-800 flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Ask about clients, projects..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="!py-1.5 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-slate-200 dark:focus:border-slate-850"
              />
            </div>
            <button
              onClick={handleSend}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl active:scale-95 transition-all duration-200 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChatWidget;
