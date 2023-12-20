# Alpaca FIFO
This is a TypeScript library that provides functionality to calculate Alpaca trading gain or loss based on FIFO using Alpaca `<YYYYMMDD>.json`
reports as inputs. We do this because Alpaca no longer supports FIFO.

## Install
```bash
git clone git@github.com:baloian/alpaca-fifo.git
cd alpaca-fifo
npm install
```

## Setup
#### STEP 1:
Create two directories, one for input (e.g. `INPUTS`) and the other for outputs (e.g. `OUTPUTS`).

#### STEP 2:
Download all the Alpaca `<YYYYMMDD>.json` files from your account documents and place them in the `INPUTS` folder. Please do not edit
the filenames or their contents. Otherwise, the result will be incorrect.


#### STEP 3:
You need to set up environment variables by creating a `.env` file in the root directory and providing the following variables:
```bash
INPUTS=<absolute path of the inputs directory>
OUTPUTS=<Absolute path of the outputs directory>
```

## Run
In the root directory, execute the following command
```bash
npm run start
```


## Use as a Dependency library
You can use the project asa  dependency lib of your project.

#### Install
```bash
npm install github:baloian/alpaca-fifo
```

#### Usage
Create an `inputs` and `outputs` directories and upload all the `<YYYYMMDD>.json` files without any modifications in the `inputs` directory.
```typescript
import { AlpacaFIFO } from 'alpaca-fifo';

(async () => {
  const inputDirPath: string = '<absolute path of the directory>';
  const outputDirPath: string = '<absolute path of the directory>';

  await AlpacaFIFO.run(inputDirPath, outputDirPath);
})();
```

## Contributions
Contributions are welcome and can be made by submitting GitHub pull requests
to this repository. In general, the `MarCal` source code follows
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and the
rules specified in `.eslintrc.json` file.
