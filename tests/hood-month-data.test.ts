import { HoodMonthData } from '../src/hood-month-data';
import { HoodTradeTy } from '../types';

describe('HoodMonthData', () => {
  // Test data setup
  const sampleData: HoodTradeTy[] = [
    {
      process_date: '3/15/2024',
      activity_date: '3/15/2024',
      settle_date: '3/17/2024',
      symbol: 'AAPL',
      trans_code: 'Buy',
      quantity: 10,
      price: 150.00,
      amount: -1500.00,
      description: 'Market Buy'
    },
    {
      process_date: '3/16/2024',
      activity_date: '3/16/2024', 
      settle_date: '3/18/2024',
      symbol: 'GOOGL',
      trans_code: 'Sell',
      quantity: 5,
      price: 200.00,
      amount: 1000.00,
      description: 'Market Sell'
    },
    {
      process_date: '2/28/2024', // Previous month
      activity_date: '2/28/2024',
      settle_date: '3/1/2024',
      symbol: 'MSFT',
      trans_code: 'Buy',
      quantity: 8,
      price: 300.00,
      amount: -2400.00,
      description: 'Market Buy'
    }
  ];

  describe('constructor', () => {
    it('should create instance with valid month/year format', () => {
      expect(new HoodMonthData('3/2024', sampleData)).toBeTruthy();
      expect(new HoodMonthData('12/2024', sampleData)).toBeTruthy();
    });

    it('should throw error for invalid month/year formats', () => {
      const invalidFormats = [
        '13/2024',    // Invalid month
        '0/2024',     // Invalid month
        '1/24',       // Invalid year
        '1-2024',     // Wrong separator
        '01/2024',    // Leading zero
        'abc',        // Non-numeric
        ''            // Empty string
      ];

      invalidFormats.forEach(format => {
        expect(() => new HoodMonthData(format, sampleData)).toThrow();
      });
    });
  });

  describe('getBuySellTxs', () => {
    const instance = new HoodMonthData('3/2024', sampleData);

    it('should return only current month buy/sell transactions', () => {
      const txs = instance.getBuySellTxs();
      expect(txs).toHaveLength(2);
      expect(txs.map(tx => tx.symbol)).toEqual(['AAPL', 'GOOGL']);
    });

    it('should exclude transactions from other months', () => {
      const txs = instance.getBuySellTxs();
      expect(txs.find(tx => tx.symbol === 'MSFT')).toBeUndefined();
    });
  });

  describe('getMetadata', () => {
    const metadataTestData: HoodTradeTy[] = [
      {
        process_date: '3/15/2024',
        activity_date: '3/15/2024',
        settle_date: '3/17/2024',
        symbol: '',
        trans_code: 'GOLD',
        quantity: 0,
        price: 0,
        amount: -5.00,
        description: 'Gold subscription fee'
      },
      {
        process_date: '3/15/2024',
        activity_date: '3/15/2024',
        settle_date: '3/17/2024',
        symbol: 'AAPL',
        trans_code: 'CDIV',
        quantity: 0,
        price: 0,
        amount: 10.50,
        description: 'Dividend payment'
      },
      {
        process_date: '3/16/2024',
        activity_date: '3/16/2024',
        settle_date: '3/18/2024',
        symbol: '',
        trans_code: 'ACH',
        quantity: 0,
        price: 0,
        amount: 1000.00,
        description: 'ACH Deposit'
      },
      {
        process_date: '3/17/2024',
        activity_date: '3/17/2024',
        settle_date: '3/19/2024',
        symbol: '',
        trans_code: 'ACH',
        quantity: 0,
        price: 0,
        amount: -500.00,
        description: 'ACH Withdrawal'
      },
      {
        process_date: '2/28/2024', // Previous month - should be ignored
        activity_date: '2/28/2024',
        settle_date: '3/1/2024',
        symbol: '',
        trans_code: 'CDIV',
        quantity: 0,
        price: 0,
        amount: 15.00,
        description: 'Dividend payment'
      }
    ];

    const instance = new HoodMonthData('3/2024', metadataTestData);

    it('should correctly aggregate metadata for current month', () => {
      const metadata = instance.getMetadata();
      expect(metadata).toEqual({
        fees: -5.00,
        dividend: 10.50,
        deposit: 1000.00,
        withdrawal: -500.00,
        interest: 0,
        benefit: 0,
        acats: 0
      });
    });

    it('should handle multiple transactions of the same type', () => {
      const multipleData = [
        ...metadataTestData,
        {
          process_date: '3/18/2024',
          activity_date: '3/18/2024',
          settle_date: '3/20/2024',
          symbol: '',
          trans_code: 'GOLD',
          quantity: 0,
          price: 0,
          amount: -5.00,
          description: 'Another fee'
        }
      ];
      const instanceWithMultiple = new HoodMonthData('3/2024', multipleData);
      const metadata = instanceWithMultiple.getMetadata();
      expect(metadata.fees).toBe(-10.00);
    });
  });
});