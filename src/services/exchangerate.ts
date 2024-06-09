import { TransactionBaseService, Currency, Logger } from "@medusajs/medusa";
import CurrencyExchangeRateRepository from "../repositories/currency-exchange-rate";
import ManualRateRepository from "../repositories/manual-rate";
import { CurrencyExchangeRate } from "../models/currency-exchange-rate";
import Freecurrencyapi from "../helpers/freecurrencyapi";
import {safeRate} from "../helpers/rate";
import { In } from 'typeorm';
import { PluginOptions } from "../types/types";



class ExchangeRateService extends TransactionBaseService {
    private logger: Logger;
    private api:  Freecurrencyapi;
    private apiKey: string;
    private currencyExchangeRateRepository: typeof CurrencyExchangeRateRepository;
    private manualRateRepository: typeof ManualRateRepository
    private pluginOptions : PluginOptions;
    private manualRates: Partial<CurrencyExchangeRate>[];

    constructor(container, pluginOptions) { 
        
        super(container);
        this.pluginOptions = pluginOptions;
        this.logger = container.logger;
        this.apiKey = this.pluginOptions.api_key;
        this.api = new Freecurrencyapi(this.apiKey);
        this.currencyExchangeRateRepository = container.currencyExchangeRateRepository;
        this.manualRateRepository =  container.manualRateRepository;
        this.manualRates = this.pluginOptions.manualRates;
    }
    /**
    * @deprecated This method is deprecated, use `upsertRate` instead.
    */
    async createRate(baseCurrency: Currency, targetCurrency: Currency): Promise<void> {
        try {
            const response = await this.api.latest({base_currency:  baseCurrency,currencies: [targetCurrency.code]});
            const rate = response.data[targetCurrency.code];
            this.currencyExchangeRateRepository.create({ currency: targetCurrency, rate });
        } catch (error) {
            this.logger.error('Failed to create exchange rate:', error);
            throw error;
        }
    }


    async upsertRate(baseCurrency: Currency,  targetCurrencies: Currency[],buffer: number = 0.05): Promise<Partial<CurrencyExchangeRate>[]|undefined> {
        try {
            const manualRates= await this.manualRateRepository.find();
            
            const updatedRates: Partial<CurrencyExchangeRate>[] = [];
            for (const manualRate of manualRates) {
                const existingRate = await this.currencyExchangeRateRepository.findOne({
                    where: { code: manualRate.code },
                });
                if (existingRate) {
                    existingRate.rate = manualRate.rate;
                    existingRate.expires_at = manualRate.expires_at;
                    await this.currencyExchangeRateRepository.save(existingRate);
                    updatedRates.push(existingRate);
                }
            }
    
            // Create new records for missing manual currencies
            const missingCurrencies = manualRates.filter(currency => !updatedRates.some(rate => rate.code === currency.code));
            const newRates = missingCurrencies.map(currency => {
                return this.currencyExchangeRateRepository.create({
                    code: currency.code,
                    rate: currency.rate,
                    expires_at: currency.expires_at
                });
            });
            const newres =await this.currencyExchangeRateRepository.save(newRates);



            const targetCurrenciesCodes = targetCurrencies.map((currency) => currency.code);
            const currentRates = await this.currencyExchangeRateRepository.find({ where: { code: In(targetCurrenciesCodes) }, relations: ["currency"]});
            const ratesToUpdate = currentRates.filter((rate) => {
                const isexpired = new Date(rate.expires_at).getTime() - new Date().getTime() < 0
                return isexpired;
            });
            const ratesToCreate = targetCurrencies.filter((currency) => {
                return ! currentRates.some((rate) => rate.currency.code === currency.code) ;
            });

            if(ratesToUpdate.length === 0 && ratesToCreate.length === 0) {
                return ;
            }
            const currenciresToUpdate = ratesToUpdate.map((rate) => rate.currency.code);
            currenciresToUpdate.push(...ratesToCreate.map((rate) => rate.code));
            const response = await this.api.latest({base_currency: baseCurrency.code,currencies: currenciresToUpdate});
            const rates = Object.entries(response.data).map(([currency, rate]) => {

                if(ratesToUpdate.some((rate) => rate.currency.code === currency.toLowerCase())) {
                    return {
                        currency: targetCurrencies.find((targetCurrency) => targetCurrency.code === currency.toLowerCase())
                        , rate: safeRate(Number(rate), buffer)
                        , id: ratesToUpdate.find((rate) => rate.currency.code === currency.toLowerCase()).id
                        ,expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 )
                    } as Partial<CurrencyExchangeRate>; 
                }
                return  this.currencyExchangeRateRepository.create( {
                    currency: targetCurrencies.find((targetCurrency) => targetCurrency.code === currency.toLowerCase())
                    , rate: safeRate(Number(rate), buffer)
                    ,expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 )

                });
            }) ;
            await this.currencyExchangeRateRepository.save(rates);

            return rates;
        } catch (error) {
            this.logger.error('Failed to update exchange rate:', error);
            throw error;
        }
    }
}

export default ExchangeRateService;