import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-desc">
        Looks like you've wandered off-stage. The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="not-found-actions">
        <button className="not-found-btn primary" onClick={() => navigate('/')}>
          ← Go Home
        </button>
        <button className="not-found-btn secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
