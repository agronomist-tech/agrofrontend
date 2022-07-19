import React, {useEffect, useState, Dispatch, SetStateAction} from 'react';
import {
    Result,
    Col,
    Row,
    Input,
    Button,
    Statistic,
    List,
    Avatar,
    Skeleton,
    message
} from "antd";
import {useStore, useUserNFTs} from "../../../utils/hooks";
import StakingClient from "../../../staking/client";
import {useAnchorWallet, useWallet, useConnection} from "@solana/wallet-adapter-react";
import dayjs from 'dayjs'
import duration from "dayjs/plugin/duration";
import {UserSettings} from "../../../staking/client";
import {
    BN
} from '@project-serum/anchor'
import {convertLamports, waitTxFinish} from "../../../utils/solana";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {getNFTMetadata} from "../../../utils/metaplex";
import {useQueries} from "react-query";
import {MetadataData} from "@metaplex/js/lib/programs/metadata";


dayjs.extend(duration);


interface StatisticI {
    client: StakingClient
}


const StakingStatistic = ({client}: StatisticI) => {
    const [staked, setStaked] = useState(new BN(0));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.getStakedAmount().then((amount: BN) => {
            setStaked(amount);
            setLoading(false);
        })
    })

    return (
        <Row justify={"space-between"}>
            <Statistic title="APY" value={"100%"}/>
            <Statistic title="Staked AGTE" loading={loading} value={staked.toNumber()}/>
        </Row>
    )
}


interface StakedNFTI {
    mint: string
    image: string
    stakeAction: (mint: string) => void
    staked: boolean
}


const StakedNFT = ({mint, image, stakeAction, staked}: StakedNFTI) => {
    return <List.Item
        actions={[
            <Button type={"primary"} onClick={() => stakeAction(mint)}>{staked ? "Unstake" : "Stake"}</Button>
        ]}>
        <List.Item.Meta
            avatar={<Avatar shape={"square"} src={image} size={64}/>}
        />
    </List.Item>
}


interface NFTSectionI {
    tokens: { [key: string]: number }
    stakeAction: (mint: string) => void
    unstakeAction: (mint: string) => void
}


const NFTSection = ({tokens, stakeAction, unstakeAction}: NFTSectionI) => {
    const {connection} = useConnection();

    const queries = Object.keys(tokens).map((token) => {
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

        return {
            queryKey: [d.mint, d.data.uri],
            queryFn: () => fetch(d.data.uri).then((resp) => {
                return resp.json()
            }).then((data) => {
                const staked = tokens[d.mint];
                return <StakedNFT
                    key={d.mint}
                    mint={d.mint}
                    // @ts-ignore
                    image={data.image}
                    // @ts-ignore
                    stakeAction={staked ? unstakeAction : stakeAction} staked={staked}/>
            }),
            retryDelay: Math.random() * 10,
            cacheTime: Infinity,
            staleTime: Infinity,
        }
    }))

    return (
        <>
            {
                datas.map((r) => r.data)
            }
        </>
    )
}


interface StakeI {
    client: StakingClient
    reloading: boolean
    reloadPage: Dispatch<SetStateAction<boolean>>
}


const calculateReward = (amount: BN, lastRedeemDate: number, apy: number): number => {
    const lastRedeem = dayjs.unix(lastRedeemDate);
    const now = dayjs();

    const stakedHours = parseInt(dayjs.duration(now.diff(lastRedeem)).asHours().toFixed());

    return apy / 8760 / 100. * amount.toNumber() * stakedHours / 1000000000;
}


