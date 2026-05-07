import { useState } from 'react'
import type { Table } from '../api'

interface Props {
    tables: Table[]
    selectedId: number | null
    onSelect: (id: number) => void
    onCreate: (name: string) => void
}

export default function TablesList({ tables, selectedId, onSelect, onCreate }: Props) {
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        onCreate(name.trim())
        setName('')
    }

    return (
        <>
            <h2>Таблицы</h2>
            {(tables ?? []).map(t => (
                <button
                    key={t.id}
                    className={`table-item ${selectedId === t.id ? 'active' : ''}`}
                    onClick={() => onSelect(t.id)}
                >
                    {t.name}
                </button>
            ))}
            <form className="create-form" onSubmit={handleSubmit}>
                <input
                    placeholder="Новая таблица..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">+</button>
            </form>
        </>
    )
}
