import React, {useEffect, useState} from 'react';
import {Col, Row, Table, Popover, Avatar, List, Radio} from 'antd';
import {useQuery} from "react-query";
import {observer} from "mobx-react-lite";
import {useStore} from "../../utils/hooks";
import {fetchLPoolsInfo, LPoolInfo} from "../../utils/api";
import {BigNumber as BN} from 'bignumber.js';
import {useSearchParams} from "react-router-dom";


const columns = [
    {
        title: "",
        key: "provider",
        dataIndex: "source",
        filters: [
            {
                text: "Raydium",
                value: "raydium"
            },
            {
                text: "ORCA",
                value: "orca"
            }],
        render: (text: string) => {
            if (text === "raydium") {
                return <Avatar
                    size={"small"}
                    src={process.env.PUBLIC_URL + `/tokens/ray.png`}/>
            }
        }
    },
    {
        title: "Coins",
        key: "coins",
        dataIndex: ["baseCurrency", "quoteCurrency"],
        render: (text: any, record: LPoolInfo) => {
            return <List size="small" bordered={false}>
                <List.Item>
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${record.baseCurrency}.png`}/> {record.baseCurrency}
                </List.Item>
                <List.Item>
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${record.quoteCurrency}.png`}/> {record.quoteCurrency}
                </List.Item>
            </List>
        }
    },
    {
        title: "Coins value",
        key: "coinsValue",
        dataIndex: "coinsValue",
        render: (text: any, record: LPoolInfo) => {
            return <List size="small" bordered={false}>
                <List.Item key="baseValue">{record.baseValue.toFormat(2)}</List.Item>
                <List.Item key="quoteValue">{record.quoteValue.toFormat(2)}</List.Item>
            </List>
        }
    },
    {
        title: "Coins cost",
        key: "coinsCost",
        dataIndex: "coinsCost",
        render: (text: any, record: LPoolInfo) => {
            const cost = <div>
                <p key={"baseValueCost"}>{`${record.baseCurrency}: ${record.basePrice.toFormat(9)}$`}</p>
                <p key={"quoteValueCost"}>{`${record.quoteCurrency}: ${record.quotePrice.toFormat(9)}$`}</p>
            </div>

            return <Popover title="Price" content={cost}>
                <List size="small" bordered={false}>
                    <List.Item
                        key={"baseValue"}>{record.baseValue.multipliedBy(record.basePrice).toFormat(2)} $</List.Item>
                    <List.Item
                        key={"quoteValue"}>{record.quoteValue.multipliedBy(record.quotePrice).toFormat(2)} $</List.Item>
                </List>
            </Popover>
        }
    },
    {
        title: "Liquidity value",
        key: "liquidityValue",
        dataIndex: "lpValue",
        sorter: (a: LPoolInfo, b: LPoolInfo): number => {
            return a.lpValue.minus(b.lpValue).toNumber()
        },
        render: (text: string, record: LPoolInfo) => {
            return record.lpValue.toFormat(2)
        }
    },
    {
        title: "Liquidity cost",
        key: "liquidityCost",
        sorter: (a: LPoolInfo, b: LPoolInfo): number => {
            const aLiq = a.baseValue.multipliedBy(a.basePrice).plus(a.quoteValue.multipliedBy(a.quotePrice))
            const bLiq = b.baseValue.multipliedBy(b.basePrice).plus(b.quoteValue.multipliedBy(b.quotePrice))
            return aLiq.minus(bLiq).toNumber()

        },
        render: (text: any, record: LPoolInfo) => {
            return `${record.baseValue.multipliedBy(record.basePrice).plus(record.quoteValue.multipliedBy(record.quotePrice)).toFormat(2)} $`
        }
    },
    {
        title: "Pool ratio",
        key: "poolRatio",
        render: (text: any, record: any) => {
            const baseCost = record.baseValue.multipliedBy(record.basePrice);
            const quoteCost = record.quoteValue.multipliedBy(record.quotePrice);

            const amount = baseCost.plus(quoteCost)
            const firstCoin = baseCost.div(amount).multipliedBy(100)
            const secondCoin = quoteCost.div(amount).multipliedBy(100)

            return <List size="small" bordered={false}>
                <List.Item key="baseAvatar">
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${record.baseCurrency}.png`}/> {firstCoin.toFixed(2)}%
                </List.Item>
                <List.Item key="quoteAvatar">
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${record.quoteCurrency}.png`}/> {secondCoin.toFixed(2)}%
                </List.Item>
            </List>
        }
    }
]


