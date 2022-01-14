import { IMethodStatus, IReport, TMoment } from "./world";
import { EnumControltypes, EnumDocumentModes, EnumFieldTypes, EnumMethodResult } from "../consts";
import { IGenericDocument } from "../lib/core";
import { App } from "../lib/app";
//import { Report } from "../lib/report";
import { ColProps } from "antd/lib/grid";
import { Rule } from "antd/lib/form";

export interface IPostProps {
    docId: string
    msg: any
}

export interface IActivitiesReplyToProps {
    docId: string
    activityId: string
    answer: any
}

export type TString = string;

export type TAppLinkItem = {
    _id: string
    title: string
    description: string
    link?: string
    imageUrl?: string
}
export type TAppLink = Array<TAppLinkItem>

export interface IAppLink<T> {
    app: App<T> | string, // placing the App or the id as string
    hasDescription: boolean,
    //description?: (doc:{ [key:string]: any }) => string
    description?: (doc: AppData<T>) => string
    hasImage: boolean,
    imageUrl?: (doc: AppData<T>) => string
    linkable: boolean
    link?: (doc: AppData<T>) => string
}

export interface IGetAppLinkOptionProps {
    appId: string,
    fieldId: string,
    currentInput: string,
    values: Array<any>
}

export interface IGetUsersSharedWithResult extends IMethodStatus {
    users?: Array<{
        userId: string,
        firstName: string,
        lastName: string
    }>
}

export interface IGenericAppLinkOptionsResult extends IMethodStatus {
    options?: Array<IGenericDocument>
}

export type TInjectables = { [key: string]: any }
export interface IAutoValueProps<T> {
    //allValues: { [key:string]: any }

    allValues: AppData<T> //{ [key in keyof T]: T[key] }
    injectables: TInjectables
}

export interface IAppField<T> {
    title?: string
    type: EnumFieldTypes,
    rules?: Array<Rule>,
    autoValue?: (props:IAutoValueProps<T>) => any,
    appLink?: IAppLink<any>,

    namesAndMessages: {
        singular: { 
            ohneArtikel: string, 
            mitArtikel: string
        },
        plural: {
            ohneArtikel: string,
            mitArtikel: string
        },

        messages: {
            onUpdate: string
        }
    }
}

export interface IToolExtras {
    moment: TMoment
}

export interface IEnabledProps {
    changedValues: IGenericDocument,
    allValues: IGenericDocument,
    mode: EnumDocumentModes,
    tools: IToolExtras
}

export interface IVisibleProps<T> {
    changedValues: AppData<T>,
    allValues: AppData<T>,
    mode: EnumDocumentModes,
    tools: IToolExtras
}

export interface IGenericAppLayoutElement<T> {
    field?: keyof T,
    title?: string,
    /**
     * True, if the title should be surpressed for the layout
     */
    noTitle?: boolean,
    controlType: EnumControltypes,
    enabled?: (props:IEnabledProps) => boolean
    visible?: (props:IVisibleProps<T>) => boolean
}

export interface IGoogleMapsLocationProps {
    currentLocation?: string,
    document: IGenericDocument,
    mode: EnumDocumentModes,
    allValues?: IGenericDocument,
    changedValues?: IGenericDocument
}

export interface IAppLayoutElementWidgetSimple<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctWidgetSimple
    /**
     * Fontawesome icon class like 'fas fa-user'
     */
    icon: string
    color?: string
    backgroundColor?: string,
    render?: (fieldValue: any, doc: AppData<T>) => number | string | JSX.Element
}

export interface IAppLayoutElementDivider<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctDivider;
    orientation?: 'left' | 'right' | 'center';
}

export interface IAppLayoutElementColumns<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctColumns;
    columns: Array<{
        columnDetails: ColProps & React.RefAttributes<HTMLDivElement>
        elements: Array<TAppLayoutElement<T>>
    }>
}

export interface IAppLayoutElementCollapsible<T> extends IGenericAppLayoutElement<T> {
    title: string;  // title ist verpflichtend, da es keine referenz auf ein Field gib und daher nicht dieser Fieldtitle verwandt werden kann
                    // falls das Propertiy nicht gesetzt ist
    controlType: EnumControltypes.ctCollapsible;
    collapsedByDefault?: boolean;
    elements: Array<TAppLayoutElement<T>>;
}


