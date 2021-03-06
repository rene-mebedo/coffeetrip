//import { Meteor } from 'meteor/meteor';
import React, { Fragment } from 'react';
import List from 'antd/lib/list';
import Tag from 'antd/lib/tag';
import Skeleton from 'antd/lib/skeleton';
import Typography from 'antd/lib/typography';
//import Select from 'antd/lib/select';
import Space from 'antd/lib/space';

const { Text } = Typography;

import { Expert } from './expert';
//import { useModule, useRecord, useRoles } from '../client/trackers';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { useApp, useDocument } from '/client/clientdata';
import { IApp } from '/imports/api/types/app-types';
import { ISharedWith, IWorldUser } from '/imports/api/types/world';

const firstLetterUppercase = (text: string): string => {
    return text[0].toUpperCase() + text.substring(1);
}

const Headline = ({ app }: { app:IApp<unknown>}): JSX.Element => {
    const { mitArtikel } = app.namesAndMessages.singular;
    const appName = firstLetterUppercase(mitArtikel);

    return (
        <Text>
            { appName } wurde mit nachfolgenden Personen geteilt:
        </Text>
    )
}

interface ISharedWithRolesProps {
    sharedWithRoles: Array<string>,
    currentUser: IWorldUser
}

const SharedWithRoles = ( _props: ISharedWithRolesProps ) => {
    //const { sharedWithRoles, currentUser } = props;
    //TODO: SharedWithRoles implementieren

    /*const [roles, rolesLoading ] = useRoles();
    const roles = ['ADMIN', 'JEDER', 'EXTERN', 'AKADEMIE', 'CONSULTING', 'MEBEDO AC'];
    const [ selectedRoles, setSelectedRoles ] = useState([]);

    const handleChange = (selectedItems:any) => {
        setSelectedRoles(selectedItems);
    }*/

    //const filteredRoles = roles.filter(o => !selectedRoles.includes(o));

    return <Space direction="vertical">
        <Tag color="blue" closable>Mitarbeiter</Tag>
        <Tag color="orange" closable>Extern</Tag>
    </Space>
    
    /*return (
        <Select
            mode="multiple"
            value={selectedRoles}
            onChange={handleChange}
            loading={rolesLoading}
            style={{ width: '100%' }}
        >
            {roles.map(item => (
                <Select.Option key={item._id} value={item._id}>
                    {item.rolename}
                </Select.Option>
            ))}
        </Select>
    );*/
}


export interface ISharedWithProps {
    currentUser: any
    appId: string
    docId: string
    mode: EnumDocumentModes
}

export const SharedWith = ( props: ISharedWithProps ): JSX.Element => {
    const { currentUser, appId, docId, mode } = props;

    const { app, status: appStatus, statusText: _appStatusText } = useApp(appId);
    const [ doc, docStatus ] = useDocument(appId, docId);

    const sharedWith = doc && doc.sharedWith || [];
    const sharedWithRoles = doc && doc.sharedWithRoles || [];

    if ( mode == EnumDocumentModes.NEW ) {
        return <div>
            <p>Die Funktion des Teilens steht erst nach vollst??ndiger Erstellung dieses Dokuments zur Verf??gung.</p>
        </div>
    }

    return (
        <Fragment>
            {   appStatus === EnumMethodResult.STATUS_LOADING
                    ? <Skeleton paragraph={{ rows: 2 }} />
                    : <Headline app={app as IApp<unknown>} />
            }
            <List
                className="list-shared-with-users"
                itemLayout="vertical"
                dataSource={sharedWith}
                loading={ appStatus === EnumMethodResult.STATUS_LOADING || docStatus == EnumMethodResult.STATUS_LOADING }
                renderItem={(item: ISharedWith) => (
                    <li key={item.user.userId} style={{height:48,marginTop:8,borderBottom:'1px solid #e1e1e1'}}>
                        <Space>
                            <Expert onlyAvatar user={item.user}/>
                            <Text>{item.user.firstName + ' ' + item.user.lastName}</Text>
                            { item.role ? <Tag color="orange">{item.role}</Tag> : null }
                        </Space>
                    </li>
                )}
            />

            <p style={{marginTop:16}}>
                <Text>
                    Des Weiteren haben alle Personen die den nachfolgenden Gruppen angeh??ren Zugriff:
                </Text>
            </p>
            <SharedWithRoles sharedWithRoles={sharedWithRoles} currentUser={currentUser} />
        </Fragment>
    )
}