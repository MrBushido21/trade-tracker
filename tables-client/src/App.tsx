import { useState, useEffect } from 'react'
import type { Table, ItemSort } from './api'
import { api } from './api'
import { useAuth } from './auth/AuthContext'
import TablesList from './components/TablesList'
import TableView from './components/TableView'
import LoginPage from './components/LoginPage'
import './App.css'

export default function App() {
    const { isAuthenticated, isLoading, logout } = useAuth()
    const [tables, setTables] = useState<Table[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState<ItemSort | undefined>(undefined)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            setTables([])
            setSelectedId(null)
            setSelectedTable(null)
            return
        }
        api.getTables().then(setTables)
    }, [isAuthenticated])

    if (isLoading) {
        return <div className="layout"><p className="placeholder">Загрузка...</p></div>
    }

    if (!isAuthenticated) {
        return <LoginPage />
    }

    const handleSelect = async (id: number) => {
        setLoading(true)
        setSelectedId(id)
        setSidebarOpen(false)
        const table = await api.getTable(id, sort)
        setSelectedTable(table)
        setLoading(false)
    }

    const handleCreate = async (name: string) => {
        const table = await api.createTable(name)
        setTables(prev => [...prev, table])
        handleSelect(table.id)
    }

    const handleRefresh = async (newSort?: ItemSort) => {
        if (!selectedId) return
        const s = newSort !== undefined ? newSort : sort
        const table = await api.getTable(selectedId, s)
        setSelectedTable(table)
    }

    const handleSort = (newSort: ItemSort | undefined) => {
        setSort(newSort)
        handleRefresh(newSort)
    }

    return (
        <div className="layout">
            <button className="btn-menu" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <button className="btn-logout" onClick={logout} title="Выйти">⏻</button>

            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <TablesList
                    tables={tables}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    onCreate={handleCreate}
                />
            </aside>

            <main className="content">
                {loading && <p className="placeholder">Загрузка...</p>}
                {!loading && selectedTable && (
                    <TableView table={selectedTable} onRefresh={handleRefresh} sort={sort} onSort={handleSort} />
                )}
                {!loading && !selectedTable && (
                    <p className="placeholder">Выбери таблицу</p>
                )}
            </main>
        </div>
    )
}
