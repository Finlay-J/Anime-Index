import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in when the app loads
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Helper function to get all registered users
    const getRegisteredUsers = () => {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
    };

    // Helper function to save users to localStorage
    const saveUsers = (users) => {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    };

    // Helper function to check if email already exists
    const emailExists = (email) => {
        const users = getRegisteredUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    };

    // Helper function to find user by email and password
    const findUser = (email, password) => {
        const users = getRegisteredUsers();
        return users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        );
    };

    const login = async (email, password) => {
        try {
            if (!email || !password) {
                return { success: false, error: 'Email and password are required' };
            }

            // Check if user exists with matching credentials
            const foundUser = findUser(email, password);
            
            if (foundUser) {
                const userData = {
                    id: foundUser.id,
                    email: foundUser.email,
                    name: foundUser.name,
                    registeredTime: foundUser.registeredTime,
                    loginTime: new Date().toISOString()
                };
                
                // Migrate any old global favorites to this user
                migrateGlobalFavorites(foundUser.id);
                
                setUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const register = async (email, password, confirmPassword) => {
        try {
            if (!email || !password || !confirmPassword) {
                return { success: false, error: 'All fields are required' };
            }

            if (password !== confirmPassword) {
                return { success: false, error: 'Passwords do not match' };
            }
            
            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            // Check if email is valid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { success: false, error: 'Please enter a valid email address' };
            }

            // Check if user already exists
            if (emailExists(email)) {
                return { success: false, error: 'An account with this email already exists' };
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                email: email.toLowerCase(),
                password: password, // In production, this should be hashed!
                name: email.split('@')[0],
                registeredTime: new Date().toISOString()
            };

            // Save user to registered users
            const users = getRegisteredUsers();
            users.push(newUser);
            saveUsers(users);

            // Log the user in automatically
            const userData = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                registeredTime: newUser.registeredTime
            };
            
            // Migrate any old global favorites to this new user
            migrateGlobalFavorites(newUser.id);
            
            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    // Helper function to migrate old global favorites to user-specific storage
    const migrateGlobalFavorites = (userId) => {
        const globalFavorites = localStorage.getItem('favorites');
        const userFavoritesKey = `favorites_user_${userId}`;
        const userFavorites = localStorage.getItem(userFavoritesKey);
        
        // If user doesn't have favorites but global favorites exist, migrate them
        if (globalFavorites && !userFavorites) {
            localStorage.setItem(userFavoritesKey, globalFavorites);
            // Remove global favorites after migration
            localStorage.removeItem('favorites');
        }
    };

    // Helper function for development - get all registered users (remove in production)
    const getRegisteredUsersForTesting = () => {
        return getRegisteredUsers().map(user => ({
            email: user.email,
            name: user.name,
            registeredTime: user.registeredTime
        }));
    };

    const value = {
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
        getRegisteredUsersForTesting // For development only
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
