import 'dotenv/config';
import * as path from 'path';
import { round } from '@baloian/lib';
import Queue from './queue';
import Validator from './validator';
import { HoodTradeTy, ClosingTradeTy } from './types';
import {
  deepCopy,
  parseCSV,
  filterRowsByTransCode,
  getTradeRecord,
  printTable
} from './utils';


export class RobinhoodFIFO {
  // This is a variable where I keep orders for every symbol in a queue.
  private gQueue: {[key: string]: any} = {};
  // These are variables where I keep data for writing in a CSV file.
  private txsData: ClosingTradeTy[] = [];
  private feeData: string[] = [];

  async run(): Promise<void> {
    try {
      this.reset();
      const filePath = path.resolve(__dirname, '../robinhood.csv');
      const rows: HoodTradeTy[] = await parseCSV(filePath);
      const trades = filterRowsByTransCode(rows);
      for (const trade of trades) {
        if (trade.trans_code === 'Buy') this.processBuyTrade(trade);
        else this.processSellTrade(trade);
      }
      printTable(this.txsData);
    } catch (error) {
      console.error(error);
    }
  }

  private processBuyTrade(trade: HoodTradeTy): void {
    if (!this.gQueue[trade.symbol]) this.gQueue[trade.symbol] = new Queue<HoodTradeTy>();
    this.gQueue[trade.symbol].push({...trade});
  }

  private processSellTrade(sellTrade: HoodTradeTy): void {
    Validator.verifySell(this.gQueue, sellTrade.symbol, sellTrade.quantity);
    const symbolQueue = this.gQueue[sellTrade.symbol];
    const buyTrade: HoodTradeTy = symbolQueue.front();
    if (buyTrade.quantity - sellTrade.quantity === 0 || buyTrade.quantity - sellTrade.quantity > 0) {
      this.sellFullOrPartially(buyTrade, sellTrade);
    } else {
      // This is when selling more than the current buy order.
      // For example, buying 5 APPL, and then buying 4 more APPL, and then selling 7 APPL.
      // In this case, the current buying order is the 5 AAPL. I would need to sell 2 more
      // AAPL from the 4 AAPL buy.
      while (sellTrade.quantity > 0) {
        const tmpBuyTrade: HoodTradeTy = symbolQueue.front();
        const tmpSellTrade: HoodTradeTy = deepCopy(sellTrade);
        tmpSellTrade.quantity = sellTrade.quantity >= tmpBuyTrade.quantity ? tmpBuyTrade.quantity : sellTrade.quantity;
        tmpSellTrade.amount = round(tmpSellTrade.quantity * tmpSellTrade.price);
        this.sellFullOrPartially(tmpBuyTrade, tmpSellTrade);
        sellTrade.quantity -= tmpSellTrade.quantity;
        sellTrade.amount = round(sellTrade.quantity * sellTrade.price);
      }
    }
  }

  // This is when selling the entire order. For example, buying 5 APPL and then selling 5 APPL.
  // OR when selling less than bought. For example, buying 5 APPL and then selling 3 APPL.
  private sellFullOrPartially(buyTrade: HoodTradeTy, sellTrade: HoodTradeTy): void {
    const symbolQueue = this.gQueue[sellTrade.symbol];
    if (buyTrade.quantity - sellTrade.quantity === 0) {
      this.txsData.push(getTradeRecord(buyTrade, sellTrade) as any);
      symbolQueue.pop();
    } else if (buyTrade.quantity - sellTrade.quantity > 0) {
      const tmpBuyTrade: HoodTradeTy = deepCopy(buyTrade);
      tmpBuyTrade.quantity = sellTrade.quantity;
      tmpBuyTrade.amount = round(tmpBuyTrade.quantity * tmpBuyTrade.price);
      this.txsData.push(getTradeRecord(tmpBuyTrade, sellTrade));
      // This would be the remaining part (not sold yet).
      buyTrade.quantity -= sellTrade.quantity;
      buyTrade.amount = round(buyTrade.quantity * buyTrade.price);
      symbolQueue.updateFront(buyTrade);
    }
  }

  private reset(): void {
    this.gQueue = {};
    this.txsData = [];
    this.feeData = [];
  }
}

