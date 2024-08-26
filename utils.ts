import { round, pctDiff, formatToUSD } from '@baloian/lib';
import fs from 'fs';
import csv from 'csv-parser';
import {
  HoodTradeTy,
  ClosingTradeTy,
  TotalProfitResultTy,
  SymbolProfitTy,
  MetaDataTy
} from './types';


function dateToMonthYear(dateString: string): string {
  const parts = dateString.split('/');
  const month = parts[0];
  const year = parts[2];
  return `${month}/${year}`;
}


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


function convertToNumber(value: string): number {
  // Remove currency symbols and parentheses
  const cleanedValue = value.replace(/[\$,()]/g, '');
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


export function getTradesByMonth(rows: HoodTradeTy [], month: string): HoodTradeTy [] {
  const filteredRows = rows.filter(row =>
    row.process_date &&
    Number(row.process_date.split('/')[0]) <= Number(month));
  return filteredRows.reverse();
}


export function getTotalData(rows: HoodTradeTy []): MetaDataTy {
  const data: MetaDataTy = {
    fees: 0,
    dividend: 0,
    deposit: 0,
    withdrawal: 0,
    interest: 0
  };
  rows.forEach((row: HoodTradeTy) => {
    if (row.trans_code === 'GOLD' || row.trans_code === 'MINT') data.fees += row.amount;
    if (row.trans_code === 'CDIV') data.dividend += row.amount;
    if (row.trans_code === 'ACH') {
      if (row.description === 'ACH Deposit') data.deposit += row.amount;
      if (row.description === 'ACH Withdrawal') data.withdrawal += row.amount;
    }
  });
  return data;
}


export function getMetadatForMonth(rows: HoodTradeTy [], monthYear: string): MetaDataTy {
  const data: MetaDataTy = {
    fees: 0,
    dividend: 0,
    deposit: 0,
    withdrawal: 0,
    interest: 0
  };
  rows.forEach((row: HoodTradeTy) => {
    if (monthYear === dateToMonthYear(row.process_date)) {
      if (row.trans_code === 'GOLD' || row.trans_code === 'MINT') data.fees += row.amount;
      if (row.trans_code === 'CDIV') data.dividend += row.amount;
      if (row.trans_code === 'ACH') {
        if (row.description === 'ACH Deposit') data.deposit += row.amount;
        if (row.description === 'ACH Withdrawal') data.withdrawal += row.amount;
      }
    }
  });
  return data;
}


export function getTxsForMonth(rows: HoodTradeTy[], monthYear: string): HoodTradeTy[] {
  return rows.filter(row =>
      monthYear === dateToMonthYear(row.process_date) &&
      (row.trans_code === 'Sell' || row.trans_code === 'Buy')
  );
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
  let total_profit: number = 0;
  let total_profit_pct: number = 0;
  trades.forEach(trade => {
    const { profit, profit_pct } = trade;
    total_profit += profit;
    const currentProfitFactor = 1 + profit_pct / 100;
    const totalProfitFactor = 1 + total_profit_pct / 100;
    const newTotalProfitFactor = totalProfitFactor * currentProfitFactor;
    total_profit_pct = (newTotalProfitFactor - 1) * 100;
  });
  return {
    total_profit: round(total_profit),
    total_profit_pct: round(total_profit_pct)
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
  const line: string = `${value1} ${symbol.repeat(totalDots)}` +
    (value2.length > 0 ? ` ${value2}` : symbol);
  console.log(line);
}


export function printTotalGainLoss(profit: TotalProfitResultTy): void {
  printWithDots('Gain/Loss ($)', formatToUSD(profit.total_profit));
  printWithDots('Gain/Loss (%)', `${profit.total_profit_pct}%`);
}


export function printSymbolTotalProfit(data: SymbolProfitTy[]): void {
  data.forEach((item: SymbolProfitTy) => {
    printWithDots(item.symbol, `${formatToUSD(item.total_profit)} / ${item.total_profit_pct}%`);
  });
}


export function calculateSymbolProfits(trades: ClosingTradeTy[]): SymbolProfitTy[] {
  const symbolProfits: { [key: string]: { total_profit: number; total_profit_pct: number } } = {};
  trades.forEach(trade => {
    const { symbol, profit, profit_pct } = trade;
    if (!symbolProfits[symbol]) {
      symbolProfits[symbol] = { total_profit: 0, total_profit_pct: 0 };
    }
    symbolProfits[symbol].total_profit += profit;
    symbolProfits[symbol].total_profit_pct =
      (1 + symbolProfits[symbol].total_profit_pct / 100) * (1 + profit_pct / 100) - 1;
    symbolProfits[symbol].total_profit_pct *= 100;
  });
  return Object.keys(symbolProfits).map(symbol => ({
    symbol: symbol,
    total_profit: round(symbolProfits[symbol].total_profit),
    total_profit_pct: round(symbolProfits[symbol].total_profit_pct)
  }));
}


export function getTotalQty(items: HoodTradeTy[]): number {
  let total: number = 0;
  items.forEach((e: any) => total += e.qty);
  return total;
}


export async function getRawData(dirPath: string): Promise<HoodTradeTy []> {
  let rows: HoodTradeTy[] = [];
  const files = await fs.promises.readdir(dirPath);
  for (const filename of files) {
    rows = [...rows, ...await parseCSV(`${dirPath}/${filename}`)];
  }
  return rows;
}


export function numberToMonth(monthNumber: number): string | null {
  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];
  if (monthNumber < 1 || monthNumber > 12) return null;
  return monthNames[monthNumber - 1];
}


export function getMonthYearData(rows: HoodTradeTy []): {[key: string]: HoodTradeTy[]} {
  const monthYearData: {[key: string]: HoodTradeTy[]} = {};
  for (const row of rows) {
    if (row.process_date) {
      const key: string = dateToMonthYear(row.process_date);
      if (!monthYearData[key]) {
        monthYearData[key] = getTradesByMonth(rows, key.split('/')[0]);
      }
    }
  }
  return monthYearData;
}
