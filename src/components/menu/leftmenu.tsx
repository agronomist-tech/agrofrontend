import React, {useEffect, useState} from 'react';
import {Col, Row, Menu, Tag} from 'antd';
import {ReactComponent as Logo} from '../../assets/images/logo.svg';
import {Link, useLocation} from "react-router-dom";

const LeftMenu = () => {
    const [active, setActive] = useState<string[]>([])
    let location = useLocation();

    useEffect(()=>{
        switch (location.pathname) {
            case "/":
                setActive(["pairs"]);
                break
            case "/pools":
                setActive(["pools"]);
                break
        }
    }, [location.pathname])

    return (
        <>
            <Col span={24}>
                <Row justify="space-around" align="middle" style={{
                    textAlign: "center",
                    padding: "30px 10px"
                }}>
                    <a href="https://app.agronomist.tech"><Logo style={{width: "80px"}}/></a>
                </Row>
                <Row>
                    <Menu mode="inline" defaultSelectedKeys={["pairs"]} selectedKeys={active}>
                        <Menu.Item key="pairs">
                            <Link to={"/"}>Pairs</Link>
                        </Menu.Item>
                        <Menu.Item key="pools">
                            <Link to={"/pools"}>Pools</Link>
                        </Menu.Item>
                        <Menu.Item key="farms" disabled>Farms <Tag color={"gold"}>SOON</Tag></Menu.Item>
                        <Menu.ItemGroup key="nft" title="NFT">
                            <Menu.Item key="nftExplorer">
                                <Link to={"/nft/explore"}>Explore</Link>
                            </Menu.Item>
                            <Menu.Item key="nftStaking">
                                <Link to={"/nft/staking"}>Staking</Link>
                            </Menu.Item>
                        </Menu.ItemGroup>
                    </Menu>
                </Row>
            </Col>
        </>
    )
}


export default LeftMenu;