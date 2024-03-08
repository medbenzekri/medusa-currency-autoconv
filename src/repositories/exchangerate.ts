import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { CurrencyExchangeRate } from "../models/exchangerates";

const CurrencyExchangeRateRepository = dataSource.getRepository(CurrencyExchangeRate);

export default CurrencyExchangeRateRepository;