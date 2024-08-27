import { formatToUSD, QueueType } from '@baloian/lib';
import { MetaDataTy, HoodTradeTy } from './types';
import {
  numberToMonth
} from './utils';


function printWithDots(value1: string, value2: string, symbol: string = '-'): void {
  const totalLength = 78;
  const totalValuesLength = value1.length + value2.length;
  const totalDots = totalLength - totalValuesLength;
  /*
  if (totalDots < 0) {
    console.error('The combined length of the values exceeds the total line length.');
    return;
  }
  */
  const line: string = `${value1} ${symbol.repeat(totalDots)}` +
    (value2.length > 0 ? ` ${value2}` : symbol);
  console.log(line);
}


export function printMetadata(data: MetaDataTy): void {
  printWithDots('///// Income Summary', '', '/');
  console.log('/');
  printWithDots('Dividend', `${formatToUSD(data.dividend)}`);
  printWithDots('Interest', `${formatToUSD(data.interest)}`);
  console.log('');
  printWithDots('///// Cost and Fees', '', '/');
  console.log('/');
  printWithDots('Fees', `${formatToUSD(data.fees)}`);
  console.log('');
  printWithDots('///// Deposit & Withdrawal', '', '/');
  console.log('/');
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
      formatToUSD(tx.amount).padEnd(10)
    ].join(' | ');
    console.log(rowString);
  });
}


export function printHoldings(data: {[key: string]: QueueType<HoodTradeTy>}): void {
  console.log('');
  printWithDots('///// Holdings', '', '/');
  console.log('/');
  Object.keys(data).forEach((symbol: string) => {
    if (!data[symbol].isEmpty()) {
      const holdingData = data[symbol].getList().reduce((acc, trade) => {
        acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.quantity;
        return acc;
      }, {} as { [key: string]: number });
      Object.keys(holdingData).forEach((s: string) => printWithDots(s, `${holdingData[s]}`));
    }
  });
}
