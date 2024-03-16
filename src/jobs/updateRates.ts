import {  CurrencyService
    type ScheduledJobConfig, 
    type ScheduledJobArgs,
  }  from "@medusajs/medusa"
import CurrencyConverterService from "../services/currencyconverter"
import ExchangeRateService from "../services/exchangerate"

  export default async function handler({ 
    container, 
    data, 
    pluginOptions,
  }: ScheduledJobArgs) {
      const currencyconverterService = container.resolve<CurrencyConverterService>(
          "currencyconverterService"
          )
          const exchangeRateService = container.resolve<ExchangeRateService>(
              "exchangeRateService"
              )
              const currencyService = container.resolve<CurrencyService>(
                  "currencyService"
                  )
    
    const currencies = await Promise.all((pluginOptions.SupportedCurrencies as string[]).map(async (currency) => 
         await currencyService.retrieveByCode(currency)
    ));
    const buffer:number= pluginOptions.Buffer as number;
    const base_currency=await  currencyService.retrieveByCode((pluginOptions.BaseCurrency as any).code)
    const currenciesrates= await exchangeRateService.upsertRate( base_currency,currencies,buffer)
    await currencyconverterService.ConvertCurrencies(base_currency,currenciesrates)
  }
  
  export const config: ScheduledJobConfig = {
    name: "update-rates-once-a-day",
    schedule: "0 0 * * *",
    data: {},
  }