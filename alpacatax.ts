import Validator from './validator';
import Queue from './queue';
import { AlpacaTradTy } from './types';
import {
  getListOfFilenames,
  readJsonFile,
  parseOrders,
  getTradeRecord,
  writeCsvFile,
  getYearFromFile
} from './utils';


// This is a global variable where I keep orders for every symbol in a queue.
const gQueue: {[key: string]: any} = {};


type StringListTy = string[];
let gData: StringListTy[] = [];


export class AlpacaTax {
  public static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    Validator.fileNames(fileNames);

    let currentYear: number = fileNames.length ? getYearFromFile(fileNames[0]) : 0;
    for (const fileName of fileNames) {
      let fileData = await readJsonFile(`${dirPath}/${fileName}`);
      Validator.fileData(fileData);

      fileData = parseOrders(fileData);
      for (const trade of fileData.trade_activities) {
        if (trade.side === 'buy') AlpacaTax.processBuyTrade(trade);
        else AlpacaTax.processSellTrade(trade);
      }

      // I do this because I create a separate <year>.csv file for each year.
      const tmpYear: number = getYearFromFile(fileName);
      if (currentYear !== tmpYear) {
        await writeCsvFile(gData, currentYear);
        currentYear = tmpYear;
        gData = [];
      }
    }
    console.log(gData);
    await writeCsvFile(gData, currentYear);
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
    if (!gQueue[trade.symbol]) gQueue[trade.symbol] = new Queue<AlpacaTradTy>();
    gQueue[trade.symbol].push({...trade});
  }

  private static processSellTrade(sellTrade: AlpacaTradTy): void {
    if (!gQueue[sellTrade.symbol]) throw new Error(`Failed to process sell for ${sellTrade.symbol}`);
    const buyTrade: AlpacaTradTy = gQueue[sellTrade.symbol].front();
    if (buyTrade.qty + sellTrade.qty === 0) {
      gData.push(getTradeRecord(buyTrade, sellTrade));
      gQueue[sellTrade.symbol].pop();
    } else {
      // TODO
    }
  }
}

