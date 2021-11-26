import { makeAutoObservable, runInAction, action } from 'mobx';
import {searchPairs} from "../utils/api";

class RootStore {
    searchItems: string[] = [];
    searchItem: string | undefined = undefined;

    constructor() {
        makeAutoObservable(this, {
            search: action.bound,
            setSearchItem: action.bound
        });
    }

    async search(query: string){
        const items = await searchPairs(query);
        runInAction(()=>this.searchItems=items);
    }

    setSearchItem(item: string | undefined){
        this.searchItem = item;
    }
}

export default new RootStore();
export {RootStore}