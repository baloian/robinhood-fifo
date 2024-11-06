import ClosingTrade from '../src/closing-trade';
import { HoodTradeTy } from '../types';


describe('ClosingTrade', () => {
  const buyTrade: HoodTradeTy = {
    symbol: 'AAPL',
    quantity: 10,
    price: 150.50,
    process_date: '1/15/2024',
    activity_date: '1/15/2024',
    settle_date: '1/17/2024',
    description: 'Buy AAPL',
    trans_code: 'Buy',
    amount: 1505.00
  };

  const sellTrade: HoodTradeTy = {
    symbol: 'AAPL', 
    quantity: 10,
    price: 165.75,
    process_date: '1/20/2024',
    activity_date: '1/20/2024',
    settle_date: '1/22/2024',
    description: 'Sell AAPL',
    trans_code: 'Sell',
    amount: 1657.50
  };

  const closingTrade = new ClosingTrade(buyTrade, sellTrade);

  test('constructor initializes properties correctly', () => {
    expect(closingTrade.symbol).toBe('AAPL');
    expect(closingTrade.buy_qty).toBe(10);
    expect(closingTrade.sell_qty).toBe(10);
    expect(closingTrade.buy_price).toBe(150.50);
    expect(closingTrade.sell_price).toBe(165.75);
    expect(closingTrade.buy_process_date).toBe('1/15/2024');
    expect(closingTrade.sell_process_date).toBe('1/20/2024');
    expect(closingTrade.profit).toBe(152.5); // (165.75 * 10) - (150.50 * 10)
    expect(closingTrade.profit_pct).toBeCloseTo(10.13, 2); // ((165.75 * 10) / (150.50 * 10) - 1) * 100
  });

  test('getHoldingTimeMs returns correct time difference', () => {
    const expectedMs = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    expect(closingTrade.getHoldingTimeMs()).toBe(expectedMs);
  });

  test('getProfit returns correct profit', () => {
    expect(closingTrade.getProfit()).toBe(152.5);
  });

  test('getSymbol returns correct symbol', () => {
    expect(closingTrade.getSymbol()).toBe('AAPL');
  });

  test('getInvestment returns correct investment amount', () => {
    expect(closingTrade.getInvestment()).toBe(1505); // 150.50 * 10
  });

  test('getData returns the entire object', () => {
    expect(closingTrade.getData()).toBe(closingTrade);
  });

  test('getProfitPct returns correct profit percentage', () => {
    expect(closingTrade.getProfitPct()).toBeCloseTo(10.13, 2);
  });
});
