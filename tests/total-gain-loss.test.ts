import { calculateTotalGainLoss } from '../src/utils';
import { ClosingTradeTy } from '../types';


describe('calculateTotalGainLoss', () => {
  const sampleTrades: ClosingTradeTy[] = [
    // Short-term trade (6 months)
    {
      symbol: 'AAPL',
      buy_qty: 10,
      sell_qty: 10,
      buy_process_date: '1/1/2023',
      sell_process_date: '6/1/2023',
      buy_price: 100,
      sell_price: 120,
      profit: 200,
      profit_pct: 20
    },
    // Long-term trade (over 1 year)
    {
      symbol: 'GOOGL',
      buy_qty: 5,
      sell_qty: 5,
      buy_process_date: '1/1/2023',
      sell_process_date: '1/2/2024',
      buy_price: 200,
      sell_price: 250,
      profit: 250,
      profit_pct: 25
    },
    // Another short-term trade in different month
    {
      symbol: 'MSFT',
      buy_qty: 8,
      sell_qty: 8,
      buy_process_date: '3/1/2023',
      sell_process_date: '7/1/2023',
      buy_price: 150,
      sell_price: 140,
      profit: -80,
      profit_pct: -6.67
    }
  ];

  it('calculate short-term gains for a specific month', () => {
    const result = calculateTotalGainLoss(sampleTrades, '6/2023');
    expect(result).toEqual({
      long_term_profit: 0,
      short_term_profit: 200
    });
  });

  it('calculate long-term gains for a specific month', () => {
    const result = calculateTotalGainLoss(sampleTrades, '1/2024');
    expect(result).toEqual({
      long_term_profit: 250,
      short_term_profit: 0
    });
  });

  it('handle months with no trades', () => {
    const result = calculateTotalGainLoss(sampleTrades, '12/2023');
    expect(result).toEqual({
      long_term_profit: 0,
      short_term_profit: 0
    });
  });

  it('handle multiple trades in the same month', () => {
    const multipleTradesMonth: ClosingTradeTy[] = [
      ...sampleTrades,
      {
        symbol: 'TSLA',
        buy_qty: 3,
        sell_qty: 3,
        buy_process_date: '6/1/2023',
        sell_process_date: '7/1/2023',
        buy_price: 100,
        sell_price: 90,
        profit: -30,
        profit_pct: -10
      }
    ];

    const result = calculateTotalGainLoss(multipleTradesMonth, '7/2023');
    expect(result).toEqual({
      long_term_profit: 0,
      short_term_profit: -110
    });
  });
});
