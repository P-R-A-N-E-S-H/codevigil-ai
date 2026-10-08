import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import SandboxDrawer from './components/SandboxDrawer.jsx';
import AnalysisSidebar from './components/AnalysisSidebar.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';

import { DEFAULT_SNIPPETS } from './data/defaultSnippets.js';
import {
  checkServerHealth,
  fetchSampleSnippets,
  reviewCode,
  executeCode,
  generateTests,
  calculateMetrics
} from './services/api.js';

import './App.css';

export default function App() {
  // Global State
  const [snippets, setSnippets] = useState(DEFAULT_SNIPPETS);
  const [selectedSnippetId, setSelectedSnippetId] = useState(DEFAULT_SNIPPETS[0].id);
  const [code, setCode] = useState(DEFAULT_SNIPPETS[0].code);
  const [fixedCode, setFixedCode] = useState(DEFAULT_SNIPPETS[0].fixedCode || '');
  const [language, setLanguage] = useState(DEFAULT_SNIPPETS[0].language || 'python');
  const [persona, setPersona] = useState('architect');
  const [customRules, setCustomRules] = useState('');

  // Editor View State
  const [editorMode, setEditorMode] = useState('editor'); // 'editor' | 'diff-split' | 'diff-inline'
  const [highlightedLine, setHighlightedLine] = useState(null);

  // Analysis & Review State
  const [reviewData, setReviewData] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Sandbox Execution State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('console'); // 'console' | 'tests' | 'rules'
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState('');

  // Unit Tests State
  const [generatedTests, setGeneratedTests] = useState('');
  const [testFramework, setTestFramework] = useState('');
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);

  // Sidebar Tab
  const [sidebarTab, setSidebarTab] = useState('issues'); // 'issues' | 'security' | 'metrics' | 'chat'

  // Settings & Theme
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('codevigil_gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('codevigil_selected_model') || 'gemini-2.0-flash');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('codevigil_theme') || 'theme-cyberpunk');
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('codevigil_editor_settings')) || { fontSize: 14, tabSize: 2, minimap: true, wordWrap: 'off' };
    } catch (e) {
      return { fontSize: 14, tabSize: 2, minimap: true, wordWrap: 'off' };
    }
  });

  // Health Status
  const [healthStatus, setHealthStatus] = useState({ status: 'checking' });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Apply Theme to document body
  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  // Initial Data & Health Fetch
  useEffect(() => {
    async function init() {
      const health = await checkServerHealth();
      setHealthStatus(health);

      const serverSnippets = await fetchSampleSnippets();
      if (serverSnippets && serverSnippets.length > 0) {
        setSnippets(serverSnippets);
      }
    }
    init();
  }, []);

  // Quick initial metrics calculation
  useEffect(() => {
    async function updateQuickMetrics() {
      try {
        const res = await calculateMetrics({ code, language });
        setMetrics(res);
      } catch (err) {
        // Silent catch for initial render
      }
    }
    const timer = setTimeout(updateQuickMetrics, 500);
    return () => clearTimeout(timer);
  }, [code, language]);

  // Snippet Selection Handler
  const handleSelectSnippet = (id) => {
    setSelectedSnippetId(id);
    if (id === 'custom') {
      setCode('// Paste or write your custom code here\nfunction example() {\n  return "CodeVigil AI";\n}\n');
      setFixedCode('');
      setReviewData(null);
      setGeneratedTests('');
      setExecutionResult(null);
      return;
    }

    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      setCode(snippet.code);
      setFixedCode(snippet.fixedCode || '');
      setLanguage(snippet.language || 'javascript');
      setReviewData(null);
      setGeneratedTests('');
      setExecutionResult(null);
      addToast('Snippet Loaded', `Loaded template: ${snippet.title}`, 'info');
    }
  };

  // Reset Snippet
  const handleResetSnippet = () => {
    if (selectedSnippetId === 'custom') {
      setCode('');
      setFixedCode('');
      setReviewData(null);
      return;
    }
    const snippet = snippets.find(s => s.id === selectedSnippetId);
    if (snippet) {
      setCode(snippet.code);
      setFixedCode(snippet.fixedCode || '');
      setReviewData(null);
      addToast('Editor Reset', 'Restored code to original snippet template.', 'info');
    }
  };

  // Start AI Code Review
  const handleReview = useCallback(async () => {
    if (!code || !code.trim()) {
      addToast('Empty Editor', 'Please enter some code before requesting a review.', 'warning');
      return;
    }

    setIsReviewing(true);
    setSidebarTab('issues');

    try {
      const result = await reviewCode({
        code,
        language,
        persona,
        customRules,
        apiKey,
        modelName: selectedModel
      });

      setReviewData(result);
      if (result.fixedCode) {
        setFixedCode(result.fixedCode);
      }

      addToast(
        'Review Complete',
        `Score: ${result.overallScore}/100 (Grade: ${result.healthGrade}). Found ${result.issues?.length || 0} issues, ${result.securityVulnerabilities?.length || 0} vulnerabilities.`,
        'success'
      );

      // Trigger celebration if score is high!
      if (result.overallScore >= 90) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      addToast('Review Failed', err.message || 'Error occurred while reviewing code.', 'error');
    } finally {
      setIsReviewing(false);
    }
  }, [code, language, persona, customRules, apiKey, selectedModel]);

  // Execute Code in Sandbox
  const handleRunCode = useCallback(async () => {
    if (!code || !code.trim()) {
      addToast('Empty Editor', 'Please enter code to execute.', 'warning');
      return;
    }

    setIsRunning(true);
    setIsDrawerOpen(true);
    setDrawerTab('console');

    try {
      const result = await executeCode({ code, language, stdin });
      setExecutionResult(result);
      if (result.success) {
        addToast('Execution Succeeded', `Finished in ${result.executionTimeMs}ms`, 'success');
      } else {
        addToast('Execution Terminated with Error', `Exit code: ${result.exitCode}`, 'warning');
      }
    } catch (err) {
      addToast('Sandbox Error', err.message, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [code, language, stdin]);

  // Generate Unit Tests
  const handleGenerateTests = useCallback(async () => {
    if (!code || !code.trim()) {
      addToast('Empty Editor', 'Please enter code to generate tests for.', 'warning');
      return;
    }

    setIsGeneratingTests(true);
    setIsDrawerOpen(true);
    setDrawerTab('tests');

    try {
      const result = await generateTests({ code, language, apiKey });
      setGeneratedTests(result.tests || '');
      setTestFramework(result.framework || '');
      addToast('Tests Generated', `Comprehensive unit test suite created with ${result.framework}`, 'success');
    } catch (err) {
      addToast('Test Generation Failed', err.message, 'error');
    } finally {
      setIsGeneratingTests(false);
    }
  }, [code, language, apiKey]);

  // Apply AI Fix to Editor
  const handleApplyFix = () => {
    if (!fixedCode) {
      addToast('No Fixed Code', 'Run AI Review first to generate an optimal refactored version.', 'warning');
      return;
    }

    setCode(fixedCode);
    setEditorMode('editor');
    addToast('Fix Applied', 'Editor code replaced with AI refactored version!', 'success');
  };

  // Insert code into editor from chat assistant
  const handleInsertCodeFromChat = (snippet) => {
    setCode(snippet);
    setEditorMode('editor');
    addToast('Code Inserted', 'AI snippet loaded into editor.', 'success');
  };

  // Keyboard Shortcuts (Ctrl+Enter = Review, Ctrl+R = Run)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleReview();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReview, handleRunCode]);

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        snippets={snippets}
        selectedSnippetId={selectedSnippetId}
        onSelectSnippet={handleSelectSnippet}
        language={language}
        setLanguage={setLanguage}
        persona={persona}
        setPersona={setPersona}
        onReview={handleReview}
        onRunCode={handleRunCode}
        onGenerateTests={handleGenerateTests}
        isReviewing={isReviewing}
        isRunning={isRunning}
        isGeneratingTests={isGeneratingTests}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKey={apiKey}
        healthStatus={healthStatus}
      />

      {/* Main Workspace Body */}
      <main className="app-main">
        {/* Left Side: Editor & Sandbox Drawer */}
        <div className="editor-section">
          <div className="editor-wrapper">
            <EditorPanel
              code={code}
              setCode={setCode}
              fixedCode={fixedCode}
              language={language}
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              editorSettings={editorSettings}
              currentTheme={currentTheme}
              highlightedLine={highlightedLine}
              reviewIssues={reviewData?.issues || []}
              securityVulns={reviewData?.securityVulnerabilities || []}
              onApplyFix={handleApplyFix}
              onResetSnippet={handleResetSnippet}
              addToast={addToast}
            />
          </div>

          {/* Collapsible Sandbox Drawer */}
          <SandboxDrawer
            isOpen={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            activeTab={drawerTab}
            setActiveTab={setDrawerTab}
            executionResult={executionResult}
            isRunning={isRunning}
            stdin={stdin}
            setStdin={setStdin}
            onRunCode={handleRunCode}
            generatedTests={generatedTests}
            testFramework={testFramework}
            isGeneratingTests={isGeneratingTests}
            onGenerateTests={handleGenerateTests}
            customRules={customRules}
            setCustomRules={setCustomRules}
            language={language}
            addToast={addToast}
          />
        </div>

        {/* Right Side: Analysis Sidebar */}
        <aside className="sidebar-section">
          <AnalysisSidebar
            activeTab={sidebarTab}
            setActiveTab={setSidebarTab}
            reviewData={reviewData}
            isReviewing={isReviewing}
            metrics={metrics}
            language={language}
            code={code}
            apiKey={apiKey}
            selectedModel={selectedModel}
            onHighlightLine={(line) => {
              setHighlightedLine(line);
              setEditorMode('editor');
            }}
            onApplyFix={handleApplyFix}
            onStartReview={handleReview}
            onInsertCode={handleInsertCodeFromChat}
            addToast={addToast}
          />
        </aside>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        editorSettings={editorSettings}
        setEditorSettings={setEditorSettings}
        addToast={addToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
