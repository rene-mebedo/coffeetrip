import { FieldNamesAndMessages, isOneOf } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { DefaultAppData, IAppLink, IAppMethodsDefaultProps, IGenericApp, TAppLink } from "/imports/api/types/app-types";
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
    dlGesamt: number
    dlVerbraucht: number
    dlRest: number
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

        dlGesamt: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand', 'die', 'Aufwände', { onUpdate: 'den Aufwand' } ),
            ...defaultSecurityLevel
        },
        
        dlVerbraucht: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Verbraucht)', 'die', 'verbrauchten Aufwände', { onUpdate: 'den Aufwand (Verbrauch)' } ),
            ...defaultSecurityLevel
        },

        dlRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Aufwand (Rest)', 'die', 'verbleibenden Aufwände', { onUpdate: 'den Aufwand (Rest)' } ),
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
                        { field: 'dlGesamt', title: 'Gesamtaufwand', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list'},
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'dlVerbraucht', title: 'bereits Verbraucht', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-tasks'},
                    ]},
                    { columnDetails: { xs:24, sm:24, md:8 }, elements: [
                        { field: 'dlRest', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list-ul' },
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
        defaults: ({ queryParams }:IAppMethodsDefaultProps) => {
            let defaults: DefaultAppData<Teilprojekt> = {
                status: 'angemeldet'
            }
    
            if (queryParams && queryParams.projektId) {                
                const prj = Projekte.findOne({ _id: queryParams.projektId }, { fields: { _id:1, title:1, description:1 }});
                if (prj) {
                    defaults.projekt = [prj];
                }
            }
        
            return defaults;
        },

        onBeforeUpdate: async (_tpId, NEW, OLD, { hasChanged }) => {
            const statusChanged = hasChanged('status'); //NEW.status !== OLD.status;
            
            if ( statusChanged ) {
                if ( NEW.status == 'abgesagt' && isOneOf(OLD.status, ['bestätigt', 'abgerechnet', 'durchgeführt']) ) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Teilprojekt "${OLD.title}" kann nicht abgesagt werden, da es bereits den Status "${OLD.status}" hat.` }
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async (tpId, NEW, _OLD, { session, hasChanged }) => {
            const statusChanged = hasChanged('status'); // NEW.status && (NEW.status !== OLD.status);

            if (statusChanged) {
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