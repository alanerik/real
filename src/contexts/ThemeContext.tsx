import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                const initialTheme = settings.darkMode ? 'dark' : 'light';
                setThemeState(initialTheme);
                applyTheme(initialTheme);
            } catch (error) {
                console.error('Error loading theme settings:', error);
            }
        }
        setMounted(true);
    }, []);

    // Apply theme to document
    const applyTheme = (newTheme: Theme) => {
        if (typeof document !== 'undefined') {
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    // Set theme and persist to localStorage
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);

        // Save to localStorage
        const savedSettings = localStorage.getItem('userSettings');
        let settings = {};
        if (savedSettings) {
            try {
                settings = JSON.parse(savedSettings);
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }

        const updatedSettings = {
            ...settings,
            darkMode: newTheme === 'dark',
        };

        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));

        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new Event('storage'));
    };

    // Toggle between light and dark
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Listen for storage changes (cross-tab sync)
    useEffect(() => {
        const handleStorageChange = () => {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    const newTheme = settings.darkMode ? 'dark' : 'light';
                    if (newTheme !== theme) {
                        setThemeState(newTheme);
                        applyTheme(newTheme);
                    }
                } catch (error) {
                    console.error('Error syncing theme:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [theme]);

    // Prevent flash of unstyled content
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook to access theme context
 * @returns Theme context with current theme and controls
 */
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
