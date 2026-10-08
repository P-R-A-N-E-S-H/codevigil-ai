import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  ArrowDownLeft,
  Trash2,
  Code
} from 'lucide-react';
import { sendChatMessage } from '../services/api.js';

export default function ChatTab({
  code,
  language,
  apiKey,
  selectedModel,
  onInsertCode,
  addToast
}) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hello! I am your AI Pair Programmer. I am actively analyzing your **${language}** code. Ask me to refactor, explain, optimize to $O(N)$, or detect elusive bugs!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: '⚡ Optimize to O(N)', prompt: 'How can we optimize the time complexity of this code to O(N)? Please provide the refactored code.' },
    { label: '🔍 Explain Logic', prompt: 'Explain the core logic and potential edge cases of this code step by step.' },
    { label: '🛡️ Check Concurrency', prompt: 'Are there any race conditions, deadlocks, or unhandled asynchronous errors here?' },
    { label: '📖 Add Docstrings', prompt: 'Generate comprehensive, clean docstrings and type annotations for all functions in this code.' },
    { label: '🧪 Edge Cases', prompt: 'What boundary and edge case inputs could break this function?' }
  ];

  const handleSend = async (customPrompt = null) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        code,
        language,
        messages: updatedMessages,
        apiKey,
        modelName: selectedModel
      });

      setMessages(prev => [...prev, { role: 'model', content: response.reply || 'No response generated.' }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: `⚠️ Error: ${err.message}. Please check your API key in Settings.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied', 'Chat snippet copied to clipboard.', 'success');
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        content: `Chat cleared. Ready for your next questions about the current **${language}** code!`
      }
    ]);
  };

  // Helper to format code blocks in text
  const renderMessageContent = (content) => {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          text: content.substring(lastIndex, match.index)
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || language,
        code: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        text: content.substring(lastIndex)
      });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {parts.map((part, i) => {
          if (part.type === 'code') {
            return (
              <div
                key={i}
                style={{
                  background: '#07080c',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  margin: '4px 0'
                }}
              >
                <div style={{
                  padding: '4px 10px',
                  background: 'var(--bg-primary)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '10.5px',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{part.language || 'code'}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleCopy(part.code)}
                      style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px' }}
                    >
                      <Copy size={11} /> Copy
                    </button>
                    {onInsertCode && (
                      <button
                        onClick={() => onInsertCode(part.code)}
                        style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px' }}
                      >
                        <ArrowDownLeft size={11} /> Insert
                      </button>
                    )}
                  </div>
                </div>
                <pre style={{
                  padding: '10px',
                  margin: 0,
                  fontSize: '11.5px',
                  color: '#38bdf8',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  lineHeight: 1.4
                }}>
                  {part.code}
                </pre>
              </div>
            );
          }
          return (
            <div key={i} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '12px' }}>
              {part.text}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
      {/* Quick Prompts Bar */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        <button
          onClick={handleClearChat}
          title="Clear chat history"
          style={{
            padding: '4px 6px',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}
        >
          <Trash2 size={12} />
        </button>

        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isLoading}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = 'var(--text-highlight)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isUser ? 'var(--accent-primary)' : 'var(--accent-primary-glow)',
                color: isUser ? '#ffffff' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isUser ? <User size={14} /> : <Bot size={15} />}
              </div>

              <div style={{
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isUser ? '#ffffff' : 'var(--text-primary)',
                border: isUser ? 'none' : '1px solid var(--border-subtle)'
              }}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--accent-primary-glow)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={15} />
            </div>
            <div style={{
              padding: '8px 12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--accent-secondary)'
            }}>
              <Sparkles size={13} className="animate-spin" />
              <span>Thinking & inspecting code context...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI pair programmer (e.g. How to make this O(N)?)..."
            style={{
              flex: 1,
              height: '38px',
              fontSize: '12px',
              background: 'var(--bg-input)'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="glow-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              padding: 0
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
