import { FieldNamesAndMessages, isOneOf } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { AppData, IAppLink, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Adresse, Adressen } from "../../allgemein/apps/adressen";
import { Projektstati } from "./projektstati";
import { TeilprojekteByProjekt } from "../reports/teilprojekte-by-projekt";
import { Teilprojekte } from "./teilprojekte";
import { ProjekteByUser } from "../reports/projekte-by-user";
import { calcMinutes, Einheiten, EinheitenEnum, TEinheit } from "./einheiten";
import { renderSimpleWidgetAufwandMitEinheit, renderSimpleWidgetCurrency } from "./_helpers";
import { Rechnungsempfaenger } from "./rechnungsempfaenger";

/**
 * Steuerung wann die abweichende Rechnungsanschrift oder der Distributor
 * in Ihrer Eingabe aktiviert und wann gesperrt werden
 * 
 * @returns true/false
 */
const enableRechnungsanschrift = (props: any): boolean => {
    const { changedValues, allValues }: { changedValues: AppData<Projekt>, allValues: AppData<Projekt>} = props;
    
    if (!changedValues && !allValues) return false;

    if (changedValues && changedValues.rechnungsempfaenger) {
        return changedValues.rechnungsempfaenger === 'abweichend'
    }

    if (allValues && allValues.rechnungsempfaenger) {
        return allValues.rechnungsempfaenger === 'abweichend';
    }

    return false;
}

const enableDistributor = (props: any): boolean => {
    const { changedValues, allValues }: { changedValues: AppData<Projekt>, allValues: AppData<Projekt>} = props;
    if (!changedValues && !allValues) return false;
    
    if (changedValues && changedValues.rechnungsempfaenger ) {
        return changedValues.rechnungsempfaenger === 'distributor'
    }

    if (allValues && allValues.rechnungsempfaenger) {
        return allValues.rechnungsempfaenger === 'distributor';
    }

    return false;
}

export interface Projekt extends IGenericApp {
    kunde: TAppLink

    projektname: string

    zeitraum: Array<Date>

    status: string
    
    /**
     * geplanter Gesamtaufwand für das Projekt in Minuten
     **/
    aufwandPlanMinuten: number
    
    /**
     * Ist-Aufwand, der bereits für das Projekt geleistet wurde  in Minuten
     */
    aufwandIstMinuten: number
    
    /**
     * Gesamtaufwand (verbleibend) für das Projekte  in Minuten
     */
    aufwandRestMinuten: number
    
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
    
    /**
     * Definition der Projektstunden je Beratungstag
     * Diese muss immer für die Berechnung der Tage Plan, Ist und Rest
     * angewandt werden
     */
    stundenProTag: number,

    /**
     * Anzeigeeinheit in der die Aufwände in der Anwendung dargestellt werden
     */
    anzeigeeinheit: string
    /**
     * Singular, Plural der Anzeigeeinheit zur Darstellung und der Faktor
     * zur Umrechnung der Aufände auf Minutenbasis zur Anzeigeeinheit
     */
    anzeigeeinheitDetails: { singular: string, plural: string, faktor: number, precision: number }

    /** 
     * Definition wie sich die Rechnungsanschrift, derRechnungsempfänger ergibt
     * 
     **/
    rechnungsempfaenger: string

    /**
     * Abweichende Rechnungsanschrift Firmenname (Adressenzeile 1)
     */
    rechnungFirma1: string
    /**
     * Abweichende Rechnungsanschrift Firmenname (Adressenzeile 2)
     */
    rechnungFirma2: string

    /**
     * Abweichende Rechnungsanschrift Firmenname (Adressenzeile 3)
     */
    rechnungFirma3: string

    /**
     * Abweichende Rechnungsanschrift Strasse
     */
    rechnungStrasse: string

    /**
     * Abweichende Rechnungsanschrift Plz
     */
    rechnungPlz: string

    /**
     * Abweichende Rechnungsanschrift Ort
     */
    rechnungOrt: string

    /**
     * Abweichende Rechnungsanschrift Land
     */
    rechnungLand: string

    /**
     * Distributor, der als Rechnungsempfänger dient
     * wenn das Feld rechnungsempfaenger den Wert "distributor" hat
     */
    rechnungDistributor: TAppLink
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

