import React from "react";
import {Card, Skeleton, Tag, Result, Image} from "antd";
import {getNFTMetadata} from '../../../utils/metaplex'
import {useConnection} from "@solana/wallet-adapter-react";
import {useQueries} from "react-query";
import {MetadataData} from "@metaplex/js/lib/programs/metadata";

interface ListNFTProps {
    loading: boolean
    tokens: string[]
}

const ListNFT = (props: ListNFTProps) => {
    const {connection} = useConnection();
    const tokenItems = {} as [key: string];

    const queries = props.tokens.map((token) => {
        return {
            queryKey: [token],
            queryFn: () => getNFTMetadata(connection, token),
            retryDelay: Math.random() * 10,
            refetchInterval: false,
            cacheTime: Infinity,
            staleTime: Infinity,
            // @ts-ignore
            select: (data) => {
                return data.data
            }
        }
    })
    // @ts-ignore
    const metadatas = useQueries(queries)

    const datas = useQueries(metadatas.filter((resp) => {
        return resp.isSuccess && resp.data
    }).map((resp) => {
        const d = resp.data as MetadataData
        // @ts-ignore
        tokenItems[d.data.name] = <Card
            key={d.data.name}
            title={d.data.name}
            loading={true}
            style={{width: "250px", margin: "20px"}}/>
        return {
            queryKey: [d.mint, d.data.uri],
            queryFn: () => fetch(d.data.uri).then((resp) => resp.json()),
            retryDelay: Math.random() * 10,
            cacheTime: Infinity,
            staleTime: Infinity,
        }
    }))

    for (let i = 0; i < metadatas.length; i++) {
        datas.filter((resp) => resp.isSuccess && resp.data).forEach((resp) => {
            // @ts-ignore
            const attrs = resp.data.attributes.map((d) => <Tag color={"#69ba43"} key={d.trait_type}><strong>{d.trait_type}</strong>: {d.value}</Tag>)
            // @ts-ignore
            tokenItems[resp.data.name] =
                <Card
                    key={resp.data.name}
                    title={resp.data.name}
                    style={{width: "250px", margin: "20px"}}
                    // @ts-ignore
                    cover={<Image src={resp.data.image} />}
                ><Card.Meta description={attrs} /></Card>
        })
    }

    return (
        <>
            {
                props.loading ?
                    <Skeleton active/> :
                    Object.values(tokenItems).length > 0 ?
                        Object.values(tokenItems) :
                        <Result title="You don't have any Agronomist NFTs in wallet"/>
            }
        </>
    )
}

export default ListNFT;