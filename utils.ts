import { round, pctDiff } from '@baloian/lib';
import fs from 'fs';
import csv from 'csv-parser';
import {
  HoodTradeTy,
  ClosingTradeTy,
  GainLossTy,
  SymbolProfitTy,
  MetaDataTy
} from './types';


function dateToMonthYear(dateString: string): string {
  const parts: string[] = dateString.split('/');
  return `${parts[0]}/${parts[2]}`;
}


function sortListsByLastProcessDate(lists: HoodTradeTy[][]): HoodTradeTy[] {
  const sortedLists: HoodTradeTy[][] = lists
    .filter(subList => subList.length > 0)
    .sort((a, b) => {
      const dateA = new Date(a[a.length - 1].process_date).getTime();
      const dateB = new Date(b[b.length - 1].process_date).getTime();
      return dateA - dateB;
    });
  return sortedLists.flatMap(subList => subList);
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
        if (row.process_date) results.push(row);
      })
      .on('end', () => {
        resolve(results.reverse());
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}


export function getTradesByMonth(rows: HoodTradeTy [], month: string): HoodTradeTy [] {
  const filteredRows = rows.filter(row =>
    row.process_date &&
    Number(row.process_date.split('/')[0]) <= Number(month));
  return filteredRows.reverse();
}


export function getMetadatForMonth(rows: HoodTradeTy [], monthYear: string): MetaDataTy {
  const data: MetaDataTy = {
    fees: 0,
    dividend: 0,
    deposit: 0,
    withdrawal: 0,
    interest: 0,
    benefit: 0,
    acats: 0
  };
  rows.forEach((row: HoodTradeTy) => {
    if (monthYear === dateToMonthYear(row.process_date)) {
      if (row.trans_code === 'GOLD' || row.trans_code === 'MINT') data.fees += row.amount;
      if (row.trans_code === 'CDIV') data.dividend += row.amount;
      if (row.trans_code === 'ACATI') data.acats += row.amount;
      if (row.trans_code === 'GDBP' || row.trans_code === 'T/A') data.benefit += row.amount;
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


export function calculateTotalGainLoss(data: ClosingTradeTy[], monthYear: string): GainLossTy {
  const trades = data.filter(d => dateToMonthYear(d.sell_process_date) === monthYear);
  const profitSummary: GainLossTy = {
    long_term_profit: 0,
    short_term_profit: 0
  };
  trades.forEach((trade) => {
    const buyDate = new Date(trade.buy_process_date);
    const sellDate = new Date(trade.sell_process_date);
    const timeDifference = sellDate.getTime() - buyDate.getTime();
    const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;
    if (timeDifference > oneYearInMilliseconds) {
      profitSummary.long_term_profit += trade.profit;
    } else {
      profitSummary.short_term_profit += trade.profit;
    }
  });
  return profitSummary;
}


// Note that this calculates percentage as weighted average of profit percentages based on
// the size of the investments.
export function calculateSymbolProfits(data: ClosingTradeTy[], monthYear: string): SymbolProfitTy[] {
  const trades = data.filter(d => dateToMonthYear(d.sell_process_date) === monthYear);
  const result: {[key: string]: {total_profit: number; total_profit_pct: number}} = {};
  trades.forEach(trade => {
    const investment = trade.buy_qty * trade.buy_price;
    if (!result[trade.symbol]) result[trade.symbol] = {total_profit: 0, total_profit_pct: 0};
    const symbolData = result[trade.symbol];
    symbolData.total_profit += trade.profit;
    const totalInvestment = (symbolData.total_profit_pct * symbolData.total_profit) + investment;
    symbolData.total_profit_pct = (
      (symbolData.total_profit_pct * (totalInvestment - investment)) +
      (trade.profit_pct * investment)
    ) / totalInvestment;
  });
  return Object.keys(result).map(symbol => ({
    symbol: symbol,
    total_profit: round(result[symbol].total_profit),
    total_profit_pct: round(result[symbol].total_profit_pct)
  }));
}


export async function getRawData(dirPath: string): Promise<HoodTradeTy []> {
  let listOfRows: HoodTradeTy[][] = [];
  const files = await fs.promises.readdir(dirPath);
  for (const filename of files) {
    listOfRows.push(await parseCSV(`${dirPath}/${filename}`));
  }
  return sortListsByLastProcessDate(listOfRows);
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
    const key: string = dateToMonthYear(row.process_date);
    if (!monthYearData[key]) {
      monthYearData[key] = getTradesByMonth(rows, key.split('/')[0]);
    }
  }
  return monthYearData;
}


export function sortMonthsAndYears(dates: string[]): string[] {
  return dates.sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });
}
