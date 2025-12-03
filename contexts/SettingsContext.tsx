import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    units: 'metric' | 'imperial';
    toggleUnits: () => void;
    notificationsEnabled: boolean;
    toggleNotifications: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Theme State
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true; // Default to dark
    });

    // Units State
    const [units, setUnits] = useState<'metric' | 'imperial'>(() => {
        const saved = localStorage.getItem('units');
        return (saved as 'metric' | 'imperial') || 'metric';
    });

    // Notifications State
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        return Notification.permission === 'granted';
    });

    // Apply Theme
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Save Units
    useEffect(() => {
        localStorage.setItem('units', units);
    }, [units]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const toggleUnits = () => setUnits(prev => prev === 'metric' ? 'imperial' : 'metric');

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
            }
        } else {
            // We can't revoke permission programmatically, but we can update our app state
            setNotificationsEnabled(false);
            alert("To fully disable notifications, please change your browser settings.");
        }
    };

    return (
        <SettingsContext.Provider value={{
            darkMode,
            toggleDarkMode,
            units,
            toggleUnits,
            notificationsEnabled,
            toggleNotifications
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
