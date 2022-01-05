import React, { Fragment, useEffect, useState } from 'react';

import { Meteor } from 'meteor/meteor';


import PageHeader from 'antd/lib/page-header';
import Button from 'antd/lib/button';
import Breadcrumb from 'antd/lib/breadcrumb';
import Affix from 'antd/lib/affix';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Result, { ResultStatusType } from 'antd/lib/result';


/*const {
    Header, 
    Sider, 
    Content
} = Layout;*/

import { useProduct, useApp } from '/client/clientdata';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { TAppDashboardElement, TAppDashboardElementType } from '/imports/api/types/app-types';
import { ReportControl } from '../components/layout-controls/report';
import { IWorldUser } from '/imports/api/types/world';

/*export const GenericTableReport = ( { report }: any) => {
    const [ loadingData, setLoadingData ] = useState(true);
    const [ reportData, setReportData ] = useState(null);
    const [ firstTime, setFirstTime ] = useState(true);

    if (reportData === null && firstTime) {
        Meteor.call('reports.' + report._id, {}, (err: Meteor.Error, result:any) => {
            if (err) {
                // mach was um den Anwender zu informieren, dass ein Fehler aufgetreten ist
                message.error(err.message);
            } else {
                setReportData(result);
                setLoadingData(false);
            }
        });
        setFirstTime(false);
    }

    if (report.columns) {
        report.columns = report.columns.map( c => {
            const fnCode = c.render;
            
            if (fnCode) {
                c.render = function renderColumn(col, doc) {
                    let renderer = eval(fnCode);
                    return renderer(col, doc, report.additionalData || {});
                }
            };
            
            return c;
        });
    }

    return (
        loadingData 
            ? <Spinner />
            : <Table dataSource={reportData} columns={report.columns} />
    );
}*/

/*
export const GenericChart = ({element, options, chartType}) => {
    const type = chartType;
    const { static, report, params, onClick } = element;

    const [ loadingData, setLoadingData ] = useState(true);
    const [ data, setData ] = useState(null);
    
    useEffect( () => {
        if (static && data === null) {
            Meteor.call('reports.' + report._id, params, (err, result) => {
                if (err) {
                    // mach was um den Anwender zu informieren, dass ein Fehler aufgetreten ist
                } else {
                    setData(result);
                    setLoadingData(false);
                }
            });
        } else {
            // realtime

        }
    })

    drillDown = () => {
        if (onClick && onClick.redirect) {
            FlowRouter.go(onClick.redirect);
        }
    }

    if ( loadingData ) 
        return <Spinner />;

    return (
        <div onClick={drillDown} style={{cursor:'pointer'}} >
            { ( type == 'Bar')
            ? <Bar key={element._id} data={data} options={options} />
            : <Line key={element._id} data={data} options={options} /> }
        </div>
    );
}
*/
/*
export const GenericWidget = ({element}) => {
    const { static, report, params, onClick } = element;

    const [ loadingData, setLoadingData ] = useState(true);
    const [ data, setData ] = useState(null);
    
    
    useEffect( () => {
        if (static && data === null) {
            Meteor.call('reports.' + report._id, params, (err, result) => {
                console.log(report._id, err, result);

                if (err) {
                    // mach was um den Anwender zu informieren, dass ein Fehler aufgetreten ist
                } else {
                    setData(result);
                    setLoadingData(false);
                }
            });
        } else {
            // realtime

        }
    })

    drillDown = () => {
        if (onClick && onClick.redirect) {
            FlowRouter.go(onClick.redirect);
        }
    }

    if ( loadingData )
        return <Spinner />;

    return (
        <div onClick={drillDown} style={{cursor:'pointer'}} >
            <Card hoverable>
                <Card.Meta
                    avatar={<Avatar icon={<i className={data.icon || element.icon} />}/>}
                    title={data.label || element.label}
                />
                <Statistic
                    value={data.value}
                    valueStyle={{ color: data.color || element.color }}
                />
            </Card>
        </div>
    );
}
*/

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
    
    /*const renderChart = ( element ) => {
        if ( element.typedetail == 'Bar' )
            return <GenericChart key={element.key} element={element} chartType='Bar'/>; //<Bar data={element.data} options={element.options} />;
        else if ( element.typedetail == 'Line' )
            return <GenericChart key={element.key} element={element} chartType='Line'/>; //<Line key={element.key} data={element.data} options={element.options} />;
        else
            return null;
    }*/

    const getElement = ( element: TAppDashboardElementType ) => {
        if ( element.type ) {
            if ( element.type == 'report' || element.type == 'widget' || element.type == 'chart') {
                const { type: reportType, reportId, document, defaults } = element.details;

                return (
                    <ReportControl 
                        environment='Dashboard'
                        reportId={reportId} mode="dashboard" document={document} defaults={defaults} currentUser={props.currentUser}    
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
    
    const DashboardRows = ({ rows }:{ rows: Array<any> }): Array<JSX.Element | null> => {
        return ( rows.map( ( row:any , index: number ) => {
            if ( row.elements && row.elements.length )
                return <Row key={index} gutter= {[16,16]}>
                    { getElements( row.elements ) }
                </Row>;
            else
                return null;
        }));
    }

    const actionClick = ( action ) => {
        return e => {
            if (action.onExecute && action.onExecute.redirect) {
                FlowRouter.go(action.onExecute.redirect);
            }
        }
    }

    const getExtras = ( actionsObj ) => {
        const actions = Object.keys(actionsObj);

        return actions.map( actionName => {
            const a = actionsObj[actionName];
            return (
                <Button 
                    key={actionName}
                    type={a.isPrimaryAction ? 'primary' : 'default'}
                    onClick={ actionClick(a) }
                >
                    {a.icon ? <i className={a.icon} style={{marginRight: 8}}/> : null} {a.title}
                </Button>
            )
        });
    }
    
    return (
        <Fragment>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <a href="">Home</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a href="">Dashboards</a>
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

            <div>
                {
                    ( dashboard && dashboard.rows && dashboard.rows.length )
                        ? <DashboardRows
                            rows={dashboard.rows} 
                        />
                        : null
                }
            </div>
        </Fragment>
    );
}