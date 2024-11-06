import { round } from '@baloian/lib-ts';
import {
  HoodTradeTy,
  ClosingTradeTy,
  GainLossTy,
  SymbolProfitTy
} from '../types';
import { HoodMonthData } from './hood-month-data';


/**
 * Converts a string value from CSV file format ($NUMBER) to the numberic value.
 * CSV files contain currency values with dollar signs and parentheses.
 * e.g. ($123.45) to $123.45.
 */
export function convertToNumber(value: string): number {
  const cleanedValue = value.replace(/[\$,()]/g, '');
  return parseFloat(cleanedValue);
}


/**
 * When processing multiple CSV files, this function ensures that data is ordered based on process date.
 * This is crucial for maintaining the correct activity order across all input files.
 */
export function sortListsByLastProcessDate(lists: HoodTradeTy[][]): HoodTradeTy[] {
  const sortedLists: HoodTradeTy[][] = lists
    .filter(subList => subList.length > 0)
    .sort((a, b) => {
      const dateA = new Date(a[a.length - 1].process_date).getTime();
      const dateB = new Date(b[b.length - 1].process_date).getTime();
      return dateA - dateB;
    });
  return sortedLists.flatMap(subList => subList);
}


export function dateToMonthYear(dateString: string): string {
  // Regular expression to match MM/DD/YYYY format
  dateString = dateString.trim();
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected format is MM/DD/YYYY.`);
  }
  const parts: string[] = dateString.split('/');
  return `${parts[0]}/${parts[2]}`;
}


export function getTradesByMonth(rows: HoodTradeTy [], month: string): HoodTradeTy [] {
  return rows.filter(row =>
    row.process_date &&
    Number(row.process_date.split('/')[0]) <= Number(month));
}


export function calculateTotalGainLoss(data: ClosingTradeTy[], monthYear: string): GainLossTy {
  const trades = data.filter(d => dateToMonthYear(d.sell_process_date) === monthYear);
  const profitSummary: GainLossTy = {
    long_term_profit: 0,
    short_term_profit: 0
  };
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const DAYS_PER_YEAR = 365;
  const ONE_YEAR_MS = DAYS_PER_YEAR * MS_PER_DAY;
  trades.forEach((trade: ClosingTradeTy) => {
    if (trade.getHoldingTimeMs() > ONE_YEAR_MS) {
      profitSummary.long_term_profit += trade.profit;
    } else {
      profitSummary.short_term_profit += trade.profit;
    }
  });
  return {
    long_term_profit: round(profitSummary.long_term_profit),
    short_term_profit: round(profitSummary.short_term_profit)
  };
}


export function calculateSymbolProfits(data: ClosingTradeTy[], monthYear: string): SymbolProfitTy[] {
  const trades = data.filter(d => dateToMonthYear(d.sell_process_date) === monthYear);
  const result: {[key: string]: {total_profit: number; total_profit_pct: number}} = {};
  trades.forEach((trade: ClosingTradeTy) => {
    const investment = trade.getInvestment();
    if (!result[trade.getSymbol()]) result[trade.getSymbol()] = {total_profit: 0, total_profit_pct: 0};
    const symbolData = result[trade.getSymbol()];
    symbolData.total_profit += trade.getProfit();
    const totalInvestment = (symbolData.total_profit_pct * symbolData.total_profit) + investment;
    symbolData.total_profit_pct = (
      (symbolData.total_profit_pct * (totalInvestment - investment)) +
      (trade.getProfitPct() * investment)
    ) / totalInvestment;
  });
  return Object.keys(result).map(symbol => ({
    symbol: symbol,
    total_profit: round(result[symbol].total_profit),
    total_profit_pct: round(result[symbol].total_profit_pct)
  }));
}


export function getOrderedHoodMonthsData(rows: HoodTradeTy []): HoodMonthData[] {
  const data: HoodMonthData[] = [];
  const monthYearData: {[key: string]: boolean} = {};
  for (const row of rows) {
    const monthYear: string = dateToMonthYear(row.process_date);
    if (!monthYearData[monthYear]) {
      monthYearData[monthYear] = true;
      data.push(new HoodMonthData(monthYear, getTradesByMonth(rows, monthYear.split('/')[0])));
    }
  }
  return data.sort((a, b) => {
    const [monthA, yearA] = a.getMonthYear().split('/').map(Number);
    const [monthB, yearB] = b.getMonthYear().split('/').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });
}


export function getTotalQty(items: HoodTradeTy[]): number {
  let total: number = 0;
  items.forEach((e: HoodTradeTy) => {
    if (e.quantity) total += e.quantity;
  });
  return total;
}
