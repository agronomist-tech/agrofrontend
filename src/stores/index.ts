import { makeAutoObservable, runInAction, action } from 'mobx';
import {searchPairs} from "../utils/api";
import {setURLPair} from "../utils/urls";
import NFTStore from "./nft";

class RootStore {
    nft: NFTStore;
    searchItems: string[] = [];
    searchItem: string | undefined = undefined;

    constructor() {
        makeAutoObservable(this, {
            search: action.bound,
            setSearchItem: action.bound
        });
        this.nft = new NFTStore(this);
    }

    async search(query: string){
        const items = await searchPairs(query);
        runInAction(()=>this.searchItems=items);
    }

    setSearchItem(item: string | undefined){
        this.searchItem = item;
        const pair = item || '';
        setURLPair(pair);
    }
}

export default new RootStore();
export {RootStore}