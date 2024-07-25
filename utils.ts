import { round, pctDiff} from '@baloian/lib';
import fs from 'fs';
import csv from 'csv-parser';
import { HoodTradeTy, ClosingTradeTy } from './types';


export function getTradeRecord(buyTrade: HoodTradeTy, sellTrade: HoodTradeTy): ClosingTradeTy {
  const buyValue: number = buyTrade.price * buyTrade.quantity;
  const sellValue: number = sellTrade.price * sellTrade.quantity;
  return {
    symbol: buyTrade.symbol,
    buy_qty: buyTrade.quantity,
    sell_qty: sellTrade.quantity,
    buy_process_date: buyTrade.process_date,
    sell_process_date: sellTrade.process_date,
    buy_price: buyTrade.price,
    sell_price: sellTrade.price,
    profit: round(sellValue - buyValue),
    profit_pct: pctDiff(sellValue, buyValue)
  };
}


export function deepCopy(data: any): any {
  if (data) return JSON.parse(JSON.stringify(data));
  return data;
}


function convertToNumber(value: string): number {
  // Remove currency symbols and parentheses
  let cleanedValue = value.replace(/[\$,()]/g, '');
  // Convert cleaned value to a number
  return parseFloat(cleanedValue);
}


export async function parseCSV(filePath: string): Promise<HoodTradeTy []> {
  return new Promise((resolve, reject) => {
    const results: HoodTradeTy [] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const row: HoodTradeTy  = {
          activity_date: data['Activity Date'],
          process_date: data['Process Date'],
          settle_date: data['Settle Date'],
          symbol: data['Instrument'],
          description: data['Description'],
          trans_code: data['Trans Code'],
          quantity: convertToNumber(data['Quantity'] || ''),
          price: convertToNumber(data['Price'] || ''),
          amount: convertToNumber(data['Amount'] || '')
        };
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}


function convertDateToMilliseconds(dateStr: string): number {
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  // Get the time in milliseconds since the Unix epoch
  const milliseconds = date.getTime();
  return milliseconds;
}


export function filterRowsByTransCode(rows: HoodTradeTy []): HoodTradeTy [] {
  const filteredRows = rows.filter(row => row.trans_code === 'Sell' || row.trans_code === 'Buy');
  // Sort filtered rows by process_date
  const sortedRows: HoodTradeTy[] = filteredRows.reverse().sort((a, b) => {
    const dateA = convertDateToMilliseconds(a.process_date);
    const dateB = convertDateToMilliseconds(b.process_date);
    return dateA - dateB;
  });
  return sortedRows;
}
