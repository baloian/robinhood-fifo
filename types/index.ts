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

export type StringListTy = string[];


export interface ArgumenTy {
  inputDirPath: string;
  outputDirPath: string;
  writeToFile: boolean;
  callbackFn: any;
}


export interface CsvRowTy {
  activity_date: string;
  process_date: string;
  settle_date: string;
  instrument: string;
  description: string;
  trans_code: string;
  quantity: string;
  price: string;
  amount: string;
};
