import { z } from 'zod';

export default class Validator {
  static fileNames(fileNames: string[]): void {
    const invalidFileFormat: string = 'Invalid filename format. It must be YYYYMMDD.json';
    const yearErrorMsg = {message: `${invalidFileFormat}. Failed 2014 <= YYYY <= 2100 validation`};
    const monthErrorMsg = {message: `${invalidFileFormat}. Failed 1 <= MM <= 12 validation`};
    const dayErrorMsg = {message: `${invalidFileFormat}. Failed 1 <= DD <= 31 validation`};

    const filenameSchema = z.object({
      extension: z.string().length(4, {message: `${invalidFileFormat}`}),
      filename: z.string().regex(/^(?=.{8,8}$)([0-9]+)$/, {message: invalidFileFormat}),
      year: z.number().int().min(2014, yearErrorMsg).max(2100, yearErrorMsg),
      month: z.number().int().min(1, monthErrorMsg).max(12, monthErrorMsg),
      day: z.number().int().min(1, dayErrorMsg).max(31, dayErrorMsg)
    });

    for (const fn of fileNames) {
      const [name, extension] = fn.split('.');
      filenameSchema.parse({
        extension: extension,
        filename: name,
        year: Number(name.substring(0, 4)),
        month: Number(name.substring(4, 6)),
        day: Number(name.substring(6, 9))
      });
    }
  }
}