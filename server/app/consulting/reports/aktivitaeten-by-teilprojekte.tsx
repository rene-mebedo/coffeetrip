import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes, EnumMethodResult } from '/imports/api/consts';
import { Teilprojekt } from '../apps/teilprojekte';
import { Projektstati } from '../apps/projektstati';
import { Aktivitaet } from '../apps/aktivitaeten';
import { Einheiten } from '../apps/einheiten';
import { AppData, IGenericRemoveResult, TInjectables, TOptionValues } from '/imports/api/types/app-types';

/**
 * Darstellung des Aufwands für die entspr. Spalte
 * @param aufwand 
 * @param akt 
 * @param param2 
 * @returns 
 */
const renderAufwand = (aufwand: any, akt: AppData<Aktivitaet>, {injectables, isExport}: {injectables: TInjectables, isExport: boolean}) => {
    const Einheiten: TOptionValues = injectables.Einheiten;
    const einheit = Einheiten.find( ({_id}:{_id:any}) => _id == akt.einheit );
    
    if (!einheit) {
        return isExport ? (aufwand || '0') + '!!' + akt.einheit : <Tag>{'!!' + (aufwand || '0 ') + akt.einheit}</Tag>
    }

    return (aufwand || '0') + ' ' + (aufwand === 1 ? einheit.title : einheit.pluralTitle)
}

export const AktivitaetenByTeilprojekte = MebedoWorld.createReport<Aktivitaet, Teilprojekt>('aktivitaeten-by-teilprojekte', {
    type: 'table',
    
    title: 'Aktivitäten',
    description: 'Zeigt alle Aktivitäten für das aktuelle Teilprojekt an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ document: teilprojekt, mode, isServer, publication, /*currentUser*/ }) => {
        //if (isServer && !publication.userId) return publication.ready();
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = teilprojekt?._id || '';
        check(_id, String);

        const Aktivitaeten = getAppStore('aktivitaeten');
        
        return Aktivitaeten.find({ 'teilprojekt._id': _id }, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati,
        Einheiten
    },

    columns: [
        {
            title: 'Aktivität',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, aktivitaet, extras: IReportRendererExtras) => {                
                const { _id } = aktivitaet;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/consulting/aktivitaeten/${_id}`}>{title}</a>
                );
            }
        },        
        {
            title: 'Aufwand',
            dataIndex: 'aufwandPlan',
            key: 'aufwandPlan',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Ist',
            dataIndex: 'aufwandIst',
            key: 'aufwandIst',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Rest',
            dataIndex: 'aufwandRest',
            key: 'aufwandRest',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: string, _aktivitaet, { injectables, isExport }: IReportRendererExtras ) => {
                const { Projektstati } = injectables;
                const aktStatus = Projektstati.find( ({_id}:{_id:any}) => _id == status );
                
                if (!aktStatus) {
                    return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                }
                return (
                    isExport
                        ? aktStatus.title
                        : <Tag style={{color:aktStatus.color, backgroundColor:aktStatus.backgroundColor, borderColor:aktStatus.color}}>
                            {aktStatus.title}
                        </Tag>
                );
            },
        },
    ],

    actions: [
        {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang eines Teilprojekt',
            icon: 'fas fa-plus',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            disabled: ({ mode, data: _data, record: _record, defaults: _defaults, currentUser: _currentUser }) => mode == 'NEW',

            onExecute: { 
                redirect: '/consulting/aktivitaeten/new?tpId={{parentRecord._id}}'
            }
        },
        /*{
            title: 'Export CSV',
            inGeneral: true,
            type: 'secondary',

            description: 'Export der Reportdaten als CSV',
            icon: 'fas fa-file-csv',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            visible: ({ mode, data, record, defaults, currentUser }) => {
                return mode != 'NEW'// && data && data.length > 0
            },

            onExecute: { 
                exportToCSV: { filename: 'Teilprojekte.csv' }
            }
        },*/
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Seminarteilnehmers',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/consulting/aktivitaeten/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminarteilnehmers',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                // executes meteor method
                runScript: ({ row, document: _doc }, tools ) => {
                    const { confirm, message, invoke } = tools;

                    confirm({
                        title: `Möchten Sie die Aktivität wirklich löschen?`,
                        //icon: <ExclamationCircleOutlined />,
                        content: <div>Das Löschen der Aktivität <b>{row.title}</b> kann nicht rückgängig gemacht werden!</div>,
                        onOk() {
                            invoke('aktivitaeten.removeDocument', { productId: 'consulting', appId: 'aktivitaeten', docId: row._id }, (err: any, res: IGenericRemoveResult) => {
                                if (err) {
                                    console.log(err);
                                    return message.error('Es ist ein unbekannter Fehler aufgetreten.');
                                }
                                if (res.status == EnumMethodResult.STATUS_OKAY) {
                                    return message.success('Die Aktivität wurde erfolgreich gelöscht');
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
        }
    ]
    
})