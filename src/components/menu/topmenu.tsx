import React from 'react';
import {Col, Row, Select} from 'antd';
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {Store} from "../../App";
import WalletConnectButtonWithModal from "../wallet/connect";

const TopMenu = observer(() => {
    const store = useContext(Store);

    const items = store.searchItems.map((item)=>{
        return <Select.Option key={item} value={item}>{item}</Select.Option>
    })

    return (
        <>
            <Row style={{textAlign: "center"}}>
                <Col span={16}>
                    <Select
                        allowClear
                        onClear={()=>store.setSearchItem(undefined)}
                        value={store.searchItem || undefined}
                        onSearch={store.search}
                        onSelect={store.setSearchItem}
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