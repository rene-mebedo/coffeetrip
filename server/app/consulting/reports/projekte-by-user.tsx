import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/tag';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Projekt } from '../apps/projekte';
import { Projektstati } from '../apps/projektstati';
import { getAppStore } from '/imports/api/lib/core';
import { isArray } from '/imports/api/lib/basics';

export const ProjekteByUser = MebedoWorld.createReport<Projekt, Projekt>('projekte-by-user', {

    type: 'table',
    
    title: 'Projekte',
    description: 'Zeigt alle Projekte an.',

    //sharedWith: [],
    //sharedWithRoles: ['EVERYBODY'],

    isStatic: false,

    liveDatasource: ({ mode, document: params, isServer, publication, /*currentUser*/ }) => {
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const Projekte = getAppStore('projekte');

        return Projekte.find({ 
            status: isArray(params?.status) ? { $in: params?.status } : params?.status 
        }, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati
    },

    //nestedReportId: AktivitaetenByTeilprojekte.reportId,

    columns: [
        {
            title: 'Projekt',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, projekt, extras: IReportRendererExtras) => {                
                const { _id } = projekt;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/consulting/projekte/${_id}`}>{title}</a>
                );
            }
        },
        {
            title: 'Beschreibung',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, _projekt, { injectables, isExport }: IReportRendererExtras ) => {
                const { Projektstati } = injectables;
                const tpStatus = Projektstati.find( ({_id}:{_id:any}) => _id == status );
                
                if (!tpStatus) {
                    return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                }
                return (
                    isExport
                        ? tpStatus.title
                        : <Tag style={{color:tpStatus.color, backgroundColor:tpStatus.backgroundColor, borderColor:tpStatus.color}}>
                            {tpStatus.title}
                        </Tag>
                );
            },
        },
    ],

    actions: [
        {
            title: 'Export CSV',
            inGeneral: true,
            type: 'secondary',

            description: 'Export der Reportdaten als CSV',
            icon: 'fas fa-file-csv',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            /*visible: ({ mode }) => {
                return mode != 'NEW'
            },*/

            onExecute: { 
                exportToCSV: { filename: 'Teilprojekte.csv' }
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
                redirect: '/consulting/projekte/{{rowdoc._id}}'
            }
        },
    ]
    
})