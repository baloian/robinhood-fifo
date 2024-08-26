import { formatToUSD } from '@baloian/lib';
import { MetaDataTy, HoodTradeTy } from './types';
import {
  printWithDots,
  numberToMonth
} from './utils';


export function printMetadata(data: MetaDataTy): void {
  printWithDots('///// Income Summary', '', '/');
  printWithDots('Dividend', `${formatToUSD(data.dividend)}`);
  printWithDots('Interest', `${formatToUSD(data.interest)}`);
  console.log('');
  printWithDots('///// Cost and Fees', '', '/');
  printWithDots('Fees', `${formatToUSD(data.fees)}`);
  console.log('');
  printWithDots(`///// Deposit & Withdrawal`, '', '/');
  printWithDots('Deposit', `${formatToUSD(data.deposit)}`);
  printWithDots('Withdrawal', `${formatToUSD(data.withdrawal)}`);
  console.log('');
}


export function printHeadline(date: string): void {
  const d = date.split('/');
  printWithDots(`### ${numberToMonth(Number(d[0]))} ${d[1]} Monthly Statement`, '', '#');
  console.log('');
}


export function printTxs(txs: HoodTradeTy[]): void {
  printWithDots('///// Transactions', '', '/');
  console.log('/');
  const headers = ['Trade Date', 'Symbol', 'Side', 'Qty', 'Price', 'Amount'];
  const headerRow = headers.map(header => header.padEnd(10)).join(' | ');
  const separator = headers.map(() => '----------').join('-|-');

  console.log(headerRow);
  console.log(separator);

  txs.forEach(tx => {
    const rowString = [
      tx.process_date.padEnd(10),
      tx.symbol.padEnd(10),
      (tx.trans_code === 'Buy' ? 'BUY' : 'SELL').padEnd(10),
      tx.quantity.toString().padEnd(10),
      formatToUSD(tx.price).padEnd(10),
      `${formatToUSD(tx.quantity * tx.price)}`.padEnd(10)
    ].join(' | ');
    console.log(rowString);
  });
}
