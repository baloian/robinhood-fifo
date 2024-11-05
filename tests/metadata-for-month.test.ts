import { getMetadatForMonth } from '../src/utils';
import { HoodTradeTy } from '../types';


describe('getMetadatForMonth', () => {
  const createTrade = (overrides: Partial<HoodTradeTy>): HoodTradeTy => ({
    activity_date: '5/15/2023',
    process_date: '5/15/2023',
    settle_date: '5/15/2023',
    trans_code: 'ACH',
    amount: 100,
    description: '',
    symbol: '',
    price: 0,
    quantity: 0,
    ...overrides
  });

  it('sum fees from GOLD and MINT transactions', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ trans_code: 'GOLD', amount: 5, process_date: '5/15/2023' }),
      createTrade({ trans_code: 'MINT', amount: 3, process_date: '5/15/2023' }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result.fees).toBe(8);
  });

  it('handle ACH deposits and withdrawals', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ 
        trans_code: 'ACH', 
        amount: 1000, 
        description: 'ACH Deposit',
        process_date: '5/15/2023'
      }),
      createTrade({ 
        trans_code: 'ACH', 
        amount: 500, 
        description: 'ACH Withdrawal',
        process_date: '5/15/2023'
      }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result.deposit).toBe(1000);
    expect(result.withdrawal).toBe(500);
  });

  it('handle dividends and benefits', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ trans_code: 'CDIV', amount: 25, process_date: '5/15/2023' }),
      createTrade({ trans_code: 'GDBP', amount: 15, process_date: '5/15/2023' }),
      createTrade({ trans_code: 'T/A', amount: 10, process_date: '5/15/2023' }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result.dividend).toBe(25);
    expect(result.benefit).toBe(25); // 15 + 10
  });

  it('filter out transactions from different months', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ trans_code: 'GOLD', amount: 5, process_date: '5/15/2023' }),
      createTrade({ trans_code: 'GOLD', amount: 3, process_date: '6/15/2023' }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result.fees).toBe(5);
  });

  it('handle ACATS transactions', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ trans_code: 'ACATI', amount: 1000, process_date: '5/15/2023' }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result.acats).toBe(1000);
  });

  it('return zero values when no transactions match', () => {
    const trades: HoodTradeTy[] = [
      createTrade({ trans_code: 'GOLD', amount: 5, process_date: '6/15/2023' }),
    ];
    const result = getMetadatForMonth(trades, '5/2023');
    expect(result).toEqual({
      fees: 0,
      dividend: 0,
      deposit: 0,
      withdrawal: 0,
      interest: 0,
      benefit: 0,
      acats: 0
    });
  });
});
