import moment from 'moment-timezone';
import { round, timeDiff } from '@baloian/lib';
import { promises as asyncfs } from 'fs';
import fs from 'fs';
import csv from 'csv-parser';
import Validator from './validator';
import { ArgumenTy, HoodTradeTy } from './types';


export async function getListOfFilenames(dirPath: string): Promise<string[]> {
  const fileNames: string[] = await asyncfs.readdir(dirPath);
  if (!fileNames.length) throw new Error('Please provide files. No YYYYMMDD.json files to process');
  Validator.fileNames(fileNames);
  return fileNames.sort();
}


export async function readJsonFile(filePath: string): Promise<any> {
  const fileData = await asyncfs.readFile(filePath, 'utf-8');
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


// The format of each element is as follow:
// [
//   'Description',
//   'Gross Amount'
// ]
export function getFeeRecord(fileData: any, gFileFeeData: any[]): any[] {
  fileData.fee_activities.forEach((f: any) => {
    const found: any = gFileFeeData.find((e) => e[0] === f.description);
    if (found) {
      found[1] = `${Number(found[1]) + Number(f.gross_amount)}`;
    } else {
      gFileFeeData.push([f.description, f.gross_amount]);
    }
  });
  return gFileFeeData;
}


async function writeTrxsToFile(data: any[], currentYear: number, outputDirPath: string) {
  if (!data.length) return;
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
  await writeCsvFile(data, filePath);
}


async function writeFeesToFile(data: any[], currentYear: number, outputDirPath: string) {
  if (!data.length) return;
  const filePath: string = `${outputDirPath}/alpaca-fees-${currentYear}.csv`;
  data.unshift(['Description', 'Gross Amount']);
  await writeCsvFile(data, filePath);
}


async function writeCsvFile(data: any[], filePath: string) {
  const csvContent = data.map((row) => row.join(',')).join('\n');
  await asyncfs.writeFile(filePath, csvContent, 'utf-8');
}


export async function writeDataToFile(txData: any[], feeData: any[], currentYear: number, outputDirPath: string) {
  await Promise.all([
    writeTrxsToFile(txData, currentYear, outputDirPath),
    writeFeesToFile(feeData, currentYear, outputDirPath)
  ]);
}


export function getYearFromFile(filename: string): number {
  return Number(filename.substring(0, 4));
}


export function deepCopy(data: any): any {
  if (data) return JSON.parse(JSON.stringify(data));
  return data;
}


export function parseArgs(args: any): ArgumenTy {
  if (typeof args !== 'object') throw new Error('Provided argument is not valid');
  if (!args.inputDirPath) args.inputDirPath = String(process.env.INPUTS);
  if (!args.outputDirPath) args.outputDirPath = String(process.env.OUTPUTS);
  if (args.writeToFile === undefined) args.writeToFile = true;
  if (args.callbackFn === undefined) args.callbackFn = null;
  return args;
}


export async function parsePdfToJson(filePath: string): Promise<any> {
  const { PdfReader } = await import('pdfreader');
  const pdfReader = new PdfReader(null);
  const items: any[] = [];

  return new Promise((resolve, reject) => {
    pdfReader.parseFileItems(filePath, (err, item) => {
      if (err) {
        return reject(err);
      }
      if (!item) {
        // End of file
        return resolve(items);
      }
      items.push(item);
    });
  });
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
          instrument: data['Instrument'],
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
