import { MetaDataTy } from './types';
import {
  printWithDots,
  numberToMonth
} from './utils';


export function printMetadata(data: MetaDataTy): void {
  printWithDots('///// Income Summary', '', '/');
  printWithDots('Dividend', `$${data.dividend}`);
  printWithDots('Interest', `$${data.interest}`);
  console.log('');
  printWithDots('///// Cost and Fees', '', '/');
  printWithDots('Fees', `$${data.fees}`);
  console.log('');
  printWithDots(`///// Deposit & Withdrawal`, '', '/');
  printWithDots('Deposit', `$${data.deposit}`);
  printWithDots('Withdrawal', `$${data.withdrawal}`);
  console.log('');
}


export function printHeadline(date: string): void {
  const d = date.split('/');
  printWithDots(`### ${numberToMonth(Number(d[0]))} ${d[1]} Monthly Statement`, '', '#');
  console.log('');
}
