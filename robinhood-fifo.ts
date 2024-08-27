import * as path from 'path';
import { round, deepCopy, Queue, QueueType } from '@baloian/lib';
import Validator from './validator';
import {
  HoodTradeTy,
  ClosingTradeTy,
  MetaDataTy
} from './types';
import {
  getTradeRecord,
  getRawData,
  getMonthYearData,
  getMetadatForMonth,
  getTxsForMonth
} from './utils';
import {
  printMetadata,
  printHeadline,
  printTxs,
  printHoldings,
  printGainLoss
} from './print';


export default class RobinhoodFIFO {
  // This is a variable where I keep orders for every symbol in a queue.
  private gQueue: {[key: string]: QueueType<HoodTradeTy>} = {};
  private txsData: ClosingTradeTy[] = [];

  async run(): Promise<void> {
    try {
      const rows: HoodTradeTy[] = await getRawData(path.resolve(__dirname, '../input'));
      this.processMonthlyStmts(rows);
    } catch (error) {
      console.error(error);
    }
  }

  private processTrades(rows: HoodTradeTy[]): void {
    const trades = rows.filter(row => row.trans_code === 'Sell' || row.trans_code === 'Buy');
    for (const trade of trades) {
      if (trade.trans_code === 'Buy') this.processBuyTrade(trade);
      else this.processSellTrade(trade);
    }
  }

  private processMonthlyStmts(rows: HoodTradeTy[]): void {
    const monthYearData: {[key: string]: HoodTradeTy[]} = getMonthYearData(rows);
    Object.keys(monthYearData).forEach((key: string) => {
      this.reset();
      printHeadline(key);
      const md: MetaDataTy = getMetadatForMonth(monthYearData[key], key);
      printMetadata(md);
      const txs: HoodTradeTy[] = getTxsForMonth(monthYearData[key], key);
      printTxs(txs);
      this.processTrades(monthYearData[key]);
      printHoldings(this.gQueue);
      this.reset();
      this.processTrades(monthYearData[key]);
      printGainLoss(this.txsData);
      console.log('');
      console.log('');
      console.log('');
      console.log('');
    });
  }

  private processBuyTrade(trade: HoodTradeTy): void {
    if (!this.gQueue[trade.symbol]) this.gQueue[trade.symbol] = new Queue<HoodTradeTy>();
    this.gQueue[trade.symbol].push({...trade});
  }

  private processSellTrade(sellTrade: HoodTradeTy): void {
    const v = Validator.verifySell(this.gQueue, sellTrade.symbol, sellTrade.quantity);
    if (v) {
      /*
      console.error('WARNING!');
      console.error(v);
      console.log('This will not be part of the calculation.');
      */
      return;
    }
    const symbolQueue = this.gQueue[sellTrade.symbol];
    const buyTrade: HoodTradeTy | undefined = symbolQueue.front();
    if (!buyTrade) return;
    if (buyTrade.quantity - sellTrade.quantity === 0 || buyTrade.quantity - sellTrade.quantity > 0) {
      this.sellFullOrPartially(buyTrade, sellTrade);
    } else {
      // This is when selling more than the current buy order.
      // For example, buying 5 APPL, and then buying 4 more APPL, and then selling 7 APPL.
      // In this case, the current buying order is the 5 AAPL. I would need to sell 2 more
      // AAPL from the 4 AAPL buy.
      while (sellTrade.quantity > 0) {
        const tmpBuyTrade: HoodTradeTy | undefined = symbolQueue.front();
        if (tmpBuyTrade) {
          const tmpSellTrade: HoodTradeTy = deepCopy(sellTrade);
          tmpSellTrade.quantity = sellTrade.quantity >= tmpBuyTrade.quantity ?
            tmpBuyTrade.quantity : sellTrade.quantity;
          tmpSellTrade.amount = round(tmpSellTrade.quantity * tmpSellTrade.price);
          this.sellFullOrPartially(tmpBuyTrade, tmpSellTrade);
          sellTrade.quantity -= tmpSellTrade.quantity;
          sellTrade.amount = round(sellTrade.quantity * sellTrade.price);
        } else {
          console.error(sellTrade);
          throw new Error('Oops! Something went wrong');
        }
      }
    }
  }

  // This is when selling the entire order. For example, buying 5 APPL and then selling 5 APPL.
  // OR when selling less than bought. For example, buying 5 APPL and then selling 3 APPL.
  private sellFullOrPartially(buyTrade: HoodTradeTy, sellTrade: HoodTradeTy): void {
    const symbolQueue = this.gQueue[sellTrade.symbol];
    if (buyTrade.quantity - sellTrade.quantity === 0) {
      this.txsData.push(getTradeRecord(buyTrade, sellTrade));
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

  private reset() {
    this.gQueue = {};
    this.txsData = [];
  }
}

