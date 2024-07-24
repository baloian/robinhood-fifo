import { round, timeDiff } from '@baloian/lib';
import fs from 'fs';
import csv from 'csv-parser';
import { HoodTradeTy } from './types';


// The format is as follow:
// [
//   activity_date: string;
//   process_date: string;
//   settle_date: string;
//   instrument: string;
//   description: string;
//   trans_code: string;
//   quantity: number;
//   price: number;
//   amount: number;
// ]
export function getTradeRecord(buyTrade: HoodTradeTy, sellTrade: HoodTradeTy): string[] {
  return [
    'abc'
    /*
    buyTrade.symbol,
    `${buyTrade.qty}`,
    `${buyTrade.trade_date}T${buyTrade.trade_time}`,
    `${sellTrade.trade_date}T${sellTrade.trade_time}`,
    timeDiff(buyTrade.trade_time_ms, sellTrade.trade_time_ms),
    `${buyTrade.gross_amount}`,
    `${Math.abs(sellTrade.gross_amount)}`,
    `${round((Math.abs(sellTrade.gross_amount) - Math.abs(buyTrade.gross_amount)))}`
    */
  ];
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


export function filterRowsByTransCode(rows: HoodTradeTy []): HoodTradeTy [] {
  const filteredRows = rows.filter(row => row.trans_code === 'Sell' || row.trans_code === 'Buy');
  // Sort filtered rows by process_date
  const sortedRows: HoodTradeTy[] = filteredRows.sort((a, b) => {
    const dateA = new Date(a.process_date);
    const dateB = new Date(b.process_date);
    return dateA.getTime() - dateB.getTime();
  });
  return sortedRows;
}
