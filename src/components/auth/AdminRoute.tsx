import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, isLoading, isDataLoading } = useAuth();
  console.log("AdminRoute - Role:", role, "Auth Loading:", isLoading, "Data Loading:", isDataLoading)

  if (isLoading || isDataLoading) {
    console.log("AdminRoute showing loading spinner")
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div className="pulse-gold" style={{ width: 20, height: 20, borderRadius: '50%', background: '#C9A050' }} />
        {isDataLoading && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Loading admin data...</span>}
      </div>
    );
  }

  if (role !== 'admin') {
    console.log("AdminRoute: User is not admin, redirecting to dashboard")
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
