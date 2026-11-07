import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    async function refresh() {
        try {
            const data = await api.get('/auth/me');
            setUser(data.user);
        }
        catch {
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void refresh(); }, []);
    function login(data) {
        setUser(data.user);
    }
    async function logout() {
        await api.post('/auth/logout');
        setUser(null);
    }
    return (_jsx(AuthContext.Provider, { value: { user, isLoading, login, logout, refresh }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
//# sourceMappingURL=AuthContext.js.map