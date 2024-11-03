import { abort } from '@baloian/lib-ts';
import RobinhoodFIFO from './robinhood-fifo';


/**
 * This is the main entry point to the entire project.
 */
(async () => {
  const robinhoodFIFO = new RobinhoodFIFO();
  await robinhoodFIFO.run();
})().catch(abort);
