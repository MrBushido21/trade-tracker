import { useState, useEffect } from 'react'
import type { Expense } from '../api'
import { api } from '../api'

interface Props {
    expense: Expense
    onSave: () => void
}

const toDisplay = (kopecks: number | null) =>
    kopecks != null ? (kopecks / 100).toFixed(2) : ''

const toKopecks = (val: string) =>
    val !== '' ? Math.round(Number(val) * 100) : undefined

export default function ExpenseRow({ expense, onSave }: Props) {
    const [draft, setDraft] = useState({
        vps: toDisplay(expense.vps),
        domen: toDisplay(expense.domen),
        advertisement: toDisplay(expense.advertisement),
        delivery: toDisplay(expense.delivery),
    })
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        setDraft({
            vps: toDisplay(expense.vps),
            domen: toDisplay(expense.domen),
            advertisement: toDisplay(expense.advertisement),
            delivery: toDisplay(expense.delivery),
        })
        setDirty(false)
    }, [expense])

    const set = (key: keyof typeof draft, value: string) => {
        setDraft(prev => ({ ...prev, [key]: value }))
        setDirty(true)
    }

    const handleSave = async () => {
        await api.updateExpense({
            id: expense.id,
            table_id: expense.table_id,
            vps: toKopecks(draft.vps),
            domen: toKopecks(draft.domen),
            advertisement: toKopecks(draft.advertisement),
            delivery: toKopecks(draft.delivery),
        })
        setDirty(false)
        onSave()
    }

    return (
        <tr>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.vps} onChange={e => set('vps', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.domen} onChange={e => set('domen', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.advertisement} onChange={e => set('advertisement', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.delivery} onChange={e => set('delivery', e.target.value)} /></td>
            <td>
                {dirty && (
                    <button className="btn btn-save btn-sm" onClick={handleSave}>Сохранить</button>
                )}
                <button className="btn btn-delete btn-sm" onClick={async () => { await api.deleteExpense(expense.id); onSave() }}>✕</button>
            </td>
        </tr>
    )
}
