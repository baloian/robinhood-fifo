import moment from 'moment-timezone';
import { round, timeDiff } from '@baloian/lib';
import Validator from './validator';
import { AlpacaTradTy } from './types';
import { promises as fs } from 'fs';


export async function getListOfFilenames(dirPath: string): Promise<string[]> {
  const fileNames: string[] = await fs.readdir(dirPath);
  Validator.fileNames(fileNames);
  return fileNames.sort();
}


export async function readJsonFile(filePath: string): Promise<any> {
  const fileData = await fs.readFile(filePath, 'utf-8');
  const jsonData = JSON.parse(fileData);
  Validator.fileData(jsonData);
  return parseOrders(jsonData);
}


export function parseOrders(fileData: any): Promise<any> {
  fileData.trade_activities.forEach((e: any) => {
    const mt = moment(`${e.trade_date} ${e.trade_time}`, 'YYYY-MM-DD HH:mm:ss.SSS');
    const nyTime = moment.tz(mt, 'America/New_York');
    e.trade_time_ms = Number(nyTime.format('x'));
    e.qty = Math.abs(e.qty);
    e.price = Number(e.price);
    e.gross_amount = Math.abs(e.gross_amount);
  });
  fileData.trade_activities = fileData.trade_activities.sort((a: any, b: any) => a.trade_time_ms - b.trade_time_ms);
  return fileData;
}


export function isValidDateString(value: string, format: string): boolean {
  const date = moment(value, format);
  return date.isValid();
}


// The format is as follow:
// [
//   'Symbol',
//   'Quantity',
//   'Date Acquired',
//   'Date Sold',
//   'Holding Time',
//   'Acquired Cost',
//   'Sold Gross Amount',
//   'Gain or Loss'
// ]
export function getTradeRecord(buyTrade: AlpacaTradTy, sellTrade: AlpacaTradTy): string[] {
  return [
    buyTrade.symbol,
    `${buyTrade.qty}`,
    `${buyTrade.trade_date}T${buyTrade.trade_time}`,
    `${sellTrade.trade_date}T${sellTrade.trade_time}`,
    timeDiff(buyTrade.trade_time_ms, sellTrade.trade_time_ms),
    `${buyTrade.gross_amount}`,
    `${Math.abs(sellTrade.gross_amount)}`,
    `${round((Math.abs(sellTrade.gross_amount) - Math.abs(buyTrade.gross_amount)))}`
  ];
}


export async function writeCsvFile(data: any[], currentYear: number, outputDirPath: string) {
  const filePath: string = `${outputDirPath}/alpaca-fifo-${currentYear}.csv`;
  data.unshift(
    [
      'Symbol',
      'Quantity',
      'Date Acquired',
      'Date Sold',
      'Holding Time (~)',
      'Acquired Cost',
      'Sold Gross Amount',
      'Gain or Loss'
    ]
  );
  const csvContent = data.map(row => row.join(',')).join('\n');
  await fs.writeFile(filePath, csvContent, 'utf-8');
}


export function getYearFromFile(filename: string): number {
  return Number(filename.substring(0, 4));
}
