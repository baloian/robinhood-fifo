import { sortMonthsAndYears } from '../utils';


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

