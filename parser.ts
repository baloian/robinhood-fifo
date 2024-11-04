import fs from 'fs';
import csv from 'csv-parser';
import { HoodTradeTy } from './types';


function convertToNumber(value: string): number {
  // Remove currency symbols and parentheses
  const cleanedValue = value.replace(/[\$,()]/g, '');
  return parseFloat(cleanedValue);
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


export default class Parser {  
  static async parseCSV(filePath: string): Promise<HoodTradeTy []> {
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

  static async getRawData(dirPath: string): Promise<HoodTradeTy []> {
    const listOfRows: HoodTradeTy[][] = [];
    const files = await fs.promises.readdir(dirPath);
    for (const filename of files) {
      listOfRows.push(await Parser.parseCSV(`${dirPath}/${filename}`));
    }
    // To merge all the ordered sub-lists into one list without altering the original
    // order within each sub-list.
    return sortListsByLastProcessDate(listOfRows);
  }
}
