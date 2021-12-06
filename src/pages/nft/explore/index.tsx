import React, {useEffect, useState} from 'react';
import {useStore} from "../../../utils/hooks";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Result, Col, Row} from "antd";
import {getNFTsInWallet} from "../../../utils/solana";
import {observer} from "mobx-react-lite";
import ListNFT from './tokens'



const getOurNFT = (mints: string[], users: string[]): string[] => {
    return users.filter((t) => mints.includes(t))
}


const ExplorePage = observer(() => {
    const store = useStore();
    const [loading, setLoading] = useState(true);
    const {connection} = useConnection();
    const {publicKey, connected} = useWallet();

    useEffect(() => {
        store.nft.saveNFTMint();
        if (publicKey) {
            getNFTsInWallet(connection, publicKey).then((data) => {
                store.nft.saveUserNFTs(getOurNFT(store.nft.addresses, data));
                setLoading(false);
            })
        }
    }, [publicKey])

    return (
        <>
            <Col>
                <Row justify={"center"}>
                    {connected ?
                        <ListNFT loading={loading} tokens={store.nft.userNFTs}/> :
                        <Result title="Please connect wallet before"/>
                    }
                </Row>
            </Col>
        </>
    )
})

export default ExplorePage