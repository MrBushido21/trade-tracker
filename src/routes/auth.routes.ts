import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sqlGet, sqlRun } from '../db/dbconstructor'

const router = Router()

const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function makeAccessToken(userId: number) {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_EXPIRES })
}

router.post('/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body
    if (!username || !password)
        return res.status(400).json({ error: 'username and password required' })

    const user = await sqlGet<{ id: number; password_hash: string } | undefined>(
        `SELECT id, password_hash FROM users WHERE username = ?`, [username]
    )
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const accessToken = makeAccessToken(user.id)
    const refreshToken = require('crypto').randomBytes(40).toString('hex')
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS).toISOString()

    await sqlRun(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, refreshToken, expiresAt]
    )

    return res.json({ accessToken, refreshToken })
})

router.post('/auth/refresh', async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })

    const row = await sqlGet<{ user_id: number; expires_at: string } | undefined>(
        `SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?`, [refreshToken]
    )
    if (!row) return res.status(401).json({ error: 'Invalid refresh token' })
    if (new Date(row.expires_at) < new Date())
        return res.status(401).json({ error: 'Refresh token expired' })

    const accessToken = makeAccessToken(row.user_id)
    return res.json({ accessToken })
})

router.post('/auth/logout', async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    if (refreshToken) {
        await sqlRun(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken])
    }
    return res.status(200).json({ message: 'ok' })
})

export default router
