# Alpaca Tax Calculator
This is a TypeScript library that provides functionality to calculate Alpaca trading tax based on FIFO using Alpaca `<YYYYMMDD>.json`
reports as inputs. We do this because Alpaca no longer supports FIFO.

## Install
```bash
npm install github:baloian/alpaca-fifo
```

## Setup
You need to set up environment variables by creating a `.env` file in the root directory and providing the following variables:
```bash
INPUTS=<input files absolute path>
OUTPUTS=<output absolute path>
```

## Usage
Create an `inputs` directory in the root directory and upload all the `<YYYYMMDD>.json` files without any modifications.
```typescript
import { AlpacaFIFO } from 'alpaca-fifo';

(async () => {
  await AlpacaFIFO.run();
})();
```

## Contributions
Contributions are welcome and can be made by submitting GitHub pull requests
to this repository. In general, the `MarCal` source code follows
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and the
rules specified in `.eslintrc.json` file.
