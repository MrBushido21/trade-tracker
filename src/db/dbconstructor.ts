import sqlite3 from "sqlite3"
const { Database } = sqlite3

export const db = new Database('db.db', (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    db.run("PRAGMA foreign_keys = ON")
    console.log('Database ok');
  }
})

export const sqlRun = (sqlText: string, sqlParams?: unknown[]): Promise<{lastID: number, changes: number}> => {        
    return new Promise((resolve, reject) => {
      db.run(sqlText, sqlParams, function (this: any, err: Error | null) {
        if (err) {
          reject(err)
        } else {
          resolve({ lastID: this.lastID, changes: this.changes })  // ← возвращаем оба!
        }
      })
    })
  } 
export const sqlGet = (sqlText: string, sqlParams?: unknown[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sqlText, sqlParams, (err: unknown, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
} 
export const sqlAll = (sqlText: string, sqlParams?: unknown[]): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sqlText, sqlParams, (err: unknown, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
} 
export const sqlEach = (sqlText: string, sqlParams?: unknown[]): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      db.each(sqlText, sqlParams, (err: unknown, data: any) => {
        if (err) {
          reject(err)
        } else {
          rows.push(data)  // собираем каждую строку
        }
      }, (err: unknown) => {  // completion callback — вызывается когда все строки обработаны
        if (err) {
          reject(err)
        } else {
          resolve(rows)  // отдаём все строки разом
        }
      })
    })
  } 