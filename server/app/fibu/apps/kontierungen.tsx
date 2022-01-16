import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { AppData, IGenericApp, IGenericRemoveResult } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Fibu } from "..";

export interface Kontierung extends IGenericApp {
    /**
     * Gültigkeit dieser Kontierung
     */
    gueltigkeit: Array<Date>

    /**
     * Umsatzsteuersatz VH i.d.R. 0, 7 oder 19 
     */
    ustsatzVh: number,

    /**
     * Steuerschlüssel wie er von der angebundenen Fibu gefordert wird
     */
    steuerschluessel: string
    /**
     * Steuerkonto, auf das die Umsatzsteuer kontiert werden soll
     */
    steuerkonto: string

    /**
     * Erlöskonto auf das der Nettoerloes gebucht werden soll
     */
    erloeskonto: string
}

export const Kontierungen = Fibu.createApp<Kontierung>('kontierungen', {
    title: "Kontierungen",
    description: "Beschreibung der zeitabhängigen Umsatzsteuerbehandlung, Erlöskonten, etc. für das Rechnungswesen.",
    icon: 'fa-fw fas fa-columns',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Kontierung', ohneArtikel: 'Kontierung' },
        plural: { mitArtikel: 'die Kontierungen', ohneArtikel: 'Kontierungen' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

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

        gueltigkeit: {
            type: EnumFieldTypes.ftDatespan, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Gültigkeit ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Gültigkeit', 'die', 'Gültigkeiten'),
            ...defaultSecurityLevel
        },

        ustsatzVh: {
            type: EnumFieldTypes.ftInteger, 
            rules: [
                { required: true, message: 'Bitte geben Sie die Gültigkeit ein.' },
                { type: 'number', min: 0, max: 100, message: 'Bitte geben Sie einen gültigen Steuersatz zwischen 0 und 100 an.' },
            ],
            ...FieldNamesAndMessages('die', 'Umsatzsteuer (vH)', 'die', 'Umsatzsteuer (vH)'),
            ...defaultSecurityLevel
        },

        steuerschluessel: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Steuerschlüssel ein.' },    
            ],
            ...FieldNamesAndMessages('der', 'Steuerschlüssel', 'die', 'Steuerschlüssel', { onUpdate: 'den Steuerschlüssel' }),
            ...defaultSecurityLevel
        },

        steuerkonto: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie das Steuerkonto ein.' },    
            ],
            ...FieldNamesAndMessages('das', 'Steuerkonto', 'die', 'Steuerkonto'),
            ...defaultSecurityLevel
        },

        erloeskonto: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie das Erlöskonto ein.' },    
            ],
            ...FieldNamesAndMessages('das', 'Erlöskonto', 'die', 'Erlöskonten'),
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
                
                { field: 'gueltigkeit', controlType: EnumControltypes.ctDatespanInput },
                { field: 'ustsatzVh', controlType: EnumControltypes.ctNumberInput },
                { field: 'steuerschluessel', controlType: EnumControltypes.ctStringInput },
                { field: 'steuerkonto', controlType: EnumControltypes.ctStringInput },
                { field: 'erloeskonto', controlType: EnumControltypes.ctStringInput },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang einer Kontiergruppe',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { redirect: '/fibu/kontierungen/new' }
        },
    },

    methods: {

    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'kontierungen-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'kontierungen-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportKontierungenAll = MebedoWorld.createReport<Kontierung, never>('kontierungen-all', {
    type: 'table',
    
    title: 'Alle Kontierungen',
    description: 'Zeigt alle Kontierungen.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    injectables: {
        
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let $Kontierungen;
        if (isServer)
            $Kontierungen = Kontierungen
        else
            $Kontierungen = getAppStore('kontierungen');
        return $Kontierungen.find({}, { sort: { title: 1 } });
    },

    columns: [
        {
            title:'Allgemein',
            children: [
                {
                    title: 'Kontierung',
                    key: 'title',
                    dataIndex: 'title',
        
                },
                {
                    title: 'Beschreibung',
                    key: 'description',
                    dataIndex: 'description',
                },
                {
                    title: 'Gültigkeit',
                    key: 'gueltigkeit',
                    dataIndex: 'gueltigkeit',
                    render: (gueltigkeit: Array<Date>, _kontierung: AppData<Kontierung>, { moment }) => {
                        return `${moment(gueltigkeit[0]).format('DD.MM.YYYY')} bis ${moment(gueltigkeit[1]).format('DD.MM.YYYY')}`;
                    }
                },
            ]
        },
        {
            title: 'Fibu',
            children: [
                {
                    title: 'Steuersatz',
                    key: 'ustsatzVh',
                    dataIndex: 'ustsatzVh',
                    align: 'right'
                },
                {
                    title: 'Steuerkonto',
                    key: 'steuerkonto',
                    dataIndex: 'steuerkonto',
                },
                {
                    title: 'Erlöskonto',
                    key: 'erloeskonto',
                    dataIndex: 'erloeskonto',
                },
            ]
        }
    ],

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten der Kontierung',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/fibu/kontierungen/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen einer Kontierung',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Kontierung löschen?`,
                        content: <div>Das Löschen der Kontierung <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('kontierungen.removeDocument', { productId: 'fibu', appId: 'kontierung', docId: row._id }, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Die Kontierung wurde erfolgreich gelöscht.');
                                }
                                if (res.status == EnumMethodResult.STATUS_ABORT) {
                                    return message.warning(res.statusText);
                                }
                                
                                message.error('Es ist ein Fehler beim Löschen aufgetreten. ' + res.statusText);
                            });
                        }
                    });
                }
            }
        },
    ]
});