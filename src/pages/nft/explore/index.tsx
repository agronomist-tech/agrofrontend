import React from 'react';
import {useStore, useUserNFTs} from "../../../utils/hooks";
import {useWallet} from "@solana/wallet-adapter-react";
import {Result, Col, Row} from "antd";
import {observer} from "mobx-react-lite";
import ListNFT from './tokens'


const ExplorePage = observer(() => {
    const store = useStore();
    const loading = useUserNFTs();
    const {connected} = useWallet();

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