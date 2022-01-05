import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Allgemein } from "/server/app/allgemein";
import { Kundenarten } from "./kundenarten";
import { IGenericApp } from "/imports/api/types/app-types";
import { ReportAdressenByKundenart } from "../reports/adressen-by-kundenart";
import { WidgetAdressenByKundenart } from "../reports/adressen-by-kundenart.widget";
import { ChartAdressenByKundenart } from "../reports/adressen-by-kundenart.chart";
import { getAppStore } from "/imports/api/lib/core";
import { StaticReportAdressenByKundenart } from "../reports/adressen-by-kundenart.static";

export interface Adresse extends IGenericApp {
    kundenart: string;
    firma1: string;
    firma2: string;
    firma3: string;
    strasse: string;
    plz: string
    ort: string;
}


export const Adressen = Allgemein.createApp<Adresse>({
    _id: 'adressen',
    
    title: "Adressen",
    description: "Alle Adressen, die von uns zur weiteren Bearbeitung der Seminare, Projekte etc benötigt werden.", 
    icon: 'fa-fw fas fa-building',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Adresse', ohneArtikel: 'Adresse' },
        plural: { mitArtikel: 'die Adressen', ohneArtikel: 'Adresse' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],

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

        kundenart: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte spezifizieren Sie diese Adresse.' },    
            ],
            ...FieldNamesAndMessages('die', 'Kundenart', 'die', 'Kundenart'),
            ...defaultSecurityLevel
        },

        firma1: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie mindestens enei Adressenzeile an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Firmenbezeichnug Zeile 1', 'die', 'Firmenbezeichnug Zeile 1'),
            ...defaultSecurityLevel
        },
        firma2: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Firmenbezeichnug Zeile 2', 'die', 'Firmenbezeichnug Zeile 3'),
            ...defaultSecurityLevel
        },
        firma3: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Firmenbezeichnug Zeile 3', 'die', 'Firmenbezeichnug Zeile 3'),
            ...defaultSecurityLevel
        },

        strasse: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Strasse an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Strasse', 'die', 'Strasse'),
            ...defaultSecurityLevel
        },

        plz: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die PLZ an.' },
                { min: 5, max: 5, message: 'Bitte geben Sie die PLZ 5-stellig an.' },
            ],
            ...FieldNamesAndMessages('die', 'Postleitzahl', 'die', 'Postleitzahl'),
            ...defaultSecurityLevel
        },

        ort: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Ort an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Ort', 'die', 'Orte', { onUpdate: 'den Ort' }),
            ...defaultSecurityLevel
        },
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'kundenart', controlType: EnumControltypes.ctOptionInput, values: Kundenarten },

                { title: 'Allgemein', controlType: EnumControltypes.ctCollapsible, collapsedByDefault: true, elements: [
                    { controlType: EnumControltypes.ctDivider, title: 'Firma' },
                    { field: 'firma1', title: 'Zeile 1', controlType: EnumControltypes.ctStringInput },
                    { field: 'firma2', title: 'Zeile 2', controlType: EnumControltypes.ctStringInput },
                    { field: 'firma3', title: 'Zeile 3', controlType: EnumControltypes.ctStringInput },
    
                    { controlType: EnumControltypes.ctDivider, title: 'Anschrift' },
                    { field: 'strasse', controlType: EnumControltypes.ctStringInput },
                    { field: 'plz', controlType: EnumControltypes.ctStringInput },
                    { field: 'ort', controlType: EnumControltypes.ctStringInput },
                ]},
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang einer Adresse',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/allgemein/adressen/new' }
        },
    },

    methods: {
        defaults: () => {
            return {}
        },
        onAfterInsert: (values) => {
            const AdressenCounts = getAppStore('adressen.counts');
            
            AdressenCounts.update(values.kundenart, { $inc: { value: 1 } });
    
            return { status: EnumMethodResult.STATUS_OKAY }
        },
        onAfterUpdate: (values, oldValues) => {
            if (values.kundenart !== oldValues.kundenart) {
                const AdressenCounts = getAppStore('adressen.counts');
        
                [{k: values.kundenart, v:1}, {k: oldValues.kundenart, v:-1}].forEach( ({k,v}) => {    
                    AdressenCounts.update(k, { $inc: { value: v } });
                });
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
                        { _id:'anzahl-kunden', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { kundenart: 'kunde' } } },
                        { _id:'anzahl-interessenten', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { kundenart: 'interessent' } } },
                        { _id:'anzahl-partner', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { kundenart: 'partner' } } },
                        { _id:'anzahl-hotels', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { kundenart: 'hotel' } } }
                    ]
                },
                {
                    elements: [
                        { _id:'adressen-kundenarten', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'chart', chartType:'bar', reportId: ChartAdressenByKundenart.reportId } },
                        { _id:'adressen-static-sonstige', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'table', reportId: StaticReportAdressenByKundenart.reportId, document: { kundenart: 'sonstiges' } } }
                    ]
                },
                {
                    elements: [
                        { _id:'adressen-kunden', width: { xs: 24, sm:24, md:12 },  type: 'report', details: { type: 'table', reportId: ReportAdressenByKundenart.reportId, document: { kundenart: 'kunde' } } },
                        { _id:'adressen-partner', width: { xs: 24, sm:24, md:12 },  type: 'report', details: { type: 'table', reportId: ReportAdressenByKundenart.reportId, document: { kundenart: 'partner' } } }
                    ]
                },
            ]
        },

        extern: {
            rows: [
                
            ]
        },
    },
});

const Adr = getAppStore('adressen');
const AdressenCounts = getAppStore('adressen.counts');

Kundenarten.forEach( (k) => {
    const { _id: kid } = k;

    const kk = Kundenarten.find( kundenart => kid === kundenart._id);
    
    const kundenartCounter = Adr.find({ kundenart: kid }).count();
    const doc = {
        title: 'Anzahl ' + (kk?.pluralTitle || kk?.title), 
        icon: kk?.icon,
        color: kk?.color,
        backgroundColor: kk?.backgroundColor,
        value: kundenartCounter
    }

    const kundenartCount = AdressenCounts.findOne(kid);
    if (!kundenartCount) { 
        AdressenCounts.insert({
            _id: kid,
            ...doc
        }); 
    } else {
        AdressenCounts.update(kid, { $set: { ...doc }})
    }
});