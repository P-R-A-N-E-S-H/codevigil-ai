import React, { useRef, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  Copy,
  RotateCcw,
  Check,
  Upload,
  Download,
  SplitSquareVertical,
  Code,
  Sparkles,
  FileCode,
  Zap
} from 'lucide-react';

export default function EditorPanel({
  code,
  setCode,
  fixedCode,
  language,
  editorMode,
  setEditorMode,
  editorSettings,
  currentTheme,
  highlightedLine,
  reviewIssues,
  securityVulns,
  onApplyFix,
  onResetSnippet,
  addToast
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define Monaco custom dark theme
    monaco.editor.defineTheme('codevigil-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'type', foreground: 'fbbf24' },
        { token: 'function', foreground: '60a5fa' }
      ],
      colors: {
        'editor.background': '#0f111a',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#181b2a',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#818cf8',
        'editorIndentGuide.background': '#1e2338',
        'editorIndentGuide.activeBackground': '#6366f1'
      }
    });

    monaco.editor.setTheme('codevigil-dark');
  };

  // Scroll to and highlight line when an issue is clicked
  useEffect(() => {
    if (editorRef.current && monacoRef.current && highlightedLine > 0 && editorMode === 'editor') {
      editorRef.current.revealLineInCenter(highlightedLine);
      editorRef.current.setPosition({ lineNumber: highlightedLine, column: 1 });
      editorRef.current.focus();

      // Add temporary highlight decoration
      const newDecorations = [
        {
          range: new monacoRef.current.Range(highlightedLine, 1, highlightedLine, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-line-highlight-target',
            glyphMarginClassName: 'monaco-glyph-issue'
          }
        }
      ];

      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
    }
  }, [highlightedLine, editorMode]);

  // Set line markers for all detected issues and vulnerabilities
  useEffect(() => {
    if (editorRef.current && monacoRef.current && editorMode === 'editor') {
      const markers = [];

      (reviewIssues || []).forEach(issue => {
        if (issue.line) {
          markers.push({
            startLineNumber: issue.line,
            startColumn: 1,
            endLineNumber: issue.line,
            endColumn: 100,
            message: `[${issue.severity}] ${issue.message}\nFix: ${issue.suggestedFix || ''}`,
            severity: issue.severity === 'Critical' || issue.severity === 'High' 
              ? monacoRef.current.MarkerSeverity.Error 
              : monacoRef.current.MarkerSeverity.Warning
          });
        }
      });

      (securityVulns || []).forEach(vuln => {
        if (vuln.line) {
          markers.push({
            startLineNumber: vuln.line,
            startColumn: 1,
            endLineNumber: vuln.line,
            endColumn: 100,
            message: `[SECURITY ${vuln.severity}] ${vuln.name} (${vuln.cwe})\n${vuln.description}\nRemediation: ${vuln.remediation}`,
            severity: monacoRef.current.MarkerSeverity.Error
          });
        }
      });

      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'codevigil-linter', markers);
      }
    }
  }, [reviewIssues, securityVulns, editorMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    addToast('Code Copied', 'Source code copied to clipboard.', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      addToast('File Loaded', `Imported ${file.name} successfully.`, 'success');
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleDownload = () => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      cpp: 'cpp',
      go: 'go',
      java: 'java',
      rust: 'rs',
      sql: 'sql'
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codevigil-source-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Download Complete', `Saved file as codevigil-source.${ext}`, 'success');
  };

  const lineCount = (code || '').split('\n').length;
  const charCount = (code || '').length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      position: 'relative',
      minWidth: '400px'
    }}>
      {/* Editor Subheader & Toolbar */}
      <div style={{
        height: '42px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        gap: '10px'
      }}>
        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setEditorMode('editor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              background: editorMode === 'editor' ? 'var(--bg-card-hover)' : 'transparent',
              color: editorMode === 'editor' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: editorMode === 'editor' ? '1px solid var(--border-medium)' : '1px solid transparent'
            }}
          >
            <Code size={14} color="var(--accent-primary)" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setEditorMode('diff-split')}
            disabled={!fixedCode}
            title={!fixedCode ? 'Run AI Review first to generate fixed code diff' : 'Side-by-Side Diff View'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              background: editorMode === 'diff-split' ? 'var(--bg-card-hover)' : 'transparent',
              color: editorMode === 'diff-split' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: editorMode === 'diff-split' ? '1px solid var(--border-medium)' : '1px solid transparent',
              opacity: fixedCode ? 1 : 0.4,
              cursor: fixedCode ? 'pointer' : 'not-allowed'
            }}
          >
            <SplitSquareVertical size={14} color="var(--accent-secondary)" />
            <span>Diff (Split)</span>
            {fixedCode && (
              <span style={{ fontSize: '9px', background: 'var(--accent-secondary)', color: '#000', borderRadius: '3px', padding: '1px 4px', fontWeight: 800 }}>
                READY
              </span>
            )}
          </button>

          <button
            onClick={() => setEditorMode('diff-inline')}
            disabled={!fixedCode}
            title={!fixedCode ? 'Run AI Review first to view diff' : 'Inline Unified Diff View'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              background: editorMode === 'diff-inline' ? 'var(--bg-card-hover)' : 'transparent',
              color: editorMode === 'diff-inline' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: editorMode === 'diff-inline' ? '1px solid var(--border-medium)' : '1px solid transparent',
              opacity: fixedCode ? 1 : 0.4,
              cursor: fixedCode ? 'pointer' : 'not-allowed'
            }}
          >
            <FileCode size={14} color="var(--accent-purple)" />
            <span>Diff (Inline)</span>
          </button>
        </div>

        {/* Toolbar Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {fixedCode && editorMode !== 'editor' && (
            <button
              onClick={onApplyFix}
              className="glow-btn"
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '11px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--status-success), #059669)'
              }}
              title="Replace original code with AI fixed refactoring"
            >
              <Check size={13} />
              <span>Apply Fix</span>
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onResetSnippet}
            title="Reset to original template code"
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <RotateCcw size={14} />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            title="Copy source code"
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Copy size={14} />
          </button>

          {/* Upload */}
          <label
            title="Upload code file (.js, .py, .cpp, .go, .sql, etc.)"
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Upload size={14} />
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {/* Download */}
          <button
            onClick={handleDownload}
            title="Download code file"
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Monaco Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {editorMode === 'editor' ? (
          <Editor
            height="100%"
            language={language === 'c++' ? 'cpp' : language}
            value={code}
            onChange={(val) => setCode(val || '')}
            onMount={handleEditorDidMount}
            theme="codevigil-dark"
            options={{
              fontSize: editorSettings.fontSize || 14,
              tabSize: editorSettings.tabSize || 2,
              minimap: { enabled: editorSettings.minimap !== false },
              wordWrap: editorSettings.wordWrap || 'off',
              lineNumbers: 'on',
              glyphMargin: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              fontLigatures: true,
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 }
            }}
          />
        ) : (
          <DiffEditor
            height="100%"
            language={language === 'c++' ? 'cpp' : language}
            original={code}
            modified={fixedCode || code}
            theme="codevigil-dark"
            options={{
              readOnly: true,
              renderSideBySide: editorMode === 'diff-split',
              fontSize: editorSettings.fontSize || 13,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 }
            }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        height: '26px',
        background: 'var(--bg-tertiary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>Lines: <strong style={{ color: 'var(--text-primary)' }}>{lineCount}</strong></span>
          <span>Chars: <strong style={{ color: 'var(--text-primary)' }}>{charCount}</strong></span>
          <span>Tokens: ~<strong style={{ color: 'var(--text-primary)' }}>{Math.round(charCount / 4)}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-secondary)' }} />
            UTF-8
          </span>
          <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-primary)' }}>
            {language}
          </span>
        </div>
      </div>
    </div>
  );
}
