import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes } from "/imports/api/consts";

import { Intern } from "/server/app/intern";
import { IGenericApp } from "/imports/api/types/app-types";
import { UrlaubskontoAktiv } from "./urlaubskonto-aktiv";
import { UrlaubsanspruchByKonto } from "../reports/urlaubsanspruch-by-konto";

export interface Urlaubskonto extends IGenericApp {
    userId: string
    jahr: number
    aktiv: boolean
    anspruch: number
    zusatzAnspruch: number
    verplant: number
    genommen: number
    rest: number
}


export const Urlaubskonto = Intern.createApp<Urlaubskonto>({
    _id: 'urlaubskonto',
    
    title: "Urlaubskonto",
    description: "Verwaltung der Urlaubskonten für alle Mitarbeiter MEBDO AC", 
    icon: 'fa-fw fas fa-globe-europe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Urlaubskonto', ohneArtikel: 'Urlaubskonto' },
        plural: { mitArtikel: 'die Urlaubskonten', ohneArtikel: 'Urlaubskonten' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE', 'ADMIN'],

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

        userId: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Benutzer an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Benutzer', 'die', 'Benutzer', { onUpdate: 'den Benutzer' }),
            ...defaultSecurityLevel
        },
        
        aktiv: {
            type: EnumFieldTypes.ftBoolean,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob das Konto aktiv ist.' },    
            ],
            ...FieldNamesAndMessages('die', 'Aktivierung', 'die', 'Aktivierung', { onUpdate: 'die Aktivierung' }),
            ...defaultSecurityLevel
        },
        
        jahr: {
            type: EnumFieldTypes.ftYear,
            rules: [
                { required: true, message: 'Bitte geben Sie das Kalenderjahr an.' },
            ],
            ...FieldNamesAndMessages('das', 'Jahr', 'die', 'Jahre'),
            ...defaultSecurityLevel
        },

        anspruch: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Gesamtanspruch an.' },
            ],
            ...FieldNamesAndMessages('der', 'Grundanspruch', 'die', 'Grundansprüche', { onUpdate: 'den Grundanspruch' }),
            ...defaultSecurityLevel
        },

        zusatzAnspruch: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den zusätzlichen Anspruch ein.' },
            ],
            ...FieldNamesAndMessages('der', 'Zusatzanspruch', 'die', 'Zusatzansprüche', { onUpdate: 'den Zusatzanspruch' }),
            ...defaultSecurityLevel
        },

        verplant: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'verplanten Urlaubstage', 'die', 'verplanten Urlaubstage'),
            ...defaultSecurityLevel
        },

        genommen: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'bereits genommenen Urlaubstage', 'die', 'bereits genommenen Urlaubstage'),
            ...defaultSecurityLevel
        },

        rest: {
            type: EnumFieldTypes.ftInteger,
            rules: [],
            ...FieldNamesAndMessages('die', 'verbleibenden Urlaubstage', 'die', 'verbleibenden Urlaubstage'),
            ...defaultSecurityLevel
        },
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EMPLOYEE'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'aktiv', title: 'Aktiv', controlType: EnumControltypes.ctOptionInput, values: UrlaubskontoAktiv },
                { field: 'jahr', controlType: EnumControltypes.ctYearInput },
                { field: 'anspruch', title: 'Grundanspruch', controlType: EnumControltypes.ctNumberInput },
                { field: 'zusatzAnspruch', title: 'zusätzlicher Anspruch', controlType: EnumControltypes.ctNumberInput, enabled:()=>false },
                { field: 'verplant', title:'davon verplante Tage', controlType: EnumControltypes.ctNumberInput, enabled:()=>false },
                { field: 'genommen', title:'davon genommene Tage', controlType: EnumControltypes.ctNumberInput, enabled:()=>false },
                { field: 'rest', title:'verbleibender Anspruch', controlType: EnumControltypes.ctNumberInput, enabled:()=>false },
                { controlType: EnumControltypes.ctReport, reportId: UrlaubsanspruchByKonto.reportId },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Urlaubskonto',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/intern/urlaubskonto/new' }
        },
    },

    methods: {
        defaults: () => {
            return {}
        },
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