export interface IAppLayoutElementGoogleMap<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctGoogleMap,
    googleMapDetails: {
        location: string | ((props:IGoogleMapsLocationProps) => string),
        /**
         * Defines the height of the map-control shown to the user.
         * The default is "500px"
         */
        height?: string,
        /**
         * Defines the width of the map-control shown to the user.
         * The default is "100%"
         */
        width?: string
    }
}

export interface IOptionValue<T> {
    /**
     * Specifies the unique ID of the value
     */
    _id: T
    /**
     * Title of the value to display
     */
    title: string
    /**
     * Optional title for plural
     */
    pluralTitle?: string
    /**
     * Some description for the value
     */
    description?: string
    /**
     * Specifies the color for further use
     */
    color?: string | number
    /**
     * Specifies the backgroundcolor for some further us
     */
    backgroundColor?: string | number
    /**
     * Specifies the fontawesome icon-class eg: "fas fa-building"
     */
    icon?: string,
    /**
     * Specifies indivial options for this item
     */
    options?: any
}

export type TOptionValues<T> = Array<IOptionValue<T>>;

export interface IAppLayoutElementInlineCombination<T> extends IGenericAppLayoutElement<T> {
    title: string,
    controlType: EnumControltypes.ctInlineCombination,
    elements: Array<TAppLayoutElement<T>>;
}

export interface IAppLayoutElementSpacer<T> extends IGenericAppLayoutElement<T> {
    title: string,
    controlType: EnumControltypes.ctSpacer,
    elements: Array<TAppLayoutElement<T>>;
}

export interface IAppLayoutElementReport<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctReport,
    reportId: string
}

export interface IAppLayoutElementOptionInput<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctOptionInput,
    values: TOptionValues<any>,
    direction?: 'horizontal' | 'vertical',
    defaultValue?: string
}

export interface IAppLayoutElementGenericInput<T> extends IGenericAppLayoutElement<T> {
    controlType: EnumControltypes.ctStringInput | 
                 EnumControltypes.ctTextInput | 
                 EnumControltypes.ctNumberInput | 
                 EnumControltypes.ctCurrencyInput | 
                 EnumControltypes.ctDateInput | 
                 EnumControltypes.ctDatespanInput | 
                 EnumControltypes.ctYearInput | 
                 EnumControltypes.ctHtmlInput |
                 EnumControltypes.ctSingleModuleOption |
                 EnumControltypes.ctReport;                
}

export type TAppLayoutElement<T> = IAppLayoutElementReport<T> |
                                IAppLayoutElementOptionInput<T> | 
                                IAppLayoutElementDivider<T> | 
                                IAppLayoutElementGoogleMap<T> | 
                                IAppLayoutElementCollapsible<T> |
                                IAppLayoutElementInlineCombination<T> |
                                IAppLayoutElementSpacer<T> |
                                IAppLayoutElementGenericInput<T> |
                                IAppLayoutElementWidgetSimple<T> |
                                IAppLayoutElementColumns<T>;


export interface IAppLayout<T> {
    title: string,
    description: string,
    visibleBy: Array<string>,
    elements: Array<TAppLayoutElement<T>>;
}

export interface IDefaultAppData<T> extends IAppMethodResult {
    defaults?: DefaultAppData<T>
}

export interface IAppMethodsDefaultProps<T> {
    /**
     * queryParams comming from the client url
     */
    queryParams?: { [key:string]: any }
    /**
     * unknown??? //TODO -> specify
     */
    document?: AppData<T>
    /**
     * Injected on the Server insert method with the NEW-data to insert as document
     */
    NEW?: AppData<T>
    isServer: boolean
}

export interface IAppMethodResult {
    status: EnumMethodResult,
    statusText?: string | null,
}

export interface ITriggerTools<T> {
    /**
     * Returns True if the specified property value has changed,
     * otherwise False
     */
     hasChanged: (propName: keyof T) => boolean
     /**
      * Returns the current Value of the give Prop
      * inside the update-trigger
      */
     currentValue: (propName: keyof T) => any 
}

export interface IDefaultsTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface TInsertTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IUpdateTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IRemoveTriggerExtras<T> extends ITriggerTools<T> {
    session: any,
    moment: TMoment
}

export interface IAppMethods<T> {
    /**
     * Ermittlung dynamischer Defaults für diese App, die als Rückgabewert
     * an die Generic übermittelt werden.
     */
    defaults?: (props: IAppMethodsDefaultProps<T>, triggerExtrags?: IDefaultsTriggerExtras<T>) => Promise<IDefaultAppData<T>>,

