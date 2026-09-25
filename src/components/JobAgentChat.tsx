import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCheck, Phone, Video, MoreVertical } from 'lucide-react';
import type { Job } from '../lib/supabase';
import { getAgentResponse, getAgentSuggestions } from '../lib/employer-agent';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  time: string;
  read: boolean;
}

export default function JobAgentChat({ job, onClose }: { job: Job; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const agentName = job.agent_name || 'Employer';
  const agentAvatar = job.agent_avatar || 'EM';
  const [online] = useState(true);

  useEffect(() => {
    const greeting = getAgentResponse('hello', job);
    setMessages([{ id: crypto.randomUUID(), role: 'agent', content: greeting, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), read: false }]);
  }, [job.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), read: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getAgentResponse(text, job);
      setTyping(false);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'agent', content: reply, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), read: false }]);
    }, 1000 + Math.random() * 800);
  };

  const avatarColors = ['from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-amber-500 to-orange-600', 'from-rose-500 to-rose-700', 'from-violet-500 to-violet-700', 'from-cyan-500 to-cyan-700'];
  const colorIdx = (agentName.charCodeAt(0) || 0) % avatarColors.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-slate-900"
    >
      {/* WhatsApp-style header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950">
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm`}>
            {agentAvatar}
          </div>
          {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-800" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{agentName}</div>
          <div className="text-xs text-green-400">{typing ? 'typing...' : online ? 'online' : 'last seen recently'}</div>
        </div>
        <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {/* Chat wallpaper */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto px-4 py-4 space-y-1.5"
        style={{ backgroundColor: '#e5ddd5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23d1c7b7" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-14V8h-2v2h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 14V8H4v2H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const prevSameSender = idx > 0 && messages[idx - 1].role === msg.role;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${prevSameSender ? 'mt-0.5' : 'mt-2'}`}
            >
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                isUser
                  ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-sm'
                  : 'bg-white text-slate-800 rounded-tl-sm'
              }`}>
                {msg.content}
                <div className="flex items-center gap-1 justify-end mt-0.5 -mb-1">
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            </motion.div>
          );
        })}

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mt-2">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
          {getAgentSuggestions(job).slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-green-500/50 border border-transparent focus:border-green-500/30"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="p-3 rounded-full bg-green-600 text-white disabled:opacity-40 hover:bg-green-700 transition-colors shadow-md"
        >
          {typing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );
}
