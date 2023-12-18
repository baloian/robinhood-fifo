import { abort } from '@baloian/lib';
import { readdir } from 'fs/promises';
import { AlpacaTax } from './alpacatax';


async function getListOfFilenames(dirPath: string = 'inputs'): Promise<string[]> {
  let fileNames: string[] = [];
  try {
    fileNames = await readdir(dirPath);
  } catch (err) {
    console.error('Error reading files names:', err);
  }
  return fileNames.sort();
}


/**
 * This is the main entry point to the entire project.
 */
(async () => {
  console.log(new Date(), 'Alpaca tax calculator started!');
  // AlpacaTax.calculate();
  const files = await getListOfFilenames();
  console.log(files);
})().catch(abort);
