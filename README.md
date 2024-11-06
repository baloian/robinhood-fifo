# Robinhood Gain/Loss Calculator
This TypeScript library provides functionality to calculate [Robinhood](https://robinhood.com/)
trading gains or losses using reports as input. We do this because Robinhood does not provide
gains and losses in the monthly statements.

**IMPORTANT:** The `robinhood-fifo` project DOES NOT generate tax forms of any kind. It helps you calculate gains
and losses.


## Build
```bash
git clone git@github.com:baloian/robinhood-fifo.git
cd robinhood-fifo
npm install
```


## Setup
Do the following two steps:
1. Generate your individual report in your Robinhood account and download the generated `.csv` file(s).
2. Create an `input` directory in the project's root directory and place the downloaded `.csv` file(s) inside it.


## Run
In the root directory, execute the following command
```bash
npm run start
```


## Contributions
Contributions are welcome and can be made by submitting GitHub pull requests
to this repository. In general, the project source code follows
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and the
rules specified in `.eslintrc.json` file.


## License
This source code is available to everyone under the standard
[MIT LICENSE](https://github.com/baloian/alpaca-fifo/blob/master/LICENSE).
