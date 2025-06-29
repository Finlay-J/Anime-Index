import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../css/LoginPrompt.css';

const LoginPrompt = ({ message = "Please login to use this feature" }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return null;

    return (
        <div className="login-prompt">
            <div className="login-prompt-content">
                <span className="login-icon">🔒</span>
                <p>{message}</p>
                <div className="login-prompt-actions">
                    <Link to="/login" className="login-btn">Login</Link>
                    <Link to="/register" className="register-btn">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPrompt;
