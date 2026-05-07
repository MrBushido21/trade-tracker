import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(username, password)
        } catch {
            setError('Неверный логин или пароль')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Вход</h2>
                <input
                    className="login-input"
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={loading}
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                />
                {error && <p className="login-error">{error}</p>}
                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    )
}
