export interface AlpacaTradTy {
  symbol: string;
  side: string;
  qty: number;
  price: number;
  gross_amount: number;
  fees: number[];
  net_amount: string;
  trade_date: string;
  trade_time: string;
  settle_date: string;
  asset_type: string;
  note: string;
  status: string;
  capacity: string;
  execution_id: string;
  trade_time_ms: number;
}
