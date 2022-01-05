import React, { Fragment, useState } from 'react';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Spin from 'antd/lib/spin';
import Tabs from 'antd/lib/tabs';

const { TabPane } = Tabs;
const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

//import { ListActivities } from './ListActivities';
import { SharedWith } from '/imports/ui/components/shared-with';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { MediaQuery, useMediaQueries } from '/client/mediaQueries';
import { useProducts, useAppsByProduct } from '/client/clientdata';
import { EnumMethodResult } from '/imports/api/consts';
import { AppActivities } from '../components/app-activities';

const Logo = () => {
    return (
        <div className="mbac-logo" >
            <img className="large" src="/MEBEDO_LOGO_PRINT_RGB-300x88.jpg" />
        </div>
    );
}

const ProductMenu = props => {
    const { product } = props;
    const { apps, status, statusText } = useAppsByProduct(product._id);

    if (status == EnumMethodResult.STATUS_LOADING || apps.length == 0)
        return <SubMenu {...props} icon={<i className={product.icon} style={{ marginRight:0 }}/>} title={product.title} />
    
    return (
        <SubMenu {...props} icon={<i className={product.icon} style={{ marginRight:0 }}/>} title={product.title} >
            {
                apps.map( m => 
                    m.isSeparator 
                        ? <hr key={m._id} style={{width:'80%'}}/> 
                        : <Menu.Item key={m._id}><span><i className={m.icon} style={{ marginRight:16 }}/>{m.title}</span></Menu.Item>
                )
            }
        </SubMenu>
    );
}

const ProductsMenu = ({theme='light', mode, displayLogo}) => {
    const { products, status, statusText } = useProducts();

    const handleClick = ({ item, key, keyPath, domEvent }) => {
        FlowRouter.go('/' + keyPath.reverse().join('/') + '/dashboard');
    }

    if (status == EnumMethodResult.STATUS_LOADING) return <Spin />

    return (
        <Menu theme={theme} mode={mode} onClick={handleClick}>
            { !displayLogo ? null :
                <Menu.Item key="mbac-logo" style={{cursor:'pointer', background:'#fff'}}>
                    <Logo />
                </Menu.Item>            
            }
            {
                products.map( p =>
                    <ProductMenu key={p._id} product={p} /> 
                )
            }
        </Menu>
    )
}

export const DefaultLayout = props => {
    const { currentUser, params, showActivities = false } = props;
    
    return (
        <Layout>
            <MediaQuery showAtPhone >
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={broken => {
                        console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        console.log(collapsed, type);
                    }}
                >
                    <ProductsMenu theme="dark" mode="inline" />
                </Sider>
            </MediaQuery>

            <Layout>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, background:'#fff' }}>
                    <MediaQuery showAtPhone >
                        <Logo />
                    </MediaQuery>

                    <MediaQuery showAtTablet showAtDesktop >
                        <ProductsMenu displayLogo mode="horizontal" />
                    </MediaQuery>
                </Header>

                <Content style={{ margin: '96px 16px 0' }}>
                    <div style={{ padding: 24, minHeight: 1260, background:'#fff' }}>
                        { props.children }
                    </div>
                </Content>
                
                { !showActivities
                    ? null
                    : <MediaQuery showAtTablet showAtDesktop >
                        <Sider 
                            theme="light" width="300" collapsible collapsedWidth="0" reverseArrow
                        >
                            <Content style={{padding:8, marginTop:60}}>
                                <Tabs defaultActiveKey="1" /*onChange={callback}*/>
                                    <TabPane tab="Aktivitäten" key="1">
                                        <AppActivities 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode}
                                        />
                                    </TabPane>
                                    <TabPane tab="geteilt mit" key="2">
                                        {<SharedWith 
                                            currentUser={currentUser}
                                            appId={params && params.appId}
                                            docId={params && params.docId}
                                            mode={props.mode}
                                        />}
                                    </TabPane>
                                </Tabs>
                            </Content>

                        </Sider>
                    </MediaQuery>
                }
            </Layout>
        </Layout>
    );
}