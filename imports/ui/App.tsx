import { Meteor } from 'meteor/meteor';
import React, { useEffect } from 'react';

import Spin from 'antd/lib/spin';
import notification from 'antd/lib/notification';

import { LoginPage } from './pages/login';
import { DefaultLayout } from './layouts/DefaultLayout';
import { useAccount } from '../../client/clientdata';
import { getAppStore } from '../api/lib/core';
import { IClientCollectionResult } from '../api/types/world';
import { EnumMethodResult } from '../api/consts';
import { NotFoundPage } from './pages/not-found';


export interface IAppProps {
    content: React.FC
    authenticatedRoute: boolean,
    routeStatus: string,
    props: any[]
}

export const App:React.FC<IAppProps> = ({ content, routeStatus, authenticatedRoute = true, ...props }) => {
    const { currentUser, isLoggedIn, accountsReady } = useAccount();
    //const { roles, rolesLoading } = useRoles();

    useEffect(() => {
        const reactRoot = document.getElementById('react-root');
        // add done for the initial loading
        reactRoot && reactRoot.classList.add('done');

        Meteor.call('__appData.clientCollectionInit', (err: Meteor.Error, result: IClientCollectionResult) => {
            if (err) {
                notification.error({
                    message: `Unbekannter Fehler`,
                    description: 'Es ist ein unbekannter Fehler beim initialisieren der Client-Appstores aufgetreten.' + err.message,
                    duration: 900
                });
            } else {
                const { appIds, status } = result;
            
                if (status == EnumMethodResult.STATUS_OKAY ) {
                    appIds && appIds.forEach( getAppStore ); //(appId: string) => getAppStore(appId))
                } else {
                    notification.error({
                        message: `Fehler`,
                        description: 'Es ist ein Fehler beim initialisieren der Client-Appstores aufgetreten.',
                        duration: 900
                    });
                }
            }
        })
    }, []);

    if (!accountsReady) {
        return <Spin size="large" />
    }

    if (!authenticatedRoute) {
        //return React.createElement(content, { ...props });
    }

    if (routeStatus == '404') {
        return <NotFoundPage />;
    }

    if (!isLoggedIn) {
        return <LoginPage />;
    }
    
    const contentProps: unknown = { currentUser, ...props };

    return (
        <DefaultLayout currentUser={currentUser} { ...props } >
            { React.createElement(content || null, contentProps as unknown as React.Attributes) }
        </DefaultLayout>
    );
}