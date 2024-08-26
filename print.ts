import { MetaDataTy } from './types';
import { printWithDots } from './utils';


export function printMetadata(data: MetaDataTy): void {
  printWithDots('*** Income Summary', '', '*');
  console.log('***');
  printWithDots('Dividend', `$${data.dividend}`);
  printWithDots('Interest', `$${data.interest}`);
  console.log('');
  printWithDots('*** Cost and Fees', '', '*');
  console.log('***');
  printWithDots('Fees', `$${data.fees}`);
  console.log('');
  printWithDots(`*** Deposit & Withdrawal`, '', '*');
  console.log('***');
  printWithDots('Deposit', `$${data.deposit}`);
  printWithDots('Withdrawal', `$${data.withdrawal}`);
  console.log('');
}
