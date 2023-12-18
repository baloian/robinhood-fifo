import { readFile, readdir } from 'fs/promises';


export async function getListOfFilenames(dirPath: string): Promise<string[]> {
  let fileNames: string[] = [];
  try {
    fileNames = await readdir(dirPath);
  } catch (err) {
    console.error('Error reading files names:', err);
  }
  return fileNames.sort();
}


export async function readJsonFile(filePath: string): Promise<any> {
  try {
    const fileData = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);
    return jsonData;
  } catch (error) {
    console.error(error);
  }
  return null;
}
