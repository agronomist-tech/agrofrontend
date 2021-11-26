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
    return fetch(`/api/getPrices?pair=${pair}&period=${activePeriod}`).then((resp) => resp.json())
}

function searchPairs(query: string): Promise<string[]>{
    return fetch(`/api/searchPairs?query=${query}`).then((resp)=>resp.json())
}


export {fetchPairs, fetchPairHistory, searchPairs};