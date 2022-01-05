import { Meteor } from 'meteor/meteor';
//import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';
import { useEffect, useState } from 'react';
import { EnumMethodResult } from '/imports/api/consts';
import { getAppStore, IGenericDocument } from '/imports/api/lib/core';
import { IAppresult, IAppsresult } from '/imports/api/types/app-types';

import { Activities } from '/imports/api/lib/activities';

import moment from 'moment';

/**
 * Reactive current User Account
 */
 export const useAccount = () => useTracker(() => {
    const user = Meteor.user();
    const userId:string|null = Meteor.userId();

    const subscription = Meteor.subscribe('currentUser');
    let currentUser = null;

    if (subscription.ready()) {
        currentUser = Meteor.users.findOne({_id:<string>userId}, { fields: { username: 1, userData: 1 }});
    }

    return {
        user,
        userId,
        currentUser,
        isLoggedIn: !!userId,
        accountsReady: user !== undefined && subscription.ready()
    }
}, [])

import { IProductresult, IProductsresult } from '/imports/api/types/world';
import { isArray, isDate } from '/imports/api/lib/basics';
import { Avatars } from '/imports/api/lib/avatars';
import { IDocumentLock } from '/imports/api/lib/world';

/**
 * Load the Products that are shared with the current user
 * 
 * @param {String} userId   Specifies the user
 */
 export const useProducts = () => {
    const [ productData, setProductData ] = useState<IProductsresult>({
        products: null, 
        status: EnumMethodResult.STATUS_LOADING, 
        statusText: null
    });

    if (!Meteor.user()) {
        const productState = {
            products: null,
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setProductData(productState);
    }
    
    useEffect(() => {
        Meteor.call('__productData.getProducts', (err: Meteor.Error, result: IProductsresult) => {
            if (err) {
                const productState = {
                    products: null,
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                setProductData(productState)
            } else {
                setProductData(result)
            }
        });
    }, []);

    return productData;
};

/**
 * Lese das angegeben Produkt für den aktuellen Benutzer
 * 
 * @param {String} userId   Specifies the user
 */
export const useProduct = (productId: string):IProductresult => {
    const [ productData, setProductData ] = useState<IProductresult>({
        product: null, 
        status: EnumMethodResult.STATUS_LOADING, 
        statusText: null
    });

    if (!Meteor.user()) {
        const newtState = {
            product: null,
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setProductData(newtState);
    }
    
    useEffect(() => {
        Meteor.call('__productData.getProduct', productId, (err: Meteor.Error, result: IProductresult) => {
            if (err) {
                const newtState = {
                    product: null,
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                setProductData(newtState)
            } else {
                setProductData(result)
            }
        });
    }, []);

    return productData;
};

/**
 * Lese der AppMeta-Data für die angegeben App-Id
 * 
 * @param {String} appId   Specifies the app
 */
 export const useApp = (appId: string):IAppresult<unknown> => {   
    const [ appsData, setAppsData ] = useState<IAppresult<unknown>>({
        app: null, 
        status: EnumMethodResult.STATUS_LOADING, 
        statusText: null
    });

    if (!Meteor.user()) {
        const newState = {
            app: null,
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf die angegebene App.'
        }
        setAppsData(newState);
    }
    
    useEffect(() => {
        Meteor.call('__appData.getApp', appId, (err: Meteor.Error, result: IAppresult<unknown>) => {
            if (err) {
                const newState = {
                    app: null,
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                setAppsData(newState)
            } else {
                let { app } = result;

                let dashboardPicker = () => { return 'default' }
                if ( app && app.dashboardPicker) {
                    app.dashboardPicker = eval(<string>app.dashboardPicker);
                } else if (app && !app.dashboardPicker) {
                    app.dashboardPicker = dashboardPicker
                }
                
                setAppsData(result)
            }
        });
    }, [appId]);

    return appsData;
};

/**
 * Lese alle Module zu einem bestimmten Produkt
 * 
 * @param {String} userId   Specifies the user
 */
export const useAppsByProduct = (productId: string) => {   
    const [ appsData, setAppsData ] = useState<IAppsresult<unknown>>({
        apps: null, 
        status: EnumMethodResult.STATUS_LOADING, 
        statusText: null
    });

    if (!Meteor.user()) {
        const newState = {
            apps: null,
            status: EnumMethodResult.STATUS_NOT_LOGGED_IN,
            statusText: 'Sie sind nicht angemeldet und haben keinen Zugriff auf das angegebene Modul.'
        }
        setAppsData(newState);
    }
    
    useEffect(() => {
        Meteor.call('__appData.getAppsByProduct', productId, (err: Meteor.Error, result: IAppsresult<unknown>) => {
            if (err) {
                const newState = {
                    apps: null,
                    status: EnumMethodResult.STATUS_SERVER_EXCEPTION,
                    statusText: 'Ein unerwarteter Fehler ist aufgetreten.\n' + err.error + ' ' + err.message
                }
                setAppsData(newState)
            } else {
                setAppsData(result)
            }
        });
    }, [productId]);

    return appsData;
};

export type IGenericDocumentTrackerResult = [IGenericDocument|null, EnumMethodResult];


/** 
 * Lesen des angegeben Datensatzes
 * für die angegebene App
 */
export const useDocument = (appId: string, docId: string) => useTracker( ():IGenericDocumentTrackerResult => {
    if (!appId || !docId) return [null, EnumMethodResult.STATUS_ABORT];

    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }

    const appStore = getAppStore(appId);

    const handler = Meteor.subscribe('__app.' + appId + '.document', { docId });

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const doc = appStore.findOne(docId);

    // prüfen ob ein document gefunden wurde
    // ggf. ist das Produkt oder Modul nicht mit dem angemeldeten Benutzer
    // geteilt und somit besteht auch kein Zugriff auf den eigentlichen Datensatz
    if (!doc) return [null, EnumMethodResult.STATUS_OKAY];

    // transform Date to moment
    doc && Object.keys(doc).forEach((propName:string) => {
        const v:any = doc[propName];
        if (v && isDate(v)) {
            doc[propName] = moment(v);
        } else if (v && isArray(v) && v.length > 0 && isDate(v[0])) {
            v[0] = moment(v[0]);
            v[1] = moment(v[1]);

            doc[propName] = v;
        }
    });

    return [ doc, EnumMethodResult.STATUS_OKAY ];
}, [appId, docId]);


export type IDocumentLockTrackerResult = [IDocumentLock|null, EnumMethodResult];

/** 
 * Lesen des aktuellen Lockstatus für das angegeben Dokument und
 * für die angegebene App
 */
 export const useDocumentLock = (appId: string, docId: string) => useTracker( ():IDocumentLockTrackerResult => {
    if (!appId || !docId) return [null, EnumMethodResult.STATUS_ABORT];

    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }

    const lockStore = getAppStore('__locks');

    const handler = Meteor.subscribe('__app.' + appId + '.islocked', docId );

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const isLocked = lockStore.findOne({ appId, docId });

    return [ isLocked, EnumMethodResult.STATUS_OKAY ];
}, [appId, docId]);

export type IuseActivitiesResult = [Array<IGenericDocument>|null, EnumMethodResult];

/** 
 * Lesen der activities für die angegebene App und den Datensatz
 * 
 */
export const useActivities = (appId: string, docId: string) => useTracker( ():IuseActivitiesResult => {
    if (!appId || !docId) return [null, EnumMethodResult.STATUS_ABORT];

    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }    

    const subName:string = `__app.${appId}.activities`;
    
    const handler = Meteor.subscribe(subName, docId);

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const activities = Activities.find<IGenericDocument>({ appId, docId }).fetch();

    return [ activities, EnumMethodResult.STATUS_OKAY ];
}, [appId, docId]);



export const useAvatar = (userId:string) => useTracker( (): IGenericDocumentTrackerResult => {
    if (!Meteor.user()) {
        return [null, EnumMethodResult.STATUS_NOT_LOGGED_IN];
    }
    const handler = Meteor.subscribe('__avatar', userId);

    if (!handler.ready()) { 
        return [ null, EnumMethodResult.STATUS_LOADING];
    }

    const avatar = Avatars.findOne({ userId });

    return [
        avatar ? avatar.link() : null,
        EnumMethodResult.STATUS_OKAY
    ];
}, [userId]);
