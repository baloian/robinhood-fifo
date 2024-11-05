import { getTotalQty } from '../src/utils';
import { HoodTradeTy } from '../types';

describe('getTotalQty', () => {
  it('return 0 for empty array', () => {
    expect(getTotalQty([])).toBe(0);
  });

  it('sum up quantities correctly', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 5 } as HoodTradeTy,
      { quantity: 3 } as HoodTradeTy,
      { quantity: 2 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(10);
  });

  it('handle undefined quantities', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 5 } as HoodTradeTy,
      { quantity: undefined } as unknown as HoodTradeTy,
      { quantity: 2 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(7);
  });

  it('handle array with all undefined quantities', () => {
    const trades: HoodTradeTy[] = [
      { quantity: undefined } as unknown as HoodTradeTy,
      { quantity: undefined } as unknown as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(0);
  });

  it('handle decimal quantities', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 5.5 } as HoodTradeTy,
      { quantity: 3.3 } as HoodTradeTy,
      { quantity: 2.2 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(11);
  });

  it('handle single item array', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 5 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(5);
  });

  it('handle zero quantities', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 0 } as HoodTradeTy,
      { quantity: 0 } as HoodTradeTy,
      { quantity: 0 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(0);
  });

  it('handle mix of zero and non-zero quantities', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 0 } as HoodTradeTy,
      { quantity: 5 } as HoodTradeTy,
      { quantity: 0 } as HoodTradeTy,
      { quantity: 3 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(8);
  });

  it('handle very large numbers', () => {
    const trades: HoodTradeTy[] = [
      { quantity: 1000000 } as HoodTradeTy,
      { quantity: 2000000 } as HoodTradeTy,
      { quantity: 3000000 } as HoodTradeTy,
    ];
    expect(getTotalQty(trades)).toBe(6000000);
  });
});
