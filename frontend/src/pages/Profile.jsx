import { useAuth } from '../contexts/AuthContext';
import { useAnimeContext } from '../contexts/AnimeContext';
import '../css/Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const { favorites } = useAnimeContext();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            </div>
            
            <div className="profile-info">
                <div className="info-card">
                    <h3>Account Information</h3>
                    <div className="info-item">
                        <label>Name:</label>
                        <span>{user.name}</span>
                    </div>
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                        <label>Member Since:</label>
                        <span>
                            {new Date(user.registeredTime || user.loginTime).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                
                <div className="stats-card">
                    <h3>My Stats</h3>
                    <div className="stat-item">
                        <span className="stat-number">{favorites.length}</span>
                        <span className="stat-label">Favorite Anime</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
