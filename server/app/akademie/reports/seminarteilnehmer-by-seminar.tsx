import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { Teilnehmerstati } from '../apps/teilnehmerstati';
import { Seminarteilnehmer } from '../apps/seminarteilnehmer';

import { AppData } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';
import { Seminar } from '../apps/seminare';
import { EnumDocumentModes } from '/imports/api/consts';

export const SeminarteilnehmerBySeminar = MebedoWorld.createReport<Seminarteilnehmer, Seminar>('seminarteilnehmer-by-seminar', {

    type: 'table',
    
    title: 'Seminarteilnehmer',
    description: 'Zeigt alle Seminarteilnehmer des ausgewählten Seminars an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ document: seminar, mode, isServer, publication, /*currentUser*/ }) => {
        //if (isServer && !publication.userId) return publication.ready();
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = seminar?._id || '';
        check(_id, String);

        const Seminarteilnehmer = getAppStore('seminarteilnehmer');
        
        return Seminarteilnehmer.find({ 'seminar._id': _id }, { sort: { title: 1 } });
    },

    injectables: {
        Teilnehmerstati
    },

    columns: [
        {
            title: 'Teilnehmer',
            dataIndex: 'title',
            key: 'title',
            render: (title: any, teilnehmer, extras: IReportRendererExtras) => {                
                const { _id } = teilnehmer;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/akademie/seminarteilnehmer/${_id}`}>{title}</a>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, _seminarteilnehmer: AppData<Seminarteilnehmer>, { injectables, isExport }: IReportRendererExtras ) => {
                const { Teilnehmerstati } = injectables;
                const tnStatus = Teilnehmerstati.find( ({_id}:{_id:any}) => _id == status );
                
                if (!tnStatus) {
                    return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                }
                return (
                    isExport
                        ? tnStatus.title
                        : <Tag style={{color:tnStatus.color, backgroundColor:tnStatus.backgroundColor, borderColor:tnStatus.color}}>
                            {tnStatus.title}
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

            description: 'Neuzugang eines Seminarteilnehmers',
            icon: 'fas fa-plus',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            disabled: ({ mode, data, record, defaults, currentUser }) => mode == 'NEW',

            onExecute: { 
                redirect: '/akademie/seminarteilnehmer/new?seminarId={{parentRecord._id}}'
            }
        },
        {
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
                exportToCSV: { filename: 'Seminarteilnehmer.csv' }
            }
        },
        {
            title: 'Export PDF',
            inGeneral: true,
            type: 'more',

            description: 'Export der Reportdaten als PDF',
            icon: 'far fa-file-pdf',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            disabled: ({ mode, data, defaults, currentUser }) => mode == 'NEW' || data.length == 0,

            onExecute: { 
                redirect: '/akademie/seminarteilnehmer/new?seminarId={{parentRecord._id}}'
            }
        },
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
                redirect: '/akademie/seminarteilnehmer/{{rowdoc._id}}'
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
                runScript: (props /*{ mode, data, record, defaults, currentUser, isServer }*/) => {
                    console.log('Run Script', props);
                }
            }
        },
        {
            title: 'Anmailen',
            type: 'more',
            description: 'Teilnehmer eine E-Mail schreiben',
            icon: 'fas fa-envelope',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                // executes meteor method
                runScript: (props /*{ mode, data, record, defaults, currentUser, isServer }*/) => {
                    console.log('Run Script', props);
                }
            }
        }
    ]
    
})