import { FieldNamesAndMessages, getAppLinkItem } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Allgemein } from "/server/app/allgemein";
import { Adressarten, AdressartenEnum } from "./adressarten";
import { DefaultAppData, IGenericApp, IGoogleMapsLocationProps, TAppLink } from "/imports/api/types/app-types";
import { ReportAdressenByKundenart } from "../reports/adressen-by-kundenart";
import { WidgetAdressenByKundenart } from "../reports/adressen-by-kundenart.widget";
import { ChartAdressenByKundenart } from "../reports/adressen-by-kundenart.chart";
import { getAppStore } from "/imports/api/lib/core"; 
import { Preislisten } from "./preislisten";
import { JaNeinEnum } from "./ja-nein-optionen";

export interface Adresse extends IGenericApp {
    /**
     * Kennzeichung der Adresse ob diese ein Kunde, Hotel
     * Distributor, etc. ist
     */
    adressart: AdressartenEnum;

    /**
     * Allgemeine Anschriftsinformation Adressenzeile (1)
     */
    firma1: string
    /**
     * Allgemeine Anschriftsinformation Adressenzeile (2)
     */
    firma2: string
    /**
     * Allgemeine Anschriftsinformation Adressenzeile (3)
     */
    firma3: string
    /**
     * Allgemeine Anschriftsinformation Strasse
     */
    strasse: string
    /**
     * Allgemeine Anschriftsinformation Postleitzahl
     */
    plz: string
    /**
     * Allgemeine Anschriftsinformation Ort
     */
    ort: string

    /**
     * Preisliste, die für diese Adresse im weiteren Verlauf
     * als Vorschlagswert verwandt werden soll
     */
    preisliste: TAppLink
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

        adressart: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte spezifizieren Sie diese Adresse.' },    
            ],
            ...FieldNamesAndMessages('die', 'Adressart', 'die', 'Adressarten'),
            ...defaultSecurityLevel
        },

        firma1: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie mindestens eine Adressenzeile an.' },    
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

        preisliste: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: 'preislisten',
                hasDescription: true,
                linkable: true,
                hasImage: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie die Preisliste an, die für diese Adresse als Vorschlag verwandt werden soll.' },    
            ],
            ...FieldNamesAndMessages('die', 'Preisliste', 'die', 'Preislisten'),
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
                { field: 'adressart', controlType: EnumControltypes.ctOptionInput, values: Adressarten },

                { title: 'Allgemein', controlType: EnumControltypes.ctCollapsible, collapsedByDefault: true, elements: [
                    { controlType: EnumControltypes.ctColumns, columns: [
                        { columnDetails: {xs:24,sm:24,md:24,lg:12,xl:12,xxl:12}, elements: [
                            { controlType: EnumControltypes.ctDivider, title: 'Firma' },
                            { field: 'firma1', title: 'Zeile 1', controlType: EnumControltypes.ctStringInput },
                            { field: 'firma2', title: 'Zeile 2', controlType: EnumControltypes.ctStringInput },
                            { field: 'firma3', title: 'Zeile 3', controlType: EnumControltypes.ctStringInput },
            
                            { controlType: EnumControltypes.ctDivider, title: 'Anschrift' },
                            { field: 'strasse', controlType: EnumControltypes.ctStringInput },
                            { field: 'plz', controlType: EnumControltypes.ctStringInput },
                            { field: 'ort', controlType: EnumControltypes.ctStringInput },
                        ]},
                        { columnDetails: {xs:24,sm:24,md:24,lg:12,xl:12,xxl:12}, elements: [
                            { controlType: EnumControltypes.ctGoogleMap, googleMapDetails: {
                                location:  ({ document, allValues }: IGoogleMapsLocationProps) => {
                                    const { firma1, firma2, firma3, strasse, plz, ort} = allValues || document;                                    
                                    let newLocation = firma1 || '';

                                    if (firma2) newLocation += ' ' + firma2;
                                    if (firma3) newLocation += ' ' + firma3;
                                    if (strasse) newLocation += ', ' + strasse;
                                    if (plz) newLocation += ', ' + plz;
                                    if (ort) newLocation += ' ' + ort;
                                    
                                    return newLocation;
                                }
                            }}
                        ]}
                    ]}
                ]},
                { title: 'Kaufmännische Angaben', controlType: EnumControltypes.ctCollapsible, collapsedByDefault: false, elements: [
                    { field: 'preisliste', controlType: EnumControltypes.ctSingleModuleOption }
                ]}
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
        defaults: async function() {
            let defaults: DefaultAppData<Adresse> = {}

            const preisliste = Preislisten.findOne({ isStandard: JaNeinEnum.ja });
            if (preisliste){
                defaults.preisliste = getAppLinkItem(preisliste, { link: '/allgemein/preislisten/' });
            }

            return { 
                status: EnumMethodResult.STATUS_OKAY,
                defaults
            }
        },
        
        onAfterInsert: async function (_id, NEW) {
            const AdressenCounts = getAppStore('adressen.counts');
            
            AdressenCounts.update(NEW.adressart, { $inc: { value: 1 } });
    
            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterUpdate: async function(_id, NEW, OLD, { hasChanged }) {
            if (hasChanged('adressart')) {
                const AdressenCounts = getAppStore('adressen.counts');
        
                [{k: NEW.adressart, v:1}, {k: OLD.adressart, v:-1}].forEach( ({k,v}: any) => {    
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
                        { _id:'anzahl-kunden', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { adressart: 'kunde' } } },
                        { _id:'anzahl-interessenten', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { adressart: 'interessent' } } },
                        { _id:'anzahl-partner', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { adressart: 'partner' } } },
                        { _id:'anzahl-hotels', width: { xs:24, sm:24, md: 12, lg: 6 },  type: 'report', details: { type: 'widget', reportId: WidgetAdressenByKundenart.reportId, document: { adressart: 'hotel' } } }
                    ]
                },
                {
                    elements: [
                        { _id:'adressen-static-sonstige', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'table', reportId: ReportAdressenByKundenart.reportId, document: { adressart: 'sonstiges' } } },
                        { _id:'adressen-kundenarten', width: { xs: 24, sm:24, md:24, lg:12 },  type: 'report', details: { type: 'chart', chartType:'bar', reportId: ChartAdressenByKundenart.reportId } },
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

//const Adr = getAppStore('adressen');
const AdressenCounts = getAppStore('adressen.counts');

Adressarten.forEach( (k) => {
    const { _id: kid } = k;

    const kk = Adressarten.find( adressart => kid === adressart._id);
    
    Adressen.raw().find({ adressart: kid }).count().then( count =>{
        const doc = {
            title: 'Anzahl ' + (kk?.pluralTitle || kk?.title), 
            icon: kk?.icon,
            color: kk?.color,
            backgroundColor: kk?.backgroundColor,
            value: count
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
    }).catch(err =>{
        console.log(err);
    });
});