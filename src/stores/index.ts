import { makeAutoObservable, runInAction, action } from 'mobx';
import {searchPairs} from "../utils/api";
import NFTStore from "./nft";

class RootStore {
    nft: NFTStore;
    searchItems: string[] = [];
    searchItem: string | null = null;
    agteAmount: number = 0;

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

    setSearchItem(item: string | null){
        this.searchItem = item;
    }

    setAgteAmount(amount: number) {
        this.agteAmount = amount;
    }
}

export default new RootStore();
export {RootStore}