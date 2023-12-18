import { getListOfFilenames, readJsonFile } from './utils';


export class AlpacaTax {
  static async calculate(dirPath: string): Promise<void> {
    const fileNames = await getListOfFilenames(dirPath);
    for (const fileName of fileNames) {
      const jsonData = await readJsonFile(`${dirPath}/${fileName}`);
      if (!jsonData) throw new Error(`Failed to read ${fileName} file`);
      console.log(jsonData);
    }
  }
}

