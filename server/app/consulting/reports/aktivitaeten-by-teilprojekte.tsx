import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Teilprojekt } from '../apps/teilprojekte';
import { Projektstati } from '../apps/projektstati';
import { Aktivitaet } from '../apps/aktivitaeten';

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
        Projektstati
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
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
        /*{
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
                runScript: (props) => {
                    console.log('Run Script', props);
                }
            }
        }*/
    ]
    
})