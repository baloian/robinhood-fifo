import { ClosingTradeTy } from '../types';


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
}
