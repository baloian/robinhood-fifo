import { abort } from '@baloian/lib';
import { AlpacaFIFO } from './alpacafifo';


/**
 * This is the main entry point to the entire project.
 */
(async () => {
  const alpacaFIFO = new AlpacaFIFO();
  await alpacaFIFO.run();
})().catch(abort);
