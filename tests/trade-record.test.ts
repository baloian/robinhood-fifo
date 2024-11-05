import { HoodTradeTy } from '../types';
import { getTradeRecord } from '../src/utils';


describe('getTradeRecord', () => {
  it('calculate profit and profit percentage correctly for a profitable trade', () => {
    const buyTrade: HoodTradeTy = {
      activity_date: '01/01/2023',
      process_date: '01/01/2023',
      settle_date: '01/03/2023',
      symbol: 'AAPL',
      quantity: 10,
      price: 100,
      trans_code: 'Buy',
      amount: 1000,
      description: 'Buy AAPL'
    };

    const sellTrade: HoodTradeTy = {
      activity_date: '02/01/2023',
      process_date: '02/01/2023',
      settle_date: '02/03/2023',
      symbol: 'AAPL',
      quantity: 10,
      price: 150,
      trans_code: 'Sell',
      amount: 1500,
      description: 'Sell AAPL'
    };

    const result = getTradeRecord(buyTrade, sellTrade);

    expect(result).toEqual({
      symbol: 'AAPL',
      buy_qty: 10,
      sell_qty: 10,
      buy_process_date: '01/01/2023',
      sell_process_date: '02/01/2023',
      buy_price: 100,
      sell_price: 150,
      profit: 500,  // (150 * 10) - (100 * 10)
      profit_pct: 50 // ((1500 - 1000) / 1000) * 100
    });
  });

  it('calculate profit and profit percentage correctly for a losing trade', () => {
    const buyTrade: HoodTradeTy = {
      activity_date: '01/01/2023',
      process_date: '01/01/2023',
      settle_date: '01/03/2023',
      symbol: 'TSLA',
      quantity: 5,
      price: 200,
      trans_code: 'Buy',
      amount: 1000,
      description: 'Buy TSLA'
    };

    const sellTrade: HoodTradeTy = {
      activity_date: '02/01/2023',
      process_date: '02/01/2023',
      settle_date: '02/03/2023',
      symbol: 'TSLA',
      quantity: 5,
      price: 180,
      trans_code: 'Sell',
      amount: 900,
      description: 'Sell TSLA'
    };

    const result = getTradeRecord(buyTrade, sellTrade);

    expect(result).toEqual({
      symbol: 'TSLA',
      buy_qty: 5,
      sell_qty: 5,
      buy_process_date: '01/01/2023',
      sell_process_date: '02/01/2023',
      buy_price: 200,
      sell_price: 180,
      profit: -100,  // (180 * 5) - (200 * 5)
      profit_pct: -10 // ((900 - 1000) / 1000) * 100
    });
  });

  it('handle fractional shares correctly', () => {
    const buyTrade: HoodTradeTy = {
      activity_date: '01/01/2023',
      process_date: '01/01/2023',
      settle_date: '01/03/2023',
      symbol: 'BTC',
      quantity: 0.5,
      price: 1000,
      trans_code: 'Buy',
      amount: 500,
      description: 'Buy BTC'
    };

    const sellTrade: HoodTradeTy = {
      activity_date: '02/01/2023',
      process_date: '02/01/2023',
      settle_date: '02/03/2023',
      symbol: 'BTC',
      quantity: 0.5,
      price: 1200,
      trans_code: 'Sell',
      amount: 600,
      description: 'Sell BTC'
    };

    const result = getTradeRecord(buyTrade, sellTrade);

    expect(result).toEqual({
      symbol: 'BTC',
      buy_qty: 0.5,
      sell_qty: 0.5,
      buy_process_date: '01/01/2023',
      sell_process_date: '02/01/2023',
      buy_price: 1000,
      sell_price: 1200,
      profit: 100,  // (1200 * 0.5) - (1000 * 0.5)
      profit_pct: 20 // ((600 - 500) / 500) * 100
    });
  });
});
