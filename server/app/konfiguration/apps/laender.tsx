import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { AppData, IGenericApp, TAppLink, UpdateableAppData } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Konfiguration } from "..";
import { Laendergruppe, Laendergruppen } from "./laendergruppen";
import { Adressen } from "../../allgemein/apps/adressen";
import { Projekte } from "../../consulting/apps/projekte";
import { DefaultAppActions, DefaultAppFields, DefaultReportActions } from "../../defaults";

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

export const enum LaenderErrorEnum {
    LAENDERGRUPPE_NOT_FOUND,
    REF_EXISTS_TO_ADRESSE,
    REF_EXISTS_TO_PROJECT_Rechnungsland,
    REF_EXISTS_TO_PROJECT_Leistungsland
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
            //removeDocument: 'des Landes' // Das Löschen des Landes "Deutschland" kann nicht rückgängig gemacht werden.
        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

    fields: {
        ...DefaultAppFields.title(['ADMIN']),
        ...DefaultAppFields.description(['ADMIN']),

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
        ...DefaultAppActions.newDocument(['ADMIN']),
        ...DefaultAppActions.editDocument(['ADMIN']),
        ...DefaultAppActions.removeDocument(['ADMIN']),
    },

    methods: {
        onAfterInsert: async function(_id, NEW, { currentValue, session }) {
            // mit dem Hinzufügen eines neuen Landes muss die Referenz des Landes auch
            // direkt innerhalb der Ländergruppe geführt sein.
            const laendergruppe: AppData<Laendergruppe> = await Laendergruppen.raw().findOne({_id: NEW.laendergruppe[0]._id}, { session });
            if (!laendergruppe) {
                return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND, statusText: `Die Ländergruppe "${NEW.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
            }

            let lgData: UpdateableAppData<Laendergruppe> = {};
            lgData.laender = laendergruppe.laender || [];
            lgData.laender.push({
                _id,
                title: currentValue('title'),
                description: currentValue('description'),
                imageUrl: currentValue('imageUrl'),
                link: '/konfiguration/laender/' + _id
            });

            await Laendergruppen.updateOne(NEW.laendergruppe[0]._id, { ...lgData }, { session } );

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterUpdate: async function(_id, NEW, OLD, { hasChanged, currentValue, session }) {
            // wurde die Ländergruppe geändert, so muss
            // die Liste der Länder innerhalb dieser Gruppe aktualisiert werden
            if (hasChanged('laendergruppe')) {
                // Ländereintrag aus der alten Ländergruppe entfernen
                const laendergruppeOld: AppData<Laendergruppe> = await Laendergruppen.raw().findOne({_id: OLD.laendergruppe[0]._id}, { session });
                if (!laendergruppeOld) {
                    return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND, statusText: `Die Ländergruppe "${OLD.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
                }
                let lgDataOld: UpdateableAppData<Laendergruppe> = {};
                lgDataOld.laender = (laendergruppeOld.laender || []).filter( land => {
                    return land._id != _id 
                });
                await Laendergruppen.updateOne(laendergruppeOld._id, { ...lgDataOld }, { session } );

                // ist eine neue Ländergruppe gesetzt worden?
                if (NEW.laendergruppe && NEW.laendergruppe[0]) {
                    // Land der neuen Ländergruppe anfügen
                    const laendergruppe: AppData<Laendergruppe> = await Laendergruppen.raw().findOne({_id: NEW.laendergruppe[0]._id}, { session });
                    if (!laendergruppe) {
                        return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND, statusText: `Die Ländergruppe "${NEW.laendergruppe[0].title}" könnte in Ihrer Beschreibung nicht gefunden werden.` }
                    }
                    let lgData: UpdateableAppData<Laendergruppe> = {};
                    lgData.laender = laendergruppe.laender || [];
                    lgData.laender.push({
                        _id,
                        title: currentValue('title'),
                        description: currentValue('description'),
                        imageUrl: currentValue('imageUrl'),
                        link: '/konfiguration/laender/' + _id
                    });
                    await Laendergruppen.updateOne(laendergruppe._id, { ...lgData }, { session } );
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterRemove: async function(OLD, { session }) {
            // prüfen ob das Land einer Ländergruppe zugeordnet war
            if (OLD.laendergruppe && OLD.laendergruppe.length > 0) {
                // Ländereintrag aus der alten Ländergruppe entfernen
                const lgId = OLD.laendergruppe[0]._id;
                const laendergruppeOld: AppData<Laendergruppe>  = await Laendergruppen.raw().findOne({_id: lgId}, { session });
                if (!laendergruppeOld) {
                    return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.LAENDERGRUPPE_NOT_FOUND, statusText: `Die Ländergruppe "${OLD.laendergruppe[0].title}" konnte in Ihrer Beschreibung nicht gefunden werden.` }
                }
                let lgData: UpdateableAppData<Laendergruppe> = {};
                lgData.laender = laendergruppeOld.laender.filter( land => land._id != OLD._id );
                await Laendergruppen.updateOne(lgId, lgData, { session } );
            }
            
            if (await Adressen.raw().findOne({'land._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.REF_EXISTS_TO_ADRESSE, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Adressen referenziert wird.` }
            }

            if (await Projekte.raw().findOne({'rechnungLand._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.REF_EXISTS_TO_PROJECT_Rechnungsland, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Rechnungsland referenziert wird.` }
            }

            if (await Projekte.raw().findOne({'leistungsland._id': OLD._id})) {
                return { status: EnumMethodResult.STATUS_ABORT, errCode: LaenderErrorEnum.REF_EXISTS_TO_PROJECT_Leistungsland, statusText: `Das Land konnte nicht gelöscht werden, da es noch in einer oder mehrerer Projekte als Leistungsland referenziert wird.` }
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
    title: 'Alle Länder',
    description: 'Zeigt alle Länder dieser Welt.',

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        let $Laender;
        if (isServer)
            $Laender = Laender
        else
            $Laender = getAppStore('laender');
        return $Laender.find({}, { sort: { title: 1 } });
    },

    type: 'table',
    tableDetails:{
        columns: [
            {
                title: 'Symbol',
                key: 'imageUrl',
                dataIndex: 'imageUrl',
                render: (imageUrl) => <img src={imageUrl} width="32" height="auto" />
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
    },

    actions: [
        DefaultReportActions.editDocument(['ADMIN'], Laender),
        DefaultReportActions.removeDocument(['ADMIN'], Laender)
    ]
});