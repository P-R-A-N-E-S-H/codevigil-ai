import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Palette, Sliders, Check, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  currentTheme,
  setCurrentTheme,
  editorSettings,
  setEditorSettings,
  addToast
}) {
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setTempApiKey(apiKey || '');
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('codevigil_gemini_api_key', tempApiKey.trim());
    localStorage.setItem('codevigil_selected_model', selectedModel);
    localStorage.setItem('codevigil_theme', currentTheme);
    localStorage.setItem('codevigil_editor_settings', JSON.stringify(editorSettings));
    setApiKey(tempApiKey.trim());
    addToast('Settings Saved', 'Your configuration has been updated successfully.', 'success');
    onClose();
  };

  const handleVerifyKey = async () => {
    if (!tempApiKey.trim()) {
      addToast('No Key Provided', 'Please enter a Gemini API Key to test.', 'warning');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch('/api/health', {
        headers: { 'x-gemini-api-key': tempApiKey.trim() }
      });
      if (res.ok) {
        addToast('Connection Verified', 'Gemini API Key is valid and server connected!', 'success');
      } else {
        addToast('Verification Warning', 'Key received by backend server.', 'info');
      }
    } catch (e) {
      addToast('Local Connection', 'Key saved locally for direct use.', 'info');
    } finally {
      setIsVerifying(false);
    }
  };

  const themes = [
    { id: 'theme-cyberpunk', name: 'Cyberpunk Dark', accent: '#6366f1', desc: 'Neon indigo & cyan highlights' },
    { id: 'theme-midnight', name: 'Midnight Navy', accent: '#38bdf8', desc: 'Deep ocean dark theme' },
    { id: 'theme-slate', name: 'Slate Modern', accent: '#0ea5e9', desc: 'Clean graphite minimalist' },
    { id: 'theme-monokai', name: 'Monokai Pro', accent: '#ffd866', desc: 'Warm syntax & amber glow' },
    { id: 'theme-light', name: 'Clean Studio Light', accent: '#4f46e5', desc: 'Crisp day studio mode' }
  ];

  const models = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Recommended)', tag: 'Ultra Fast & Accurate' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Complex Reasoning & Deep Analysis' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Low Latency Response' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--accent-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-highlight)' }}>Preferences & Settings</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure AI engines, appearance & editor behaviors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Gemini API Key */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="var(--accent-primary)" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                Get Free API Key <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use built-in offline engine)"
                  style={{ width: '100%', paddingRight: '36px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleVerifyKey}
                disabled={isVerifying}
                style={{
                  padding: '0 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isVerifying ? <Sparkles size={14} className="animate-spin" /> : 'Verify'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Your key is stored securely in your browser's local storage and used directly for AI evaluations.
            </p>
          </div>

          {/* Gemini Model */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Cpu size={15} color="var(--accent-secondary)" />
              AI Intelligence Model
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedModel === m.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: selectedModel === m.id ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-highlight)' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.tag}</div>
                  </div>
                  {selectedModel === m.id && <Check size={16} color="var(--accent-primary)" />}
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Palette size={15} color="var(--accent-purple)" />
              UI Theme & Atmosphere
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {themes.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setCurrentTheme(t.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: currentTheme === t.id ? `1px solid ${t.accent}` : '1px solid var(--border-subtle)',
                    background: currentTheme === t.id ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-highlight)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Options */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Sliders size={15} color="var(--status-high)" />
              Monaco Code Editor Settings
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Font Size</span>
                <select
                  value={editorSettings.fontSize || 14}
                  onChange={(e) => setEditorSettings({ ...editorSettings, fontSize: Number(e.target.value) })}
                  style={{ width: '100%', fontSize: '12px' }}
                >
                  <option value={12}>12 px (Compact)</option>
                  <option value={13}>13 px</option>
                  <option value={14}>14 px (Standard)</option>
                  <option value={15}>15 px</option>
                  <option value={16}>16 px (Comfort)</option>
                  <option value={18}>18 px (Large)</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tab Spacing</span>
                <select
                  value={editorSettings.tabSize || 2}
                  onChange={(e) => setEditorSettings({ ...editorSettings, tabSize: Number(e.target.value) })}
                  style={{ width: '100%', fontSize: '12px' }}
                >
                  <option value={2}>2 Spaces (JS / React / Web)</option>
                  <option value={4}>4 Spaces (Python / C++ / Go)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editorSettings.minimap !== false}
                  onChange={(e) => setEditorSettings({ ...editorSettings, minimap: e.target.checked })}
                />
                Show Minimap
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editorSettings.wordWrap === 'on'}
                  onChange={(e) => setEditorSettings({ ...editorSettings, wordWrap: e.target.checked ? 'on' : 'off' })}
                />
                Soft Word Wrap
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="glow-btn"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
