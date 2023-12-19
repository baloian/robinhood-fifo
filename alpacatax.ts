import Validator from './validator';
import Queue from './queue';
import { AlpacaTradTy } from './types';
import { getListOfFilenames, readJsonFile, parseOrders } from './utils';


// This is a global variable where I keep orders for every symbol in a queue.
const gQueue: {[key: string]: any} = {};


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
    console.log(gQueue);
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
      if (gQueue[trade.symbol]) {
        gQueue[trade.symbol].push({...trade});
      } else {
        gQueue[trade.symbol] = new Queue<AlpacaTradTy>();
        gQueue[trade.symbol].push({...trade});
      }
  }

  private static processSellTrade(trade: AlpacaTradTy): void {
    if (!gQueue[trade.symbol]) throw new Error(`Failed to process sell for ${trade.symbol}`);
    const data = gQueue[trade.symbol].front();
    if (data.qty + trade.qty === 0) gQueue[trade.symbol].pop();
  }
}

