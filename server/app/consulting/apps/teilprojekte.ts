import { FieldNamesAndMessages, isOneOf } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { DefaultAppData, IAppLink, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Projektstati } from "./projektstati";
import { Projekt, Projekte } from "./projekte";
import { Aktivitaeten } from "./aktivitaeten";
import { AktivitaetenByTeilprojekte } from "../reports/aktivitaeten-by-teilprojekte";

export interface Teilprojekt extends IGenericApp {
    projekt: TAppLink
    teilprojektname: string
    zeitraum: Array<Date>
    status: string

    /**
     * geplanter Gesamtaufwand für das Projekt 
     **/
     aufwandPlan: number
     /**
      * Ist-Aufwand, der bereits für das Projekt geleistet wurde
      */
     aufwandIst: number
     /**
      * Gesamtaufwand (verbleibend) für das Projekte
      */
     aufwandRest: number
     
     /**
      * geplanter Umsatz
      */
     erloesePlan: number
     /**
      * Umsatz, der gebucht wurde jedoch noch nicht fakturiert ist
      */
     erloeseForecast: number
     /**
      * fakturierter Umsatz
      */
     erloeseIst: number
     /**
      * noch zu fakturierender Umsatz
      */
     erloeseRest: number
 }


export const Teilprojekte = Consulting.createApp<Teilprojekt>({
    _id: 'teilprojekte',
    
    title: "Teilprojekte",
    description: "Alle Teilprojekte der Consulting", 
    icon: 'fa-fw fas fa-atlas',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Teilprojekt', ohneArtikel: 'Teilprojekte' },
        plural: { mitArtikel: 'die Teilprojekte', ohneArtikel: 'Teilprojekte' },

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

        projekt: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Projekt> > {
                app: 'projekte', //Projekte,
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

        teilprojektname: {
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

        aufwandPlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aufwand (Plan) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Aufwand (Plan)', 'die', 'Aufwände (Plan)', { onUpdate: 'den Aufwand (Plan)' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIst: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Ist)', 'die', 'Aufwände (Ist)', { onUpdate: 'den Aufwand (Ist)' } ),
            ...defaultSecurityLevel
        },

        aufwandRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Rest)', 'die', 'Aufwände (Rest)', { onUpdate: 'den Aufwand (Rest)' } ),
            ...defaultSecurityLevel
        },

        erloesePlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der geplante Erlös muss immer größer oder gleich 0,00 € sein.' },
                { required: true, message: 'Bitte geben Sie den geplanten Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Plan)', 'die', 'Erlöse (Plan)', { onUpdate: 'den Erlös (Plan)' } ),
            ...defaultSecurityLevel
        },

        erloeseIst: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der Erlös muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Ist)', 'die', 'Erlöse (Ist)', { onUpdate: 'den Erlös (Ist)' } ),
            ...defaultSecurityLevel
        },

        erloeseForecast: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der Erlös-Forecast muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den Erlös (Forecast) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Forecast)', 'die', 'Erlöse (Forecast)', { onUpdate: 'den Erlös (Forecast)' } ),
            ...defaultSecurityLevel
        },

        erloeseRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der restliche Erlös muss immer größer oder gleich 0,00 sein.' },
                { required: true, message: 'Bitte geben Sie den verbleibenden Erlös an.' },
            ],
            ...FieldNamesAndMessages('der', 'Erlös (Rest)', 'die', 'Erlöse (Rest)', { onUpdate: 'den Erlös (Rest)' } ),
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
                { field: 'projekt', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                { controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandPlan', title: 'Gesamtaufwand', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list'},
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandIst', title: 'bereits Verbraucht', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-tasks'},
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'aufwandRest', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list-ul' },
                    ]}
                ]},
                { controlType: EnumControltypes.ctReport, reportId: AktivitaetenByTeilprojekte.reportId },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Teilprojekt',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/consulting/teilprojekte/new' }
        },
    },

    methods: {
        defaults: async function ({ queryParams }) {
            let defaults: DefaultAppData<Teilprojekt> = {
                status: 'angemeldet',

                aufwandPlan: 0,
                aufwandIst: 0,
                aufwandRest: 0,
                erloesePlan: 0,
                erloeseIst: 0,
                erloeseForecast: 0,
                erloeseRest: 0
            }
    
            if (queryParams && queryParams.projektId) {                
                const prj = Projekte.findOne({ _id: queryParams.projektId }, { fields: { _id:1, title:1, description:1 }});
                if (prj) {
                    defaults.projekt = [prj];
                }
            }
        
            return {
                status: EnumMethodResult.STATUS_OKAY,
                defaults
            }
        },

        onAfterInsert: async function() {
            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onBeforeUpdate: async function(_tpId, NEW, OLD, { hasChanged }) {
            if (hasChanged('aufwandPlan')) {
                NEW.aufwandRest = (NEW.aufwandPlan || 0) - (OLD.aufwandIst || 0);
            }
            
            if (hasChanged('status')) {
                if ( OLD.status = 'abgerechnet' ) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Teilprojekt "${OLD.title}" kann nicht abgesagt werden, da es bereits den Status "${OLD.status}" hat und Rechnungen hiezu existieren.` }
                }

                if ( NEW.status == 'abgesagt' && isOneOf(OLD.status, ['bestätigt', 'abgerechnet', 'durchgeführt']) ) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Teilprojekt "${OLD.title}" kann nicht abgesagt werden, da es bereits den Status "${OLD.status}" hat.` }
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async function (tpId, NEW, OLD, { session, hasChanged }) {
            if (hasChanged('status')) {
                // wenn das Teilprojekt den Status verändert, soll dieser neue Status auch auf die 
                // darunterliegenden Aktivitäten übertragen werden
                const akts = await Aktivitaeten.rawCollection().find({ 'teilprojekt._id' : tpId }, { session }).toArray();
                
                let i, max: number;
                for(i = 0, max = akts.length; i < max; i++) {
                    const akt = akts[i];
                    
                    const result = await Aktivitaeten.updateOne(akt._id, {
                        status: NEW.status
                    }, { session });

                    if (result.status != EnumMethodResult.STATUS_OKAY) {
                        return result;
                    }
                }
            }

            if (hasChanged('aufwandPlan')) {
                console.log('Test aufwandChanged', NEW, OLD)
                const prjId = OLD.projekt[0]._id;
                const prj = await Projekte.rawCollection().findOne({ _id: prjId }, { session } );
                const aufwandPlan:number = (prj.aufwandPlan || 0) + (NEW.aufwandPlan || 0) - (OLD.aufwandPlan || 0);
                
                await Projekte.updateOne(prjId, { aufwandPlan }, { session });
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        }
    },

    dashboardPicker: () => {
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