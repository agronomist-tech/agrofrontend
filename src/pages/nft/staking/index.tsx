import React, {useEffect, useState} from 'react';
import {Result, Col, Row, Card, Tabs, Input, Button, Space, Statistic, List, Avatar, Skeleton} from "antd";
import {useStore} from "../../../utils/hooks";
import StakingClient from "../../../staking/client";
import {useAnchorWallet, useWallet, useConnection} from "@solana/wallet-adapter-react";
import dayjs from 'dayjs'
import duration from "dayjs/plugin/duration";
import {UserSettings} from "../../../staking/client";
import {
    Program,
    Provider,
    BN,
    web3,
} from '@project-serum/anchor'
import {convertLamports} from "../../../utils/solana";


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
    }, [])

    return (
        <Row justify={"space-between"}>
            <Statistic title="APY" value={"100%"}/>
            <Statistic title="Staked AGTE" loading={loading} value={staked.toNumber()}/>
        </Row>
    )
}


interface StakeI {
    client: StakingClient
}


const calculateReward = (amount: BN, lastRedeemDate: number, apy: number): number => {
    const lastRedeem = dayjs.unix(lastRedeemDate);
    const now = dayjs();

    const stakedHours = parseInt(dayjs.duration(now.diff(lastRedeem)).asHours().toFixed());
    console.log("Calculate reward ", lastRedeemDate, apy, amount, stakedHours);
    return apy / 8760 / 100. * amount.toNumber() * stakedHours / 1000000000;
}


const StakeForm = ({client}: StakeI) => {
    const store = useStore();

    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stakeAmount, setStakeAmount] = useState(0);
    const [userStaked, setUserStaked] = useState(new BN(0));
    const [userApy, setUserApy] = useState(0);
    const [userLastRedeemDate, setUserLastRedeemDate] = useState(0);
    const [userPendingRedeem, setPendingRedeem] = useState(0);
    const [userReward, setUserReward] = useState(0);

    useEffect(() => {
        client.userApproved().then((res: UserSettings | boolean) => {
            if (typeof res === "boolean"){
                setApproved(res);
            } else {
                setApproved(true);
                setUserApy(res.apy);
                setUserLastRedeemDate(res.lastRedeemDate);
                setPendingRedeem(res.pendingRedeem);
                setUserStaked(res.staked);
            }
            setLoading(false)
        })
    }, [])

    const approveUser = () => {
        client.approveStake();
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
                                suffix={<Button disabled={!approved} type={"text"} onClick={setMaxAmount}>max</Button>}
                                disabled={!approved}
                            />
                        </Col>
                        <Col>
                            {approved ? <Button
                                    style={{width: "100px", marginLeft: "1rem"}}
                                    type={"primary"}
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
                                        actions={[
                                            <Button type={"primary"} onClick={client.unstake}>Unstake</Button>
                                        ]}
                                    >
                                        <List.Item.Meta title={"Staked"}/>
                                        <div>{`${convertLamports(userStaked)} AGTE`}</div>
                                    </List.Item>
                                    <List.Item
                                        actions={[<Button type={"primary"} onClick={client.redeem}>Redeem</Button>]}
                                    >
                                        <List.Item.Meta title={"Your reward"}/>
                                        <div>{`${calculateReward(userStaked, userLastRedeemDate, userApy).toFixed(9)} AGTE`}</div>
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
                                    <List.Item actions={[<Button type={"primary"}>Stake</Button>]}>
                                        <List.Item.Meta
                                            avatar={<Avatar shape={"square"} size={64}/>}
                                        />
                                    </List.Item>
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

    const client = new StakingClient(connection, anchorWallet);

    return <Col span={16} offset={4} style={{marginTop: "2rem"}}>
        <StakingStatistic client={client}/>
        <Row style={{marginTop: "2rem"}} justify={"center"}>
            {wallet.connected ? <StakeForm client={client}/> : <Result title="Please connect wallet before"/>}
        </Row>
    </Col>
}


export default StakingPage;