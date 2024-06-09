import {  TransactionBaseService, Logger ,CurrencyService } from "@medusajs/medusa";
import ExchangeRateService from "./exchangerate";
import CurrencyConverterService from "./currencyconverter"
import { PluginOptions } from "../types/types";
import { CurrencyExchangeRate } from "../models/currency-exchange-rate";

export default class UpdateProductsPricesService extends TransactionBaseService {
    private currencyService: CurrencyService;
    private exchangeRateService: ExchangeRateService;
    private currencyconverterService: CurrencyConverterService;
    private logger: Logger;
    private pluginOptions : PluginOptions;
    
    constructor(container ,pluginOptions) {
        super(container);
        this.currencyService = container.currencyService;
        this.exchangeRateService = container.exchangerateService;
        this.currencyconverterService = container.currencyconverterService;
        this.logger = container.logger;
        this.pluginOptions= pluginOptions;

    }
    async updateProductsPrices() {
        const currencies = await Promise.all((this.pluginOptions.SupportedCurrencies ).map(async (currency) => 
        await this.currencyService.retrieveByCode(currency)
        ));
        const buffer:number= this.pluginOptions.Buffer;
        const base_currency=await  this.currencyService.retrieveByCode(this.pluginOptions.BaseCurrency )
        const currenciesrates= await this.exchangeRateService.upsertRate( base_currency,currencies,buffer)
        if (currenciesrates){
            await this.currencyconverterService.ConvertCurrencies(base_currency,currenciesrates)
        }
    }

}