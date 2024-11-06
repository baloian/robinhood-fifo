import { round, pctDiff } from '@baloian/lib-ts';
import { ClosingTradeTy, HoodTradeTy } from '../types';


export default class ClosingTrade implements ClosingTradeTy {
  symbol: string;
  buy_qty: number;
  sell_qty: number;
  buy_process_date: string;
  sell_process_date: string;
  buy_price: number;
  sell_price: number;
  profit: number;
  profit_pct: number;

  constructor(data: ClosingTradeTy) {
    this.symbol = data.symbol;
    this.buy_qty = data.buy_qty;
    this.sell_qty = data.sell_qty;
    this.buy_process_date = data.buy_process_date;
    this.sell_process_date = data.sell_process_date;
    this.buy_price = data.buy_price;
    this.sell_price = data.sell_price;
    this.profit = data.profit;
    this.profit_pct = data.profit_pct;
  }

  static init(buyTrade: HoodTradeTy, sellTrade: HoodTradeTy): ClosingTradeTy {
    const buyValue: number = buyTrade.price * buyTrade.quantity;
    const sellValue: number = sellTrade.price * sellTrade.quantity;
    return new ClosingTrade({
      symbol: buyTrade.symbol,
      buy_qty: buyTrade.quantity,
      sell_qty: sellTrade.quantity,
      buy_process_date: buyTrade.process_date,
      sell_process_date: sellTrade.process_date,
      buy_price: buyTrade.price,
      sell_price: sellTrade.price,
      profit: round(sellValue - buyValue),
      profit_pct: pctDiff(sellValue, buyValue)
    } as ClosingTradeTy);
  }

  getHoldingTimeMs(): number {
    const buyDate = new Date(this.buy_process_date);
    const sellDate = new Date(this.sell_process_date);
    return sellDate.getTime() - buyDate.getTime();
  }

  getProfit(): number {
    return this.profit;
  }

  getSymbol(): string {
    return this.symbol;
  }

  getInvestment(): number {
    return this.buy_price * this.buy_qty;
  }

  getData(): ClosingTradeTy {
    return this;
  }

  getProfitPct(): number {
    return this.profit_pct;
  }
}
