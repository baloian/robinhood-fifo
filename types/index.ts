export interface HoodTradeTy {
  activity_date: string;
  process_date: string;
  settle_date: string;
  symbol: string;
  description: string;
  trans_code: string;
  quantity: number;
  price: number;
  amount: number;
};


export interface ClosingTradeTy {
  symbol: string;
  buy_qty: number;
  sell_qty: number;
  buy_process_date: string;
  sell_process_date: string;
  buy_price: number;
  sell_price: number;
  profit: number;
  profit_pct: number;
};


export interface TotalProfitResultTy {
  total_profit: number;
  total_profit_pct: number;
};
