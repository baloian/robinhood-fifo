import { getTotalQty } from '../src/utils';
import { HoodTradeTy } from '../types';

describe('getTotalQty', () => {
  // Empty array case
  test('return 0 for empty array', () => {
    const items: HoodTradeTy[] = [];
    expect(getTotalQty(items)).toBe(0);
  });

  // Single item case
  test('return correct quantity for single item', () => {
    const items: HoodTradeTy[] = [
      { qty: 10, symbol: 'AAPL' } as unknown as HoodTradeTy
    ];
    expect(getTotalQty(items)).toBe(10);
  });

  // Multiple items case
  test('sum quantities correctly for multiple items', () => {
    const items: HoodTradeTy[] = [
      { qty: 5, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 3, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 2, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(10);
  });

  // Zero quantity items
  test('handle zero quantity items', () => {
    const items: HoodTradeTy[] = [
      { qty: 0, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 0, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(0);
  });

  // Large numbers
  test('should handle large quantities', () => {
    const items: HoodTradeTy[] = [
      { qty: 1000000, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 2000000, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(3000000);
  });

  // Null/undefined quantity cases
  test('handle null quantities by treating them as 0', () => {
    const items: HoodTradeTy[] = [
      { qty: null, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 5, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(5);
  });

  test('handle undefined quantities by treating them as 0', () => {
    const items: HoodTradeTy[] = [
      { qty: undefined, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 3, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(3);
  });

  test('handle mix of null and undefined quantities', () => {
    const items: HoodTradeTy[] = [
      { qty: null, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: undefined, symbol: 'AAPL' } as unknown as HoodTradeTy,
      { qty: 2, symbol: 'AAPL' } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(items)).toBe(2);
  });
});

