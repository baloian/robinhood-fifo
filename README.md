# Alpaca Tax Calculator
This is a TypeScript library that provides functionality to calculate Alpaca trading tax based on FIFO using Alpaca `<YYYYMMDD>.json`
reports as inputs. We do this because Alpaca no longer supports FIFO.

## Install
```bash
npm install github:baloian/alpaca-tax
```

## Usage
Create an `inputs` directory in the root directory and upload all the `<YYYYMMDD>.json` files without any modifications.
```typescript
import { AlpacaTax } from 'alpaca-tax';

(async () => {
  await AlpacaTax.calculate();
})();
```

## Contributions
Contributions are welcome and can be made by submitting GitHub pull requests
to this repository. In general, the `MarCal` source code follows
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and the
rules specified in `.eslintrc.json` file.
