import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IAppLink, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Adresse, Adressen } from "../../allgemein/apps/adressen";
import { Projektstati } from "./projektstati";
import { TeilprojekteByProjekt } from "../reports/teilprojekte-by-projekt";
import { Teilprojekte } from "./teilprojekte";
import { ProjekteByUser } from "../reports/projekte-by-user";

export interface Projekt extends IGenericApp {
    kunde: TAppLink
    projektname: string
    zeitraum: Array<Date>
    status: string
    
    aufwandPlan: number
    aufwandIst: number
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
        
        aufwandPlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Gesamt) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Projektaufwand (Plan)', 'die', 'Projektaufwände (Plan)', { onUpdate: 'den Projektaufwand (Plan)' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIst: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Projektaufwand (Ist)', 'die', 'Projektaufwände (Ist)', { onUpdate: 'den Projektaufwand (Ist)' } ),
            ...defaultSecurityLevel
        },

        aufwandRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Projektaufwand (Rest)', 'die', 'Projektaufwände (Rest)', { onUpdate: 'den Projektaufwand (Rest)' } ),
            ...defaultSecurityLevel
        },

        erloesePlan: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { min: 0, message: 'Der geplante Erlös muss immer größer oder gleich 0,00 sein.' },
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
                { controlType: EnumControltypes.ctColumns, columns: [
                    { columnDetails: { xs:24, sm:24, md:24, lg:18, xl:16, xxl:16 }, elements: [
                        { field: 'title', controlType: EnumControltypes.ctStringInput },
                        { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                        { field: 'kunde', controlType: EnumControltypes.ctSingleModuleOption },
                        { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                        { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                    ]},
                    { columnDetails: { xs:24, sm:24, md:24, lg:6, xl:8, xxl:8 }, elements: [
                        { controlType: EnumControltypes.ctColumns, columns: [
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloesePlan', title: 'Projekterlöse (Plan)', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-dollar-sign'},
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseIst', title: 'Ist', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-file-invoice-dollar'},
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseForecast', title: 'Forecast', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-funnel-dollar'},
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseRest', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-search-dollar' },
                            ]}
                        ]},
                        { controlType: EnumControltypes.ctColumns, columns: [
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12 }, elements: [
                                { field: 'aufwandPlan', title: 'Projektaufwand', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list'},
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12 }, elements: [
                                { field: 'aufwandIst', title: 'Ist', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-tasks'},
                            ]},
                            { columnDetails: { push:12, xs:24, sm:12, md:12  }, elements: [
                                { field: 'aufwandRest', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list-ul' },
                            ]}
                        ]}
                    ]}
                ]},

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

        onAfterUpdate: async function (projektId, NEW, _OLD, { session, hasChanged }) {    
            if (hasChanged('status')) {
                // soll das Projekt abgesagt werden, so muss geprüft werden, ob es nicht schon
                // Einzelleistungen bestätigt oder abgerechnet wurden. In diesem Fall
                // kann das Gesamtprojekt nicht mehr abgesagt werden.
                const tps = await Teilprojekte.rawCollection().find({ 'projekt._id' : projektId }, { session }).toArray();

                let i:number, max:number=tps.length;
                for (i = 0; i < max; i++) {
                    const tp = tps[i];

                    const result = await Teilprojekte.updateOne(tp._id, {
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
        /*if (this.user.roles.has('external')) return 'extern';
        if (this.user.roles.has('gf')) return ['default', 'extern'];*/

        return 'default';
    },
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'projekte-by-user', width: { xs: 24, sm:24, md:12 },  type: 'report', details: { type: 'table', reportId: ProjekteByUser.reportId, document: { status: ['geplant', 'bestätigt']} } },
                    ]
                }
            ]
        },

        extern: {
            rows: [
                
            ]
        },
    },
});