        kunde: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: Adressen,
                hasDescription: true,                
                hasImage: false,
                linkable: true,
                link: (doc) => `/allgemein/adressen/${doc._id}`
            } as IAppLink<Adresse>,
            rules: [
                { required: true, message: 'Bitte geben Sie den Kunden an.' },
            ],
            ...FieldNamesAndMessages('der', 'Kunde', 'die', 'Kunden', { onUpdate: 'den Kunden' }),
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
        
        aufwandPlanMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Gesamt) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Projektaufwand (Plan)', 'die', 'Projektaufwände (Plan)', { onUpdate: 'den Projektaufwand (Plan)' } ),
            ...defaultSecurityLevel
        },
        
        aufwandIstMinuten: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'Projektaufwand (Ist)', 'die', 'Projektaufwände (Ist)', { onUpdate: 'den Projektaufwand (Ist)' } ),
            ...defaultSecurityLevel
        },

        aufwandRestMinuten: {
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
        },

        stundenProTag: {
            type: EnumFieldTypes.ftInteger,
            rules: [ 
                { type:'number', min: 1, message: 'Die minimale Stundenangabe beträgt 1 Stunde.' },
                { type:'number', max: 10, message: 'Die maximale Stunden je Tag betragen 10 Stunden.' },
                { required: true, message: 'Bitte geben Sie die Stunden je Beratertag an.' },
            ],
            ...FieldNamesAndMessages('die', 'Stunden je Beratertag', 'die', 'Stunden je Beratertag' ),
            ...defaultSecurityLevel
        },

        anzeigeeinheit: {
            type: EnumFieldTypes.ftString,
            rules: [ 
                { required: true, message: 'Bitte geben Sie Einheit an, in der die Aufwände angezeigt werden sollen.' },
            ],
            ...FieldNamesAndMessages('die', 'Einheit zur Darstellung der Aufwände', 'die', 'Einheiten zur Darstellung der Aufwände' ),
            ...defaultSecurityLevel
        },

        anzeigeeinheitDetails: {
            type: EnumFieldTypes.ftString,
            rules: [ 
                { required: true, message: 'Bitte geben Sie Details zur Anzeigeeinheit an.' },
            ],
            ...FieldNamesAndMessages('die', 'Details zur Anzeigeeinheit', 'die', 'Details zur Anzeigeeinheit' ),
            ...defaultSecurityLevel
        },

        rechnungsempfaenger: {
            type: EnumFieldTypes.ftString,
            rules: [ 
                { required: true, message: 'Bitte geben Sie die Art des Rechnungsempfängers an.' },
            ],
            ...FieldNamesAndMessages('die', 'Definition Rechnungsempfänger', 'die', 'Definitionen Rechnungsempfänger' ),
            ...defaultSecurityLevel
        },

        rechnungFirma1: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie mindestens die erste Adressenzeile an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Rechnungsanschrift (Zeile 1)', 'die', 'Rechnungsanschrift (Zeile 1)'),
            ...defaultSecurityLevel
        },
        rechnungFirma2: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Rechnungsanschrift (Zeile 2)', 'die', 'Rechnungsanschrift (Zeile 2)'),
            ...defaultSecurityLevel
        },
        rechnungFirma3: {
            type: EnumFieldTypes.ftString,
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Rechnungsanschrift (Zeile 3)', 'die', 'Rechnungsanschrift (Zeile 3)'),
            ...defaultSecurityLevel
        },

        rechnungStrasse: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die Strasse an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Strasse der Rechnungsanschrift', 'die', 'Strasse der Rechnungsanschrift'),
            ...defaultSecurityLevel
        },

        rechnungPlz: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie die PLZ an.' },
                { min: 5, max: 5, message: 'Bitte geben Sie die PLZ 5-stellig an.' },
            ],
            ...FieldNamesAndMessages('die', 'Postleitzahl der Rechnungsanschrift', 'die', 'Postleitzahlen der Rechnungsanschrift'),
            ...defaultSecurityLevel
        },

        rechnungOrt: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Ort an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Ort der Rechnungsanschrift', 'die', 'Orte', { onUpdate: 'den Ort der Rechnungsanschrift' }),
            ...defaultSecurityLevel
        },

        rechnungLand: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie das Land an.' },
            ],
            ...FieldNamesAndMessages('das', 'Land der Rechnungsanschrift', 'die', 'Länder der Rechnungsanschrift'),
            ...defaultSecurityLevel
        },

        rechnungDistributor: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: Adressen,
                hasDescription: true,                
                hasImage: false,
                linkable: true,
                link: (doc) => `/allgemein/adressen/${doc._id}`
            } as IAppLink<Adresse>,
            rules: [
                { required: true, message: 'Bitte geben Sie den Distributor an.' },
            ],
            ...FieldNamesAndMessages('der', 'Distributor', 'die', 'Distributoren', { onUpdate: 'den Distributor' }),
            ...defaultSecurityLevel
        },
    },

    layouts: {       
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EMPLOYEE'],
            
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
                                { field: 'erloesePlan', title: 'Projekterlöse (Plan)', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-dollar-sign',
                                    render: renderSimpleWidgetCurrency
                                },
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseIst', title: 'Ist', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-file-invoice-dollar',
                                render: renderSimpleWidgetCurrency
                            },
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseForecast', title: 'Forecast', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-funnel-dollar',
                                render: renderSimpleWidgetCurrency
                            },
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12, xl:12, xxl:12 }, elements: [
                                { field: 'erloeseRest', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-search-dollar',
                                render: renderSimpleWidgetCurrency
                            },
                            ]}
                        ]},
                        { controlType: EnumControltypes.ctColumns, columns: [
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12 }, elements: [
                                { field: 'aufwandPlanMinuten', title: 'Projektaufwand', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list', 
                                    render: renderSimpleWidgetAufwandMitEinheit
                                },
                            ]},
                            { columnDetails: { xs:24, sm:12, md:12, lg: 12 }, elements: [
                                { field: 'aufwandIstMinuten', title: 'Ist', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-tasks',
                                    render: renderSimpleWidgetAufwandMitEinheit
                                },
                            ]},
                            { columnDetails: { push:12, xs:24, sm:12, md:12  }, elements: [
                                { field: 'aufwandRestMinuten', title: 'Rest', controlType: EnumControltypes.ctWidgetSimple, icon:'fas fa-list-ul', 
                                    render: renderSimpleWidgetAufwandMitEinheit
                                },
                            ]}
                        ]}
                    ]}
                ]},
                { title: 'Projekteinstellungen', controlType: EnumControltypes.ctCollapsible, elements: [
                    { field: 'stundenProTag', controlType: EnumControltypes.ctNumberInput },
                    { field: 'anzeigeeinheit', controlType:EnumControltypes.ctOptionInput, values: Einheiten}
                ]},
                { title: 'Kaufmännische Angaben', controlType: EnumControltypes.ctCollapsible, elements: [
                    { field: 'rechnungsempfaenger', controlType:EnumControltypes.ctOptionInput, values: Rechnungsempfaenger },
                    { field: 'rechnungDistributor', controlType: EnumControltypes.ctSingleModuleOption, enabled: enableDistributor, visible: enableDistributor },
                    { field: 'rechnungFirma1', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                    { field: 'rechnungFirma2', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                    { field: 'rechnungFirma3', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                    { field: 'rechnungStrasse', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                    { title: 'Postleitzahl, Ort', controlType: EnumControltypes.ctInlineCombination, visible: enableRechnungsanschrift, elements: [
                        { field: 'rechnungPlz', noTitle: true, controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                        { field: 'rechnungOrt', title: 'Ort', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
                    ]},
                    { field: 'rechnungLand', controlType: EnumControltypes.ctStringInput, enabled: enableRechnungsanschrift, visible: enableRechnungsanschrift },
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
        defaults: async function () {
            const stundenProTag = 8;
            const defaultEinheit = Einheiten.find( e => e._id === EinheitenEnum.tage);

            if (!defaultEinheit) {
                return {
                    status: EnumMethodResult.STATUS_ABORT,
                    statusText: 'Die Standard-Einheit "Tage" konnte nicht in Ihrer Beschreibung gefunden werden.'
                }
            }

            return {
                status: EnumMethodResult.STATUS_OKAY,
                defaults: {
                    aufwandPlanMinuten: 0,
                    aufwandIstMinuten: 0,
                    aufwandRestMinuten: 0,
                    erloesePlan: 0,
                    erloeseIst: 0,
                    erloeseForecast: 0,
                    erloeseRest: 0,
                    stundenProTag,
                    anzeigeeinheit: defaultEinheit._id,
                    anzeigeeinheitDetails: { 
                        singular: defaultEinheit.title, 
                        plural: defaultEinheit.pluralTitle || defaultEinheit.title, 
                        faktor: calcMinutes(1, defaultEinheit as TEinheit, stundenProTag),
                        precision: (defaultEinheit as TEinheit).options.precision
                    },
                    rechnungsempfaenger: 'kunde'
                }
            }
        },

        onBeforeInsert: async function(NEW) {
            const einheit = Einheiten.find( e => e._id === NEW.anzeigeeinheit);
            if (einheit) {
                NEW.anzeigeeinheitDetails = { 
                    singular: einheit.title, 
                    plural: einheit.pluralTitle || einheit.title, 
                    faktor: calcMinutes(1, einheit as TEinheit, NEW.stundenProTag || 0),
                    precision: (einheit as TEinheit).options.precision
                }
            } else {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Anzeigeeinheit "${NEW.anzeigeeinheit}" konnte in Ihrer Beschreibung nicht gefunden werden.` };
            }

            if (isOneOf(NEW.rechnungsempfaenger, ['kunde', 'distributor'])) {
                // leeren der Felder für die abweichende Rechnungsaschrift, die ggf. im Dialog zuvor erfasst wurden
                // und nachträglich wurde die Steuerung umgestellt
                NEW.rechnungFirma1 = '';
                NEW.rechnungFirma2 = '';
                NEW.rechnungFirma3 = '';
                NEW.rechnungStrasse = '';
                NEW.rechnungPlz = '';
                NEW.rechnungOrt = '';
                NEW.rechnungLand = '';
            }

            if (isOneOf(NEW.rechnungsempfaenger, ['kunde', 'abweichend'])) {
                // leeren der Felder für die abweichende Rechnungsaschrift, die ggf. im Dialog zuvor erfasst wurden
                // und nachträglich wurde die Steuerung umgestellt
                NEW.rechnungDistributor = [];
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onBeforeUpdate: async function (_projektId, NEW, _OLD, { hasChanged, currentValue }) {
            if (hasChanged('aufwandPlanMinuten') || hasChanged('aufwandIstMinuten')) {
                NEW.aufwandRestMinuten = currentValue('aufwandPlanMinuten') - currentValue('aufwandIstMinuten');
            }

            if (hasChanged('erloesePlan') || hasChanged('erloeseIst')) {
                NEW.erloeseRest = currentValue('erloesePlan') - currentValue('erloeseIst')
            }

            if (hasChanged('anzeigeeinheit')) {
                const einheit = Einheiten.find( e => e._id === NEW.anzeigeeinheit);
                if (einheit) {
                    NEW.anzeigeeinheitDetails = {
                        singular: einheit.title, 
                        plural: einheit.pluralTitle || einheit.title, 
                        faktor: calcMinutes(1, einheit as TEinheit, NEW.stundenProTag || 0),
                        precision: (einheit as TEinheit).options.precision
                    }
                } else {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Anzeigeeinheit "${NEW.anzeigeeinheit}" konnte in Ihrer Beschreibung nicht gefunden werden.` };
                }
            }

            if (isOneOf(NEW.rechnungsempfaenger, ['kunde', 'distributor'])) {
                // leeren der Felder für die abweichende Rechnungsaschrift, die ggf. im Dialog zuvor erfasst wurden
                // und nachträglich wurde die Steuerung umgestellt
                NEW.rechnungFirma1 = '';
                NEW.rechnungFirma2 = '';
                NEW.rechnungFirma3 = '';
                NEW.rechnungStrasse = '';
                NEW.rechnungPlz = '';
                NEW.rechnungOrt = '';
                NEW.rechnungLand = '';
            }

            if (isOneOf(NEW.rechnungsempfaenger, ['kunde', 'abweichend'])) {
                // leeren der Felder für die abweichende Rechnungsaschrift, die ggf. im Dialog zuvor erfasst wurden
                // und nachträglich wurde die Steuerung umgestellt
                NEW.rechnungDistributor = [];
            }

            return { status: EnumMethodResult.STATUS_OKAY };
        },

        onAfterUpdate: async function (projektId, NEW, _OLD, { session, hasChanged }) {
            if (hasChanged('stundenProTag')) {
                // wird die Anzahl der Stunden pro Tag geändert,
                // so muss die Definition in die TPs nachgetriggert werden
                const tps = await Teilprojekte.raw().find({ 'projekt._id' : projektId }, { session }).toArray();
                tps.forEach( tp => {
                    Teilprojekte.updateOne(tp._id, { 
                        stundenProTag: NEW.stundenProTag,                        
                    });
                });
            }

            if (hasChanged('anzeigeeinheit')) {
                // wird die Anzeigeeinheit geändert,
                // so muss die Definition in die TPs nachgetriggert werden
                const tps = await Teilprojekte.raw().find({ 'projekt._id' : projektId }, { session }).toArray();
                tps.forEach( tp => {
                    Teilprojekte.updateOne(tp._id, { 
                        anzeigeeinheit: NEW.anzeigeeinheit,
                        anzeigeeinheitDetails: NEW.anzeigeeinheitDetails
                    });
                });
            }

            if (hasChanged('status')) {
                // soll das Projekt abgesagt werden, so muss geprüft werden, ob es nicht schon
                // Einzelleistungen bestätigt oder abgerechnet wurden. In diesem Fall
                // kann das Gesamtprojekt nicht mehr abgesagt werden.
                const tps = await Teilprojekte.raw().find({ 'projekt._id' : projektId }, { session }).toArray();

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