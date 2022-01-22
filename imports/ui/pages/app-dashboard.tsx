import React, { Fragment } from 'react';

import PageHeader from 'antd/lib/page-header';
import Button from 'antd/lib/button';
import Breadcrumb from 'antd/lib/breadcrumb';
import Affix from 'antd/lib/affix';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import notification from 'antd/lib/notification';
import Result, { ResultStatusType } from 'antd/lib/result';

/*const {
    Header, 
    Sider, 
    Content
} = Layout;*/

import { useProduct, useApp } from '/client/clientdata';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { IAppAction, TAppActions, TAppDashboardElementType } from '/imports/api/types/app-types';
import { ReportControl } from '../components/layout-controls/report';
import { IWorldUser } from '/imports/api/types/world';
import { IGenericDocument } from '/imports/api/lib/core';

interface IAppDashboardPageProps {
    currentUser: IWorldUser
    params: {
        productId: string
        appId: string
    }
}

const convertMethodResult2ResultStatusType = (s: EnumMethodResult): ResultStatusType => {
    let res: ResultStatusType = 'success';

    switch (s) {
        case
            EnumMethodResult.STATUS_NOT_FOUND,
            EnumMethodResult.STATUS_NOT_LOGGED_IN,
            EnumMethodResult.STATUS_SERVER_EXCEPTION:
            res = s;
            break;

        case EnumMethodResult.STATUS_OKAY:
            res = 'success';
            break;

        case EnumMethodResult.STATUS_ABORT:
            res = 'warning';
            break;

        case EnumMethodResult.STATUS_LOADING:
            res = 'info';
            break;

        default:
            res = 'success';
    }

    return res;
}

export const AppDashboardPage = ( props: IAppDashboardPageProps) => {
    const { productId, appId } = props.params;

    const { product, status: productStatus, statusText: productStatusText } = useProduct(productId);
    const { app, status: appStatus, statusText: appStatusText  } = useApp(appId);
    
    if (productStatus == EnumMethodResult.STATUS_LOADING || appStatus == EnumMethodResult.STATUS_LOADING)
        return null;

    if (productStatus != EnumMethodResult.STATUS_OKAY) {
        return <Result
            status={convertMethodResult2ResultStatusType(productStatus)}
            title={productStatus}
            subTitle={productStatusText}
            extra={<Button type="primary" onClick={ () => history.back() }>Zurück</Button>}
        />
    }

    if (appStatus != EnumMethodResult.STATUS_OKAY || !app) {
        return <Result
            status={convertMethodResult2ResultStatusType(appStatus)}
            title={appStatus}
            subTitle={appStatusText}
            extra={<Button type="primary" onClick={ () => history.back() }>Zurück</Button>}
        />
    }

    const dashboardName = (app.dashboardPicker as Function)();
    const dashboard = (app.dashboards || {})[dashboardName];
    
    const getElement = ( element: TAppDashboardElementType ) => {
        if ( element.type ) {
            if ( element.type == 'report' || element.type == 'widget' || element.type == 'chart') {
                const { type: _reportType, reportId, document } = element.details;

                return (
                    <ReportControl 
                        environment='Dashboard'
                        reportId={reportId}
                        mode={EnumDocumentModes.DASHBOARD}
                        document={document as IGenericDocument}
                        defaults={{} /* das Dashboard verfügt über keine Defaultwerte */}
                        currentUser={props.currentUser}
                        
                        onValuesChange={null}
                        elem={null}
                        app={null}
                    />
                )
            }
        }
        else
            return null;
    }

    const getElements = ( elements: Array<TAppDashboardElementType> ) => {
        return ( elements.map( ( element: TAppDashboardElementType ) => {
            if ( element ) {
                if ( element.width )
                    return <Col key={element._id} {...element.width}>{ getElement( element ) }</Col>;
                else
                    return <Col key={element._id}>{ getElement( element ) }</Col>;
            }
            else
                return null;
        }));
    };
    
    const DashboardRows = ({ rows }:{ rows: Array<any> }): JSX.Element => {
        return (
            <Fragment>
            { 
                rows.map( ( row:any , index: number ) => {
                    if ( row.elements && row.elements.length )
                        return <Row key={index} gutter= {[16,16]}>
                            { getElements( row.elements ) }
                        </Row>;
                    else
                        return <Fragment/>;
                })
            }
            </Fragment>
        );
    }

    const actionClick = ( action: IAppAction<any> ) => {
        return ( _e: any ) => {
            if (action.onExecute && action.onExecute.redirect) {
                FlowRouter.go(action.onExecute.redirect);
            }
            if (action.onExecute && action.onExecute.force) {
                if (action.onExecute.force == 'new') {
                    FlowRouter.go(`/${productId}/${appId}/new`);
                } else {
                    notification.error({
                        message: 'Befehl nicht ausführbar.',
                        description: `Der Befehl "${action.onExecute.force}" kann in diesem Kontext nicht ausgeführt werden. Bitte wenden Sie sich an Ihren Administrator.`
                    });
                }
            }
        }
    }

    const getExtras = ( actions: TAppActions<any> ) => {
        return Object.values(actions).filter( action => action.environment.find( env => env == 'Dashboard' ) ).map( (action, index) => {
            return (
                <Button 
                    key={index}
                    type={action.isPrimaryAction ? 'primary' : 'default'}
                    onClick={ actionClick(action) }
                >
                    {action.icon ? <i className={action.icon} style={{marginRight: 8}}/> : null} {action.title}
                </Button>
            )
        });
    }
    
    return (
        <Fragment>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <a href="/">Start</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {product?.title}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {app?.title}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Affix className="mbac-affix-style-bottom" offsetTop={64}>
                <PageHeader
                    title={<span><i className={app?.icon} style={{fontSize:32, marginRight:16 }}/>{app?.title}</span>}
                    subTitle={<span style={{marginTop:8, display:'flex'}}>{app?.description}</span>}
                    //tags={<Tag color="blue">Running</Tag>}
                    extra={ getExtras(app?.actions || {} ) }
                />
            </Affix>

            {
                ( dashboard && dashboard.rows && dashboard.rows.length )
                    ? <DashboardRows
                        rows={dashboard.rows} 
                    />
                    : null
            }
        </Fragment>
    );
}