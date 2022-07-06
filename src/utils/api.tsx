import dayjs from 'dayjs'
import {BigNumber as BN} from 'bignumber.js';

type RatioRecord = {
    pair: string,
    price: number,
    last_update: string
}


type PairHistoryData = {
    dates: string[]
    prices: string[]
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


function fetchPairs(): Promise<RatioRecord[]>{
    return fetch('/api/allPairs').then((resp)=>resp.json())
}

function fetchPairHistory(pair: string, activePeriod: string): Promise<PairHistoryData>{
    return fetch(`/api/getPrices?pair=${pair}&period=${activePeriod}`).then((resp) => {
        return resp.json().then((data: PairHistoryData)=>{
            return {prices: data.prices, dates: data.dates.map((record: string)=>dayjs(record).format())}
        })
    })
}

function searchPairs(query: string): Promise<string[]>{
    return fetch(`/api/searchPairs?query=${query}`).then((resp)=>resp.json())
}


function getNFTAddresses(): Promise<string[]>{
    return fetch('/api/listNFT').then(resp=>resp.json())
}


function fetchLPoolsInfo(): Promise<LPoolInfo[]>{
    // @ts-ignore
    return fetch('/api/liquidity/list').then(resp=>resp.json()).then(data => data.map(p=>{
        const multiplier = Math.pow(10, 9)
        p.baseValue = new BN(p.baseValue).div(Math.pow(10, p.baseDecimal))
        p.quoteValue = new BN(p.quoteValue).div(Math.pow(10, p.quoteDecimal))
        p.basePrice = new BN(p.basePrice).div(multiplier);
        p.quotePrice = new BN(p.quotePrice).div(multiplier);
        p.lpValue = new BN(p.lpValue).div(Math.pow(10, p.lpDecimal));
        if (p.basePrice.toNumber() === 0 && p.quotePrice.toNumber() !== 0){
            p.basePrice = p.quoteValue.multipliedBy(p.quotePrice).div(p.baseValue)
            console.log("Unknown basePrice ", p.baseCurrency, p.basePrice.toNumber())
        } else if (p.quotePrice.toNumber() === 0 && p.basePrice.toNumber() !== 0){
            p.quotePrice = p.baseValue.multipliedBy(p.basePrice).div(p.quoteValue)
        }
        return p
    }))
}


export {fetchPairs, fetchPairHistory, searchPairs, getNFTAddresses, fetchLPoolsInfo};
export type {LPoolInfo};