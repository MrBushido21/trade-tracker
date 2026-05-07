import { useState, useEffect } from 'react'
import type { Item } from '../api'
import { api } from '../api'

interface Props {
    item: Item
    onSave: () => void
}

const toDisplay = (kopecks: number | null) =>
    kopecks != null ? (kopecks / 100).toFixed(2) : ''

const toKopecks = (val: string) =>
    val !== '' ? Math.round(Number(val) * 100) : undefined

export default function ItemRow({ item, onSave }: Props) {
    const [draft, setDraft] = useState({
        item_name: item.item_name ?? '',
        item_buy_price: toDisplay(item.item_buy_price),
        item_sell_price: toDisplay(item.item_sell_price),
        item_count: item.item_count ?? '',
        item_sel_count: item.item_sel_count ?? '',
        in_stock: item.in_stock ?? '',
    })
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        setDraft({
            item_name: item.item_name ?? '',
            item_buy_price: toDisplay(item.item_buy_price),
            item_sell_price: toDisplay(item.item_sell_price),
            item_count: item.item_count ?? '',
            item_sel_count: item.item_sel_count ?? '',
            in_stock: item.in_stock ?? '',
        })
        setDirty(false)
    }, [item])

    const set = (key: keyof typeof draft, value: string) => {
        setDraft(prev => ({ ...prev, [key]: value }))
        setDirty(true)
    }

    const handleSave = async () => {
        await api.updateItem({
            id: item.id,
            table_id: item.table_id,
            item_name: draft.item_name || undefined,
            item_buy_price: toKopecks(draft.item_buy_price),
            item_sell_price: toKopecks(draft.item_sell_price),
            item_count: draft.item_count !== '' ? Number(draft.item_count) : undefined,
            item_sel_count: draft.item_sel_count !== '' ? Number(draft.item_sel_count) : undefined,
            in_stock: draft.in_stock !== '' ? draft.in_stock : undefined,
        })
        setDirty(false)
        onSave()
    }

    const bought = item.item_count ?? 0
    const sold = item.item_sel_count ?? 0
    const inStock = Number(item.in_stock) || 0

    const rowClass =
        String(item.in_stock) === 'Едет'      ? 'row-transit' :
        bought === sold && inStock === 0       ? 'row-green' :
        inStock > 0 && sold === 0             ? 'row-red' :
        inStock > 0 && sold > 0              ? 'row-yellow' :
        ''

    return (
        <tr className={rowClass}>
            <td><input className="cell-input" placeholder="Название" value={draft.item_name} onChange={e => set('item_name', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.item_buy_price} onChange={e => set('item_buy_price', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="0.00" type="number" onWheel={e => e.currentTarget.blur()} value={draft.item_sell_price} onChange={e => set('item_sell_price', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="—" type="number" onWheel={e => e.currentTarget.blur()} value={draft.item_count} onChange={e => set('item_count', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="—" type="number" onWheel={e => e.currentTarget.blur()} value={draft.item_sel_count} onChange={e => set('item_sel_count', e.target.value)} /></td>
            <td><input className="cell-input" placeholder="—" onWheel={e => e.currentTarget.blur()} value={draft.in_stock} onChange={e => set('in_stock', e.target.value)} /></td>
            <td>
                {dirty && (
                    <button className="btn btn-save btn-sm" onClick={handleSave}>Сохранить</button>
                )}
                <button className="btn btn-delete btn-sm" onClick={async () => { await api.deleteItem(item.id); onSave() }}>✕</button>
            </td>
        </tr>
    )
}
