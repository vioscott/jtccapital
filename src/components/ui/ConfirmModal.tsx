import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning'
}: ConfirmModalProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'danger': return '#ef4444';
      case 'warning': return '#C9A050';
      case 'info': return '#3b82f6';
      default: return '#C9A050';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '400px', margin: '0 20px',
                background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px', padding: '32px', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden'
              }}
            >
              {/* Subtle accent glow */}
              <div style={{
                position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                width: '200px', height: '200px', background: getVariantColor(),
                opacity: 0.05, filter: 'blur(80px)', pointerEvents: 'none'
              }} />

              <button 
                onClick={onClose}
                style={{
                  position: 'absolute', top: '24px', right: '24px',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', padding: '4px'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '20px',
                  background: `rgba(${variant === 'danger' ? '239, 68, 68' : variant === 'warning' ? '201, 160, 80' : '59, 130, 246'}, 0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', border: `1px solid rgba(${variant === 'danger' ? '239, 68, 68' : variant === 'warning' ? '201, 160, 80' : '59, 130, 246'}, 0.2)`
                }}>
                  <AlertTriangle size={32} color={getVariantColor()} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '32px' }}>
                  {message}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '14px',
                      background: variant === 'danger' ? '#ef4444' : 'linear-gradient(135deg, #C9A050, #E5C97A)',
                      border: 'none', color: variant === 'danger' ? '#fff' : '#0A0A0A', 
                      fontWeight: 700, fontSize: '14px', cursor: confirming ? 'not-allowed' : 'pointer',
                      boxShadow: `0 10px 20px rgba(0,0,0,0.2)`,
                      opacity: confirming ? 0.75 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    {confirming ? <Loader2 size={16} className="spin" /> : confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
