import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, Paperclip, Image as ImageIcon, Plus, Trash2,
  MessageSquare, X, Loader2, Sparkles, User, Sun, Moon, Menu,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAIResponse, getSuggestedPrompts } from '../lib/ai-engine';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-3 mb-1.5 text-slate-900 dark:text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-3 mb-2 text-slate-900 dark:text-white">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-sm font-mono">$1</code>')
    .replace(/^\| (.+)$/gm, (match) => {
      const cells = match.split('|').filter((c) => c.trim());
      if (cells.length < 2) return match;
      const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
      if (isSeparator) return '';
      const tds = cells.map((c) => `<td class="px-3 py-2 border-b border-slate-200 dark:border-white/10 text-sm">${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table class="w-full my-3 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">$1</table>')
    .replace(/^[-•] (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal">$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="space-y-1 my-2">$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/(<table>[\s\S]*?<\/table>)/g, (m) => m.replace(/<br\/>/g, ''));
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('ai_conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
    setConversations(data as Conversation[] || []);
  }, [user]);

  const fetchMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase.from('ai_messages').select('*').eq('conversation_id', convoId).order('created_at', { ascending: true });
    setMessages(data as Message[] || []);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    fetchConversations();
  }, [user, authLoading, navigate, fetchConversations]);

  useEffect(() => {
    if (activeConvo) fetchMessages(activeConvo);
    else setMessages([]);
  }, [activeConvo, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedText]);

  const createConversation = async (): Promise<string> => {
    const { data, error } = await supabase.from('ai_conversations').insert({
      user_id: user!.id,
      title: 'New Conversation',
    }).select('*').maybeSingle();
    if (error || !data) throw new Error('Failed to create conversation');
    const convo = data as Conversation;
    setConversations((prev) => [convo, ...prev]);
    setActiveConvo(convo.id);
    return convo.id;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    let convoId = activeConvo;
    if (!convoId) convoId = await createConversation();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setUploadedFile(null);
    setTyping(true);

    await supabase.from('ai_messages').insert({
      conversation_id: convoId, user_id: user.id, role: 'user', content: text,
    });

    if (convoId === activeConvo && conversations.find((c) => c.id === convoId)?.title === 'New Conversation') {
      const title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      await supabase.from('ai_conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', convoId);
      setConversations((prev) => prev.map((c) => (c.id === convoId ? { ...c, title } : c)));
    }

    const aiResponse = getAIResponse(text);
    const fullText = uploadedFile ? `I see you've uploaded a file. I'll analyze it alongside your question.\n\n${aiResponse.content}` : aiResponse.content;

    setTimeout(() => {
      setTyping(false);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setDisplayedText('');

      supabase.from('ai_messages').insert({
        conversation_id: convoId, user_id: user.id, role: 'assistant', content: fullText,
      }).then(() => {
        supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convoId);
      });

      let i = 0;
      typingTimerRef.current = setInterval(() => {
        if (i <= fullText.length) {
          setDisplayedText(fullText.slice(0, i));
          i += 3;
        } else {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setDisplayedText('');
        }
      }, 10);
    }, 800 + Math.random() * 600);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('ai_messages').delete().eq('conversation_id', id);
    await supabase.from('ai_conversations').delete().eq('id', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvo === id) { setActiveConvo(null); setMessages([]); }
  };

  const startNewChat = async () => {
    if (activeConvo && messages.length === 0) return;
    setActiveConvo(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleVoiceInput = () => {
    setRecording(!recording);
    if (!recording) {
      setTimeout(() => {
        setRecording(false);
        setInput('What are the salary ranges for caregivers in Canada?');
      }, 2000);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setUploadedFile(file.name);
    };
    input.click();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setUploadedFile(file.name);
    };
    input.click();
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  const showTypingText = typing && displayedText.length > 0;
  const suggestedPrompts = getSuggestedPrompts();

  return (
    <div className="h-screen flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 288 : 0 }}
        className={`${sidebarOpen ? 'fixed lg:relative z-40' : 'hidden lg:block'} h-full overflow-hidden bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/10`}
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 288 : undefined }}
      >
        <div className="w-72 h-full flex flex-col">
          <div className="p-4">
            <button onClick={startNewChat} className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-5 h-5" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => { setActiveConvo(convo.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                  activeConvo === convo.id
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{convo.title}</span>
                <Trash2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all" onClick={(e) => deleteConversation(convo.id, e)} />
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Msaidizi wa Ajira wa GlobalHire</div>
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !typing ? (
            <div className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Naweza kukusaidia vipi leo?</h1>
                <p className="text-slate-500 dark:text-slate-400">Uliza chochote kuhusu kazi, mshahara, visa, uhamiaji, waajiri, CV, mahojiano, na kuhamia — kwa lugha yoyote. Nitajibu kwa Kiswahili au lugha unayotumia.</p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => sendMessage(prompt)}
                    className="p-4 text-left rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-md transition-all text-sm text-slate-700 dark:text-slate-200"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-800'
                      : 'bg-gradient-to-br from-brand-500 to-brand-700'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/5">
                    {showTypingText ? (
                      <div className="text-sm text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(displayedText) }} />
                    ) : (
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-2 h-2 bg-brand-400 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          {uploadedFile && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-sm">
              <Paperclip className="w-4 h-4 text-brand-600" />
              <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">{uploadedFile}</span>
              <button onClick={() => setUploadedFile(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <button onClick={handleFileUpload} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Upload file">
              <Paperclip className="w-5 h-5" />
            </button>
            <button onClick={handleImageUpload} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Upload image">
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Uliza kuhusu kazi, mshahara, visa..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50 resize-none max-h-32"
                style={{ minHeight: 48 }}
              />
            </div>
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl transition-colors ${recording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() && !uploadedFile}
              className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg hover:shadow-xl disabled:opacity-40 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
