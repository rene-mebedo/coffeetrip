import { World } from "./world";
import { IReport, IReportAction } from "../types/world";
import { deepClone, isFunction } from "./basics";
import { Meteor, Subscription } from "meteor/meteor";
import { ReportSchema } from "./schemas";


export class Report {
    private world: World
    private _originalReportDef: IReport<any, any>
    private _report: IReport<any, any> | null = null;
    private _reportId: string | null = null;

    constructor(world: World, reportDef: IReport<any, any>) {
        this.world = world;

        this._originalReportDef = deepClone(reportDef);

        this.registerReport(reportDef);
    }

    get reportId(): string {
        return this._reportId || '';
    }

    get report(): IReport<any, any> | null {
        return this._report;
    }

    get originalReportDef(): IReport<any, any> | null {
        return this._originalReportDef;
    }

    private registerReport = (r: IReport<any, any>) => {
        const reportId = r._id;
        console.log('Register Report', reportId);
        
        let report = r;
    
        if (r.columns) {
            r.columns = r.columns.map( col => {
                if (col.render && typeof col.render === 'function') col.render = col.render.toString()
                return col;
            });
        }
    
        if (r.actions) {
            r.actions = r.actions.map( (ac:IReportAction) => {
                if (ac.disabled && isFunction(ac.disabled)) ac.disabled = ac.disabled.toString();
                if (ac.visible && isFunction(ac.visible)) ac.visible = ac.visible.toString();
    
                if (ac.onExecute && ac.onExecute.runScript && isFunction(ac.onExecute.runScript)) {
                    ac.onExecute.runScript = ac.onExecute.runScript.toString();
                }
    
                ac.inGeneral = !!ac.inGeneral;
                ac.iconOnly = !!ac.iconOnly;

                return ac;
            })
        }
    
        if (report.staticDatasource) {
            const methodName = '__reports.' + reportId;

            console.log('Register method for static report', methodName);
            const fnDatasource: Function = report.staticDatasource as Function;
    
            Meteor.methods({ [methodName]: function(this:Meteor.MethodThisType, param) {
                param = param || {};
                param.isServer = true
                param.datasource = this;
                param.record = param.record || {};
    
                const currentUser = Meteor.users.findOne(this.userId as string);
                param.currentUser = currentUser;
    
                //console.log('From inside method', methodName, param);
                return fnDatasource.apply(this, [param]);
            }})
            
            r.staticDatasource = report.staticDatasource.toString();
        }
    
        if (report.liveDatasource) {
            const subscriptionName = '__reports.' + reportId;
            console.log('Register subscription for realtime-report', subscriptionName);
            const fnLiveData: Function = report.liveDatasource as Function;

            Meteor.publish(subscriptionName, function(this:Subscription, param) {
                param = param || {};
                param.isServer = true
                param.publication = this;
                param.record = param.record || {};
    
                const currentUser = Meteor.users.findOne(this.userId as string);
                param.currentUser = currentUser;
    
                //console.log('From inside publication', subscriptionName, param);
                return fnLiveData.apply(this, [param]);
            });
            
            r.liveDatasource = report.liveDatasource.toString();
        }
    
        try {
            ReportSchema.validate(r);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        this._reportId = this.world.reportCollection.insert(report);
        this._report = r; 
    
        console.log(`done. (register Report ${reportId})`);
    }
}