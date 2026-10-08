import React from 'react';
import {
  ShieldAlert,
  Play,
  Sparkles,
  FlaskConical,
  Settings,
  Code2,
  ChevronDown,
  Layers,
  UserCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function Header({
  snippets,
  selectedSnippetId,
  onSelectSnippet,
  language,
  setLanguage,
  persona,
  setPersona,
  onReview,
  onRunCode,
  onGenerateTests,
  isReviewing,
  isRunning,
  isGeneratingTests,
  onOpenSettings,
  apiKey,
  healthStatus
}) {
  const PERSONAS = [
    { id: 'architect', name: 'Principal Architect', icon: '🏛️', desc: 'Design patterns, SOLID, scalability' },
    { id: 'security', name: 'Security Red Team', icon: '🛡️', desc: 'OWASP Top 10, CWEs, injection risks' },
    { id: 'performance', name: 'High-Performance Guru', icon: '⚡', desc: 'Big-O complexity, memory, latency' },
    { id: 'linter', name: 'Strict Quality Linter', icon: '🧹', desc: 'Clean code, styling, dead code' },
    { id: 'mentor', name: 'Staff Engineer Mentor', icon: '🎓', desc: 'Encouraging, educational step-by-step' }
  ];

  const LANGUAGES = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'go', label: 'Go' },
    { id: 'java', label: 'Java' },
    { id: 'rust', label: 'Rust' },
    { id: 'sql', label: 'SQL' }
  ];

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      gap: '16px',
      flexShrink: 0,
      zIndex: 100
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px var(--accent-primary-glow)'
        }}>
          <ShieldAlert size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ffffff 40%, var(--accent-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CodeVigil
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-bright)',
              borderRadius: '4px',
              padding: '1px 5px'
            }}>
              AI 2.0
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Code Reviewer & Debugger
          </span>
        </div>
      </div>

      {/* Center Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
        {/* Sample Snippets Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--text-muted)" />
          <select
            value={selectedSnippetId}
            onChange={(e) => onSelectSnippet(e.target.value)}
            style={{
              height: '36px',
              fontSize: '12px',
              fontWeight: 500,
              maxWidth: '240px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <option value="custom">✏️ Custom / Blank Editor</option>
            {snippets.map((snip) => (
              <option key={snip.id} value={snip.id}>
                {snip.title}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={14} color="var(--text-muted)" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              height: '36px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Persona Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={14} color="var(--text-muted)" />
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            style={{
              height: '36px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sandbox Run Button */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          title="Run Code in Safe Sandbox (Ctrl+R)"
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--status-success)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
        >
          {isRunning ? (
            <Sparkles size={14} className="animate-spin" color="var(--status-success)" />
          ) : (
            <Play size={14} color="var(--status-success)" />
          )}
          <span>Run</span>
        </button>

        {/* Generate Tests Button */}
        <button
          onClick={onGenerateTests}
          disabled={isGeneratingTests}
          title="Generate Unit Test Suite"
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
        >
          {isGeneratingTests ? (
            <Sparkles size={14} className="animate-spin" color="var(--accent-secondary)" />
          ) : (
            <FlaskConical size={14} color="var(--accent-secondary)" />
          )}
          <span>Tests</span>
        </button>

        {/* Primary AI Review Button */}
        <button
          onClick={onReview}
          disabled={isReviewing}
          className="glow-btn"
          title="Start AI Code Review & Security Audit (Ctrl+Enter)"
          style={{
            height: '36px',
            padding: '0 18px',
            fontSize: '13px'
          }}
        >
          {isReviewing ? (
            <>
              <Sparkles size={15} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Review Code</span>
            </>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Preferences & Settings"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
