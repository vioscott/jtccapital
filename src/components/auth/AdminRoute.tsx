import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-gold" style={{ width: 20, height: 20, borderRadius: '50%', background: '#C9A050' }} />
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
