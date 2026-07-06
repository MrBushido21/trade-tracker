import type { Table, ItemSort } from '../api'
import { api } from '../api'
import ItemRow from './ItemRow'
import ExpenseRow from './ExpenseRow'

interface Props {
    table: Table
    onRefresh: () => void
    sort?: ItemSort
    onSort: (sort: ItemSort | undefined) => void
}

export default function TableView({ table, onRefresh, sort, onSort }: Props) {
    const result = table.result

    const toHrn = (kopecks: number | null) => kopecks != null ? (kopecks / 100).toFixed(2) : '—'

    const handleAddItem = async () => {
        await api.addItem(table.id)
        onRefresh()
    }

    const handleAddExpense = async () => {
        await api.addExpense(table.id)
        onRefresh()
    }

    return (
        <>
            <div className="table-header">
                <h1>{table.name}</h1>
            </div>

            <div className="section">
                <div className="section-header">
                    <h2>Товары</h2>
                    <div className="sort-bar">
                        {([
                            { value: 'in_stock', label: 'В наличии' },
                            { value: 'sold',     label: 'Продажи' },
                            { value: 'idle',     label: 'Простой' },
                            { value: 'transit',  label: 'Едет' },
                        ] as { value: ItemSort; label: string }[]).map(({ value, label }) => (
                            <button
                                key={value}
                                className={`btn btn-sort btn-sm${sort === value ? ' active' : ''}`}
                                onClick={() => onSort(sort === value ? undefined : value)}
                            >{label}</button>
                        ))}
                    </div>
                </div>
                <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th style={{ width: 92 }}>Цена покупки</th>
                            <th style={{ width: 92 }}>Доставка</th>
                            <th style={{ width: 92 }}>Цена продажи</th>
                            <th style={{ width: 76 }}>Куплено</th>
                            <th style={{ width: 76 }}>Продано</th>
                            <th style={{ width: 76 }}>В наличии</th>
                            <th style={{ width: 92 }}>Доход</th>
                            <th style={{ width: 100 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.items.map(item => (
                            <ItemRow key={item.id} item={item} onSave={onRefresh} />
                        ))}
                    </tbody>
                </table>
                </div>
                <div className="totals-bar">
                    <span>Количество товара: <strong>{result?.total_count ?? 0} ед.</strong></span>
                    <span>Продано: <strong>{result?.total_sell ?? 0}</strong></span>
                    <span>В наличии: <strong>{result?.total_in_stock ?? 0}</strong></span>
                    <button className="btn btn-primary btn-sm" onClick={handleAddItem}>+ Добавить</button>
                </div>
            </div>

            <div className="section">
                <div className="section-header">
                    <h2>Расходы</h2>
                </div>
                <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>VPS</th>
                            <th>Домен</th>
                            <th>Реклама</th>
                            <th>Доставка</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.expenses.map(exp => (
                            <ExpenseRow key={exp.id} expense={exp} onSave={onRefresh} />
                        ))}
                    </tbody>
                </table>
                </div>
                <div className="totals-bar">
                    <span>Итого расходов: <strong>{toHrn(result?.total_amount ?? null)} грн</strong></span>
                    <span>Доход: <strong>{toHrn(result?.income ?? null)} грн</strong></span>
                    <span>Прибыль: <strong>{toHrn(result?.profit ?? null)} грн</strong></span>
                    <button className="btn btn-primary btn-sm" onClick={handleAddExpense}>+ Добавить</button>
                </div>
            </div>
        </>
    )
}
