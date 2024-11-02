import { formatToUSD, QueueType } from '@baloian/lib';
import { MetaDataTy, HoodTradeTy, SymbolProfitTy, GainLossTy } from './types';
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
  printWithDots('///// Income, Fees, Deposit and Withdrawal', '', '');
  console.log('-----');
  printWithDots('Dividend', `${formatToUSD(data.dividend)}`);
  printWithDots('Interest', `${formatToUSD(data.interest)}`);
  printWithDots('Fees', `${formatToUSD(data.fees)}`);
  printWithDots('Deposit', `${formatToUSD(data.deposit)}`);
  printWithDots('Withdrawal', `${formatToUSD(data.withdrawal)}`);
  if (data.benefit) printWithDots('Benefit', `${formatToUSD(data.benefit)}`);
  if (data.acats) printWithDots('ACATS Transfer', `${formatToUSD(data.acats)}`);
  console.log('');
}


export function printHeadline(date: string): void {
  const d = date.split('/');
  printWithDots(`### ${numberToMonth(Number(d[0]))} ${d[1]} Monthly Statement`, '', '#');
  console.log('');
}


export function printTxs(txs: HoodTradeTy[]): void {
  printWithDots('///// Transactions', '', '');
  console.log('-----');
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
  printWithDots('///// Holdings', '', '');
  console.log('-----');
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


export function printGainLoss(data: SymbolProfitTy[], gainLoss: GainLossTy): void {
  console.log('');
  printWithDots('///// Realized Gain/Loss', '', '');
  console.log('-----');
  printWithDots('Total (short term)', `${formatToUSD(gainLoss.short_term_profit)}`);
  printWithDots('Total (long term)', `${formatToUSD(gainLoss.long_term_profit)}`);
  console.log('');
  if (data.length > 0) {
    printWithDots('///// Realized Gain/Loss by Symbols', '', '');
    console.log('-----');
    data.forEach((item: SymbolProfitTy) => {
      printWithDots(item.symbol, `${formatToUSD(item.total_profit)} / ${item.total_profit_pct}%`);
    });
  }
}
