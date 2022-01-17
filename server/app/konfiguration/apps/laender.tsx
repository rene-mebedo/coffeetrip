import { FieldNamesAndMessages, getAppLinkItem } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IGenericApp, IGenericRemoveResult, TAppLink, UpdateableAppData } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { JaNeinEnum, JaNeinOptionen } from "../../allgemein/apps/ja-nein-optionen";
import { Konfiguration } from "..";
import { Laendergruppe, Laendergruppen } from "./laendergruppen";
import { Adressen } from "../../allgemein/apps/adressen";
import { Projekte } from "../../consulting/apps/projekte";


export interface Land extends IGenericApp {
    /**
     * Two-Letter-Code für das jeweilige Land
     * z .B. DE für Deutschland, FR für Frankreich
     */
    lc2: string

    /**
     * 3-Letter-Code für das jeweilige Land
     * z .B. DEU für Deutschland, FRA für Frankreich
     */
    lc3: string

    /**
     * Image Url für die Nationalflagge um diese in der
     * DropDown anzuzeigen
     */
    imageUrl: string

    /**
     * Definition zu welcher Ländergruppe
     * EU, Inland, Drittland das jeweilige Land gehört
     */
    laendergruppe: TAppLink
}

export const Laender = Konfiguration.createApp<Land>('laender', {
    title: "Länder",
    description: "Liste aller Länder dieser Welt.",
    icon: 'fa-fw fas fa-globe',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Land', ohneArtikel: 'Land' },
        plural: { mitArtikel: 'die Länder', ohneArtikel: 'Länder' },

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

        lc2: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { type:'string', min:2, max:2, len:2, required: true, message: 'Bitte geben Sie den 2-Letter-Code ein.' },    
            ],
            ...FieldNamesAndMessages('der', '2-Letter-Code', 'die', '2-Letter-Code`s', { onUpdate: 'den 2-Letter-Code' }),
            ...defaultSecurityLevel
        },

        lc3: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { type:'string', min:3, max:3, len:3, required: true, message: 'Bitte geben Sie den 3-Letter-Code ein.' },    
            ],
            ...FieldNamesAndMessages('der', '3-Letter-Code', 'die', '3-Letter-Code`s', { onUpdate: 'den 3-Letter-Code' }),
            ...defaultSecurityLevel
        },

        imageUrl: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Bildinformation', 'die', 'Bildinformationen' ),
            ...defaultSecurityLevel
        },

        laendergruppe: {
            type: EnumFieldTypes.ftAppLink, 
            appLink: {
                app: 'laendergruppen',
                hasDescription: true,
                hasImage: true,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie die Ländergruppe an.' },
            ],
            ...FieldNamesAndMessages('die', 'Ländergruppe', 'die', 'Ländergruppen' ),
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
                
                { field: 'lc2', controlType: EnumControltypes.ctStringInput },
                { field: 'lc3', controlType: EnumControltypes.ctStringInput },
                { field: 'imageUrl', controlType: EnumControltypes.ctStringInput },
                { field: 'laendergruppe', controlType: EnumControltypes.ctAppLink },
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Land',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { redirect: '/konfiguration/laender/new' }
        },
    },

    methods: {
        onAfterInsert: async function(_id, NEW, { session }) {
            // mit dem Hinzufügen eines neuen Landes muss die Referenz des Landes auch
            // direkt innerhalb der ändergruppe geführt sein.
            const laendergruppe = Laendergruppen.raw().findOne({_id: NEW.laendergruppe[0]._id});
            if (!laendergruppe) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Ländergruppe "${NEW.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
            }
            let lgData: UpdateableAppData<Laendergruppe> = {};
            lgData.laender?.push( getAppLinkItem(NEW, { link: '/konfiguration/laender/' }) )
            Laendergruppen.updateOne(NEW.laendergruppe[0]._id, lgData, { session } );

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterUpdate: async function(_id, NEW, OLD, { hasChanged, session }) {
            // wurde die Ländergruppe geändert, so muss
            // die Liste der Länder innerhalb dieser Gruppe aktualisiert werden
            if (hasChanged('laendergruppe')) {
                // Ländereintrag aus der alten Ländergruppe entfernen
                const laendergruppeOld = Laendergruppen.findOne({_id: OLD.laendergruppe[0]._id});
                if (!laendergruppeOld) {
                    return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Ländergruppe "${OLD.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
                }
                let lgDataOld: UpdateableAppData<Laendergruppe> = {};
                lgDataOld.laender = laendergruppeOld.laender?.filter( land => land._id !== _id )
                Laendergruppen.updateOne(laendergruppeOld._id, lgDataOld, { session } );

                // ist eine neue Ländergruppe gesetzt worden?
                if (NEW.laendergruppe && NEW.laendergruppe[0]) {
                    // Land der neuen Ländergruppe anfügen
                    const laendergruppe = Laendergruppen.raw().findOne({_id: NEW.laendergruppe[0]._id});
                    if (!laendergruppe) {
                        return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Ländergruppe "${NEW.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
                    }
                    let lgData: UpdateableAppData<Laendergruppe> = {};
                    lgData.laender?.push( getAppLinkItem(NEW, { link: '/konfiguration/laender/' }) )
                    Laendergruppen.updateOne(NEW.laendergruppe[0]._id, lgData, { session } );
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterRemove: async function(OLD, { session }) {
            // prüfen ob das Land einer Ländergruppe zugeordnet war
            if (OLD.laendergruppe && OLD.laendergruppe.length > 0) {
                OLD.laendergruppe.forEach( lg => {
                    // Ländereintrag aus der alten Ländergruppe entfernen
                    const laendergruppeOld = Laendergruppen.findOne({_id: lg._id});
                    if (!laendergruppeOld) {
                        return { status: EnumMethodResult.STATUS_ABORT, statusText: `Die Ländergruppe "${lg.title}" konnte in Ihrer Beschreibung nicht gefunden werden.` }
                    }
                    let lgDataOld: UpdateableAppData<Laendergruppe> = {};
                    lgDataOld.laender = laendergruppeOld.laender?.filter( land => land._id !== lg._id )
                    Laendergruppen.updateOne(laendergruppeOld._id, lgDataOld, { session } );
                });
            }

            if (Adressen.raw().findOne({'land._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Adressen referenziert wird.` }
            }

            if (Projekte.raw().findOne({'rechnungLand._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Rechnungsland referenziert wird.` }
            }
            
            if (Projekte.raw().findOne({'leistungsland._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Leistungsland referenziert wird.` }
            }
            return { status: EnumMethodResult.STATUS_OKAY }
        }
    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'laender-all', width: { xs:24 },  type: 'report', details: { type: 'table', reportId: 'laender-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportLaenderAll = MebedoWorld.createReport<Land, never>('laender-all', {
    type: 'table',
    
    title: 'Alle Länder',
    description: 'Zeigt alle Länder dieser Welt.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    injectables: {
        JaNeinOptionen, janein: JaNeinEnum
    },

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let $Laender;
        if (isServer)
            $Laender = Laender
        else
            $Laender = getAppStore('laender');
        return $Laender.find({}, { sort: { title: 1 } });
    },

    columns: [
        {
            title: 'Symbol',
            key: 'imageUrl',
            dataIndex: 'imageUrl',
            render: (imageUrl) => <img src={imageUrl} width="48" height="auto" />
        },
        {
            title: 'Land',
            key: 'title',
            dataIndex: 'title',

        },
        {
            title: 'Kurzbeschreibung',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: '2-LC',
            key: 'lc2',
            dataIndex: 'lc2',
        },
        {
            title: '3-LC',
            key: 'lc3',
            dataIndex: 'lc3',
        },
    ],

    actions: [
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Landes',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                redirect: '/konfiguration/laender/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Landes',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN' ],
            executeBy: [ 'ADMIN' ],

            onExecute: { 
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Land löschen?`,
                        content: <div>Das Löschen des Landes <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('laender.removeDocument', { productId: 'konfiguration', appId: 'laender', docId: row._id }, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Las Land wurde erfolgreich gelöscht.');
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