import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '420px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        let borderColor = 'var(--accent-primary)';
        let bgColor = 'var(--bg-secondary)';
        let icon = <Info size={18} color="var(--accent-primary)" />;

        if (isSuccess) {
          borderColor = 'var(--status-success)';
          icon = <CheckCircle2 size={18} color="var(--status-success)" />;
        } else if (isWarning) {
          borderColor = 'var(--status-high)';
          icon = <AlertTriangle size={18} color="var(--status-high)" />;
        } else if (isError) {
          borderColor = 'var(--status-critical)';
          icon = <AlertCircle size={18} color="var(--status-critical)" />;
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
              animation: 'slideIn 0.25s ease-out'
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-highlight)', marginBottom: '2px' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
