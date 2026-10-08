import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Bot,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import IssuesTab from './IssuesTab.jsx';
import SecurityTab from './SecurityTab.jsx';
import MetricsTab from './MetricsTab.jsx';
import ChatTab from './ChatTab.jsx';

export default function AnalysisSidebar({
  activeTab,
  setActiveTab,
  reviewData,
  isReviewing,
  metrics,
  language,
  code,
  apiKey,
  selectedModel,
  onHighlightLine,
  onApplyFix,
  onStartReview,
  onInsertCode,
  addToast
}) {
  const issuesCount = reviewData?.issues?.length || 0;
  const securityCount = reviewData?.securityVulnerabilities?.length || 0;
  const effectiveMetrics = reviewData?.metrics || metrics;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
      overflow: 'hidden'
    }}>
      {/* Tab Navigation */}
      <div style={{
        height: '42px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: '4px',
        flexShrink: 0
      }}>
        {/* Tab 1: Issues */}
        <button
          onClick={() => setActiveTab('issues')}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            fontWeight: 600,
            background: activeTab === 'issues' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'issues' ? 'var(--text-highlight)' : 'var(--text-muted)',
            border: activeTab === 'issues' ? '1px solid var(--border-medium)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <AlertTriangle size={13} color="var(--accent-primary)" />
          <span>Overview</span>
          {issuesCount > 0 && (
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '4px',
              background: 'var(--accent-primary-glow)',
              color: 'var(--accent-primary)',
              fontWeight: 700
            }}>
              {issuesCount}
            </span>
          )}
        </button>

        {/* Tab 2: Security */}
        <button
          onClick={() => setActiveTab('security')}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            fontWeight: 600,
            background: activeTab === 'security' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'security' ? 'var(--text-highlight)' : 'var(--text-muted)',
            border: activeTab === 'security' ? '1px solid var(--border-medium)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Lock size={13} color="var(--status-critical)" />
          <span>Security</span>
          {securityCount > 0 && (
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '4px',
              background: 'var(--status-critical-bg)',
              color: 'var(--status-critical)',
              fontWeight: 700
            }}>
              {securityCount}
            </span>
          )}
        </button>

        {/* Tab 3: Metrics */}
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            fontWeight: 600,
            background: activeTab === 'metrics' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'metrics' ? 'var(--text-highlight)' : 'var(--text-muted)',
            border: activeTab === 'metrics' ? '1px solid var(--border-medium)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Activity size={13} color="var(--accent-secondary)" />
          <span>Metrics</span>
          {effectiveMetrics?.estimatedTimeComplexity && (
            <span style={{
              fontSize: '9.5px',
              padding: '1px 4px',
              borderRadius: '3px',
              background: 'var(--bg-tertiary)',
              color: 'var(--accent-secondary)',
              fontFamily: 'var(--font-mono)'
            }}>
              {effectiveMetrics.estimatedTimeComplexity}
            </span>
          )}
        </button>

        {/* Tab 4: AI Chat */}
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            fontWeight: 600,
            background: activeTab === 'chat' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'chat' ? 'var(--text-highlight)' : 'var(--text-muted)',
            border: activeTab === 'chat' ? '1px solid var(--border-medium)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Bot size={13} color="var(--accent-purple)" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'issues' && (
          <IssuesTab
            reviewData={reviewData}
            isReviewing={isReviewing}
            onHighlightLine={onHighlightLine}
            onApplyFix={onApplyFix}
            onStartReview={onStartReview}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTab
            reviewData={reviewData}
            language={language}
            code={code}
            onHighlightLine={onHighlightLine}
            addToast={addToast}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsTab
            metrics={effectiveMetrics}
            language={language}
          />
        )}

        {activeTab === 'chat' && (
          <ChatTab
            code={code}
            language={language}
            apiKey={apiKey}
            selectedModel={selectedModel}
            onInsertCode={onInsertCode}
            addToast={addToast}
          />
        )}
      </div>
    </div>
  );
}
