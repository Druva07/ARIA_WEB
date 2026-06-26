'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Circle, Bot, User } from 'lucide-react';

type Task = {
  _id: string;
  content: string;
  done: boolean;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm ARIA. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(tasks.filter(t => t._id !== id)); // optimistic UI update
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done: !currentStatus }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
        if (data.taskAdded) {
          fetchTasks(); 
        }
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Failed to connect to server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '1.5rem', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Sidebar: Tasks */}
      <div className="glass" style={{ width: '320px', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground)' }}>
          <CheckCircle size={20} color="var(--accent)" />
          Pending Tasks
        </h2>
        
        <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={32} style={{ opacity: 0.3 }} />
              <p>You're all caught up!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task._id} 
                onClick={() => toggleTask(task._id, task.done)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {task.done ? <CheckCircle size={18} color="var(--primary)" /> : <Circle size={18} color="var(--text-muted)" />}
                </div>
                <span style={{ fontSize: '0.9rem', lineHeight: '1.4', color: task.done ? 'var(--text-muted)' : 'var(--foreground)', textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.content}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="glass" style={{ flex: 1, borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
            <Bot size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ARIA</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Intelligent Assistant</p>
          </div>
        </div>

        {/* Chat History */}
        <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} color="var(--primary)" />
                </div>
              )}
              
              <div style={{ 
                padding: '14px 20px', 
                borderRadius: '20px', 
                background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(255,255,255,0.04)',
                color: 'white',
                fontSize: '1rem',
                lineHeight: '1.6',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.02)' : 'none',
              }}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                 <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
             <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} color="var(--primary)" />
                </div>
                <div style={{ padding: '14px 20px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottomLeftRadius: '4px' }}>
                  <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>Thinking...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--panel-border)' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message ARIA or say 'remind me to...'"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--panel-border)',
                borderRadius: '16px',
                padding: '16px 20px',
                paddingRight: '60px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--panel-border)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                bottom: '8px',
                background: input.trim() && !loading ? 'var(--primary)' : 'transparent',
                color: input.trim() && !loading ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px',
                width: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={18} style={{ transform: input.trim() && !loading ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
