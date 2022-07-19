import React from 'react';
import {Col, Row, Select} from 'antd';
import {observer} from "mobx-react-lite";
import {useNavigate, useLocation} from "react-router";
import {useSearchParams, createSearchParams} from "react-router-dom";
import WalletConnectButtonWithModal from "../wallet/connect";
import {useStore} from "../../utils/hooks";
import {OptionProps} from "antd/es/mentions";


const TopMenu = observer(() => {
    const store = useStore();
    let navigate = useNavigate();
    let location = useLocation();
    let [searchParams, setSearchParams] = useSearchParams();

    const items = store.searchItems.map((item)=>{
        return <Select.Option key={item.id} value={`${item.type}-${item.name}`}>
            <>{item.name} <span style={{fontStyle: "italic", color: "gray"}}>{item.type}</span></>
        </Select.Option>
    })

    return (
        <>
            <Row style={{textAlign: "center"}}>
                <Col span={16}>
                    <Select
                        allowClear
                        onClear={()=>{
                            store.setSearchItem(null);
                            setSearchParams({});
                        }}
                        value={store.searchItem || undefined}
                        onSearch={store.search}
                        onSelect={(pair: string, option: OptionProps)=>{
                            store.setSearchItem(pair);
                            const splitted = pair.split("-")
                            let type = "pair"
                            let id = "";

                            if (splitted.length === 2){
                                type = splitted[0]
                                id = option.key
                            }
                            if (type === "pair" && location.pathname !== "/") {
                                navigate(`/?${createSearchParams({pair: id})}`);
                            } else if (type === "pool" && location.pathname !== "/pools") {
                                navigate(`/pools?${createSearchParams({pool: id})}`)
                            } else {
                                let params: {[key: string]: string} = {}
                                params[type] = id
                                setSearchParams(params);
                            }

                        }}
                        showSearch
                        showArrow={false}
                        style={{width: "100%"}}
                        placeholder="Search...">
                        {items}
                    </Select>
                </Col>
                <Col span={7} offset={1}>
                    <WalletConnectButtonWithModal />
                </Col>
            </Row>
        </>
    )
})

export default TopMenu;