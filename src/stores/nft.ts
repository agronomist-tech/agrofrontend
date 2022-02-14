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
            this.addresses = [
                "3aMW3T8JHwm2b1KeEbqnr92cBZpN2aRSksKwBZR6Rtep",
                "CTL4GaeQCTuutXobLJ7mxjdfzMT9ABXbjBJQ8uadNror",
                "2Q2g96pAsrGJoAfHr6NgtCzk8Fa8zf3girizgFBw61Jq",
                "EQQZZmfmd44cvi9ZSdE85DigtEkUTPMAF2WARkKcsB2z"
            ]
            // getNFTAddresses().then((data)=>{
            //     this.addresses = data;
            // })
        })
    }
}

export default NFTStore;