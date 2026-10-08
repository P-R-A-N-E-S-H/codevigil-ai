import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileDown,
  ArrowRight,
  AlertTriangle,
  Lock,
  Key,
  Database,
  Terminal,
  FileCode,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { exportReviewToPdf, exportReviewToMarkdown } from '../services/pdfExport.js';

export default function SecurityTab({
  reviewData,
  language,
  code,
  onHighlightLine,
  addToast
}) {
  const securityVulns = reviewData?.securityVulnerabilities || [];
  const hasVulns = securityVulns.length > 0;

  const handleExportPdf = () => {
    if (!reviewData) {
      addToast('No Audit Data', 'Run AI Review first before exporting reports.', 'warning');
      return;
    }
    exportReviewToPdf(reviewData, language, code);
    addToast('PDF Exported', 'Security Audit Report PDF downloaded.', 'success');
  };

  const handleExportMarkdown = () => {
    if (!reviewData) {
      addToast('No Audit Data', 'Run AI Review first before exporting reports.', 'warning');
      return;
    }
    exportReviewToMarkdown(reviewData, language, code);
    addToast('Markdown Exported', 'Security Audit Report Markdown downloaded.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto', height: '100%' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: hasVulns 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(24, 15, 20, 0.7))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 24, 20, 0.7))',
        border: hasVulns ? '1px solid var(--status-critical-border)' : '1px solid var(--status-success-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: hasVulns ? 'var(--status-critical-bg)' : 'var(--status-success-bg)',
            color: hasVulns ? 'var(--status-critical)' : 'var(--status-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {hasVulns ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-highlight)' }}>
              {hasVulns ? `${securityVulns.length} Security Flaws Detected` : 'Zero Vulnerabilities Detected'}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {hasVulns ? 'Immediate remediation required for production readiness.' : 'Code meets OWASP Top 10 & CWE standard guardrails.'}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleExportPdf}
            title="Download PDF Security Report"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FileDown size={12} color="var(--accent-primary)" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            title="Download Markdown Report"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FileCode size={12} color="var(--accent-secondary)" />
            <span>MD</span>
          </button>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!hasVulns ? (
          <div style={{
            padding: '30px 20px',
            textAlign: 'center',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={32} color="var(--status-success)" />
            <span style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>OWASP Static Check Passed</span>
            <span>No injection vectors, leaked tokens, path traversal or memory vulnerabilities found.</span>
          </div>
        ) : (
          securityVulns.map((vuln, idx) => {
            const isCritical = vuln.severity === 'Critical';
            const badgeClass = isCritical ? 'badge-critical' : vuln.severity === 'High' ? 'badge-high' : 'badge-medium';

            return (
              <div
                key={vuln.id || idx}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className={`badge ${badgeClass}`}>{vuln.severity}</span>
                    {vuln.cwe && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-highlight)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {vuln.cwe}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {vuln.category}
                    </span>
                  </div>

                  {vuln.line && (
                    <button
                      onClick={() => onHighlightLine(vuln.line)}
                      title={`Jump to line ${vuln.line}`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--status-critical)',
                        background: 'var(--status-critical-bg)',
                        border: '1px solid var(--status-critical-border)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>Line {vuln.line}</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>

                {/* Name */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-highlight)' }}>
                  {vuln.name}
                </div>

                {/* Description */}
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {vuln.description}
                </div>

                {/* Remediation Box */}
                <div style={{
                  padding: '10px 12px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '11px',
                  lineHeight: 1.4
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--status-success)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    Recommended Security Remediation:
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {vuln.remediation}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
