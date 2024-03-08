



export function safeRate(rate:number, buffer:number ):number{
    return rate * (1 + buffer);
}