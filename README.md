# Alpaca FIFO
This TypeScript library provides functionality to calculate [Alpaca Markets](https://alpaca.markets/)
trading gains or losses based on FIFO using Alpaca `<YYYYMMDD>.json` reports as inputs. We do this because
Alpaca no longer supports FIFO.

**IMPORTANT:** The `alpaca-fifo` project DOES NOT generate tax forms of any kind. It helps you calculate gains
and losses in FIFO mode for your taxes.


## Build
```bash
git clone git@github.com:baloian/alpaca-fifo.git
cd alpaca-fifo
npm install
```

## Setup
#### STEP 1:
Create two directories, one for input (e.g. `INPUTS`) and the other for outputs (e.g. `OUTPUTS`).

#### STEP 2:
Download all the Alpaca `<YYYYMMDD>.json` files from your account documents and place them in the `INPUTS` folder.
Please do not edit the filenames or their contents. Otherwise, the result will be incorrect.


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

## Output Results
If running the project went successfully, then in the `OUTPUTS` directory, you should see `alpaca-fifo-<YYYY>.csv`
and `alpaca-fees-<YYYY>.csv` files for each year. 


## Use as a Dependency Library
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
  const alpacaFIFO = new AlpacaFIFO();
  await alpacaFIFO.run({
    inputDirPath: '<absolute path of the directory>',
    outputDirPath: '<absolute path of the directory>'
  });
})();
```
The `run()` method takes an argument object with the following properties:
```typescript
{
  inputDirPath:  <string>,   // absolute path of the directory>',
  outputDirPath: <string>,   // <absolute path of the directory>'
  writeToFile:   <boolean>,  // True if you want to write data to a .csv file. Default is true
  callbackFn:    <function>  // Callback function. callback(txsData, feeData, year). Default is null
}
```

## Contributions
Contributions are welcome and can be made by submitting GitHub pull requests
to this repository. In general, the `MarCal` source code follows
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and the
rules specified in `.eslintrc.json` file.
