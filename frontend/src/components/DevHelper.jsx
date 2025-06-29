import { useAuth } from '../contexts/AuthContext';
import '../css/DevHelper.css';

const DevHelper = () => {
    const { getRegisteredUsersForTesting } = useAuth();
    const registeredUsers = getRegisteredUsersForTesting();

    if (registeredUsers.length === 0) {
        return (
            <div className="dev-helper">
                <h4>🧪 Dev Helper - No Registered Users</h4>
                <p>Register a new account to test the login system!</p>
            </div>
        );
    }

    return (
        <div className="dev-helper">
            <h4>🧪 Dev Helper - Registered Users</h4>
            <p>Use these credentials to test login:</p>
            <div className="users-list">
                {registeredUsers.map((user, index) => (
                    <div key={index} className="user-item">
                        <strong>Email:</strong> {user.email}<br/>
                        <strong>Name:</strong> {user.name}<br/>
                        <small>Registered: {new Date(user.registeredTime).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
            <p className="warning">⚠️ This helper is for development only and should be removed in production!</p>
        </div>
    );
};

export default DevHelper;
