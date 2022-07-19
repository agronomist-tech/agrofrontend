import dayjs from 'dayjs'
import {BigNumber as BN} from 'bignumber.js';

type RatioRecord = {
    pair: string,
    price: number,
    last_update: string
}


type HistoryData = {
    dates: string[]
    prices: number[]
    decimal?: number
}

type SearchResult = {
    id: string
    type: string
    name: string
}

type LPoolInfo = {
    address: string
    baseCurrency: string
    baseValue: BN
    basePrice: BN
    baseDecimal: number
    quoteCurrency: string
    quoteValue: BN
    quotePrice: BN
    quoteDecimal: number
    lpValue: BN
    lpDecimal: number
    source: string
}


function fetchPairs(): Promise<RatioRecord[]> {
    return fetch('/api/allPairs').then((resp) => resp.json())
}

function fetchPairHistory(pair: string, activePeriod: string): Promise<HistoryData> {
    return fetch(`/api/getPrices?pair=${pair}&period=${activePeriod}`).then((resp) => {
        return resp.json().then((data: HistoryData) => {
            if (!data.prices || !data.dates) return {
                prices: [],
                dates: []
            }
            return {prices: data.prices, dates: data.dates.map((record: string) => dayjs(record).format())}
        })
    })
}

function makeSearchRequest(query: string): Promise<SearchResult[]> {
    return fetch(`/api/search?query=${query}`).then((resp) => resp.json())
}


function getNFTAddresses(): Promise<string[]> {
    return fetch('/api/listNFT').then(resp => resp.json())
}

// Liquidity Pools

function fetchLPoolsInfo(): Promise<LPoolInfo[]> {
    // @ts-ignore
    return fetch('/api/liquidity/list').then(resp => resp.json()).then(data => data.map(p => {
        const multiplier = Math.pow(10, 9)
        p.baseValue = new BN(p.baseValue).div(Math.pow(10, p.baseDecimal))
        p.quoteValue = new BN(p.quoteValue).div(Math.pow(10, p.quoteDecimal))
        p.basePrice = new BN(p.basePrice).div(multiplier);
        p.quotePrice = new BN(p.quotePrice).div(multiplier);
        p.lpValue = new BN(p.lpValue).div(Math.pow(10, p.lpDecimal));
        if (p.basePrice.toNumber() === 0 && p.quotePrice.toNumber() !== 0) {
            p.basePrice = p.quoteValue.multipliedBy(p.quotePrice).div(p.baseValue)
        } else if (p.quotePrice.toNumber() === 0 && p.basePrice.toNumber() !== 0) {
            p.quotePrice = p.baseValue.multipliedBy(p.basePrice).div(p.quoteValue)
        }
        return p
    }))
}


function fetchPoolHistory(pool: string, type: string, activePeriod: string): Promise<HistoryData> {
    return fetch(`/api/liquidity/chart?pool=${pool}&type=${type}&period=${activePeriod}`).then((resp) => {
        return resp.json().then((data: HistoryData) => {
            if (!data.prices || !data.dates) return {
                prices: [],
                dates: []
            }
            return {
                prices: data.prices.map((record: number) => {
                    const decimal = data.decimal? data.decimal: 9
                    return new BN(record).dividedBy(new BN(Math.pow(10, decimal))).toNumber()
                }),
                dates: data.dates.map((record: string) => dayjs(record).format())
            }
        })
    })
}


export {fetchPairs, fetchPairHistory, makeSearchRequest, getNFTAddresses, fetchLPoolsInfo, fetchPoolHistory};
export type {LPoolInfo, SearchResult};