import {
  dateToMonthYear,
  sortMonthsAndYears
} from '../utils';


describe('sortMonthsAndYears', () => {
  test('sorts dates by year and then by month', () => {
    const dates = ['12/2022', '01/2023', '11/2022', '02/2023'];
    const sortedDates = sortMonthsAndYears(dates);
    expect(sortedDates).toEqual(['11/2022', '12/2022', '01/2023', '02/2023']);
  });

  test('sorts dates within the same year by month', () => {
    const dates = ['06/2022', '01/2022', '12/2022', '05/2022'];
    const sortedDates = sortMonthsAndYears(dates);
    expect(sortedDates).toEqual(['01/2022', '05/2022', '06/2022', '12/2022']);
  });

  test('handles single date array', () => {
    const dates = ['03/2022'];
    const sortedDates = sortMonthsAndYears(dates);
    expect(sortedDates).toEqual(['03/2022']);
  });

  test('handles empty array', () => {
    const dates: string[] = [];
    const sortedDates = sortMonthsAndYears(dates);
    expect(sortedDates).toEqual([]);
  });

  test('sorts dates when mixed across years and months', () => {
    const dates = ['01/2023', '12/2021', '03/2022', '07/2021', '10/2023'];
    const sortedDates = sortMonthsAndYears(dates);
    expect(sortedDates).toEqual(['07/2021', '12/2021', '03/2022', '01/2023', '10/2023']);
  });
});


describe('dateToMonthYear', () => {
  test('converts MM/DD/YYYY to MM/YYYY format', () => {
    expect(dateToMonthYear('05/15/2024')).toBe('05/2024');
    expect(dateToMonthYear('12/01/2023')).toBe('12/2023');
    expect(dateToMonthYear('01/31/2022')).toBe('01/2022');
  });

  test('handles single-digit months and days', () => {
    expect(dateToMonthYear('3/9/2021')).toBe('3/2021');
    expect(dateToMonthYear('6/1/2020')).toBe('6/2020');
  });

  test('returns correct format when input has extra spaces', () => {
    expect(dateToMonthYear(' 07/04/2022 ')).toBe('07/2022');
  });

  test('throws an error on invalid input format', () => {
    expect(() => dateToMonthYear('2024-05-15')).toThrow();
    expect(() => dateToMonthYear('May 15, 2024')).toThrow();
    expect(() => dateToMonthYear('05/2024')).toThrow();
  });
});