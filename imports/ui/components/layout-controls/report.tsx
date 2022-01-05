import React, { Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import message from 'antd/lib/message';
import Skeleton from 'antd/lib/skeleton';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import Table/*,{ ColumnsType }*/ from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import Card from 'antd/lib/card'
import Statistic from 'antd/lib/statistic';

import { IChartData, IReport, IReportAction, IReportActionExecution, IReportDatasourceProps, IWorldUser, TColumnRenderer } from '/imports/api/types/world';
import { AppData, IGetReportResult } from '/imports/api/types/app-types';
import { EnumDocumentModes } from '/imports/api/consts';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { deepClone, isArray } from '/imports/api/lib/basics';
import { withTracker } from 'meteor/react-meteor-data';
import { getAppStore } from '/imports/api/lib/core';

import PageHeader from 'antd/lib/page-header';
import Breadcrumb from 'antd/lib/breadcrumb';
import Affix from 'antd/lib/affix';

import { Bar, Line, Pie } from 'react-chartjs-2';


// dummyfoo was added to use getAppstore, check, Match and <Tag> in LiveDatasource on the client and server
export const dummyfoo = (): JSX.Element => {
    const x = getAppStore('x');
    check('String', Match.OneOf(String, Boolean));
    
    return <Tag>{x}</Tag>
}

interface IReportWithData extends IReport<any,any> {
    data?: AppData<any>
}

interface IReportControlProps {
    reportId: string,
    defaults?: AppData<any>,
    document?: AppData<any>,
    mode: EnumDocumentModes | 'dashboard',
    currentUser: IWorldUser,
    pageStyle?: boolean
    /**
     * Gibt die Umgebung an, an der der Report gerade platziert ist
     * Handelt es sich um einen allgemeinen Aufruf des Reports mit eigener Seite,
     * wird der Report im Dahsboard angezeigt oder ist der Report Bestandteil eines Dokuments
     */
    environment: 'ReportPage' | 'Dashboard' | 'Document'
}

interface IReportControlState {
    loading: boolean,
    report: IReportWithData | null
}

export class ReportControl extends React.Component<IReportControlProps, IReportControlState> {
    private unmounted: boolean;

    constructor(props:IReportControlProps) {
        super(props);
        
        this.unmounted = true

        this.state = {
            loading : true,
            report: null
        };
    }

    componentDidMount() {
        const { reportId, environment } = this.props;
        
        this.unmounted = false;
        console.log('Report did mount');
        Meteor.call('__reportData.getReport', reportId, (err: Meteor.Error, result: IGetReportResult) => {
        
            if (err) {
                message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                if (!this.unmounted) this.setState({ loading: false });
            } else {
                const { status, report } = result;

                if ( status != '200' ) {
                    message.error('Es ist ein Fehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + result.status);
                    if (!this.unmounted) this.setState({ loading: false });
                } else if (report) {
                    report.columns = report.columns?.map( c => {
                        const fnCode = c.render;
                        if (fnCode) {
                            let renderer: TColumnRenderer<any>;
                            try{
                                renderer = eval(fnCode as string);
                            } catch (err) {
                                console.error(err, 'Fehler in der Funktion:', fnCode);
                            }

                            c.render = function renderColumn(col, doc, { isExport = false }) {
                                return (renderer as Function)(col, doc, { injectables: report.injectables, isExport });
                            }
                        };
                        
                        return c;
                    });

                    // löschen der actions, die nicht der aktuellen Umgebung entsprechen
                    report.actions = report.actions?.filter( a => {
                        if (a.visibleAt.find( va => va == environment )){
                            return true;
                        };
                        return false;
                    });
                }

                if (!this.unmounted) {
                    this.setState({ report: report as IReportWithData /*IReport<any,any>*/, loading: false });
                }
            }
        });
    }

    componentWillUnmount() {
		this.unmounted = true
	}

    render() {
        const { loading, report } = this.state;
        const { currentUser, mode, pageStyle = false } = this.props;

        if (loading || !report) return <Skeleton />;

        const { isStatic, type } = report;
        
        const reportParams: IReportDatasourceProps<any> = {
            defaults: this.props.defaults,
            document: this.props.document,
            mode: this.props.mode, 
            isServer: false,
            currentUser: this.props.currentUser
        }
        
        return (
            <div className="report-container">
                { pageStyle
                    ? <Fragment>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <a href="">Home</a>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <a href="">Reports</a>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {report?.title}
                            </Breadcrumb.Item>
                        </Breadcrumb>

                        <Affix className="mbac-affix-style-bottom" offsetTop={64}>
                            <PageHeader
                                title={<span><i className={report?.icon} style={{fontSize:32, marginRight:16 }}/>{report?.title}</span>}
                                subTitle={<span style={{marginTop:8, display:'flex'}}>{report?.description}</span>}
                                //tags={<Tag color="blue">Running</Tag>}
                                extra={ report.actions && <ReportGeneralActions report={report} reportParams={reportParams} /> }
                            />
                        </Affix>
                    </Fragment>
                    : null
                }
                { type == 'table' && report.actions && !pageStyle ? <ReportGeneralActions report={report} reportParams={reportParams} /> : null }
                { isStatic
                    ? <ReportStatic report={report} reportParams={reportParams} mode={mode as EnumDocumentModes} currentUser={currentUser} />
                    : <ReportLiveData report={report} reportParams={reportParams} mode={mode as EnumDocumentModes} currentUser={currentUser} />
                }
            </div>
        )
    }
}

interface IReportGeneralActionsProps {
    report: IReportWithData //IReport<any,any> & { data: AppData<any> }
    reportParams: any
}

const ReportGeneralActions = (props: IReportGeneralActionsProps) => {
    const { report, reportParams } = props;
    const { actions } = report;
    
    const generalActions = actions?.filter( ({ inGeneral }) => !!inGeneral);

    const primaryAction = generalActions?.find( ({type}) => type == 'primary');
    const secondaryAction = generalActions?.find( ({type}) => type == 'secondary');
    const moreActions = generalActions?.filter( action => action !== primaryAction && action !== secondaryAction);

    return (
        <div className="report-general-actions">
            <Space>
                { primaryAction && <ReportAction report={report} action={primaryAction} reportParams={reportParams} /> }
                { secondaryAction && <ReportAction report={report} action={secondaryAction} reportParams={reportParams} /> }
                { moreActions && moreActions.length > 0 && <ReportAction report={report} action={moreActions} reportParams={reportParams} /> }
            </Space>
        </div>
    )
}

const executeAction = (onExecute: IReportActionExecution, mode: EnumDocumentModes | "dashboard", defaults: AppData<any>, doc: AppData<any>, rowdoc: AppData<any> | undefined, report: IReportWithData) => {
    let { redirect, exportToCSV } = onExecute;
    
    if (redirect) {
        const data = mode == 'NEW' ? defaults : doc;
        
        if (data) {
            Object.keys(data).forEach( key => {
                redirect = redirect?.replace(new RegExp(`{{parentRecord.${key}}}`, 'g'), encodeURIComponent(data[key]));
                redirect = redirect?.replace(new RegExp(`{{doc.${key}}}`, 'g'), encodeURIComponent(data[key]));
            });
        }

        if (rowdoc) {
            Object.keys(rowdoc || {}).forEach( key => {
                redirect = redirect?.replace(new RegExp(`{{rowdoc.${key}}}`, 'g'), encodeURIComponent(rowdoc[key]));
            });
        }

        return FlowRouter.go(redirect);
    }

    if (exportToCSV) {
        const { columns, data, injectables } = report;

        let csvContent = "data:text/csv;charset=utf-8," 
                + columns?.filter( ({key}) => key && key.substring(0,2) != '__' ).map( ({ title }) => title).join('\t') + '\n'
                + data?.map((doc: any) => {
                    return columns?.filter( ({key}) => key && key.substring(0,2) != '__' ).map( c => {
                        if (c.render) {
                            return (c.render as Function)(doc[c.dataIndex], doc, { isExport/*renderExport*/: true, injectables });
                        }
                        return doc[c.dataIndex];
                    }).join('\t')
                }).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", exportToCSV.filename);
        //document.body.appendChild(link); // Required for FF

        return link.click();
    }
}


interface IReportActionProps {
    report: IReportWithData
    action: IReportAction | Array<IReportAction>
    reportParams:any
    isRowAction?: boolean
    rowdoc?:AppData<any>
}

const ReportAction = (props: IReportActionProps) => {
    const { report, action, reportParams, isRowAction = false, rowdoc} = props;
    const { defaults, document: doc, mode } = reportParams;
    
    if (isArray(action)) {
        const MenuItems = (action as Array<IReportAction>).map( a => {
            const { type: _type, title, icon, onExecute, disabled, visible } = a;
            const { data } = report;

            const checkDisabled = disabled ? eval(disabled as string) : () => false;
            const checkVisible = visible ? eval(visible as string) : () => true;

            if (!checkVisible({mode, data, defaults, document:doc/*, TODO currentUser*/})) return null;

            return (
                <Menu.Item 
                    key={a.title} 
                    onClick={() => executeAction(onExecute, mode, defaults, doc, rowdoc, report)}
                    disabled={checkDisabled({mode, data: data || [], defaults, document:doc/*, TODO currentUser*/})} 
                >
                    { icon && <i className={icon} style={{marginRight:8}} /> }
                    {title}
                </Menu.Item>
            )
        }).filter(item => item !== null)

        if (MenuItems.length == 0) return null;

        const menu = (
            <Menu>
                { MenuItems }
            </Menu>
        );

        return <Dropdown.Button type={(isRowAction || report.type == 'widget' ? "link" : "default") as any} overlay={menu} />
    } else {
        const { type, title, icon, iconOnly, onExecute, disabled, visible } = (action as IReportAction);
        const { data } = report;

        const checkDisabled = disabled ? eval(disabled as string) : () => false;
        const checkVisible = visible ? eval(visible as string) : () => true;

        if (!checkVisible({mode, data: data || [], defaults, document:doc/*, TODO currentUser*/})) return null;

        return (
            <Button 
                key={title} 
                type={isRowAction || iconOnly ? 'link' : (type == 'primary' ? 'primary' : 'secondary') as any}
                onClick={() => executeAction(onExecute, mode, defaults, doc, rowdoc, report)}
                disabled={checkDisabled({mode, data, defaults, document:doc/*, TODO currentUser*/})} 
            >                
                { icon && <i className={icon} style={report.type == 'widget' ? {fontSize:16,color:'#999'}:{marginRight:8}} /> }
                { !iconOnly && title}
            </Button>
        );
    }
}


interface IReportStaticProps {
    report: IReportWithData
    reportParams: any
    mode: EnumDocumentModes
    currentUser: IWorldUser
}

interface IReportStaticState {
    loading: boolean
    data: Array<any> | IChartData | null
}

export class ReportStatic extends React.Component<IReportStaticProps, IReportStaticState> {
    private unmounted = true;
    private primaryWidgetAction: React.MouseEventHandler<HTMLDivElement> | undefined = undefined;

    private actionColumn:any = null;
    private widgetActions:any = null;

    constructor(props: IReportStaticProps) {
        super(props);

        const { report, reportParams } = props;

        this.state = {
            loading: true,
            data: null //report.type == 'chart' ? { options: null, data: null } : []
        }
        
        if (report.actions) {
            let acs = report.actions.filter( ({ inGeneral }) => !inGeneral )

            const primaryAction = acs.find( ({type}) => type == 'primary' );
            const secondaryAction = acs.find( ({type}) => type == 'secondary' );
            const moreActions = acs.filter( ({type}) => type != 'primary' && type != 'secondary' );

            if ( primaryAction || secondaryAction || (moreActions && moreActions.length)) {
                this.actionColumn = {
                    title: ' ',
                    key: '__action',
                    align: 'right',
                    render: (_text: string, doc: AppData<any>) => (
                        <Space>
                            { primaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={primaryAction} reportParams={reportParams} /> }
                            { secondaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={secondaryAction} reportParams={reportParams} /> }
                            { (moreActions.length > 0) && <ReportAction isRowAction rowdoc={doc} report={report} action={moreActions} reportParams={reportParams} /> }
                        </Space>
                    ),
                }

                this.widgetActions = []
                if (primaryAction) {
                    this.primaryWidgetAction = (_e) => {
                        const { mode, defaults, document: doc, rowdoc } = reportParams;
                        executeAction(primaryAction.onExecute, mode, defaults, doc, rowdoc, report);
                    }
                    //this.widgetActions.push(<ReportAction report={report} action={primaryAction} reportParams={reportParams} /> );
                }
                if (secondaryAction) {
                    this.widgetActions.push(<ReportAction report={report} action={secondaryAction} reportParams={reportParams} />);
                }
                if (moreActions && moreActions.length > 0) {
                    this.widgetActions.push(<ReportAction report={report} action={moreActions} reportParams={reportParams} />);
                }
            }

        }
    }

    loadData() {
        const reportId = this.props.report._id;
        const { reportParams } = this.props;
        
        let clonedReportParams = deepClone(reportParams, { transformDate: true, deleteCurrentUser: true });

        Meteor.call('__reports.' + reportId,  { ...clonedReportParams }, (err: Meteor.Error, data: Array<any>) => {
            if (err) {
                message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                if (!this.unmounted) this.setState({ loading: false });
            } else {
                if (!this.unmounted) this.setState({ data, loading: false });
            }
        });
    }

    componentDidMount() {
        this.unmounted = false;
        this.loadData();
    }

    componentDidUpdate(prevProps: IReportStaticProps, _prevState: IReportStaticState) {
        if (prevProps.reportParams !== this.props.reportParams) {
            this.loadData();
        }
    }

    componentWillUnmount() {
		this.unmounted = true
	}

    render() {
        const { type, columns, title, nestedReportId } = this.props.report;
        const { data, loading } = this.state;

        if (loading) return <Skeleton />;

        if (type == 'table') {
            let cols = columns || [];

            if (this.actionColumn) {
                cols.push(this.actionColumn);
            }

            return <Table 
                rowKey="_id" 
                dataSource={data as any } 
                pagination={false} 
                columns={cols as any } 
                title={() => 
                    <Space>
                        <span>{title}</span>
                        <Tag color="green">realtime</Tag>
                    </Space>
                }

                expandable={!nestedReportId ? undefined : {
                    expandedRowRender: (record:any) => { 
                        return (
                            <div style={{ margin: 0 }}>
                                <ReportControl environment='Document' reportId={nestedReportId} mode={this.props.mode} document={record} currentUser={this.props.currentUser}/>
                            </div>
                        )
                    },
                    rowExpandable: (_record:any) => true,
                }}
            />
        }

        if (type == 'widget') {
            const widgetData: any = data && (data as Array<any>)[0];

            if (!widgetData) {
                return <div>Keine Daten vorhanden</div>
            }

            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
            
            // colorful
            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
        }

        if (type == 'chart') {
            const chartData: IChartData = data as IChartData;
            const { chartType } = this.props.report;

            if ( chartType == 'bar') return <Bar getElementAtEvent={(elems, _event) => {console.log(elems)}} options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
            if ( chartType == 'line') return <Line options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
            if ( chartType == 'pie') return <Pie options={chartData.options as unknown as any} data={chartData.data as unknown as any} />
        }

        return <div>Unbekannter Reporttype</div>
    }
}


interface IReportLiveDataControlProps {
    report: IReportWithData
    reportParams: any
    mode: EnumDocumentModes
    loading?: boolean
    data?: AppData<any>
    currentUser:IWorldUser
}

interface IReportLiveDataControlState {

}

class ReportLiveDataControl extends React.Component<IReportLiveDataControlProps, IReportLiveDataControlState> {
    private actionColumn:any = null;
    private widgetActions:any = null;
    private primaryWidgetAction: React.MouseEventHandler<HTMLDivElement> | undefined = undefined;

    constructor(props: IReportLiveDataControlProps) {
        super(props);

        const { report, reportParams } = props;
        
        if (report.actions) {
            let acs = report.actions.filter( ({ inGeneral }) => !inGeneral )

            const primaryAction = acs.find( ({type}) => type == 'primary' );
            const secondaryAction = acs.find( ({type}) => type == 'secondary' );
            const moreActions = acs.filter( ({type}) => type != 'primary' && type != 'secondary' );

            if ( primaryAction || secondaryAction || (moreActions && moreActions.length)) {
                this.actionColumn = {
                    title: ' ',
                    key: '__action',
                    align: 'right',
                    render: (_text: string, doc: AppData<any>) => (
                        <Space>
                            { primaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={primaryAction} reportParams={reportParams} /> }
                            { secondaryAction && <ReportAction isRowAction rowdoc={doc} report={report} action={secondaryAction} reportParams={reportParams} /> }
                            { (moreActions.length > 0) && <ReportAction isRowAction rowdoc={doc} report={report} action={moreActions} reportParams={reportParams} /> }
                        </Space>
                    ),
                }

                this.widgetActions = []
                if (primaryAction) {
                    this.primaryWidgetAction = (_e) => {
                        const { mode, defaults, document: doc, rowdoc } = reportParams;
                        executeAction(primaryAction.onExecute, mode, defaults, doc, rowdoc, report);
                    }
                    //this.widgetActions.push(<ReportAction report={report} action={primaryAction} reportParams={reportParams} /> );
                }
                if (secondaryAction) {
                    this.widgetActions.push(<ReportAction report={report} action={secondaryAction} reportParams={reportParams} />);
                }
                if (moreActions && moreActions.length > 0) {
                    this.widgetActions.push(<ReportAction report={report} action={moreActions} reportParams={reportParams} />);
                }
            }

        }
    }

    render() {
        const { currentUser, data, loading: _loading, report } = this.props;
        const { type, columns, title, nestedReportId } = report;

        report.data = data;
        //console.log('Reportdata', loading, data);
        //if (loading) return <Skeleton />;

        if (type == 'table') {
            let cols = columns || [];

            if (this.actionColumn) {
                cols.push(this.actionColumn);
            }

            return <Table 
                rowKey="_id" 
                dataSource={data as any } 
                pagination={false} 
                columns={cols as any } 
                title={() => 
                    <Space>
                        <span>{title}</span>
                        <Tag color="green">realtime</Tag>
                    </Space>
                }

                expandable={!nestedReportId ? undefined : {
                    expandedRowRender: (record:any) => { 
                        return (
                            <div style={{ margin: 0 }}>
                                <ReportControl environment='Document' reportId={nestedReportId} mode={this.props.mode} document={record} currentUser={currentUser} />
                            </div>
                        )
                    },
                    rowExpandable: (_record:any) => true,
                }}
            />
        }

        if (type == 'widget') {
            const widgetData = data && data[0];

            if (!widgetData) {
                return <div>Keine Daten vorhanden</div>
            }
            
            return (
                <div onClick={this.primaryWidgetAction} style={{marginBottom:16, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card 
                        hoverable={this.primaryWidgetAction ? true:false}
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{fontSize:12, color:'#999'}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );

            // colorful
            return (
                <div onClick={this.primaryWidgetAction} style={{color: widgetData.color, cursor: this.primaryWidgetAction ? 'pointer':'default'}} >
                    <Card style={{borderColor: widgetData.color, color: widgetData.color, backgroundColor: widgetData.backgroundColor}}
                        //hoverable
                        actions={this.widgetActions}
                    >
                        <Card.Meta 
                            style={{borderColor: widgetData.color}}
                            //avatar={}
                            title={<span style={{color: widgetData.color}}>{widgetData.title}</span>}
                        />
                        <Statistic
                            value={widgetData.value}
                            prefix={<i style={{marginRight:16}} className={widgetData.icon} />}
                            //prefix={<Avatar size="large" style={{marginRight: 16, backgroundColor: widgetData.color, color: widgetData.backgroundColor}} icon={<i className={widgetData.icon} />}/>}
                            valueStyle={{ color: widgetData.color/* || report.color*/ }}
                        />
                    </Card>
                </div>
            );
        }

        if (type == 'chart') {
            const { chartType } = this.props.report;

            if ( chartType == 'bar') return <Bar options={data?.options as unknown as any} data={data?.data as unknown as any} />
            if ( chartType == 'line') return <Line options={data?.options as unknown as any} data={data?.data as unknown as any} />
            if ( chartType == 'pie') return <Pie options={data?.options as unknown as any} data={data?.data as unknown as any} />
        }

        return <div>Unbekannter Reporttype</div>
    }
}


interface IReturnProps {
    loading?: boolean
    data?: AppData<any>
}

export const ReportLiveData = withTracker<IReturnProps, IReportLiveDataControlProps>  ( ({ report, reportParams }) => {
    const { _id, liveDatasource } = report;
    let fnLiveData;

    try {
        fnLiveData = eval(liveDatasource as string);
    } catch(err) {
        console.log('Fehler in der Datasource für einen LiveReport: ' + err)
    }

    const subscriptionData = deepClone(reportParams, { transformDate: true, deleteCurrentUser: true });
    const subscription = Meteor.subscribe('__reports.' + _id, subscriptionData);
   
    const liveData = fnLiveData(reportParams);

    return {
        loading: !subscription.ready(),
        data: liveData && liveData.fetch(),
    };
})(ReportLiveDataControl);