    onBeforeInsert?: (values: AppData<T>, triggerExtras: TInsertTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterInsert?: (id: string, values: AppData<T>, triggerExtras: TInsertTriggerExtras<T>) => Promise<IAppMethodResult>,
    onBeforeUpdate?: (id: string, values: UpdateableAppData<T>, oldValues: AppData<T>, triggerExtras: IUpdateTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterUpdate?: (id: string, values: UpdateableAppData<T>, oldValues: AppData<T>, triggerExtras: IUpdateTriggerExtras<T>) => Promise<IAppMethodResult>,
    onBeforeRemove?: (values: AppData<T>, triggerExtras: IRemoveTriggerExtras<T>) => Promise<IAppMethodResult>,
    onAfterRemove?: (values: AppData<T>, triggerExtras: IRemoveTriggerExtras<T>) => Promise<IAppMethodResult>,
}

export interface IAppActions {
    isPrimaryAction: boolean,

    description: string,
    icon: string | undefined,

    visibleBy: Array<string>,
    executeBy: Array<string>,

    onExecute: {
        redirect?: string
    }

}

interface IAppDashboardElementTypeGeneric {
    _id: string
    width?: ColProps
}

export interface IAppDashboardElementChart extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'chart'
        chartType: 'bar' | 'line' | 'pie'
        document?: DefaultAppData<any>
    }
}

export interface IAppDashboardElementWidget extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'widget'
        document?: DefaultAppData<any>
    }
}

export interface IAppDashboardElementReport extends IAppDashboardElementTypeGeneric {
    type: 'report'
    details: {        
        reportId: string
        type: 'table'
        document?: DefaultAppData<any>
        //defaults?: DefaultAppData<any>
    }
}

export type TAppDashboardElementType = IAppDashboardElementReport | IAppDashboardElementWidget | IAppDashboardElementChart;

export type TAppDashboardRow = { elements: Array<TAppDashboardElementType> };

export interface IAppDashboard {
    rows: Array<TAppDashboardRow>
}

/**
 * Every AppData property as optional of Type T without the _id prop
 */
export type UpdateableAppData<T> = { [key in keyof T]?: T[key] } & {
    // ID could not be updated _id?: string
    _rev?: number
};

export type DefaultAppData<T> = { [key in keyof T]?: T[key] } & {
    _id?: string 
    _rev?: number
};

export type AppData<T> = { [key in keyof T]: T[key] } & {
     _id: string
     _rev: number
};

export interface IGenericApp {
    title: string;
    description: string;
}

export type TAppFields<T> = {
    [key in keyof T]: IAppField<T>
}

export interface IApp<T> {
    _id?: string,
    productId?: string,

    title: string,
    description: string,
    icon: string,
    position?: number,

    sharedWith: Array<string>,
    sharedWithRoles: Array<string>,

    namesAndMessages: {
        singular: {
            mitArtikel: string,
            ohneArtikel: string
        },
        plural: { 
            mitArtikel: string,
            ohneArtikel: string
        },

        messages: {
            activityRecordInserted?: string
            activityRecordUpdated?: string
            activityRecordRemoved?: string
        }
    },

    fields: TAppFields<T>,

    layouts: {
        [key: string]: IAppLayout<T> // old U
    },
    actions: {
        [key: string]: IAppActions
    },

    methods: IAppMethods<T>

    dashboardPicker: string | (() => string),
    dashboards: {        
        [ key: string ]: IAppDashboard
    },

    injectables?: TInjectables
}

export interface IAppresult<T> extends IMethodStatus {
    app?: IApp<T> | null
}

export interface IAppsresult<T> extends IMethodStatus {
    apps?: Array<IApp<T>> | null
}

export interface IGetReportResult extends IMethodStatus {
    report?: IReport<any, any>
}

export interface IGenericInsertArguments<T> {
    productId: string,
    appId: string,
    values: AppData<T>
}

export interface IGenericUpdateArguments<T> {
    productId: string,
    appId: string,
    docId: string,
    values: AppData<T>
}

export interface IGenericRemoveArguments {
    productId: string,
    appId: string,
    docId: string
}

export interface IGenericInsertResult extends IMethodStatus {
    docId?: string | null
}

export interface IGenericUpdateResult extends IMethodStatus {
    affectedDocs?: number | null
}

export interface IGenericRemoveResult extends IMethodStatus {
    affectedDocs?: number | null
}

export interface IGenericDefaultResult extends IMethodStatus {
    defaults?: null | IGenericDocument
}

export interface ILockResult extends IMethodStatus {
    lockId?: string
}
