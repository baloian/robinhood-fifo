import ClosingTrade from '../src/closing-trade';
import { ClosingTradeTy, HoodTradeTy } from '../types';

describe('ClosingTrade', () => {
  // Sample test data
  const mockClosingTradeData = new ClosingTrade({
    symbol: 'AAPL',
    buy_qty: 10,
    sell_qty: 10,
    buy_process_date: '1/1/2024',
    sell_process_date: '2/1/2024',
    buy_price: 100,
    sell_price: 110,
    profit: 100,
    profit_pct: 10
  } as ClosingTradeTy);

  const mockBuyTrade: HoodTradeTy = {
    symbol: 'AAPL',
    quantity: 10,
    price: 100,
    process_date: '1/1/2024',
    activity_date: '1/1/2024',
    settle_date: '1/3/2024',
    description: 'Buy AAPL',
    trans_code: 'Buy',
    amount: 1000
  };

  const mockSellTrade: HoodTradeTy = {
    symbol: 'AAPL',
    quantity: 10,
    price: 110,
    process_date: '2/1/2024',
    activity_date: '2/1/2024', 
    settle_date: '2/3/2024',
    description: 'Sell AAPL',
    trans_code: 'Sell',
    amount: 1100
  };

  describe('constructor', () => {
    it('should create instance with correct properties', () => {
      const trade = new ClosingTrade(mockClosingTradeData);
      expect(trade).toEqual(mockClosingTradeData);
    });
  });

  describe('static init', () => {
    it('should create ClosingTrade instance from buy and sell trades', () => {
      const trade = ClosingTrade.init(mockBuyTrade, mockSellTrade);
      
      expect(trade.symbol).toBe('AAPL');
      expect(trade.buy_qty).toBe(10);
      expect(trade.sell_qty).toBe(10);
      expect(trade.buy_price).toBe(100);
      expect(trade.sell_price).toBe(110);
      expect(trade.buy_process_date).toBe('1/1/2024');
      expect(trade.sell_process_date).toBe('2/1/2024');
      expect(trade.profit).toBe(100);
      expect(trade.profit_pct).toBeDefined();
    });
  });

  describe('instance methods', () => {
    let trade: ClosingTrade;

    beforeEach(() => {
      trade = new ClosingTrade(mockClosingTradeData);
    });

    it('getHoldingTimeMs should return correct time difference', () => {
      const expectedMs = new Date('2/1/2024').getTime() - new Date('1/1/2024').getTime();
      expect(trade.getHoldingTimeMs()).toBe(expectedMs);
    });

    it('getProfit should return profit value', () => {
      expect(trade.getProfit()).toBe(100);
    });

    it('getSymbol should return symbol', () => {
      expect(trade.getSymbol()).toBe('AAPL');
    });

    it('getInvestment should return initial investment amount', () => {
      expect(trade.getInvestment()).toBe(1000); // 100 * 10
    });

    it('getData should return the entire instance', () => {
      expect(trade.getData()).toEqual(mockClosingTradeData);
    });

    it('getProfitPct should return profit percentage', () => {
      expect(trade.getProfitPct()).toBe(10);
    });
  });
});
