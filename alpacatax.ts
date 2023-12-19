import Validator from './validator';
import Queue from './queue';
import { AlpacaTradTy } from './types';
import { getListOfFilenames, readJsonFile, parseOrders } from './utils';


// This is a global variable where I keep orders for every symbol in a queue.
const gData: {[key: string]: any} = {};


export class AlpacaTax {
  public static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    Validator.fileNames(fileNames);

    for (const fileName of fileNames) {
      let fileData = await readJsonFile(`${dirPath}/${fileName}`);
      Validator.fileData(fileData);

      fileData = parseOrders(fileData);
      for (const trade of fileData.trade_activities) {
        if (trade.side === 'buy') {
          AlpacaTax.processBuyTrade(trade);
        } else if (trade.side === 'sell') {
          // TODO
        } else {
          throw new Error(`The order with ${trade.side} side is not supported`);
        }
      }
    }
    // console.log(gData['SHOP']);
  }

  private static processBuyTrade(trade: AlpacaTradTy): void {
      if (gData[trade.symbol]) {
        gData[trade.symbol].push({...trade});
      } else {
        gData[trade.symbol] = new Queue<AlpacaTradTy>();
        gData[trade.symbol].push({...trade});
      }
  }
}

