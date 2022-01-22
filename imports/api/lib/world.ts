import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { EnumMethodResult } from '/imports/api/consts';
import { Product } from './product';
import { IApp, IAppMethodResult, IAppresult, IAppsresult, IGetReportResult } from '/imports/api/types/app-types';
import { MethodInvocationFunction } from './types';

import { IWorld, IWorldUser, IProduct, IProductresult, IProductsresult, IClientCollectionResult, TReport } from '/imports/api/types/world';
import { ProductSchema, AppSchema, ReportSchema, LockSchema } from './schemas';
import { Report } from './report';
import { check } from 'meteor/check';
import { Avatars } from './avatars';

//import { MongoInternals, InsertOneWriteOpResult, UpdateWriteOpResult, WriteOpResult } from 'meteor/mongo';
import * as SuperMongo from "meteor/mongo";
import { userHasOneOrMoreRequiredRole } from './security';
const { MongoInternals } = SuperMongo as unknown as any;

export interface InsertOneWriteOpResult {
    insertedId: string
}
export interface UpdateWriteOpResult {
    modifiedCount: number
}
export interface WriteOpResult {
    result: { ok: number }
}


export interface IDocumentLock {
    _id: string
    appId: string
    docId: string
    locked: boolean
    lockedBy: {
        userId: string
        sessionId: string
        firstName: string
        lastName: string 
    }
    lockedAt: Date
}

export class World {
    public worldCollection: Mongo.Collection<IWorld>;
    public productCollection: Mongo.Collection<IProduct>;
    public appCollection: Mongo.Collection<IApp<any>>;
    public reportCollection: Mongo.Collection<TReport<any, any>>;

    public locksCollection: Mongo.Collection<IDocumentLock>;

    private worldId: string;

    constructor() {
        this.worldId = '';

        this.worldCollection = new Mongo.Collection('__worldData');
        this.productCollection = new Mongo.Collection('__productData');
        this.productCollection.attachSchema(ProductSchema);
        this.appCollection = new Mongo.Collection('__appData');
        this.appCollection.attachSchema(AppSchema);
        this.reportCollection = new Mongo.Collection('__reportData');
        this.reportCollection.attachSchema(ReportSchema);

        this.locksCollection = new Mongo.Collection('__locks');
        this.locksCollection.attachSchema(LockSchema);
        this.locksCollection.createIndex({
            appId: 1,
            docId: 1
        }, { name:'lock-document', unique: true });

        [
            this.worldCollection,
            this.productCollection, 
            this.appCollection,

            this.reportCollection,
            this.locksCollection
        ].map( collection => {
            // remove all previous defined worlds, products, apps and reports
            collection.remove({});

            collection.allow ({
                insert() { return false; },
                update() { return false; },
                remove() { return false; },
            });
        });

        this.registerWorldMethods();

        Meteor.publish('__avatar', function publishAvatar(this:Subscription, userId: string) {
            if (!userId)
                return this.ready();

            check(userId, String);

            const currentUser = <IWorldUser>Meteor.users.findOne(<string>this.userId);
        
            if (!currentUser)
                return this.ready();

            return Avatars.find({_id: userId}).cursor;
        });

        Meteor.onConnection( (connection) => {
            connection.onClose( () => {
                // locks aufheben, wenn die Connection beendet wird
                this.locksCollection.remove({ 'lockedBy.sessionId' : connection.id })
            });
        });
    }

    createWorld( worldDef: IWorld ):string{
        this.worldId = this.worldCollection.insert(worldDef);
        return this.worldId;
    }

    public createProduct( productDef: IProduct ): Product {
        return new Product(this, productDef);
    }

    public createReport<T, Parent>( reportId: string, reportDef: TReport<T, Parent>): Report {
        reportDef._id = reportId;
        return new Report(this, reportDef);
    }

    /**
     * Register all neccessary Meteor Methods to get 
     * productData for the client
     * 
     */
    private registerWorldMethods() {
        this.getProduct();
        
        Meteor.methods({
            '__productData.getProduct': this.getProduct(),
            '__productData.getProducts': this.getProducts(),
            '__appData.getApp': this.getApp(),
            '__appData.getApps': this.getApps(),
            '__appData.getAppsByProduct': this.getAppsByProduct(),
            '__appData.clientCollectionInit': this.clientCollectionInit(),
            '__reportData.getReport': this.getReport()
        });
    }

    /**
     * Get the meta data of the specified product
     * 
     * @param productId Id of the requested product
     * @returns Metadata of product
     */
    private getProduct():MethodInvocationFunction {
        const Products = this.productCollection;

        return function(this:{userId:string}, productId: string):IProductresult {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };
        
            const product = <IProduct>Products.findOne({
                $and: [
                    { _id: productId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]        
                    }
                ]
            }); 
            
