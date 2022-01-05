import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes } from "/imports/api/consts";

import { DefaultAppData, IAppLink, IAppMethodsDefaultProps, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Projektstati } from "./projektstati";
import { Projekt, Projekte } from "./projekte";
import { Teilprojekte } from "./teilprojekte";

export interface Aktivitaet extends IGenericApp {
    projekt: TAppLink
    teilprojekt: TAppLink
    name: string
    nummer: string
    zeitraum: Array<Date>
    status: string
}


export const Aktivitaeten = Consulting.createApp<Aktivitaet>({
    _id: 'aktivitaeten',
    
    title: "Aktivitaeten",
    description: "Alle Aktivitäten der Consulting", 
    icon: 'fa-fw fas fa-tasks',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Aktivität', ohneArtikel: 'Aktivitäten' },
        plural: { mitArtikel: 'die Aktivitäten', ohneArtikel: 'Aktivitäten' },

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
                app: 'projekte',
                hasDescription: true,                
                hasImage: false,
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie das Projekt an.' },
            ],
            ...FieldNamesAndMessages('das', 'Projekt', 'die', 'Projekte'),
            ...defaultSecurityLevel
        },

        teilprojekt: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Projekt> > {
                app: 'teilprojekte',
                hasDescription: true,                
                hasImage: false,
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie das Teilprojekt an.' },
            ],
            ...FieldNamesAndMessages('das', 'Teilprojekt', 'die', 'Teilprojekte'),
            ...defaultSecurityLevel
        },

        name: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Aktivitätsnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Aktivitätsname', 'die', 'Aktivitätsnamen', { onUpdate: 'den Aktivitätsnamen' }),
            ...defaultSecurityLevel
        },

        nummer: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Aktivitätsnummer an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Aktivitätsname', 'die', 'Aktivitätsnamen', { onUpdate: 'den Aktivitätsnamen' }),
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
                { field: 'teilprojekt', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati }
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang einer Aktivität',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/consulting/aktivitaeten/new' }
        },
    },

    methods: {
        defaults: ({ queryParams }:IAppMethodsDefaultProps) => {
            let defaults: DefaultAppData<Aktivitaet> = {
                status: 'angemeldet'
            }
    
            if (queryParams && queryParams.tpId) {                
                const tp = Teilprojekte.findOne({ _id: queryParams.tpId }, { fields: { _id:1, title:1, description:1, projekt:1 }});
                if (tp) {
                    defaults.teilprojekt = [{_id:tp._id, title:tp.title, description:tp.description}];

                    const prj = Projekte.findOne({ _id: tp.projekt[0]._id }, { fields: { _id:1, title:1, description:1 }});
                    if (prj) {
                        defaults.projekt = [prj];
                    }
                }
            }
        
            return defaults;
        },
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