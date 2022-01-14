import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Allgemein } from "/server/app/allgemein";

import { AppData, IGenericApp, IGenericRemoveResult, TOptionValues } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import Tag from 'antd/lib/tag';
import { JaNeinEnum, JaNeinOptionen } from "./ja-nein-optionen";
import { Adressen } from "./adressen";
import { Projekte } from "../../consulting/apps/projekte";

export interface Preisliste extends IGenericApp {
    /**
     * Gültigkeit der Preisliste
     */
    gueltigkeit: Array<Date>

    /**
     * Zusätzlicher Kommentar, der den Umfang den Preisliste ggf. beschreibt
     */
    comment: string

    /**
     * Definiert, ob die Preisliste noch aktive in einer
     * Auswahl angeboten wird
     */
    active: JaNeinEnum

    /**
     * Kennzeichnung ob diese Preisliste als Default für neue Adressen
     * herangezogen werden soll
     */
    isStandard: JaNeinEnum
}

export const Preislisten = Allgemein.createApp<Preisliste>('preislisten', {
    title: "Preislisten",
    description: "Beschreibung aller Preislisten zur Abbildung wiederkehrender Kundenpreismodelle.",
    icon: 'fa-fw far fa-money-bill-alt',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'die Preisliste', ohneArtikel: 'Preisliste' },
        plural: { mitArtikel: 'die Preislisten', ohneArtikel: 'Preislisten' },

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
                { required: true, message: 'Bitte geben Sie die Güligkeit der Preisliste ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Gültigkeit', 'die', 'Gültigkeiten'),
            ...defaultSecurityLevel
        },

        comment: {
            type: EnumFieldTypes.ftString,
            ...FieldNamesAndMessages('der', 'Kommentar', 'die', 'Kommentare', { onUpdate: 'den Kommentar' }),
            ...defaultSecurityLevel
        },

        active: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob die Preisliste noch aktiv ausgewählt werden kann.' },
            ],
            ...FieldNamesAndMessages('die', 'Aktivierung', 'die', 'Aktivierung'),
            ...defaultSecurityLevel
        },

        isStandard: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie an, ob diese Preisliste die Standard-Systempreisliste sein soll.' },
            ],
            ...FieldNamesAndMessages('die', 'Standardeinstellung', 'die', 'Standardeinstellungen'),
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
                
                { field: 'gueltigkeit', controlType: EnumControltypes.ctDatespanInput },
                { field: 'comment', controlType: EnumControltypes.ctTextInput },
                { field: 'active', title: 'Aktiv', controlType: EnumControltypes.ctOptionInput, values: JaNeinOptionen },
                { field: 'isStandard', title:'Als Standard verwenden', controlType: EnumControltypes.ctOptionInput, values: JaNeinOptionen },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang einer Preisliste',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { redirect: '/allgemein/preislisten/new' }
        },
    },

    methods: {
        onBeforeInsert: async function(_NEW, { currentValue }) {
            if (currentValue('isStandard') == JaNeinEnum.ja) {
                const std = Preislisten.findOne({ isStandard: JaNeinEnum.ja });
                if (std) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Es ist bereits eine Preisliste als Standard definiert. Es können nicht mehrere Preislisten zeitgleich als Standard agieren.`}
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onBeforeUpdate: async function(_id, _NEW, _OLD, { currentValue }) {
            if (currentValue('isStandard') == JaNeinEnum.ja) {
                const std = Preislisten.findOne({ isStandard: JaNeinEnum.ja });
                if (std) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Es ist bereits eine Preisliste als Standard definiert. Es können nicht mehrere Preislisten zeitgleich als Standard agieren.`}
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onBeforeRemove: async function(OLD) {
            // Prüfen, ob diese Preisliste bereits verwandt wird
            const adr = Adressen.findOne({ 'preisliste._id': OLD._id });
            const prj = Projekte.findOne({ 'preisliste._id': OLD._id });
            if (adr || prj) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Preisliste wird bereits in einer oder mehrere Adressen verwandt und kann nicht gelöscht werden.` }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },
    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'preislisten-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'preislisten-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportPreislistenAll = MebedoWorld.createReport<Preisliste, never>('preislisten-all', {
    type: 'table',
    
    title: 'Alle Preislisten',
    description: 'Zeigt alle Preislisten.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    injectables: {
        JaNeinOptionen, janein: JaNeinEnum
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const Preislisten = getAppStore('preislisten');
        return Preislisten.find({}, { sort: { title: 1 } });
    },

    columns: [
        {
            title: 'Preisliste',
            key: 'title',
            dataIndex: 'title',

        },
        {
            title: 'Gültigkeit',
            key: 'gueltigkeit',
            dataIndex: 'gueltigkeit',
            render: (gueltigkeit: Array<Date>, _preisliste: AppData<Preisliste>, { moment }) => {
                return `${moment(gueltigkeit[0]).format('DD.MM.YYYY')} bis ${moment(gueltigkeit[1]).format('DD.MM.YYYY')}`;
            }
        },
        {
            title: 'Status',
            key: 'active',
            dataIndex: 'active',
            align: 'center',
            render: (active: string, preisliste: AppData<Preisliste>, { injectables }) => {
                const { JaNeinOptionen }: { JaNeinOptionen: TOptionValues<JaNeinEnum> } = injectables as any;
                
                const a = JaNeinOptionen.find( jn => jn._id === active );
                if (!a) return <Tag color='grey'>{`!!${active}!!`}</Tag>
                
                return (
                    <div>
                        <Tag style={{color: a.color as string, backgroundColor: a.backgroundColor as string}}>{ a._id == 'ja' ? 'Aktiv': 'Inaktiv' }</Tag>
                        { preisliste.isStandard == 'ja' ? <Tag color='volcano'>Standard</Tag> : null }
                    </div>
                )
            }
        },

    ],

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten einer Preisliste',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/allgemein/preislisten/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminarteilnehmers',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Möchten Sie die Preisliste wirklich löschen?`,
                        //icon: <ExclamationCircleOutlined />,
                        content: <div>Das Löschen der Preisliste <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('preislisten.removeDocument', { productId: 'allgemein', appId: 'preislisten', docId: row._id }, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Die Preisliste wurde erfolgreich gelöscht');
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