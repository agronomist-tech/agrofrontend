import {makeAutoObservable, runInAction, action} from 'mobx';
import {RootStore} from "./index";
import {getNFTAddresses} from "../utils/api";

class NFTStore {
    userNFTs: string[] = []
    addresses: string[] = []
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this, {
            saveUserNFTs: action.bound
        });
    }

    saveUserNFTs(nfts: string[]) {
        this.userNFTs = nfts
    }

    saveNFTMint() {
        runInAction(() => {
            getNFTAddresses().then((data)=>{
                this.addresses = data;
            })
        })
    }
}

export default NFTStore;