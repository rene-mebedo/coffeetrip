import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IAppLink, IAppMethodResult, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Adresse, Adressen } from "../../allgemein/apps/adressen";
import { Projektstati } from "./projektstati";
import { TeilprojekteByProjekt } from "../reports/teilprojekte-by-projekt";
import { Teilprojekte } from "./teilprojekte";

export interface Projekt extends IGenericApp {
    kunde: TAppLink
    projektname: string
    zeitraum: Array<Date>
    status: string
    dlGesamt: number
    dlVerbraucht: number
    dlRest: number
}


export const Projekte = Consulting.createApp<Projekt>({
    _id: 'projekte',
    
    title: "Projekte",
    description: "Alle Projekte der Consulting", 
    icon: 'fa-fw fas fa-atlas',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Projekt', ohneArtikel: 'Projekt' },
        plural: { mitArtikel: 'die Projekte', ohneArtikel: 'Projekte' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE'],

    fields: {
        title: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Titel ein.' },    
            ],
            ...FieldNamesAndMessages('der', 'Titel', 'die', 'Titel', { onUpdate: 'den Titel' }),
            ...defaultSecurityLevel
        },

        description: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine kurze Beschreibung ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibung'),
            ...defaultSecurityLevel
        },

        kunde: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Adresse> > {
                app: Adressen,
                hasDescription: true,                
                hasImage: false,
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie den Kunden an.' },
            ],
            ...FieldNamesAndMessages('der', 'Kunde', 'die', 'Kunden'),
            ...defaultSecurityLevel
        },

        projektname: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Projektname', 'die', 'Projektnamen', { onUpdate: 'den Projektnamen' }),
            ...defaultSecurityLevel
        },

        zeitraum: {
            type: EnumFieldTypes.ftDatespan,
            rules: [
                { required: true, message: 'Bitte geben Sie den Durchführungszeitraum an.' },
            ],
            ...FieldNamesAndMessages('der', 'Zeitraum', 'die', 'Zeiträume', { onUpdate: 'den Zeitraum' } ),
            ...defaultSecurityLevel
        },

        status: StatusField,
        
        /*{
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Status an.' },
            ],
            ...FieldNamesAndMessages('der', 'Status', 'die', 'Status', { onUpdate: 'den Status' } ),
            ...defaultSecurityLevel
        },*/
        dlGesamt: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Gesamt) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Projektaufwand', 'die', 'Projektaufwände', { onUpdate: 'den Projektaufwand' } ),
            ...defaultSecurityLevel
        },
        
        dlVerbraucht: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Verbraucht) an.' },
            ],
            ...FieldNamesAndMessages('der', 'verbrauchte Projektaufwand', 'die', 'verbrauchten Projektaufwände', { onUpdate: 'den Projektaufwand (Verbrauch)' } ),
            ...defaultSecurityLevel
        },

        dlRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Rest) an.' },
            ],
            ...FieldNamesAndMessages('der', 'verbleibende Projektaufwand', 'die', 'verbleibenden Projektaufwände', { onUpdate: 'den Projektaufwand (Rest)' } ),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'kunde', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                { controlType: EnumControltypes.ctReport, reportId: TeilprojekteByProjekt.reportId }
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Projektes',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/consulting/projekte/new' }
        },
    },

    methods: {
        defaults: () => {
            return {}
        },

        onBeforeUpdate: async (projektId, prj, prjOld, session) => {
            if (prj.status != prjOld.status && prj.status == 'abgesagt') {
                // soll das Projekt abgesagt werden, so muss geprüft werden, obe nicht schon
                // Einzelleistungen bestätigt oder abgerechnet wurden. In diesem Fall
                // kann das Gesamtprojekt nicht mehr abgesagt werden.
                const tp = await Teilprojekte.rawCollection().findOne({
                    'projekt._id' : projektId,
                    status: { $in: ['bestätigt', 'abgerechnet', 'durchgeführt'] }
                }, { session });
                if (tp) return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Das Gesamtprojekt kann nicht abgesagt werden, da bereits einzelne Teilprojekte und/oder Aktivitäten bestätigt wurden.' }

                /* diese Prüfung erfolgt nun im BeforeUpdate des Teilprojekts
                    um im späteren die Transaktion zu testen
                
                    const akt = Aktivitaeten.findOne({
                    'projekt._id' : projektId,
                    status: { $in: ['bestätigt', 'abgerechnet', 'durchgeführt'] } 
                });
                if (akt) return { status: EnumMethodResult.STATUS_ABORT, statusText: 'Das Gesamtprojekt kann nicht abgesagt werden, da bereits einzelne Teilprojekte und/oder Aktivitäten bestätigt wurden.' }*/
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async (projektId, prj, prjOld, session): Promise<IAppMethodResult> => {    
            if (prj.status != prjOld.status) {
                // soll das Projekt abgesagt werden, so muss geprüft werden, ob es nicht schon
                // Einzelleistungen bestätigt oder abgerechnet wurden. In diesem Fall
                // kann das Gesamtprojekt nicht mehr abgesagt werden.
                const tps = await Teilprojekte.rawCollection().find({ 'projekt._id' : projektId }, { session }).toArray();

                let i:number, max:number=tps.length;
                for (i = 0; i < max; i++) {
                    const tp = tps[i];
                    // nur den Status des Teilprojekts aktualivieren
                    // z.B. Aktiv setzten wenn dieser den gleichen Status aufweist wie das zugehörige Projekt.
                    // Steht das Projekt auf geplant und das TP jedoch auf "abgelehnt" so soll
                    // das TP nicht auf aktiv geschaltet werden und behält den "abgelehnt"-Status
                    if (tp.status === prjOld.status) {
                        const result = await Teilprojekte.updateOne(tp._id, {
                            status: prj.status
                        }, { session });

                        if (result.status != EnumMethodResult.STATUS_OKAY) {
                            return result;
                        }
                    }
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        }
    },

    dashboardPicker: () => {
        /*if (this.user.roles.has('external')) return 'extern';
        if (this.user.roles.has('gf')) return ['default', 'extern'];*/

        return 'default';
    },
    dashboards: {
        default: { 
            rows: [

            ]
        },

        extern: {
            rows: [
                
            ]
        },
    },
});