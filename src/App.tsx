import React from 'react';
import {createContext} from "react"
import './styles/theme.less';
import './styles/global.css';
import './styles/components.css';
import {Layout} from 'antd';
import {observer} from "mobx-react-lite";
import {RootStore} from "./stores";
import rootStore from "./stores"
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
import LeftMenu from "./components/menu/leftmenu";
import TopMenu from "./components/menu/topmenu";
import PairsPage from "./pages/pairs";

const queryClient = new QueryClient();

const Store = createContext<RootStore>(rootStore);

const App = observer(() => {
    return (
        <>
            <Store.Provider value={rootStore}>
                <QueryClientProvider client={queryClient}>
                    <Layout style={{height: "100%"}}>
                        <Layout.Sider style={{
                            overflow: 'auto',
                            height: '100vh',
                            position: 'fixed',
                            left: 0,
                        }}>
                            <LeftMenu/>
                        </Layout.Sider>
                        <Layout style={{marginLeft: 200}}>
                            <Layout.Header><TopMenu/></Layout.Header>
                            <Layout.Content>
                                <PairsPage/>
                            </Layout.Content>
                        </Layout>
                    </Layout>
                </QueryClientProvider>
            </Store.Provider>
        </>
    );
})

export default App;
export {Store}