const StakeForm = ({client, reloading, reloadPage}: StakeI) => {
    const store = useStore();
    const {connection} = useConnection();

    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stakeAmount, setStakeAmount] = useState(0);
    const [userStaked, setUserStaked] = useState(new BN(0));
    const [userApy, setUserApy] = useState(0);
    const [userLastRedeemDate, setUserLastRedeemDate] = useState(0);
    const [userPendingRedeem, setPendingRedeem] = useState(0);
    const [userReward, setUserReward] = useState(0);

    const [userTokens, setUserTokens] = useState({} as { [key: string]: number })
    const nftLoading = useUserNFTs();

    useEffect(() => {
        client.userApproved().then((res: UserSettings | boolean) => {
            if (typeof res === "boolean") {
                setApproved(res);
            } else {
                setApproved(true);
                setUserApy(res.apy);
                setUserLastRedeemDate(res.lastRedeemDate);
                setPendingRedeem(res.pendingRedeem);
                setUserStaked(res.staked);
            }
            setLoading(false);
            reloadPage(false);
        })
    },// eslint-disable-next-line react-hooks/exhaustive-deps
        [reloading])

    useEffect(() => {
        const reward = calculateReward(userStaked, userLastRedeemDate, userApy) + userPendingRedeem
        setUserReward(reward);
    }, [userStaked, userLastRedeemDate, userApy, userPendingRedeem])

    useEffect(() => {
        if (!nftLoading) {
            store.nft.userNFTs.forEach((t) => {
                userTokens[t] = 0
            });

            client.getStakingATA().then((result) => {
                if (result) {
                    // @ts-ignore
                    result.value.forEach((v) => {
                        const mint = v.account.data.parsed.info.mint;
                        const value = v.account.data.parsed.info.tokenAmount.uiAmount;

                        if (value === 1) userTokens[mint] = 1;
                    })
                }
                setUserTokens(userTokens);
            })
        }

    }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [nftLoading])

    const approveUser = () => {
        client.approveStake().then((tx) => {
            if (tx) waitTxFinish(tx, connection, reloadPage);
        }).catch((err) => {
            message.info("Something went wrong :(")
        });
    }

    const stake = () => {
        client.stake(stakeAmount * LAMPORTS_PER_SOL).then((tx) => {
            if (tx) waitTxFinish(tx, connection, reloadPage);
        }).catch((err) => {
            message.info("Something went wrong :(")
        });
    }

    const stakeNFT = (mint: string) => {
        client.stakeNFT(mint).then((tx) => {
            if (tx) {
                waitTxFinish(tx, connection, reloadPage);
                userTokens[mint] = 1;
                setUserTokens(userTokens);
            }
        }).catch((err) => {
            message.info("Something went wrong :(");
            userTokens[mint] = 0;
            setUserTokens(userTokens);
        });
    }

    const unstakeNFT = (mint: string) => {
        client.unstakeNFT(mint).then((tx) => {
            if (tx) {
                waitTxFinish(tx, connection, reloadPage);
                userTokens[mint] = 0;
                setUserTokens(userTokens);
            }
        }).catch((err) => {
            message.info("Something went wrong :(");
            userTokens[mint] = 1;
            setUserTokens(userTokens);
        });
    }

    const unstake = () => {
        client.unstake().then((tx) => {
            if (tx) waitTxFinish(tx, connection, reloadPage);
        }).catch((err) => {
            message.info("Something went wrong :(")
        });
    }

    const redeem = () => {
        client.redeem().then((tx) => {
            if (tx) waitTxFinish(tx, connection, reloadPage);
        }).catch((err) => {
            message.info("Something went wrong :(")
        });
    }

    const setMaxAmount = () => {
        setStakeAmount(store.agteAmount);
    }

    return <Col span={24}>
        {
            loading ? <Skeleton active/> :
                <>
                    <Row justify={"space-between"}>
                        <Col span={16}>
                            <Input
                                defaultValue={0}
                                value={stakeAmount}
                                onChange={(amount) => setStakeAmount(parseInt(amount.target.value))}
                                suffix={<Button disabled={!approved} type={"text"} onClick={setMaxAmount}>max</Button>}
                                disabled={!approved}
                            />
                        </Col>
                        <Col>
                            {approved ? <Button
                                    style={{width: "100px", marginLeft: "1rem"}}
                                    type={"primary"}
                                    onClick={stake}
                                >Stake</Button> :
                                <Button
                                    style={{width: "100px", marginLeft: "1rem"}}
                                    type={"primary"}
                                    onClick={approveUser}
                                >Approve</Button>}
                        </Col>
                    </Row>
                    {
                        approved ? <>
                            <Row style={{marginTop: "2rem"}}>
                                <List style={{width: "100%"}}>
                                    <List.Item
                                    >
                                        <List.Item.Meta title={"Your APY"}/>
                                        <div>{`${userApy}%`}</div>
                                    </List.Item>
                                    <List.Item
                                    >
                                        <List.Item.Meta title={"Your AGTE balance"}/>
                                        <div>{`${store.agteAmount}`}</div>
                                    </List.Item>
                                    <List.Item
                                        actions={[
                                            <Button type={"primary"} onClick={unstake}>Unstake</Button>
                                        ]}
                                    >
                                        <List.Item.Meta title={"Staked"}/>
                                        <div>{`${convertLamports(userStaked)} AGTE`}</div>
                                    </List.Item>
                                    <List.Item
                                        actions={[<Button type={"primary"} onClick={redeem}>Redeem</Button>]}
                                    >
                                        <List.Item.Meta title={"Your reward"}/>
                                        <div>{`${userReward.toFixed(9)} AGTE`}</div>
                                    </List.Item>
                                    <NFTSection
                                        tokens={userTokens}
                                        stakeAction={stakeNFT}
                                        unstakeAction={unstakeNFT}
                                    />
                                </List>
                            </Row>
                        </> : <div style={{marginBottom: "4rem"}}></div>
                    }
                </>
        }
    </Col>
}

const StakingPage = () => {
    const anchorWallet = useAnchorWallet();
    const wallet = useWallet();
    const {connection} = useConnection();
    const [loading, setLoading] = useState(true);

    const client = new StakingClient(connection, anchorWallet);

    return <Col span={16} offset={4} style={{marginTop: "2rem"}}>
        <StakingStatistic client={client}/>
        <Row style={{marginTop: "2rem"}} justify={"center"}>
            {wallet.connected ? <StakeForm client={client} reloading={loading} reloadPage={setLoading}/> : <Result title="Please connect wallet before"/>}
        </Row>
    </Col>
}


export default StakingPage;