import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="state-text">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
