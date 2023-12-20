import 'dotenv/config';
import Queue from './queue';
import { AlpacaTradTy } from './types';
import {
  getListOfFilenames,
  readJsonFile,
  getTradeRecord,
  writeDataToFile,
  getYearFromFile,
  getFeeRecord
} from './utils';


// This is a global variable where I keep orders for every symbol in a queue.
let gQueue: {[key: string]: any} = {};
// These are global variables where I keep data for writing in a CSV file.
type StringListTy = string[];
let gFileTxsData: StringListTy[] = [];
let gFileFeeData: StringListTy[] = [];


export class AlpacaFIFO {
  public static async run(
    inputDirPath: string = String(process.env.INPUTS),
    outputDirPath: string = String(process.env.OUTPUTS)
  ): Promise<void> {
    AlpacaFIFO.reset();
    const fileNames = await getListOfFilenames(inputDirPath);
    if (!fileNames.length) throw new Error('Please provide files. No YYYYMMDD.json files to process');

    let currentYear: number = getYearFromFile(fileNames[0]);
    for (const fileName of fileNames) {
      const fileData = await readJsonFile(`${inputDirPath}/${fileName}`);
      for (const trade of fileData.trade_activities) {
        if (trade.side === 'buy') AlpacaFIFO.processBuyTrade(trade);
        else AlpacaFIFO.processSellTrade(trade);
      }

      gFileFeeData = getFeeRecord(fileData, gFileFeeData);
      // I do this because I create a separate <year>.csv file for each year.
      const tmpYear: number = getYearFromFile(fileName);
      if (currentYear !== tmpYear) {
        await writeDataToFile(gFileTxsData, gFileFeeData, currentYear, outputDirPath);
        currentYear = tmpYear;
        gFileTxsData = [];
        gFileFeeData = [];
      }
    }
    await writeDataToFile(gFileTxsData, gFileFeeData, currentYear, outputDirPath);
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
    if (!gQueue[trade.symbol]) gQueue[trade.symbol] = new Queue<AlpacaTradTy>();
    gQueue[trade.symbol].push({...trade});
  }

  private static processSellTrade(sellTrade: AlpacaTradTy): void {
    const symbolQueue = gQueue[sellTrade.symbol];
    if (!symbolQueue) throw new Error(`Failed to process sell for ${sellTrade.symbol}`);
    const buyTrade: AlpacaTradTy = symbolQueue.front();
    if (buyTrade.qty - sellTrade.qty === 0) {
      // This is when selling the entire order. For example, buying 5 APPL and then selling 5 APPL.
      gFileTxsData.push(getTradeRecord(buyTrade, sellTrade));
      symbolQueue.pop();
    } else if (buyTrade.qty - sellTrade.qty > 0) {
      // This is when selling less than bought. For example, buying 5 APPL and then selling 3 APPL.
      // In this case, I should keep the order in the queue but decrease only the quantity.
      buyTrade.qty -= sellTrade.qty;
      symbolQueue.updateFront(buyTrade);
      gFileTxsData.push(getTradeRecord(buyTrade, sellTrade));
    } else {
      // This is when selling more than the current but order.
      // For example, buying 5 APPL, and then buying 4 more APPL, and then selling 7 APPL.
      // In this case, the current buying order is the 5 AAPL. I would need to sell 2 more
      // AAPL from the 4 AAPL buy.
      // TODO
    }
  }

  private static reset(): void {
    gQueue = {};
    gFileTxsData = [];
    gFileFeeData = [];
  }
}

