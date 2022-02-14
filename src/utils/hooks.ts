import {useContext, useEffect, useState} from 'react';
import {Store} from "../App";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {getNFTsInWallet} from "./solana";
import {getOurNFT} from "./metaplex";


const useStore = ()=>{
    return useContext(Store);
}


const useUserNFTs = (): boolean => {
    const store = useStore();
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const [loading, setLoading] = useState(true);

    useEffect(()=>store.nft.saveNFTMint(), [store.nft])

    useEffect(() => {
        if (publicKey && loading) {
            getNFTsInWallet(connection, publicKey).then((data) => {
                store.nft.saveUserNFTs(getOurNFT(store.nft.addresses, data));
                setLoading(false);
            })
        }
    }, [publicKey, connection, store.nft.addresses, store.nft, loading])

    return loading
}

export {useStore, useUserNFTs}