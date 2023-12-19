import Validator from './validator';
import Queue from './queue';
import { AlpacaTradTy } from './types';
import {
  getListOfFilenames,
  readJsonFile,
  parseOrders,
  getTradeRecord,
  writeCsvFile
} from './utils';


// This is a global variable where I keep orders for every symbol in a queue.
const gQueue: {[key: string]: any} = {};


type StringListTy = string[];
const gData: StringListTy[] = [
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
];


export class AlpacaTax {
  public static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    Validator.fileNames(fileNames);

    for (const fileName of fileNames) {
      let fileData = await readJsonFile(`${dirPath}/${fileName}`);
      Validator.fileData(fileData);

      fileData = parseOrders(fileData);
      for (const trade of fileData.trade_activities) {
        if (trade.side === 'buy') AlpacaTax.processBuyTrade(trade);
        else AlpacaTax.processSellTrade(trade);
      }
    }
    console.log(gData);
    await writeCsvFile(gData, 'example.csv');
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
    if (gQueue[trade.symbol]) {
      gQueue[trade.symbol].push({...trade});
    } else {
      gQueue[trade.symbol] = new Queue<AlpacaTradTy>();
      gQueue[trade.symbol].push({...trade});
    }
  }

  private static processSellTrade(sellTrade: AlpacaTradTy): void {
    if (!gQueue[sellTrade.symbol]) throw new Error(`Failed to process sell for ${sellTrade.symbol}`);
    const buyTrade: AlpacaTradTy = gQueue[sellTrade.symbol].front();
    if (buyTrade.qty + sellTrade.qty === 0) {
      gData.push(getTradeRecord(buyTrade, sellTrade));
      gQueue[sellTrade.symbol].pop();
    }
  }
}

