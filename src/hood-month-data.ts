import { HoodTradeTy, HoodMonthDataTy } from '../types';


export class HoodMonthData implements HoodMonthDataTy {
  monthYear: string;
  data: HoodTradeTy[];

  constructor(monthYear: string, data: HoodTradeTy[]) {
    const regex = /^([1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(monthYear)) {
      throw new Error(`Invalid month/year format: ${monthYear}. Expected format is MM/YYYY.`);
    }
    this.monthYear = monthYear;
    this.data = data;
  }

  getMonthYear(): string {
    return this.monthYear;
  }

  getData(): HoodTradeTy[] {
    return this.data;
  }
}
