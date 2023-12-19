import { z } from 'zod';
import { isValidDateString } from './utils';

export default class Validator {
  static fileNames(fileNames: string[]): void {
    if (!fileNames.length) return;

    const invalidFileFormat: string = 'Invalid filename format. It must be YYYYMMDD.json';
    const yearErrorMsg = {message: `${invalidFileFormat}. Failed 2014 <= YYYY <= 2100 validation`};
    const monthErrorMsg = {message: `${invalidFileFormat}. Failed 1 <= MM <= 12 validation`};
    const dayErrorMsg = {message: `${invalidFileFormat}. Failed 1 <= DD <= 31 validation`};

    const filenameSchema = z.object({
      extension: z.string().length(4, {message: `${invalidFileFormat}`}),
      filename: z.string().regex(/^(?=.{8,8}$)([0-9]+)$/, {message: invalidFileFormat}),
      year: z.number().int().min(2014, yearErrorMsg).max(2100, yearErrorMsg),
      month: z.number().int().min(1, monthErrorMsg).max(12, monthErrorMsg),
      day: z.number().int().min(1, dayErrorMsg).max(31, dayErrorMsg)
    });

    for (const fn of fileNames) {
      const [name, extension] = fn.split('.');
      filenameSchema.parse({
        extension: extension,
        filename: name,
        year: Number(name.substring(0, 4)),
        month: Number(name.substring(4, 6)),
        day: Number(name.substring(6, 9))
      });
    }
  }

  static fileData(fileData: any): void {
    if (!fileData) throw new Error(`Failed to read JSON file`);

    const tradeActivitiesSchema = z.object({
      symbol: z.string().min(1),
      side: z.string().refine((val) => val === 'buy' || val === 'sell', {
        message: 'The trade side must be `buy` or `sell`',
      }),
      qty: z.string().refine((val) => !isNaN(parseFloat(val)), {
        message: 'Invalid number format',
      }),
      price: z.string().refine((val) => !isNaN(parseFloat(val)), {
        message: 'Invalid number format',
      }),
      gross_amount: z.string().refine((val) => !isNaN(parseFloat(val)), {
        message: 'Invalid number format',
      }),
      /*
      fees: [],
      net_amount: '2379.93',
      */
      trade_date: z.string().refine((val) => isValidDateString(val, 'YYYY-MM-DD'), {
        message: 'Invalid trade date format',
      }),
      trade_time: z.string().refine((val) => isValidDateString(val, 'HH:mm:ss.SSS'), {
        message: 'Invalid trade time format',
      }),
      /*
      settle_date: '2023-12-14',
      asset_type: 'E',
      note: '',
      */
      status: z.string().refine((val) => val === 'executed', {
        message: 'The trade status must be executed',
      }),
      /*
      capacity: 'agency',
      execution_id: '20315094015'
      */
    });

    for (const trade of fileData.trade_activities) {
      tradeActivitiesSchema.parse({
        symbol: trade.symbol,
        side: trade.side,
        qty: trade.qty,
        price: trade.price,
        gross_amount: trade.gross_amount,
        status: trade.status,
        trade_date: trade.trade_date,
        trade_time: trade.trade_time
      });
    }
  }
}
