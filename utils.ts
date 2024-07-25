import { round, pctDiff} from '@baloian/lib';
import fs from 'fs';
import csv from 'csv-parser';
import { HoodTradeTy, ClosingTradeTy, TotalProfitResultTy } from './types';


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


function formatToUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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


export function printTable(trades: ClosingTradeTy[]): void {
  // Define the table headers
  const headers = ['Symbol', 'Qty', 'Sell Price', 'Sold At', 'Profit $', 'Profit %'];
  const headerRow = headers.map(header => header.padEnd(11)).join(' | ');
  const separator = headers.map(() => '-----------').join('-|-');

  console.log(headerRow);
  console.log(separator);

  trades.forEach(trade => {
    const rowString = [
      trade.symbol.padEnd(11),
      trade.sell_qty.toString().padEnd(11),
      formatToUSD(trade.sell_price).padEnd(11),
      trade.sell_process_date.padEnd(11),
      formatToUSD(trade.profit).padEnd(11),
      `${trade.profit_pct.toString()}%`.padEnd(11)
    ].join(' | ');
    console.log(rowString);
  });
}


export function printSummary(trades: HoodTradeTy[]): void {
  // Define the table headers
  const headers = ['Symbol', 'Qty', 'Amount', 'Processed At'];
  const headerRow = headers.map(header => header.padEnd(12)).join(' | ');
  const separator = headers.map(() => '------------').join('-|-');

  console.log(headerRow);
  console.log(separator);

  trades.forEach(trade => {
    const rowString = [
      trade.symbol.padEnd(12),
      trade.quantity.toString().padEnd(12),
      formatToUSD(trade.amount).padEnd(12),
      trade.process_date.padEnd(12)
    ].join(' | ');
    console.log(rowString);
  });
}


export function calculateTotalProfit(trades: ClosingTradeTy[]): TotalProfitResultTy {
  let totalProfit = 0;
  let totalProfitPct = 0;

  trades.forEach(trade => {
    totalProfit += trade.profit;
    totalProfitPct += trade.profit_pct;
  });

  return {
    total_profit: round(totalProfit),
    total_profit_pct: round(totalProfitPct)
  };
}


export function printWithDots(value1: string, value2: string, symbol: string = '-'): void {
  const totalLength = 78;
  const totalValuesLength = value1.length + value2.length;
  const totalDots = totalLength - totalValuesLength;
  /*
  if (totalDots < 0) {
    console.error('The combined length of the values exceeds the total line length.');
    return;
  }
  */
  const line: string = `${value1} ${symbol.repeat(totalDots)}` + (value2.length > 0 ? ` ${value2}` : symbol);
  console.log(line);
}


export function printTotalProfit(profit: TotalProfitResultTy): void {
  printWithDots('Total Profit ($)', formatToUSD(profit.total_profit));
  printWithDots('Total Profit (%)', `${profit.total_profit_pct}%`);
}
