import 'dotenv/config';
import { round } from '@baloian/lib';
import Queue from './queue';
import Validator from './validator';
import { AlpacaTradTy, StringListTy } from './types';
import {
  getListOfFilenames,
  readJsonFile,
  getTradeRecord,
  writeDataToFile,
  getYearFromFile,
  getFeeRecord,
  deepCopy
} from './utils';


export class AlpacaFIFO {
  // This is a variable where I keep orders for every symbol in a queue.
  private static gQueue: {[key: string]: any} = {};
  // These are variables where I keep data for writing in a CSV file.
  private static txsData: StringListTy[] = [];
  private static feeData: StringListTy[] = [];

  public static async run(
    inputDirPath: string = String(process.env.INPUTS),
    outputDirPath: string = String(process.env.OUTPUTS),
    writeToFile: boolean = true,
    callbackFn: any = null
  ): Promise<void> {
    AlpacaFIFO.reset();
    const fileNames = await getListOfFilenames(inputDirPath);
    let year: number = getYearFromFile(fileNames[0]);

    for (const fileName of fileNames) {
      const fileData = await readJsonFile(`${inputDirPath}/${fileName}`);
      for (const trade of fileData.trade_activities) {
        if (trade.side === 'buy') AlpacaFIFO.processBuyTrade(trade);
        else AlpacaFIFO.processSellTrade(trade);
      }

      this.feeData = getFeeRecord(fileData, this.feeData);
      // I do this because I create a separate <year>.csv file for each year.
      const tmpYear: number = getYearFromFile(fileName);
      if (year !== tmpYear) {
        if (writeToFile) await writeDataToFile(this.txsData, this.feeData, year, outputDirPath);
        if (callbackFn) await callbackFn(this.txsData, this.feeData, year);
        year = tmpYear;
        this.txsData = [];
        this.feeData = [];
      }
    }
    if (writeToFile) await writeDataToFile(this.txsData, this.feeData, year, outputDirPath);
    if (callbackFn) await callbackFn(this.txsData, this.feeData, year);
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
    if (!this.gQueue[trade.symbol]) this.gQueue[trade.symbol] = new Queue<AlpacaTradTy>();
    this.gQueue[trade.symbol].push({...trade});
  }

  private static processSellTrade(sellTrade: AlpacaTradTy): void {
    Validator.verifySell(this.gQueue, sellTrade.symbol, sellTrade.qty);
    const symbolQueue = this.gQueue[sellTrade.symbol];
    const buyTrade: AlpacaTradTy = symbolQueue.front();
    if (buyTrade.qty - sellTrade.qty === 0 || buyTrade.qty - sellTrade.qty > 0) {
      AlpacaFIFO.sellFullOrPartially(buyTrade, sellTrade);
    } else {
      // This is when selling more than the current but order.
      // For example, buying 5 APPL, and then buying 4 more APPL, and then selling 7 APPL.
      // In this case, the current buying order is the 5 AAPL. I would need to sell 2 more
      // AAPL from the 4 AAPL buy.
      while (sellTrade.qty > 0) {
        const tmpBuyTrade: AlpacaTradTy = symbolQueue.front();
        const tmpSellTrade: AlpacaTradTy = deepCopy(sellTrade);
        tmpSellTrade.qty = sellTrade.qty >= tmpBuyTrade.qty ? tmpBuyTrade.qty : sellTrade.qty;
        tmpSellTrade.gross_amount = round(tmpSellTrade.qty * tmpSellTrade.price);
        AlpacaFIFO.sellFullOrPartially(tmpBuyTrade, tmpSellTrade);

        sellTrade.qty -= tmpSellTrade.qty;
        sellTrade.gross_amount = round(sellTrade.qty * sellTrade.price);
      }
    }
  }

  // This is when selling the entire order. For example, buying 5 APPL and then selling 5 APPL.
  // OR when selling less than bought. For example, buying 5 APPL and then selling 3 APPL.
  private static sellFullOrPartially(buyTrade: AlpacaTradTy, sellTrade: AlpacaTradTy): void {
    const symbolQueue = this.gQueue[sellTrade.symbol];
    if (buyTrade.qty - sellTrade.qty === 0) {
      this.txsData.push(getTradeRecord(buyTrade, sellTrade));
      symbolQueue.pop();
    } else if (buyTrade.qty - sellTrade.qty > 0) {
      const tmpBuyTrade: AlpacaTradTy = deepCopy(buyTrade);
      tmpBuyTrade.qty = sellTrade.qty;
      tmpBuyTrade.gross_amount = round(tmpBuyTrade.qty * tmpBuyTrade.price);
      this.txsData.push(getTradeRecord(tmpBuyTrade, sellTrade));

      // This would be the remaining part (not sold yet).
      buyTrade.qty -= sellTrade.qty;
      buyTrade.gross_amount = round(buyTrade.qty * buyTrade.price);
      symbolQueue.updateFront(buyTrade);
    }
  }

  private static reset(): void {
    this.gQueue = {};
    this.txsData = [];
    this.feeData = [];
  }
}

