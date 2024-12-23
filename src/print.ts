import { formatToUSD } from '@baloian/lib-ts';
import { SymbolProfitTy, GainLossTy } from '../types';
import { HoodQueue } from './hood-queue';


export function printWithDots(value1: string, value2: string, symbol: string = '-'): void {
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


export function printHoldings(data: HoodQueue): void {
  if (data.size() === 0) return;
  // if (Object.values(data.getData()).every(queue => queue.isEmpty())) return;
  console.log('');
  printWithDots('///// Holdings', '', '');
  console.log('-----');
  /*
  Object.keys(data).forEach((symbol: string) => {
    if (!data[symbol].isEmpty()) {
      const holdingData = data[symbol].getList().reduce((acc, trade) => {
        acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.quantity;
        return acc;
      }, {} as { [key: string]: number });
      Object.keys(holdingData).forEach((s: string) => printWithDots(s, `${holdingData[s]}`));
    }
  });
  */
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
