import { getMonthYearData } from '../utils';
import { HoodTradeTy } from '../types';


describe('getMonthYearData', () => {
  const mockTrades: HoodTradeTy[] = [
    {
      activity_date: '1/15/2024',
      process_date: '1/15/2024',
      settle_date: '1/17/2024',
      symbol: 'AAPL',
      quantity: 10,
      price: 100,
      amount: 1000,
      trans_code: 'Buy',
      description: 'Buy AAPL'
    },
    {
      activity_date: '2/20/2024',
      process_date: '2/20/2024',
      settle_date: '2/22/2024',
      symbol: 'GOOGL',
      quantity: 5,
      price: 200,
      amount: 1000,
      trans_code: 'Buy',
      description: 'Buy GOOGL'
    },
    {
      activity_date: '1/25/2024',
      process_date: '1/25/2024',
      settle_date: '1/27/2024',
      symbol: 'MSFT',
      quantity: 8,
      price: 150,
      amount: 1200,
      trans_code: 'Buy',
      description: 'Buy MSFT'
    }
  ];

  it('group trades by month/year and include all previous months', () => {
    const result = getMonthYearData(mockTrades);
    
    // Check if keys are correct
    expect(Object.keys(result).sort()).toEqual(['1/2024', '2/2024']);
    
    // January should have all January trades
    expect(result['1/2024']).toHaveLength(2);
    expect(result['1/2024']).toContainEqual(expect.objectContaining({
      process_date: '1/15/2024',
      symbol: 'AAPL'
    }));
    expect(result['1/2024']).toContainEqual(expect.objectContaining({
      process_date: '1/25/2024', 
      symbol: 'MSFT'
    }));
    
    // February should have all trades (January + February)
    expect(result['2/2024']).toHaveLength(3);
    expect(result['2/2024']).toContainEqual(expect.objectContaining({
      process_date: '1/15/2024',
      symbol: 'AAPL'
    }));
    expect(result['2/2024']).toContainEqual(expect.objectContaining({
      process_date: '1/25/2024',
      symbol: 'MSFT'  
    }));
    expect(result['2/2024']).toContainEqual(expect.objectContaining({
      process_date: '2/20/2024',
      symbol: 'GOOGL'
    }));
  });

  it('return empty object for empty input', () => {
    const result = getMonthYearData([]);
    expect(result).toEqual({});
  });

  it('handle single trade', () => {
    const singleTrade: HoodTradeTy[] = [{
      activity_date: '3/1/2024',
      process_date: '3/1/2024',
      settle_date: '3/3/2024',
      symbol: 'TSLA',
      quantity: 1,
      price: 500,
      amount: 500,
      trans_code: 'Buy',
      description: 'Buy TSLA'
    }];

    const result = getMonthYearData(singleTrade);
    expect(Object.keys(result)).toEqual(['3/2024']);
    expect(result['3/2024']).toHaveLength(1);
    expect(result['3/2024'][0]).toEqual(singleTrade[0]);
  });
});
