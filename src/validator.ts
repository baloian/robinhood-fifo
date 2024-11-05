import { QueueType } from '@baloian/lib-ts';
import { HoodTradeTy } from '../types';


function getTotalQty(items: HoodTradeTy[]): number {
  let total: number = 0;
  items.forEach((e: any) => total += e.qty);
  return total;
}


export default class Validator {
  static verifySell(queue: {[key: string]: QueueType<HoodTradeTy>},
    symbol: string, qty: number): string | null {
    const symbolQueue: QueueType<HoodTradeTy> = queue[symbol];
    if (!symbolQueue) return `You are trying to sell ${qty} ${symbol} that has not been bought yet.`;
    const totalQty: number = getTotalQty(symbolQueue.getList());
    if (totalQty < qty) return `Symbol: ${symbol}. Qty: ${qty}. You are trying to sell more than you have.`;
    return null;
  }
}
