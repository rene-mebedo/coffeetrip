import React, { Fragment, useEffect, useState } from 'react';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { MediaQuery } from '/client/mediaQueries';

import PageHeader from 'antd/lib/page-header';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import Breadcrumb from 'antd/lib/breadcrumb';
import Affix from 'antd/lib/affix';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Result from 'antd/lib/result';
import Comment from 'antd/lib/comment';
import Tooltip from 'antd/lib/tooltip';

import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';

import Layout from 'antd/lib/layout';
const { Header, Content, Footer, Sider } = Layout;

const { useForm } = Form;

import { AppLayout } from '../components/app-layout';
//import { ModalShareWith } from './modals/share-with';

import { useApp, useDocument, useDocumentLock, useProduct } from '/client/clientdata';

import moment from 'moment';
import localization from 'moment/locale/de';
import { useOnceWhen, useWhenChanged } from '/imports/api/lib/react-hooks';
import { EnumMethodResult } from '/imports/api/consts';
import { Expert } from '../components/expert';

export const Record = ({ params, queryParams, currentUser, mode }) => {
    const { productId, appId, docId } = params;

    const { product, status: productStatus, statusText: productStatusText } = useProduct(productId);
    const { app, status: appStatus, statusText: appStatusText  } = useApp(appId);

    const [ reloadRevision, setReloadRevision ] = useState(0);
    const [ document, documentStatus ] = useDocument(appId, docId);
    
    const [ lock, lockStatus ] = useDocumentLock(appId, docId);

    const [ defaults, setDefaults ] = useState(null);

    const [ recordMode, setRecordMode ] = useState(mode);

    const [ recordForm ] = useForm();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    
    useOnceWhen(() => productStatus == EnumMethodResult.STATUS_OKAY && appStatus == EnumMethodResult.STATUS_OKAY && documentStatus != EnumMethodResult.STATUS_LOADING, () => {
        if (mode === 'NEW') {
            Meteor.call('__app.' + appId + '.getDefaults', {productId, appId, queryParams}, (err, result) => {
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler beim ermitteln der Standardwerte aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY && result.defaults) {
                        const { defaults } = result;

                        Object.keys(app.fields).forEach(f => {
                            const field = app.fields[f];
                            const { type } = field;

                            if (type === 'Date' || type === 'Datespan') {
                                const v = defaults[f];
                                if (v) {
                                    defaults[f] = (type == 'Date' ) ? moment(v) : [moment(v[0]), moment(v[1])]
                                }
                            }

                            if (type === 'Year') {
                                const v = defaults[f];
                                if (v) {
                                    defaults[f] = moment( new Date('01/01/' + v) );
                                }
                            }
                        });

                        setDefaults(defaults);
                        recordForm.setFieldsValue(defaults)
                    }
                }
            });
        } else {
            // setFieldvalues erfolgt nun in eigenem "useWhenChanged"
            // so dass auch update von anderen benutzern durch die Relatime funktion
            // Anwendung finden und im Frontend dargestllt werden

            /*if (document) {
                // Timeout ist erforderlich, da der setFieldsValue vor dem eigentlichen rendern des Forms
                // stattfindet
                setTimeout(() => {
                    // transform der Year-typen
                    // die Date und Datespan-typen werden bereits im useDocument abgehandelt
                    Object.keys(app.fields).forEach(f => {
                        const field = app.fields[f];
                        const { type } = field;

                        if (type === 'Year') {
                            const v = document[f];
                            if (v) {
                                document[f] = moment( new Date('01/01/' + v) );
                            }
                        }
                    });

                    recordForm.setFieldsValue(document)
                }, 100);
            }*/
        }
    }, [productId, appId, docId, mode]);

    const getDocumentRevision = () => {
        if (
            productStatus != EnumMethodResult.STATUS_OKAY
            || appStatus != EnumMethodResult.STATUS_OKAY
            || documentStatus != EnumMethodResult.STATUS_OKAY
        ) return 0;
        if (!document) return 0;

        return (document && document._rev);
    }

    useWhenChanged(getDocumentRevision, () => {
        setTimeout(() => {
            // transform der Year-typen
            // die Date und Datespan-typen werden bereits im useDocument abgehandelt
            if (app) {
                Object.keys(app.fields).forEach(f => {
                    const field = app.fields[f];
                    const { type } = field;

                    if (type === 'Year') {
                        const v = document[f];
                        if (v) {
                            document[f] = moment( new Date('01/01/' + v) );
                        }
                    }
                });

                recordForm.setFieldsValue(document)
            }
        }, 10);
    });

    if (productStatus == EnumMethodResult.STATUS_LOADING
        || appStatus == EnumMethodResult.STATUS_LOADING
        || documentStatus == EnumMethodResult.STATUS_LOADING) {
    
        return null; // TODO show loading animation
    }

    // prüfen, ob das angegebene Modul aus der URL
    // gefunden wurde (richtig geschrieben) oder ob ggf. kein Zugriff besteht,
    // da das Modul nicht mit dem benutzer geteilt wurde
    if (productStatus != EnumMethodResult.STATUS_OKAY) {
        return <Result
            status={productStatus}
            title={productStatus}
            subTitle={productStatusText}
            extra={<Button onClick={_ => history.back()} type="primary">Zurück</Button>}
        />
    }

    if (appStatus != EnumMethodResult.STATUS_OKAY) {
        return <Result
            status={appStatus}
            title={appStatus}
            subTitle={appStatusText}
            extra={<Button onClick={_ => history.back()} type="primary">Zurück</Button>}
        />
    }

    // aktuell wird nur das default-layout unterstützt
    //const layout = mod.layouts && mod.layouts.default;
    
    const saveRecord = e => {
        recordForm.validateFields().then( values => {
            const data = {
                productId,
                appId,
                values
            }
            
            // es müssen alle Date-Werte konvertiert werden, da diese als Funktionsausdruck von moment() vorliegen
            // uns nicht per Metor.call übertragen werden können
            Object.keys(app.fields).forEach(f => {
                const field = app.fields[f];
                const { type } = field;

                if (type === 'Date' || type === 'Datespan') {
                    const v = values[f];
                    if (data.values[f]) {
                        data.values[f] = type === 'Date' ? v.toDate() : [v[0].toDate(), v[1].toDate()]
                    }
                }
                if (type === 'Year') {
                    const v = values[f];
                    if (data.values[f]) {
                        data.values[f] = v.year();
                    }
                }
            });
            
            const methodeName = recordMode === 'NEW' ? 'insertDocument' : 'updateDocument';

            if (recordMode === 'EDIT') {
                data.docId = docId;
            }
            
            Meteor.call('__app.' + appId + '.' + methodeName, data, (err, res) => {
                console.log('Update', err, res);
                
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                }

                const { status, statusText } = res;

                if (status == EnumMethodResult.STATUS_SERVER_EXCEPTION) {
                    message.error('Ein unbekannter Systemfehler ist aufgetreten:\n' + statusText);
                    return;
                }

                if (status == EnumMethodResult.STATUS_ABORT) {
                    message.error(statusText);
                    return;
                }

                /*if (status === 'warning') {
                    message.warning(messageText);
                }

                if (status === 'success') {
                    message.success(messageText);
                }

                if (status === 'info') {
                    message.info(messageText);
                }*/

                if (status == EnumMethodResult.STATUS_OKAY && statusText) {
                    message.success(statusText);
                }
                                
                if (recordMode === 'NEW') {
                    // nach dem Neuzugang können wir auf den konkret gespeicherten Datensatz wechseln
                    FlowRouter.go(`/${productId}/${appId}/${res.docId}`);
                } else {
                    // EDIT, UPDATE
                    Meteor.call('__app.' + appId + '.lock', docId, true /*unlock*/, (err, result) => {
                        if (err) {
                            return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                        } else {
                            if (result.status == EnumMethodResult.STATUS_OKAY) {
                                setRecordMode('SHOW');
                            } else {
                                return message.warning('Es ist ein Fehler beim Entsperren der Daten aufgetreten. ' + result.statusText);
                            }
                        }
                    });
                }
            });

        }).catch(errorInfo => {
            console.log(errorInfo)
            message.error('Es ist ein Fehler beim Speichern der Daten aufgetreten. Bitte überprüfen Sie Ihre Eingaben.');
        });
    }

    const editRecord = () => {
        if (recordMode === 'SHOW') {
            Meteor.call('__app.' + appId + '.lock', docId, (err, result) => { 
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY) {
                        setRecordMode('EDIT');
                    } else {
                        return message.warning('Es ist ein Fehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + result.appStatusText);
                    }
                }
            });
        }
    }

    const cancelRecord = () => {
        if (recordMode === 'EDIT' && document && document._id) {
            Meteor.call('__app.' + appId + '.lock', docId, true /*unlock*/, (err, result) => {
                if (err) {
                    return message.error('Es ist ein unbekannter Systemfehler beim Sperren der Daten aufgetreten. Bitte wenden Sie sich an den Systemadministrator.' + err.message);
                } else {
                    if (result.status == EnumMethodResult.STATUS_OKAY) {
                        setRecordMode('SHOW');
                    } else {
                        return message.warning('Es ist ein Fehler beim Entsperren der Daten aufgetreten.' + result.statusText);
                    }
                }
            });

            // on cancel reset to original saved values
            recordForm.setFieldsValue(document);
        } else if (recordMode === 'NEW') {
            history.back();
        }
    }

    const shareRecord = () => {
        console.log('share clicked');
    }

    const showLockInfo = () => {

    }
    
    let pageButtons = null;
    if (recordMode === 'NEW' || recordMode === 'EDIT') {
        pageButtons = [
            <Button key="cancelEdit" onClick={cancelRecord}>Abbruch</Button>,
            <Button key="save" type="primary" onClick={saveRecord}>Speichern</Button>,
        ]
    } else if ( recordMode === 'SHOW') {
        if (lock) {
            /*pageButtons = [
                <div key="locked" style={{marginTop:16}}>
                    <Tag icon={<StopOutlined />} color="error">gesperrt</Tag>
                    {lock.lockedBy.firstName + ' ' + lock.lockedBy.lastName}
                </div>                
            ];*/
            pageButtons = [
                <Comment key="locked"
                    author={lock.lockedBy.firstName + ' ' + lock.lockedBy.lastName}
                    avatar={<Expert onlyAvatar user={lock.lockedBy}/>}
                    content={
                        <Tag icon={<StopOutlined />} color="error">gesperrt</Tag>
                    }
                    datetime={
                        <Tooltip title={moment(lock.lockedAt).format('DD.MM.YYYY HH:mm')}>
                            <span>{moment(lock.lockedAt).locale('de').fromNow()}</span>
                        </Tooltip>
                    }
                />
            ];
        } else {
            pageButtons = [
                <Button key="edit" type="dashed" icon={<EditOutlined />} onClick={editRecord}>Bearbeiten</Button>,
            ];
        }
    } else {
        pageButtons = [];
    }

    let valuesChangeHooks = []
    const onFieldsChangeHook = (changedFields, allFields) => {
        //console.log('onFieldsChangeHook', changedFields, allFields);
    }

    const registerValuesChangeHook = fnHook => {
        if (!valuesChangeHooks.find(fn => fn === fnHook))
            valuesChangeHooks.push(fnHook);
    }

    const onValuesChangeHook = (changedValues, allValues) => {
        const setValue = (field, value) => {
            recordForm.setFieldsValue({[field]:value});
        }

        valuesChangeHooks.forEach(fn => fn(changedValues, allValues, setValue));
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
                    <a href={"/dashboards/" + product._id}>{product.title}</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {app.title}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Affix className="mbac-affix-style-bottom" offsetTop={66}>
                <PageHeader
                    title={<span><i className={app.icon} style={{fontSize:32, marginRight:16 }}/>{recordMode !== 'NEW' ? document && document.title : ''}</span>}
                    subTitle={
                        <MediaQuery showAtTablet showAtDesktop >
                            <span style={{marginTop:8, display:'flex'}}>{recordMode === 'NEW' ? 'Neuzugang' : null} {`(${app.namesAndMessages.singular.ohneArtikel})`}</span>
                        </MediaQuery>
                    }
                    /*tags={
                        <MediaQuery showAtTablet showAtDesktop >
                            {
                                recordMode === 'NEW' 
                                    ? <Tag color="orange" style={{marginTop:8, display:'flex'}}>nicht gespeichert</Tag>
                                    : <Tag color="green" style={{marginTop:8, display:'flex'}}>{record && record._id}</Tag>
                            }
                        </MediaQuery>
                    }*/
                    extra={pageButtons}
                    style={{borderBottom:'2px solid #e1e1e1', marginBottom:16}}
                />
            </Affix>

            <Form
                layout="horizontal"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                form={recordForm}

                onFieldsChange={onFieldsChangeHook}
                onValuesChange={onValuesChangeHook}

                preserve={false}
            >

                <AppLayout
                    product={product}
                    app={app}

                    defaults={defaults}
                    document={document}
                    mode={recordMode}
                    
                    onValuesChange={registerValuesChangeHook}
                />
            </Form>
        </Fragment>
    );
}
