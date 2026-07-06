import axios from 'axios'
import { API_URL } from './config'

const BASE = API_URL

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export const setAccessToken = (token: string | null) => {
    accessToken = token
}

export const setOnUnauthorized = (cb: () => void) => {
    onUnauthorized = cb
}

export const http = axios.create({ baseURL: BASE })

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)))
    failedQueue = []
}

http.interceptors.request.use(config => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
})

http.interceptors.response.use(
    res => res,
    async error => {
        const original = error.config
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error)
        }
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then(token => {
                original.headers.Authorization = `Bearer ${token}`
                return http(original)
            })
        }
        original._retry = true
        isRefreshing = true
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            isRefreshing = false
            onUnauthorized?.()
            return Promise.reject(error)
        }
        try {
            const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
            setAccessToken(data.accessToken)
            processQueue(null, data.accessToken)
            original.headers.Authorization = `Bearer ${data.accessToken}`
            return http(original)
        } catch (err) {
            processQueue(err, null)
            localStorage.removeItem('refreshToken')
            setAccessToken(null)
            onUnauthorized?.()
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export type ItemSort = 'in_stock' | 'sold' | 'idle' | 'transit'

export interface Result {
    id: number
    table_id: number
    total_count: number | null
    total_sell: number | null
    total_in_stock: number | null
    total_amount: number | null
    income: number | null
    profit: number | null
}

export interface Table {
    id: number
    name: string
    created_at: string
    updated_at: string
    items: Item[]
    expenses: Expense[]
    result: Result | null
}

export interface Item {
    id: number
    table_id: number
    item_name: string | null
    item_buy_price: number | null
    item_sell_price: number | null
    item_count: number | null
    item_sel_count: number | null
    in_stock: number | string | null
    item_delivery: number | null
    item_income: number | null
    created_at: string
    updated_at: string
}

export interface Expense {
    id: number
    table_id: number
    vps: number | null
    domen: number | null
    advertisement: number | null
    delivery: number | null
    created_at: string
    updated_at: string
}

export const api = {
    getTables: async (): Promise<Table[]> => {
        const { data } = await http.get('/')
        return data.tables
    },

    getTable: async (id: number, sort?: ItemSort): Promise<Table> => {
        const { data } = await http.get('/table', { params: { id, ...(sort ? { sort } : {}) } })
        return data.table
    },

    createTable: async (tableName: string): Promise<Table> => {
        const { data } = await http.post('/createmaintable', { tableName })
        return data.table
    },

    addItem: async (table_id: number): Promise<void> => {
        await http.post('/createitems', { table_id, tableType: 'table_items' })
    },

    addExpense: async (table_id: number): Promise<void> => {
        await http.post('/createitems', { table_id, tableType: 'table_expense' })
    },

    updateItem: async (data: Partial<Item> & { id: number }): Promise<void> => {
        await http.patch('/table/item', { ...data, type: 'item' })
    },

    updateExpense: async (data: { id: number; table_id: number; vps?: number; domen?: number; advertisement?: number; delivery?: number }): Promise<void> => {
        await http.patch('/table/item', { ...data, type: 'expense' })
    },

    deleteItem: async (id: number): Promise<void> => {
        await http.delete('/table/item', { data: { id, type: 'item' } })
    },

    deleteExpense: async (id: number): Promise<void> => {
        await http.delete('/table/item', { data: { id, type: 'expense' } })
    },
}
