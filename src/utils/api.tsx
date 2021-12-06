import dayjs from 'dayjs'

type RatioRecord = {
    pair: string,
    price: number,
    last_update: string
}


type PairHistoryData = {
    dates: string[]
    prices: string[]
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


export {fetchPairs, fetchPairHistory, searchPairs, getNFTAddresses};