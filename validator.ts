
export default class Validator {
  static verifySell(queue: any, symbol: string, qty: number): void {
    const symbolQueue = queue[symbol];
    if (!symbolQueue) throw new Error(`You are trying to sell ${qty} ${symbol} that has not been bought yet`);
    const totalQty: number = symbolQueue.totalQty();
    if (totalQty < qty) throw new Error(`Symbol: ${symbol}. Qty: ${qty}. You are trying to sell more than you have`);
  }
}
