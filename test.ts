import { abort } from '@baloian/lib';
import { AlpacaTax } from './alpacatax';


/**
 * This is the main entry point to the entire project.
 */
(async () => {
  const dirPath = 'inputs';
  await AlpacaTax.calculate(dirPath);
})().catch(abort);
