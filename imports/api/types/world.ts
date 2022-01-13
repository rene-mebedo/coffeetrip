import { Meteor, Subscription } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { AppData, TInjectables } from './app-types';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { ChartOptions, ChartData } from 'chart.js';

import { ModalFunc } from 'antd/lib/modal/confirm';
import { MessageApi } from 'antd/lib/message';

export interface IUserShort {
    userId: string,
    firstName: string,
    lastName: string
}

export interface ISharedWith {
    user: IUserShort,
    role?: string
}

export interface IMethodStatus {
    status: EnumMethodResult,
    statusText?: string | null,
}

export interface IProduct {
    _id?:string,
    title: string,
    description: string,
    position?: number,
    icon?: string,
    sharedWith: Array<ISharedWith>,
    sharedWithRoles: Array<string>
}

export interface IProductresult extends IMethodStatus {
    product?: IProduct | null
}

export interface IProductsresult extends IMethodStatus {
    products?: Array<IProduct> | null
}

export interface IClientCollectionResult extends IMethodStatus {
    appIds?: Array<string/*|undefined*/> | null
}

export interface IWorld {
    title: string,
    description: string,
    logoUrl: string
}

export interface IUserData {
    roles: Array<string>,
    firstName: string,
    lastName: string
}

export interface IWorldUser extends Meteor.User {
    userData: IUserData
}


export interface IChartData {
    options: ChartOptions, data: ChartData
}


export interface IReportRendererExtras {
    injectables: TInjectables
    isExport: boolean
}

export type TColumnRenderer<T> = string | ((columnData: any, doc:AppData<T>, extras: IReportRendererExtras) => string | JSX.Element)

export interface IReportDatasourceProps<T>{
    document?: AppData<T>
    defaults?: AppData<T>
    mode: EnumDocumentModes | "dashboard"
    isServer: boolean,
    publication?: Subscription // nur serverseitig verfügbar
    currentUser: IWorldUser
}

export type TReportDatasource<T> = string | ((props: IReportDatasourceProps<T>) => Mongo.Cursor<T> | { fetch: () => any } | void | Array<any> );

export interface IReportColumns<T> {
    key: string
    dataIndex: string
    title: string
    render?: TColumnRenderer<T> //string | ((columnData: any, doc:AppData<any>, extras: IReportRendererExtras) => string | JSX.Element) | undefined
    align?: 'left' | 'right' | 'center'
}

export interface IReport<T, Caller> {
    _id?: string
    title: string
    description: string
    /**
     * Hides the title section of an table typed report
     */
    noHeader?: boolean
    type: 'table' | 'chart' | 'widget'
    chartType?: 'bar' | 'line' | 'pie'
    icon?:string
    columns?: Array<IReportColumns<T>>
    isStatic: boolean
    staticDatasource?: TReportDatasource<Caller>
    liveDatasource?: TReportDatasource<Caller>
    injectables?: TInjectables
    actions?: Array<IReportAction>
    /**
     * ID of a given Report to show as nested report for
     * each data column
     */
    nestedReportId?: string
}

export interface IDisableReportActionProps {
    mode: EnumDocumentModes
    data: AppData<any>
    record: AppData<any>
    defaults: AppData<any>
    currentUser: IWorldUser
}

export interface IReportAction {
    title: string;
    description: string;
    icon?: string;
    iconOnly?: boolean;
    /**
     * gibt an, ob die Action z.B. Neuzugang als alg. Aktion überhalb des Reports dargestelt wird
     * oder für jeden einzelnen Datensatz angeboten wird
     */
    inGeneral?: boolean;
    /**
     * gibt an, ob dies die "Haut"Aktion ist. Diese wird im rendering direkt dargestellt und hervorgehben
     */
    type: 'primary' | 'secondary' | 'more';

    /**
     * Gibt an, ob die Action nur im Bezug eines Hauptreports (pageStyle = true)
     * angezeigt werden soll oder ob die Action nur im Dashboard oder im Dokument angezeigt werden soll.
     */
    visibleAt: Array<'ReportPage' | 'Dashboard' | 'Document'>

    visibleBy: Array<string>
    executeBy: Array<string>
    
    /**
     * Funktion, die prüft ob die Action deaktiviert werden soll oder nicht
     */
    disabled?: string | ( ( props: IDisableReportActionProps ) => boolean );
    /**
     * Funktion, die prüft ob die Action angezeigt werde soll oder nicht
     */
    visible?: string | ((props: IDisableReportActionProps) => boolean);
    
    onExecute: IReportActionExecution;
}


export interface IRunScriptData {
    /**
     * current rowdata of the report where the action is located
     */
    row: AppData<any>
    /**
     * Parent/Document that was displayed where the report is implemented
     * in the layout
     */
    document: AppData<any>
}

export interface IRunScriptTools {
    confirm: ModalFunc,
    message: MessageApi
    /**
     * Invokes an app-method on the Server
     */
    invoke: (name: string, ...args: any[]) => any;
}

export interface IReportActionExecution {
    /**
     * URL, die aufgerufen werden soll, sobald die Aktion ausgeführt wird
     */
    redirect?: string
    /**
     * Export in CSV, wobei filename den Dateiname als Vorschlag angibt
     * Der Export erfolgt client-seitig
     */
     exportToCSV?: {    
        filename: string
    }
    /**
     * Funktion, die als methode für Server und client registriert wird
     */
    runScript?: string | ((data: IRunScriptData, tools: IRunScriptTools) => void);
}