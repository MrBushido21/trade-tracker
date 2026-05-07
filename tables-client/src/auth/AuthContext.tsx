import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import axios from 'axios'
import { setAccessToken, setOnUnauthorized } from '../api'

const BASE = 'http://localhost:5001'

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const handleUnauthorized = useCallback(() => {
        localStorage.removeItem('refreshToken')
        setAccessToken(null)
        setIsAuthenticated(false)
    }, [])

    useEffect(() => {
        setOnUnauthorized(handleUnauthorized)
    }, [handleUnauthorized])

    useEffect(() => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            setIsLoading(false)
            return
        }
        axios
            .post(`${BASE}/auth/refresh`, { refreshToken })
            .then(({ data }) => {
                setAccessToken(data.accessToken)
                setIsAuthenticated(true)
            })
            .catch(() => {
                localStorage.removeItem('refreshToken')
            })
            .finally(() => setIsLoading(false))
    }, [])

    const login = useCallback(async (username: string, password: string) => {
        const { data } = await axios.post(`${BASE}/auth/login`, { username, password })
        setAccessToken(data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        setIsAuthenticated(true)
    }, [])

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try {
                await axios.post(`${BASE}/auth/logout`, { refreshToken })
            } catch {}
        }
        handleUnauthorized()
    }, [handleUnauthorized])

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
