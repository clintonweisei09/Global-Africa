import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Mic, Paperclip, Smile, Phone, Video, MoreVertical,
  ArrowLeft, CheckCheck, Check, Loader2, Image as ImageIcon,
  Languages, FileText, Play, MessageSquarePlus, Camera,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getAgentResponse } from '../lib/employer-agent';
import type { Job } from '../lib/supabase';

interface ChatConvo {
  id: string;
  participant_type: string;
  participant_name: string;
  participant_avatar: string;
  participant_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  online?: boolean;
  job_id?: string;
}

interface ChatMsg {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  message_type: string;
  file_url: string;
  file_name: string;
  duration: number;
  read_at: string | null;
  translated_content: string;
  created_at: string;
}

const emojis = ['😀', '😂', '🥰', '😍', '👍', '🙏', '💪', '🎉', '🔥', '✨', '❤️', '🤝', '😊', '😎', '🤔', '👋', '✅', '⭐', '🌍', '✈️', '💼', '🏠', '💰', '📋'];

const avatarColors = ['from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-amber-500 to-orange-600', 'from-rose-500 to-rose-700', 'from-violet-500 to-violet-700', 'from-cyan-500 to-cyan-700'];

function getColor(name: string) {
  return avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Messages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ChatConvo[]>([]);
  const [activeConvo, setActiveConvo] = useState<ChatConvo | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [translated, setTranslated] = useState<Set<string>>(new Set());
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('chat_conversations').select('*').eq('user_id', user.id).order('last_message_at', { ascending: false });
    const convos = (data as ChatConvo[]) || [];
    convos.forEach((c) => { c.online = Math.random() > 0.25; });
    setConversations(convos);

    // Auto-create conversations from accepted applications that don't have one yet
    const { data: apps } = await supabase.from('applications').select('*, job:jobs(*)').eq('user_id', user.id).in('status', ['submitted', 'accepted', 'reviewing']);
    if (apps) {
      for (const app of apps) {
        const job = app.job as any;
        if (!job) continue;
        const existing = convos.find((c) => c.job_id === job.id);
        if (!existing) {
          const employerName = job.agent_name || job.company || 'Employer';
          const { data: newConvo } = await supabase.from('chat_conversations').insert({
            user_id: user.id,
            participant_type: 'employer',
            participant_name: employerName,
            participant_avatar: job.agent_avatar || getInitials(employerName),
            participant_role: `${job.title} — ${job.company}`,
            last_message: 'Conversation started',
            last_message_at: new Date().toISOString(),
            job_id: job.id,
          }).select('*').maybeSingle();
          if (newConvo) {
            const greeting = getAgentResponse('hello', job);
            await supabase.from('chat_messages').insert({
              conversation_id: (newConvo as ChatConvo).id,
              user_id: user.id,
              sender: 'other',
              content: greeting,
              message_type: 'text',
            });
            await supabase.from('chat_conversations').update({
              last_message: greeting.slice(0, 50),
              last_message_at: new Date().toISOString(),
            }).eq('id', (newConvo as ChatConvo).id);
            (newConvo as ChatConvo).online = true;
            setConversations((prev) => [newConvo as ChatConvo, ...prev]);
          }
        }
      }
    }
  }, [user]);

  const fetchMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', convoId).order('created_at', { ascending: true });
    setMessages(data as ChatMsg[] || []);
  }, []);

  const fetchJobForConvo = useCallback(async (convo: ChatConvo) => {
    if (!convo.job_id) return;
    const { data } = await supabase.from('jobs').select('*').eq('id', convo.job_id).maybeSingle();
    setActiveJob(data as Job);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    fetchConversations();
  }, [user, authLoading, navigate, fetchConversations]);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo.id);
      fetchJobForConvo(activeConvo);
    }
  }, [activeConvo, fetchMessages, fetchJobForConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async (type: string, name: string, role: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('chat_conversations').insert({
      user_id: user.id,
      participant_type: type,
      participant_name: name,
      participant_avatar: getInitials(name),
      participant_role: role,
      last_message: 'Conversation started',
      last_message_at: new Date().toISOString(),
    }).select('*').maybeSingle();
    if (error) return;
    const convo = data as ChatConvo;
    convo.online = true;
    setConversations((prev) => [convo, ...prev]);
    setActiveConvo(convo);
    setMessages([]);
  };

  const sendMessage = async (text: string, type = 'text') => {
    if (!text.trim() || !user || !activeConvo) return;
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      conversation_id: activeConvo.id,
      sender: 'user',
      content: text,
      message_type: type,
      file_url: '',
      file_name: '',
      duration: 0,
      read_at: null,
      translated_content: '',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setShowEmoji(false);

    await supabase.from('chat_messages').insert({
      conversation_id: activeConvo.id, user_id: user.id, sender: 'user', content: text, message_type: type,
    });
    await supabase.from('chat_conversations').update({
      last_message: type === 'voice' ? '🎤 Voice message' : text.slice(0, 50),
      last_message_at: new Date().toISOString(),
    }).eq('id', activeConvo.id);

    // Generate reply from the employer (using employer-agent)
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let reply: string;
      if (activeJob) {
        reply = getAgentResponse(text, activeJob);
      } else if (activeConvo.participant_type === 'support') {
        reply = 'Hello! Welcome to GlobalHire Support. How can I help you today? You can ask about your application, documents, visa process, or any other questions.';
      } else {
        reply = 'Thank you for your message! I\'ll get back to you as soon as possible. Feel free to ask any questions about the job or the process.';
      }
      const replyMsg: ChatMsg = {
        id: crypto.randomUUID(),
        conversation_id: activeConvo.id,
        sender: 'other',
        content: reply,
        message_type: 'text',
        file_url: '',
        file_name: '',
        duration: 0,
        read_at: null,
        translated_content: '',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, replyMsg]);
      supabase.from('chat_messages').insert({
        conversation_id: activeConvo.id, user_id: user.id, sender: 'other', content: reply, message_type: 'text',
      }).then(() => {
        supabase.from('chat_conversations').update({
          last_message: reply.slice(0, 50),
          last_message_at: new Date().toISOString(),
        }).eq('id', activeConvo.id);
        fetchConversations();
      });
    }, 1200 + Math.random() * 1000);
  };

  const sendVoiceMessage = () => {
    if (!recording) {
      setRecording(true);
      setTimeout(() => {
        setRecording(false);
        sendMessage('Voice message', 'voice');
      }, 2000);
    }
  };

  const handleFileUpload = () => {
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) sendMessage(`📎 ${file.name}`, 'file');
    };
    inputEl.click();
  };

  const handleImageUpload = () => {
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.accept = 'image/*';
    inputEl.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) sendMessage(`🖼️ ${file.name}`, 'image');
    };
    inputEl.click();
  };

  const translateMessage = (msg: ChatMsg) => {
    if (translated.has(msg.id)) {
      setTranslated((prev) => { const n = new Set(prev); n.delete(msg.id); return n; });
    } else {
      setTranslated((prev) => new Set(prev).add(msg.id));
    }
  };

  const markAsRead = async (convoId: string) => {
    if (!user) return;
    await supabase.from('chat_messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', convoId).eq('sender', 'other').is('read_at', null);
    await supabase.from('chat_conversations').update({ unread_count: 0 }).eq('id', convoId);
  };

  const openConvo = (convo: ChatConvo) => {
    setActiveConvo(convo);
    markAsRead(convo.id);
    setConversations((prev) => prev.map((c) => (c.id === convo.id ? { ...c, unread_count: 0 } : c)));
  };

  const filteredConvos = conversations.filter((c) =>
    c.participant_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-slate-950 pt-16 lg:pt-20">
      {/* Conversation list — WhatsApp style */}
      <div className={`w-full sm:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 ${activeConvo ? 'hidden sm:flex' : 'flex'}`}>
        {/* Gradient header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Messages</h1>
            <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <MessageSquarePlus className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-green-500/50"
            />
          </div>
        </div>

        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-white/5">
          <button onClick={() => createConversation('support', 'GlobalHire Support', 'Customer Support')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold whitespace-nowrap hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Support
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvos.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                <MessageSquarePlus className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet.</p>
              <p className="text-xs text-slate-400 mt-1">Apply for a job to start chatting with employers!</p>
            </div>
          ) : (
            filteredConvos.map((convo) => (
              <button
                key={convo.id}
                onClick={() => openConvo(convo)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 ${
                  activeConvo?.id === convo.id ? 'bg-green-50 dark:bg-green-500/10' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getColor(convo.participant_name)} flex items-center justify-center text-white font-bold text-sm`}>
                    {convo.participant_avatar || getInitials(convo.participant_name)}
                  </div>
                  {convo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{convo.participant_name}</span>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{new Date(convo.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{convo.last_message}</span>
                    {convo.unread_count > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-green-600 rounded-full shrink-0">{convo.unread_count}</span>
                    )}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-0.5 truncate">{convo.participant_role}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area — WhatsApp style */}
      <div className={`flex-1 flex flex-col ${activeConvo ? 'flex' : 'hidden sm:flex'}`}>
        {activeConvo ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950">
              <button onClick={() => setActiveConvo(null)} className="sm:hidden p-1.5 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(activeConvo.participant_name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {activeConvo.participant_avatar || getInitials(activeConvo.participant_name)}
                </div>
                {activeConvo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-800" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">{activeConvo.participant_name}</div>
                <div className="text-xs text-green-400">{typing ? 'typing...' : activeConvo.online ? 'online' : 'last seen recently'}</div>
              </div>
              <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>

            {/* Messages — WhatsApp wallpaper */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ backgroundColor: '#e5ddd5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23d1c7b7" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-14V8h-2v2h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 14V8H4v2H0v2h4v4h2v-4h4v-2H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            >
              <div className="max-w-2xl mx-auto space-y-1">
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isTranslated = translated.has(msg.id);
                  const prevSameSender = idx > 0 && messages[idx - 1].sender === msg.sender;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${prevSameSender ? 'mt-0.5' : 'mt-2'}`}
                    >
                      <div className={`max-w-[75%] ${isUser ? 'order-2' : ''}`}>
                        {msg.message_type === 'voice' ? (
                          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${isUser ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-sm' : 'bg-white text-slate-900 rounded-tl-sm shadow-sm'}`}>
                            <button className="p-1.5 rounded-full bg-slate-200"><Play className="w-4 h-4 text-slate-700" /></button>
                            <div className="flex-1 flex items-center gap-0.5">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="w-0.5 rounded-full bg-slate-400" style={{ height: `${4 + Math.random() * 12}px` }} />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">0:12</span>
                          </div>
                        ) : msg.message_type === 'file' ? (
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isUser ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-sm' : 'bg-white text-slate-900 rounded-tl-sm shadow-sm'}`}>
                            <div className="p-2 rounded-lg bg-slate-200"><FileText className="w-5 h-5 text-slate-700" /></div>
                            <div>
                              <div className="text-sm font-semibold">{msg.content.replace('📎 ', '')}</div>
                              <div className="text-xs text-slate-500">Tap to download</div>
                            </div>
                          </div>
                        ) : msg.message_type === 'image' ? (
                          <div className={`rounded-2xl overflow-hidden ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm shadow-sm'}`}>
                            <div className="w-48 h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                            <div className={`px-3 py-1.5 text-xs ${isUser ? 'bg-[#dcf8c6] text-slate-700' : 'bg-white text-slate-600'}`}>{msg.content.replace('🖼️ ', '')}</div>
                          </div>
                        ) : (
                          <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line shadow-sm ${isUser ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm'}`}>
                            {isTranslated ? `[Translated] ${msg.content}` : msg.content}
                            <div className="flex items-center gap-1 justify-end mt-0.5 -mb-1">
                              <span className="text-[10px] text-slate-400">{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isUser && (msg.read_at ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-slate-400" />)}
                            </div>
                          </div>
                        )}
                        {!isUser && msg.message_type === 'text' && (
                          <div className="flex items-center gap-1 mt-0.5 ml-1">
                            <button onClick={() => translateMessage(msg)} className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-green-600 transition-colors">
                              <Languages className="w-3 h-3" /> {isTranslated ? 'Original' : 'Translate'}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator */}
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
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                  <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
                    {emojis.map((emoji) => (
                      <button key={emoji} onClick={() => { setInput((prev) => prev + emoji); setShowEmoji(false); }} className="text-2xl hover:scale-125 transition-transform">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar — WhatsApp style */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
              <div className="max-w-2xl mx-auto flex items-end gap-1.5">
                <button onClick={() => setShowEmoji(!showEmoji)} className="p-2.5 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button onClick={handleFileUpload} className="p-2.5 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button onClick={handleImageUpload} className="p-2.5 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(input); } }}
                    placeholder="Type a message"
                    className="w-full px-4 py-2.5 rounded-full bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-green-500/50 border border-transparent focus:border-green-500/30"
                  />
                </div>
                {input.trim() ? (
                  <button onClick={() => sendMessage(input)} className="p-3 rounded-full bg-green-600 text-white shadow-md hover:bg-green-700 transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={sendVoiceMessage}
                    className={`p-3 rounded-full transition-all ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-green-600 text-white shadow-md hover:bg-green-700'}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#e5ddd5' }}>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.99.97 4.29L2 22l5.71-1.97C9.01 20.64 10.46 21 12 21c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.39 0-2.73-.29-3.95-.82l-.28-.14-3.4 1.17 1.17-3.4-.14-.28C5.29 15.73 5 14.39 5 13c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">GlobalHire Messages</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Chat directly with employers about jobs, visa, travel, and more. Your conversations are private and secure.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