            if (!product) { 
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: `The product with the id "${productId}" was not found.` };
            }

            return { status: EnumMethodResult.STATUS_OKAY, product }
        }
    }

    /**
     * Get the meta data of all products the current
     * user is permitted to
     * 
     * @returns Metadata of all products
     */
    private getProducts():MethodInvocationFunction {
        const Products = this.productCollection;

        return function(this:{userId:string}):IProductsresult {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };
            
            const products = <Array<IProduct>>Products.find({
                $or: [
                    { "sharedWith.user.userId": currentUser._id },
                    { sharedWithRoles: { $in: currentUser.userData.roles } }
                ]        
            }, { sort: { position: 1, title: 1 } }).fetch();
            
            return { status: EnumMethodResult.STATUS_OKAY, products }
        }
    }

    /**
     * Get the Metadata of the specified app
     * @returns Metadata of app
     */
    private getApp():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}, appId:string):IAppresult<any> {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const app = Apps.findOne({
                $and: [
                    { _id: appId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            });
            
            if (!app) { 
                return { status: EnumMethodResult.STATUS_NOT_FOUND, statusText: `The app with the id "${appId}" was not found.` };
            }

            // rausfilteren der actions, die für den aktuellen Benutzer möglich sind
            const appActions = { ...app.actions };
            const actionCodes = Object.keys(appActions);
            
            
            app.actions = {}
            actionCodes.forEach( code => {
                const action = appActions[code];
                if (userHasOneOrMoreRequiredRole(currentUser.userData.roles, appActions[code].visibleBy)) {
                    app.actions[code] = action
                }
            });
            


            return { status: EnumMethodResult.STATUS_OKAY, app }
        }
    }

    /**
     * Get the Metadata of all app's the user is shared with
     * @returns Metadata of apps
     */
    private getApps():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}):IAppsresult<any> {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const apps = <Array<IApp<any>>>Apps.find({
                $or: [
                    { "sharedWith.user.userId": currentUser._id },
                    { sharedWithRoles: { $in: currentUser.userData.roles } }
                ]
            }).fetch();

            return { status: EnumMethodResult.STATUS_OKAY, apps }
        }
    }

    /**
     * Get the Metadata of all app's by the given product the user is shared with
     * @returns Metadata of apps
     */
    private getAppsByProduct():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}, productId: string):IAppsresult<any> {
            const currentUser = <IWorldUser>Meteor.users.findOne(this.userId);

            if (!currentUser)
                return { status: EnumMethodResult.STATUS_NOT_LOGGED_IN, statusText: 'You are not logged in.' };

            const apps = <Array<IApp<any>>>Apps.find({
                $and: [
                    { productId: productId },
                    {
                        $or: [
                            { "sharedWith.user.userId": currentUser._id },
                            { sharedWithRoles: { $in: currentUser.userData.roles } }
                        ]
                    }
                ]
            }, {sort: {position:1, title:1}}).fetch();
            
            return { status: EnumMethodResult.STATUS_OKAY, apps }
        }
    }

    /**
     * Get all App-Ids to init the mongos client collections
     * @returns Metadata of apps
     */
     private clientCollectionInit():MethodInvocationFunction {
        const Apps = this.appCollection;

        return function(this:{userId:string}):IClientCollectionResult {
            const appIds: Array<string|undefined> = Apps.find({}, { fields: { _id: 1 }}).map( ({ _id }) => <string>_id );
    
            return { status: EnumMethodResult.STATUS_OKAY, appIds: appIds as Array<string> }
        }
    }


    /**
     * Get all Metadata by the given reportId
     * @returns Metadata of report
     */
     private getReport():MethodInvocationFunction {
        const Reports = this.reportCollection;

        return function(this:{userId:string}, reportId: string):IGetReportResult {
            check(reportId, String);
            
            const report = Reports.findOne({ _id: reportId });
            
            return { status: EnumMethodResult.STATUS_OKAY, report }
        }
    }

    public async runTransaction(transactionHandler:(session:any)=>Promise<IAppMethodResult>): Promise<IAppMethodResult> {

        const { client } = MongoInternals.defaultRemoteCollectionDriver().mongo;
        const session = await client.startSession();
        await session.startTransaction();

        try {
            // running the async operations
            const result = await transactionHandler(session);
            if (result.status != EnumMethodResult.STATUS_OKAY) {
                await session.abortTransaction();
            } else {
                await session.commitTransaction();
            }
            // transaction committed - return value to the caller
            return result;
        } catch (err) {
            await session.abortTransaction();

            console.error(err.message);
            // transaction aborted - report error to the client
            throw new Meteor.Error('Database Transaction Failed', err.message);
        } finally {
            session.endSession();
        }
    }

}