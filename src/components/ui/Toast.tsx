import { useEffect } from 'react';

type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  type?: ToastVariant;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeouts = toasts.map(toast => {
      const tid = window.setTimeout(() => onDismiss(toast.id), 5000);
      return tid;
    });
    return () => timeouts.forEach(tid => window.clearTimeout(tid));
  }, [toasts, onDismiss]);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', top: 84, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '10px', width: '320px',
    }}>
      {toasts.map(toast => {
        const bg = toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'warning' ? 'rgba(234,179,8,0.2)' : toast.type === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(201,160,80,0.15)';
        const border = toast.type === 'success' ? 'rgba(34,197,94,0.4)' : toast.type === 'warning' ? 'rgba(234,179,8,0.5)' : toast.type === 'danger' ? 'rgba(239,68,68,0.5)' : 'rgba(201,160,80,0.5)';
        const color = toast.type === 'danger' ? '#ef4444' : toast.type === 'success' ? '#22c55e' : toast.type === 'warning' ? '#ca8a04' : '#C9A050';

        return (
          <div key={toast.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:'10px',
            background: bg, border: `1px solid ${border}`, color, boxShadow:'0 8px 14px rgba(0,0,0,0.25)',
            fontSize:'13px', fontWeight:600
          }}>
            <span>{toast.message}</span>
            <button onClick={() => onDismiss(toast.id)} style={{ border:'none', background:'transparent', color, cursor:'pointer', fontSize:'14px', padding:'0' }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
