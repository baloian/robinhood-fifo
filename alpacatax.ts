import Validator from './validator';
import { getListOfFilenames, readJsonFile, parseOrders } from './utils';


export class AlpacaTax {
  static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    Validator.fileNames(fileNames);

    for (const fileName of fileNames) {
      let fileData = await readJsonFile(`${dirPath}/${fileName}`);
      Validator.fileData(fileData);

      fileData = parseOrders(fileData);
      for (const trade of fileData.trade_activities) {
        await AlpacaTax.processTrade(trade);
      }
    }
  }

  static async processTrade(trade: any): Promise<void> {
    console.log(trade);
  }
}

