import React, {useEffect, useState} from 'react';
import {Col, Row, Table, Radio, Avatar} from 'antd';
import {useQuery} from "react-query";
import {observer} from "mobx-react-lite";
import dayjs from 'dayjs'
import {useSearchParams} from "react-router-dom";
import {fetchPairs, fetchPairHistory} from "../../utils/api";
import {RechartPairChart} from "../../components/charts";
import {useStore} from "../../utils/hooks";

const columns = [
    {
        title: "Pair",
        dataIndex: "pair",
        key: "pair",
        sorter: (a: Pair, b: Pair) => {
            return (a.pair > b.pair) ? 1 : -1
        },
        render: (text: string) => {
            const tokens = text.split("/")
            return <>
                <Avatar.Group maxCount={2} size={24} style={{marginRight: "8px"}}>
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${tokens[0]}.png`}/>
                    <Avatar
                        size={"small"}
                        src={process.env.PUBLIC_URL + `/tokens/${tokens[1]}.png`}/>
                </Avatar.Group>
                {text}
            </>
        }
    },
    {
        title: "Ratio",
        dataIndex: "ratio",
        key: "ratio",
        sorter: (a: Pair, b: Pair) => {
            return (a.ratio > b.ratio) ? 1 : -1
        }
    },
    {
        title: "Last price update",
        dataIndex: "lastUpdate",
        key: "update",
        sorter: (a: Pair, b: Pair) => {
            return (dayjs(a.lastUpdate) > dayjs(b.lastUpdate)) ? 1 : -1
        }
    }
]


type Pair = {
    pair: string,
    ratio: number,
    lastUpdate: string
}


const PairsPage = observer(() => {
    const {isLoading, data} = useQuery('todos', fetchPairs)
    const [activePeriod, setActivePeriod] = useState("24H");
    const [activePair, setActivePair] = useState("");
    let [searchParams, setSearchParams] = useSearchParams();

    const {
        isLoading: isHistoryLoading,
        data: historyData,
        refetch: refetchHistory
    } = useQuery(['pairData', activePair, activePeriod], () => fetchPairHistory(activePair, activePeriod), {enabled: false})
    const store = useStore();

    let pairsData: Pair[] = [];

    const setActiveClass = (record: Pair, index: number): string => {
        if (record.pair === searchParams.get("pair") || record.pair === store.searchItem) {
            return "active-pair"
        }
        return ""
    }

    const setActiveRow = (pair: string) => {
        if (searchParams.get("pair") === pair) {
            store.setSearchItem(null);
            setSearchParams({})
            setActivePair("");
        } else {
            setActivePair(pair);
            setSearchParams({pair: pair})
        }
    }

    // useEffect(()=>{
    //     // Manage new page open with search param
    //     const pair = searchParams.get("pair");
    //     if (pair){
    //         setActivePair(pair);
    //     }
    // }, [])

    useEffect(() => {
        const pair = searchParams.get('pair');
        if (pair != null) {
            setActivePair(pair);
        } else {
            setActivePair("");
        }
    }, [searchParams])

    useEffect(() => {
        if (searchParams.get("pair") || "") {
            refetchHistory();
        }
    }, [searchParams, activePair, activePeriod, refetchHistory])

    if (data) {
        pairsData = data.map((record) => {
            return {
                key: record.pair,
                pair: record.pair,
                ratio: Number(record.price),
                lastUpdate: dayjs(record.last_update).format('HH:mm D MMM')
            }
        })
        if (store.searchItem) {
            pairsData = pairsData.filter((v) => v.pair === store.searchItem)
        }
    }

    return (
        <>
            <Col>
                {activePair ?
                    <React.Fragment>
                        <Row className="pair-title">
                            <Col span={18}>
                                <div>
                                    <Avatar.Group maxCount={2} size={24} style={{marginRight: "8px"}}>
                                        <Avatar
                                            src={process.env.PUBLIC_URL + `/tokens/${activePair.split("/")[0]}.png`}/>
                                        <Avatar
                                            src={process.env.PUBLIC_URL + `/tokens/${activePair.split("/")[1]}.png`}/>
                                    </Avatar.Group>

                                    {activePair} {historyData ?
                                        <span className="pair-cost">{parseFloat(historyData.prices.slice(-1)[0]).toFixed(8)}</span> :
                                    <></>}
                                </div>

                            </Col>
                            <Col span={6} style={{textAlign: "right", paddingRight: "1rem"}}>
                                <Radio.Group defaultValue={"24H"} onChange={(e) => {
                                    setActivePeriod(e.target.value)
                                }}>
                                    <Radio.Button value="24H">24H</Radio.Button>
                                    <Radio.Button value="7D">7D</Radio.Button>
                                    <Radio.Button value="1M">1M</Radio.Button>
                                    <Radio.Button value="3M">3M</Radio.Button>
                                </Radio.Group>
                            </Col>
                        </Row>
                        {!isHistoryLoading && historyData ?
                            <Row style={{width: "100%"}}>
                                <RechartPairChart x={historyData.dates} y={historyData.prices}/>
                            </Row> : <></>
                        }
                    </React.Fragment>
                    :
                    <></>
                }

                <Row className="pairs-table">
                    <Table
                        onRow={(record, index) => {
                            return {
                                onClick: event => {
                                    setActiveRow(record.pair)
                                }
                            }
                        }}
                        rowClassName={setActiveClass}
                        loading={isLoading}
                        style={{width: "100%"}}
                        columns={columns}
                        dataSource={pairsData}/>
                </Row>
            </Col>
        </>
    )
})


export default PairsPage;