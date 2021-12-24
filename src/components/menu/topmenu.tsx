import React from 'react';
import {Col, Row, Select} from 'antd';
import {observer} from "mobx-react-lite";
import {useNavigate, useLocation} from "react-router";
import {useSearchParams} from "react-router-dom";
import WalletConnectButtonWithModal from "../wallet/connect";
import {useStore} from "../../utils/hooks";

const TopMenu = observer(() => {
    const store = useStore();
    let navigate = useNavigate();
    let location = useLocation();
    let [searchParams, setSearchParams] = useSearchParams();

    const items = store.searchItems.map((item)=>{
        return <Select.Option key={item} value={item}>{item}</Select.Option>
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
                        onSelect={(pair: string)=>{
                            store.setSearchItem(pair);
                            if (location.pathname !== "/"){
                                navigate(`/?pair=${pair}`);
                            } else {
                                setSearchParams({pair: pair});
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