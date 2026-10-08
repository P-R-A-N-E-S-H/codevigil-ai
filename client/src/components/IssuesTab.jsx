import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Zap,
  Info,
  Layers
} from 'lucide-react';

export default function IssuesTab({
  reviewData,
  isReviewing,
  onHighlightLine,
  onApplyFix,
  onStartReview
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [expandedStep, setExpandedStep] = useState(null);

  if (isReviewing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-primary-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)'
        }}>
          <Sparkles size={28} className="animate-spin" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-highlight)' }}>
            Analyzing Code Structure & Logic...
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '280px' }}>
            Running static AST heuristics, complexity estimation, and Gemini AI deep code audit.
          </p>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}>
          <Layers size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-highlight)' }}>
            No Review Performed Yet
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '280px' }}>
            Click "Review Code" or press <kbd style={{ background: 'var(--bg-input)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>Ctrl+Enter</kbd> to inspect code quality, bugs, and maintainability.
          </p>
        </div>
        <button
          onClick={onStartReview}
          className="glow-btn"
          style={{ padding: '8px 18px', fontSize: '12px', marginTop: '6px' }}
        >
          <Sparkles size={14} />
          <span>Run AI Review</span>
        </button>
      </div>
    );
  }

  const {
    overallScore = 85,
    healthGrade = 'A',
    summary,
    issues = [],
    explanation = [],
    warning
  } = reviewData;

  // Counts by severity
  const criticalCount = issues.filter(i => i.severity === 'Critical').length;
  const highCount = issues.filter(i => i.severity === 'High').length;
  const mediumCount = issues.filter(i => i.severity === 'Medium').length;
  const lowCount = issues.filter(i => i.severity === 'Low').length;

  const filteredIssues = issues.filter(issue => {
    if (filterSeverity === 'ALL') return true;
    return issue.severity === filterSeverity;
  });

  // Calculate score circle stroke offset
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  let scoreColor = 'var(--status-success)';
  if (overallScore < 60) scoreColor = 'var(--status-critical)';
  else if (overallScore < 75) scoreColor = 'var(--status-high)';
  else if (overallScore < 85) scoreColor = 'var(--status-medium)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto', height: '100%' }}>
      {warning && (
        <div style={{
          padding: '10px 12px',
          background: 'var(--status-medium-bg)',
          border: '1px solid var(--status-medium-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '11px',
          color: 'var(--status-medium)',
          display: 'flex',
          gap: '8px'
        }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{warning}</span>
        </div>
      )}

      {/* Score Overview Card */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        background: 'linear-gradient(135deg, rgba(22, 25, 38, 0.9), rgba(30, 35, 53, 0.6))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Circular Score Gauge */}
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={scoreColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-highlight)' }}>
                {overallScore}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-2px' }}>
                / 100
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-highlight)' }}>
                Code Health Grade
              </h3>
              <span style={{
                fontSize: '13px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: scoreColor === 'var(--status-success)' ? 'var(--status-success-bg)' : 'var(--status-critical-bg)',
                color: scoreColor,
                border: `1px solid ${scoreColor}`
              }}>
                {healthGrade}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overallScore >= 85 ? 'Solid architecture & clean patterns.' : overallScore >= 70 ? 'Moderate concerns detected.' : 'High risk bugs or complexity.'}
            </p>
          </div>
        </div>

        <button
          onClick={onApplyFix}
          className="glow-btn"
          style={{
            padding: '8px 14px',
            fontSize: '11px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap'
          }}
        >
          <Zap size={13} />
          <span>Apply All Fixes</span>
        </button>
      </div>

      {/* Summary Text */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: 1.5
      }}>
        {summary}
      </div>

      {/* Severity Filter Tabs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="var(--accent-primary)" />
            Detected Issues ({issues.length})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${issues.length})` },
            { id: 'Critical', label: `Critical (${criticalCount})`, badgeClass: 'badge-critical' },
            { id: 'High', label: `High (${highCount})`, badgeClass: 'badge-high' },
            { id: 'Medium', label: `Medium (${mediumCount})`, badgeClass: 'badge-medium' },
            { id: 'Low', label: `Low (${lowCount})`, badgeClass: 'badge-low' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: filterSeverity === tab.id ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                color: filterSeverity === tab.id ? 'var(--text-highlight)' : 'var(--text-muted)',
                border: filterSeverity === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredIssues.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '12px'
          }}>
            <CheckCircle2 size={24} color="var(--status-success)" style={{ margin: '0 auto 8px' }} />
            No issues found under this filter!
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const badgeClass =
              issue.severity === 'Critical' ? 'badge-critical' :
              issue.severity === 'High' ? 'badge-high' :
              issue.severity === 'Medium' ? 'badge-medium' : 'badge-low';

            return (
              <div
                key={issue.id || idx}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className={`badge ${badgeClass}`}>{issue.severity}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {issue.category}
                    </span>
                  </div>

                  {issue.line && (
                    <button
                      onClick={() => onHighlightLine(issue.line)}
                      title={`Jump to line ${issue.line} in code editor`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--accent-primary)',
                        background: 'var(--accent-primary-glow)',
                        border: '1px solid var(--border-bright)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>Line {issue.line}</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>

                {/* Message */}
                <div style={{ fontSize: '12px', color: 'var(--text-highlight)', fontWeight: 500, lineHeight: 1.4 }}>
                  {issue.message}
                </div>

                {/* Suggested Fix */}
                {issue.suggestedFix && (
                  <div style={{
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '11px',
                    color: 'var(--accent-secondary)'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Suggested Fix:</strong> {issue.suggestedFix}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Step-by-Step Refactoring Explanations */}
      {explanation && explanation.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-highlight)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--accent-purple)" />
            Refactoring Steps & Rationales
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {explanation.map((step, idx) => {
              const isExp = expandedStep === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setExpandedStep(isExp ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary-glow)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}>
                        {step.step || idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    {isExp ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                  </button>

                  {isExp && (
                    <div style={{
                      padding: '0 12px 12px 40px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5
                    }}>
                      {step.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
