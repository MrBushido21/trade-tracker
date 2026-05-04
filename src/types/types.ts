export interface TableItemsI {
    type: 'item'
    id:number,
    table_id:number
    item_name?:string
    item_buy_price?:number
    item_sell_price?:number
    item_count?:number
    item_sel_count?:number
    in_stock?:number
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