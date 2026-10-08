import React from 'react';
import {
  Activity,
  Zap,
  HardDrive,
  GitBranch,
  Clock,
  Code2,
  PieChart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function MetricsTab({ metrics, language }) {
  const m = metrics || {
    loc: 0,
    blankLines: 0,
    commentLines: 0,
    codeLines: 0,
    cyclomaticComplexity: 1,
    maintainabilityIndex: 100,
    estimatedTimeComplexity: 'O(1)',
    estimatedSpaceComplexity: 'O(1)',
    technicalDebtMinutes: 0
  };

  const total = Math.max(1, m.loc);
  const codePercent = Math.round((m.codeLines / total) * 100);
  const commentPercent = Math.round((m.commentLines / total) * 100);
  const blankPercent = Math.round((m.blankLines / total) * 100);

  // Time complexity speed rating
  let timeBadgeColor = 'var(--status-success)';
  let timeRating = 'Constant / Highly Efficient';
  if (m.estimatedTimeComplexity.includes('N²') || m.estimatedTimeComplexity.includes('N³') || m.estimatedTimeComplexity.includes('2ⁿ')) {
    timeBadgeColor = 'var(--status-critical)';
    timeRating = 'Quadratic / Severe Bottleneck on Large Inputs';
  } else if (m.estimatedTimeComplexity.includes('N log N')) {
    timeBadgeColor = 'var(--status-medium)';
    timeRating = 'Log-Linear / Standard Sorting Complexity';
  } else if (m.estimatedTimeComplexity.includes('N')) {
    timeBadgeColor = 'var(--status-low)';
    timeRating = 'Linear / Scalable Stream Iteration';
  }

  // Cyclomatic rating
  let cycloStatus = 'Low Complexity (Easy to Test & Reason)';
  let cycloColor = 'var(--status-success)';
  if (m.cyclomaticComplexity > 10) {
    cycloStatus = 'High Complexity (Risk of Unhandled Execution Branches)';
    cycloColor = 'var(--status-critical)';
  } else if (m.cyclomaticComplexity > 5) {
    cycloStatus = 'Moderate Branching (Multiple Conditional Paths)';
    cycloColor = 'var(--status-medium)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto', height: '100%' }}>
      {/* Big-O Complexity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Time Complexity Card */}
        <div className="glass-panel" style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={13} color="var(--accent-secondary)" />
              Time Complexity
            </span>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: timeBadgeColor
          }}>
            {m.estimatedTimeComplexity}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
            {timeRating}
          </div>
        </div>

        {/* Space Complexity Card */}
        <div className="glass-panel" style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={13} color="var(--accent-purple)" />
              Space Complexity
            </span>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-purple)'
          }}>
            {m.estimatedSpaceComplexity}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
            Auxiliary heap allocations & stack depth
          </div>
        </div>
      </div>

      {/* Cyclomatic & Maintainability Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Cyclomatic Complexity */}
        <div className="glass-panel" style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GitBranch size={13} color={cycloColor} />
            Cyclomatic Complexity
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-highlight)' }}>
            {m.cyclomaticComplexity} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>paths</span>
          </div>
          <div style={{ fontSize: '10.5px', color: cycloColor, fontWeight: 500 }}>
            {cycloStatus}
          </div>
        </div>

        {/* Maintainability Index */}
        <div className="glass-panel" style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={13} color="var(--accent-primary)" />
            Maintainability Index
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-highlight)' }}>
            {m.maintainabilityIndex} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${m.maintainabilityIndex}%`, height: '100%', background: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      {/* Technical Debt Estimate */}
      <div className="glass-panel" style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-high)'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-highlight)' }}>
              Estimated Technical Debt
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Projected engineering time to refactor issues
            </div>
          </div>
        </div>

        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--status-high)' }}>
          ~{m.technicalDebtMinutes} min
        </div>
      </div>

      {/* Lines of Code Breakdown */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={15} color="var(--accent-secondary)" />
          Lines of Code Breakdown ({m.loc} Total)
        </div>

        {/* Stacked Percentage Bar */}
        <div style={{
          height: '10px',
          width: '100%',
          display: 'flex',
          borderRadius: '5px',
          overflow: 'hidden',
          background: 'var(--bg-input)'
        }}>
          <div style={{ width: `${codePercent}%`, background: 'var(--accent-primary)' }} title={`Source Code: ${m.codeLines} lines`} />
          <div style={{ width: `${commentPercent}%`, background: 'var(--status-success)' }} title={`Comments: ${m.commentLines} lines`} />
          <div style={{ width: `${blankPercent}%`, background: 'var(--text-muted)' }} title={`Blank Lines: ${m.blankLines} lines`} />
        </div>

        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent-primary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Code: <strong>{m.codeLines}</strong> ({codePercent}%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--status-success)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Comments: <strong>{m.commentLines}</strong> ({commentPercent}%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Blank: <strong>{m.blankLines}</strong> ({blankPercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
