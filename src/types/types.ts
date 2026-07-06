export type ItemSort = 'in_stock' | 'sold' | 'idle' | 'transit'

export interface TableItemsI {
    type: 'item'
    id:number,
    table_id:number
    item_name?:string
    item_buy_price?:number
    item_sell_price?:number
    item_count?:number
    item_sel_count?:number
    in_stock?:number | string
    item_delivery?:number
    item_income?:number
}
export interface TableExpeceI {
    type: 'expense'
    id:number
    table_id:number
    total_amount?:number
    vps?:number
    domen?:number
    advertisement?:number
    delivery?:number
    income?:number
    profit?:number
}

export interface TotalResultI {
    table_id:number
    total_count?:number
    total_sell?:number
    total_in_stock?:number
    income?:number
    profit?:number
    total_amount?:number
}

export interface ItemsI {
    income: number
    total_buy: number
    total_count: number
    total_in_stock: number
    total_item_sel_count: number
    total_item_delivery: number
}

export interface ExpenseI {
 totalVps: number 
 totalDomen: number 
 totalAdvertisement: number
 totalDelivery: number 
}