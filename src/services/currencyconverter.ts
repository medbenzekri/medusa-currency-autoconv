import { ProductVariantService, TransactionBaseService, Logger ,Currency } from "@medusajs/medusa";
import { MoneyAmountRepository } from "@medusajs/medusa/dist/repositories/money-amount";
import {CurrencyExchangeRate} from "../models/exchangerates"
import { EntityManager } from "typeorm";

type InjectedDependencies = {

    productVariantService: typeof ProductVariantService;
};

class CurrencyConverterService extends TransactionBaseService {
    protected moneyAmountRepository_: typeof MoneyAmountRepository;
    protected productVariantService_: ProductVariantService;
    protected logger: Logger;



    constructor(container) {
        super(container);
        this.productVariantService_ = container.productVariantService;
        this.moneyAmountRepository_ = container.moneyAmountRepository;
        this.logger = container.logger;
    }


    async ConvertCurrency(base_currency:Currency, dest_currency:Partial<CurrencyExchangeRate>) {

        const productVariants = await this.productVariantService_.list({}, { relations: ["prices"], select: ["prices"] });
        return await this.atomicPhase_(
            async (transactionManager: EntityManager) => {
                productVariants.map(async (Variant) => {
                    const productVariant = await this.productVariantService_.retrieve(Variant.id, { relations: ["prices"] })
                    this.logger.info(`Converting price of product variant with id ${productVariant.id} from ${base_currency.code} to ${dest_currency.currency.code}`);
                    const base_price_index = productVariant.prices?.findIndex((price) => price.currency_code === base_currency.code);
                    const dest_price_index = productVariant.prices?.findIndex((price) => price.currency_code === dest_currency.currency.code);
                    this.logger.info(`base_price_index: ${base_price_index}`);
                    this.logger.info(`dest_price_index: ${dest_price_index}`);
                    if (base_price_index >= 0 && dest_price_index < 0) {
                        this.logger.info(`we are in`);
                        const base_price = productVariant.prices[base_price_index].amount;
                        const dest_price_amount = Math.ceil(base_price * dest_currency.rate);

                        await this.productVariantService_.upsertCurrencyPrices([
                            {
                                variantId: productVariant.id,
                                price: {
                                    amount: dest_price_amount,
                                    currency_code: dest_currency.currency.code,
                                }
                            }]
                        );

                        this.logger.info(`Price of product variant with id ${productVariant.id} has been converted from ${base_currency.code} to ${dest_currency.currency.code}`);
                    }
                });
            }
        );

    }
    async ConvertCurrencies(base:Currency,currencies:Partial<CurrencyExchangeRate>[]) {
        currencies.map(async (currency)=> {
            await this.ConvertCurrency(base, currency);
        });

    }


}

export default CurrencyConverterService;