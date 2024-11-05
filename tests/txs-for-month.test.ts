import { getTxsForMonth } from '../src/utils';
import { HoodTradeTy } from '../types';


describe('getTxsForMonth', () => {
  const mockTrades: HoodTradeTy[] = [
    // January transactions
    {
      activity_date: '01/15/2024',
      process_date: '01/15/2024',
      settle_date: '01/17/2024',
      trans_code: 'Buy',
      symbol: 'AAPL',
      quantity: 10,
      price: 100,
      amount: 1000,
      description: 'Buy AAPL'
    },
    {
      activity_date: '01/20/2024',
      process_date: '01/20/2024',
      settle_date: '01/22/2024',
      trans_code: 'Sell',
      symbol: 'AAPL',
      quantity: 10,
      price: 110,
      amount: 1100,
      description: 'Sell AAPL'
    },
    {
      activity_date: '01/31/2024',
      process_date: '01/31/2024',
      settle_date: '02/02/2024',
      trans_code: 'Buy',
      symbol: 'MSFT',
      quantity: 5,
      price: 200,
      amount: 1000,
      description: 'Buy MSFT'
    },
    // February transactions
    {
      activity_date: '02/01/2024',
      process_date: '02/01/2024',
      settle_date: '02/03/2024',
      trans_code: 'Buy',
      symbol: 'GOOGL',
      quantity: 5,
      price: 200,
      amount: 1000,
      description: 'Buy GOOGL'
    },
    // Non-trade transactions
    {
      activity_date: '01/10/2024',
      process_date: '01/10/2024',
      settle_date: '01/12/2024',
      trans_code: 'ACH',
      symbol: '',
      quantity: 0,
      price: 0,
      amount: 5000,
      description: 'ACH Deposit'
    },
    {
      activity_date: '01/11/2024',
      process_date: '01/11/2024',
      settle_date: '01/13/2024',
      trans_code: 'DIV',
      symbol: 'AAPL',
      quantity: 0,
      price: 0,
      amount: 50,
      description: 'Dividend Payment'
    },
    {
      activity_date: '01/12/2024',
      process_date: '01/12/2024',
      settle_date: '01/14/2024',
      trans_code: 'INTEREST',
      symbol: '',
      quantity: 0,
      price: 0,
      amount: 1.25,
      description: 'Interest Payment'
    }
  ];

  it('return only Buy and Sell transactions for the specified month/year', () => {
    const result = getTxsForMonth(mockTrades, '01/2024');
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      mockTrades[0], // January Buy AAPL
      mockTrades[1], // January Sell AAPL
      mockTrades[2]  // January Buy MSFT
    ]);
  });

  it('return empty array for month with no Buy/Sell transactions', () => {
    const result = getTxsForMonth(mockTrades, '03/2024');
    expect(result).toHaveLength(0);
  });

  it('filter out non-Buy/Sell transactions', () => {
    const result = getTxsForMonth(mockTrades, '01/2024');
    expect(result).not.toContainEqual(mockTrades[4]); // Should not include ACH
    expect(result).not.toContainEqual(mockTrades[5]); // Should not include DIV
    expect(result).not.toContainEqual(mockTrades[6]); // Should not include INTEREST
  });

  it('handle empty input array', () => {
    const result = getTxsForMonth([], '01/2024');
    expect(result).toHaveLength(0);
  });

  it('handle transactions at month boundaries', () => {
    const boundaryTrades: HoodTradeTy[] = [
      {
        activity_date: '01/01/2024',
        process_date: '01/01/2024',
        settle_date: '01/03/2024',
        trans_code: 'Buy',
        symbol: 'AAPL',
        quantity: 1,
        price: 100,
        amount: 100,
        description: 'First day of month'
      },
      {
        activity_date: '01/31/2024',
        process_date: '01/31/2024',
        settle_date: '02/02/2024',
        trans_code: 'Sell',
        symbol: 'AAPL',
        quantity: 1,
        price: 110,
        amount: 110,
        description: 'Last day of month'
      }
    ];
    
    const result = getTxsForMonth(boundaryTrades, '01/2024');
    expect(result).toHaveLength(2);
    expect(result).toEqual(boundaryTrades);
  });

  it('handle case-sensitive trans_code values', () => {
    const caseSensitiveTrades: HoodTradeTy[] = [
      {
        activity_date: '01/15/2024',
        process_date: '01/15/2024',
        settle_date: '01/17/2024',
        trans_code: 'buy', // lowercase
        symbol: 'AAPL',
        quantity: 1,
        price: 100,
        amount: 100,
        description: 'Lowercase buy'
      },
      {
        activity_date: '01/15/2024',
        process_date: '01/15/2024',
        settle_date: '01/17/2024',
        trans_code: 'SELL', // uppercase
        symbol: 'AAPL',
        quantity: 1,
        price: 110,
        amount: 110,
        description: 'Uppercase sell'
      }
    ];
    
    const result = getTxsForMonth(caseSensitiveTrades, '01/2024');
    expect(result).toHaveLength(0); // Should be 0 as it's case-sensitive
  });

  it('handle different year correctly', () => {
    const multiYearTrades: HoodTradeTy[] = [
      {
        activity_date: '01/15/2023',
        process_date: '01/15/2023',
        settle_date: '01/17/2023',
        trans_code: 'Buy',
        symbol: 'AAPL',
        quantity: 1,
        price: 100,
        amount: 100,
        description: 'Previous year'
      },
      {
        activity_date: '01/15/2024',
        process_date: '01/15/2024',
        settle_date: '01/17/2024',
        trans_code: 'Buy',
        symbol: 'AAPL',
        quantity: 1,
        price: 110,
        amount: 110,
        description: 'Current year'
      }
    ];
    
    const result2023 = getTxsForMonth(multiYearTrades, '01/2023');
    expect(result2023).toHaveLength(1);
    expect(result2023[0]).toEqual(multiYearTrades[0]);

    const result2024 = getTxsForMonth(multiYearTrades, '01/2024');
    expect(result2024).toHaveLength(1);
    expect(result2024[0]).toEqual(multiYearTrades[1]);
  });

  it('handle malformed date strings', () => {
    const malformedTrades: HoodTradeTy[] = [
      {
        activity_date: 'invalid-date',
        process_date: 'invalid-date',
        settle_date: 'invalid-date',
        trans_code: 'Buy',
        symbol: 'AAPL',
        quantity: 1,
        price: 100,
        amount: 100,
        description: 'Invalid date'
      }
    ];
    expect(() => getTxsForMonth(malformedTrades, '01/2024')).toThrow();
  });
});
