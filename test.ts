import { abort } from '@baloian/lib';
import { AlpacaTax } from './alpacatax';


/**
 * This is the main entry point to the entire project.
 */
(async () => {
  console.log(new Date(), 'Alpaca tax calculator started!');
  AlpacaTax.calculate();
})().catch(abort);
