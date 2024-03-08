import { TransactionBaseService, Currency, Logger } from "@medusajs/medusa";
import CurrencyExchangeRateRepository from "../repositories/exchangerate";
import { CurrencyExchangeRate } from "../models/exchangerates";
import FreeCurrencyApi from "@everapi//freecurrencyapi-js";
import {safeRate} from "../helpers/rate";
import { In } from 'typeorm';



class ExchangeRateService extends TransactionBaseService {
    private logger: Logger;
    private api: FreeCurrencyApi;
    private apiKey: string;
    private currencyExchangeRateRepository: typeof CurrencyExchangeRateRepository;

    constructor(container, options) {
        super(container);
        this.logger = container.logger;
        this.apiKey = options.apiKey;
        this.api = new FreeCurrencyApi(this.apiKey);
        this.currencyExchangeRateRepository = container.currencyExchangeRateRepository;
    }
    /**
    * @deprecated This method is deprecated, use `upsertRate` instead.
    */
    async createRate(baseCurrency: Currency, targetCurrency: Currency): Promise<void> {
        try {
            const response = await this.api.latest(baseCurrency, [targetCurrency]);
            const rate = response.data[targetCurrency];
            this.currencyExchangeRateRepository.create({ currency: targetCurrency, rate });
        } catch (error) {
            this.logger.error('Failed to create exchange rate:', error);
            throw error;
        }
    }


    async upsertRate(baseCurrency: Currency,  targetCurrencies: Currency[],buffer: number = 0.05): Promise<Partial<CurrencyExchangeRate>[]> {
        try {
            const currentRates = await this.currencyExchangeRateRepository.find({ where: { currency: In(targetCurrencies) } });
            const ratesToUpdate = currentRates.filter((rate) => {
                const isexpired = new Date(rate.expires_at).getTime() - new Date().getTime() < 0
                return isexpired;
            });
            const ratesToCreate = targetCurrencies.filter((currency) => {
                return !currentRates.some((rate) => rate.currency === currency);
            });

            const currenciresToUpdate = ratesToUpdate.map((rate) => rate.currency.code);
            currenciresToUpdate.push(...ratesToCreate.map((rate) => rate.code));
            const response = await this.api.latest(baseCurrency, currenciresToUpdate);
            const rates = Object.entries(response.data).map(([currency, rate]) => {
                return {
                    currency: targetCurrencies.find((targetCurrency) => targetCurrency.code === currency)
                    , rate: safeRate(Number(rate), buffer)
                };
            });
            await this.currencyExchangeRateRepository.save(rates);
            return rates;
        } catch (error) {
            this.logger.error('Failed to update exchange rate:', error);
            throw error;
        }
    }
}

export default ExchangeRateService;