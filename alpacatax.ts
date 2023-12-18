import { getListOfFilenames, readJsonFile, parseOrders } from './utils';


export class AlpacaTax {
  static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    for (const fileName of fileNames) {
      let fileData = await readJsonFile(`${dirPath}/${fileName}`);
      if (!fileData) throw new Error(`Failed to read ${fileName} file`);
      fileData = parseOrders(fileData);
      console.log(fileData);
    }
  }
}

