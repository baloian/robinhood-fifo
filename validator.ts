
export default class Validator {
  static verifySell(queue: any, symbol: string, qty: number): string | null {
    const symbolQueue = queue[symbol];
    if (!symbolQueue) return `You are trying to sell ${qty} ${symbol} that has not been bought yet.`;
    const totalQty: number = symbolQueue.totalQty();
    if (totalQty < qty) return `Symbol: ${symbol}. Qty: ${qty}. You are trying to sell more than you have.`;
    return null;
  }
}
