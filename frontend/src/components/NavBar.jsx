import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import '../css/Navbar.css';

function NavBar(){
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return <nav className="navbar">
        <div className ="navbar-brand">
            <Link to="/">The Anime Index</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated && <Link to="/favorites" className="nav-link">Favorites</Link>}
            {isAuthenticated && <Link to="/profile" className="nav-link">Profile</Link>}
            
            {isAuthenticated ? (
                <div className="user-menu">
                    <span className="user-greeting">Hello, {user?.name}!</span>
                    <button onClick={handleLogout} className="nav-link logout-btn">
                        Logout
                    </button>
                </div>
            ) : (
                <div className="auth-links">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link">Register</Link>
                </div>
            )}
        </div>
    </nav>

}

export default NavBar;