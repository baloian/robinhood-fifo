export type StringListTy = string[];


export interface ArgumenTy {
  inputDirPath: string;
  outputDirPath: string;
  writeToFile: boolean;
  callbackFn: any;
}


export interface HoodTradeTy {
  activity_date: string;
  process_date: string;
  settle_date: string;
  instrument: string;
  description: string;
  trans_code: string;
  quantity: number;
  price: number;
  amount: number;
};