interface PoolChartProps {
    baseToken: string
    quoteToken: string
    source: string
}


const PoolChart = observer((props: PoolChartProps) => {
    const [activeChart, setActiveChart] = useState("")

    useEffect(()=>setActiveChart(props.baseToken), [props.baseToken])

    let sourceIcon = "ray";
    switch (props.source) {
        case "raydium":
            sourceIcon = "ray"
    }

    const source = <Avatar.Group maxCount={1} size={24}>
        <Avatar
            size={24}
            src={process.env.PUBLIC_URL + `/tokens/${sourceIcon}.png`}/>
    </Avatar.Group>

    return <React.Fragment>
        <Row className="pair-title">
            <Col span={18}>
                <div>
                    {source}
                    <Avatar.Group maxCount={2} size={24} style={{marginRight: "8px"}}>
                        <Avatar
                            src={process.env.PUBLIC_URL + `/tokens/${props.baseToken}.png`}/>
                        <Avatar
                            src={process.env.PUBLIC_URL + `/tokens/${props.quoteToken}.png`}/>
                    </Avatar.Group>
                </div>
            </Col>
            <Col span={6} style={{textAlign: "right", paddingRight: "1rem"}}>
                <Radio.Group value={activeChart} onChange={(e) => {
                    setActiveChart(e.target.value)
                }}>
                    <Radio.Button value={props.baseToken}>{props.baseToken.toUpperCase()}</Radio.Button>
                    <Radio.Button value={props.quoteToken}>{props.quoteToken.toUpperCase()}</Radio.Button>
                    <Radio.Button value="liquidity">{"Liquidity"}</Radio.Button>
                </Radio.Group>
            </Col>
        </Row>
    </React.Fragment>
})


const PoolsPage = observer(() => {
    const {isLoading, data} = useQuery('lpools', fetchLPoolsInfo, {refetchInterval: 300000})
    const [activePool, setActivePool] = useState<LPoolInfo | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const store = useStore();

    const setActiveRow = (record: LPoolInfo | string) => {
        if (typeof record === "string") {
            const res = data?.filter(v => v.address === record)
            if (res) {
                record = res[0]
            } else {
                return
            }
        }
        if (activePool && activePool.address === record.address) {
            store.setSearchItem(null);
            setActivePool(null);
            setSearchParams({});
        } else {
            setActivePool(record);
            setSearchParams({pool: record.address});
        }
    }

    useEffect(() => {
        if (searchParams.has("pool")) {
            const p = searchParams.get("pool");
            if (p) setActiveRow(p)
        }
    }, [])

    return <>
        <Col>
            {activePool ? <PoolChart
                baseToken={activePool.baseCurrency}
                quoteToken={activePool.quoteCurrency}
                source={activePool.source}
            /> : <></>}
            <Row className="pairs-table">
                <Table
                    size={"small"}
                    loading={isLoading}
                    columns={columns}
                    dataSource={data}
                    rowClassName={(record: LPoolInfo): string => {
                        if (activePool && record.address === activePool.address) {
                            return "active-pair"
                        }
                        return ""
                    }}
                    onRow={(record) => {
                        return {
                            onClick: event => setActiveRow(record)
                        }
                    }}
                    style={{width: "100%"}}
                />
            </Row>
        </Col>
    </>
})


export default PoolsPage;