import React, { useState } from 'react';
import {
  Terminal,
  FlaskConical,
  Sliders,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SandboxDrawer({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  executionResult,
  isRunning,
  stdin,
  setStdin,
  onRunCode,
  generatedTests,
  testFramework,
  isGeneratingTests,
  onGenerateTests,
  customRules,
  setCustomRules,
  language,
  addToast
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleCopyTests = () => {
    if (!generatedTests) return;
    navigator.clipboard.writeText(generatedTests);
    addToast('Tests Copied', 'Unit test suite copied to clipboard.', 'success');
  };

  const handleDownloadTests = () => {
    if (!generatedTests) return;
    const testExtensions = {
      python: 'test_suite.py',
      javascript: 'suite.test.js',
      typescript: 'suite.test.ts',
      cpp: 'test_suite.cpp',
      go: 'main_test.go',
      java: 'TestSuite.java'
    };
    const fileName = testExtensions[language] || 'test_suite.txt';
    const blob = new Blob([generatedTests], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Download Complete', `Saved ${fileName}`, 'success');
  };

  const drawerHeight = !isOpen ? '36px' : isMaximized ? '60vh' : '230px';

  return (
    <div style={{
      height: drawerHeight,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* Drawer Tab Bar */}
      <div style={{
        height: '36px',
        background: 'var(--bg-primary)',
        borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => {
              setActiveTab('console');
              if (!isOpen) setIsOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              background: isOpen && activeTab === 'console' ? 'var(--bg-card-hover)' : 'transparent',
              color: isOpen && activeTab === 'console' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: isOpen && activeTab === 'console' ? '1px solid var(--border-medium)' : '1px solid transparent'
            }}
          >
            <Terminal size={13} color="var(--accent-secondary)" />
            <span>Sandbox Console</span>
            {executionResult && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: executionResult.success ? 'var(--status-success)' : 'var(--status-critical)'
              }} />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('tests');
              if (!isOpen) setIsOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              background: isOpen && activeTab === 'tests' ? 'var(--bg-card-hover)' : 'transparent',
              color: isOpen && activeTab === 'tests' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: isOpen && activeTab === 'tests' ? '1px solid var(--border-medium)' : '1px solid transparent'
            }}
          >
            <FlaskConical size={13} color="var(--accent-purple)" />
            <span>Unit Test Suite</span>
            {generatedTests && (
              <span style={{ fontSize: '9px', background: 'var(--accent-purple)', color: '#fff', borderRadius: '3px', padding: '0 4px', fontWeight: 700 }}>
                1
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('rules');
              if (!isOpen) setIsOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              background: isOpen && activeTab === 'rules' ? 'var(--bg-card-hover)' : 'transparent',
              color: isOpen && activeTab === 'rules' ? 'var(--text-highlight)' : 'var(--text-muted)',
              border: isOpen && activeTab === 'rules' ? '1px solid var(--border-medium)' : '1px solid transparent'
            }}
          >
            <Sliders size={13} color="var(--status-high)" />
            <span>Custom Rules Prompt</span>
            {customRules && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-high)' }} />
            )}
          </button>
        </div>

        {/* Right Tools & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOpen && (
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {isMaximized ? 'Restore' : 'Maximize'}
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse panel' : 'Expand panel'}
            style={{
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* TAB 1: Console */}
          {activeTab === 'console' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0b10', padding: '10px 14px', overflow: 'hidden' }}>
              {/* Header Status Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                  {executionResult ? (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: executionResult.success ? 'var(--status-success)' : 'var(--status-critical)', fontWeight: 600 }}>
                        {executionResult.success ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                        Exit: {executionResult.exitCode ?? 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {executionResult.executionTimeMs} ms
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Ready for execution. Click "Run" or press Ctrl+R.</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Standard Input (stdin)..."
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    style={{ height: '26px', fontSize: '11px', width: '180px', padding: '0 8px' }}
                  />
                  <button
                    onClick={onRunCode}
                    disabled={isRunning}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-success-bg)',
                      border: '1px solid var(--status-success-border)',
                      color: 'var(--status-success)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={11} fill="var(--status-success)" />
                    Run
                  </button>
                </div>
              </div>

              {/* Console Output Area */}
              <div style={{
                flex: 1,
                background: '#07080c',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {isRunning ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
                    <Sparkles size={14} className="animate-spin" />
                    <span>Executing in isolated sandbox runtime...</span>
                  </div>
                ) : executionResult ? (
                  <>
                    {executionResult.stdout && (
                      <div style={{ color: '#38bdf8' }}>{executionResult.stdout}</div>
                    )}
                    {executionResult.stderr && (
                      <div style={{ color: '#f87171', marginTop: executionResult.stdout ? '8px' : '0' }}>
                        {executionResult.stderr}
                      </div>
                    )}
                    {!executionResult.stdout && !executionResult.stderr && (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        (Program finished with no standard output)
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>
                    $ codevigil-sandbox --lang={language}<br />
                    // Output and runtime traces will appear here upon execution.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Generated Tests */}
          {activeTab === 'tests' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0b10', padding: '10px 14px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                    Automated Unit Tests
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '10px', textTransform: 'none' }}>
                    {testFramework || 'Framework Auto'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={onGenerateTests}
                    disabled={isGeneratingTests}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} color="var(--accent-secondary)" />
                    Regenerate
                  </button>

                  {generatedTests && (
                    <>
                      <button
                        onClick={handleCopyTests}
                        style={{
                          height: '26px',
                          padding: '0 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px'
                        }}
                      >
                        <Copy size={12} />
                        Copy
                      </button>

                      <button
                        onClick={handleDownloadTests}
                        style={{
                          height: '26px',
                          padding: '0 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px'
                        }}
                      >
                        <Download size={12} />
                        Export
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{
                flex: 1,
                background: '#07080c',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap'
              }}>
                {isGeneratingTests ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
                    <Sparkles size={14} className="animate-spin" />
                    <span>Generating edge case, assertion & exception test cases...</span>
                  </div>
                ) : generatedTests ? (
                  generatedTests
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>
                    Click "Tests" or "Regenerate" to generate a complete unit test suite for your current code.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Rules */}
          {activeTab === 'rules' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0b10', padding: '10px 14px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                  Custom Code Quality & Linter Rules
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  These rules will be injected into AI review evaluations.
                </span>
              </div>

              <textarea
                value={customRules}
                onChange={(e) => setCustomRules(e.target.value)}
                placeholder="e.g. Enforce immutability, all async functions must use try/catch blocks, require strict TypeScript types, disallow any nested loops with complexity > O(N)..."
                style={{
                  flex: 1,
                  background: '#07080c',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
