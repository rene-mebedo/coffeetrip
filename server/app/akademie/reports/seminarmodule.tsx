import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';

import { TOptionValues } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';

import { Seminarmodule } from '../apps/seminarmodule';

export const ReportSeminarmodule = MebedoWorld.createReport<Seminarmodul, Seminarmodul>('Seminarmodule', {

    type: 'table',
    
    title: 'Seminarmodule',
    description: 'Zeigt alle Seminarmodule an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser, document }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const Seminarmodule = getAppStore('seminarmodule');
        
        return Seminarmodule.find({}, { sort: { title: 1 } });
    },

    /*injectables: {
        Adressarten
    },*/

    columns: [
        {
            title: 'Seminarmodul',
            dataIndex: 'title',
            key: 'title',
            render: (title: any, seminarmodul, extras: IReportRendererExtras) => {                
                const { _id } = seminarmodul;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/akademie/seminarmodule/${_id}`}>{title}</a>
                );
            }
        },
        {
            title: 'Beschreibung',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Modul',
            dataIndex: 'modul',
            key: 'modul'
        },
    ],

    actions: [
        {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang eines Seminamoduls',
            icon: 'fas fa-plus',
            iconOnly: false,

            visibleAt: ['ReportPage'],
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/akademie/seminarmodule/new'
            }
        },
        {
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten eines Seminamoduls',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/akademie/seminarmodule/{{rowdoc._id}}'
            }
        },
        {
            title: 'Löschen',
            type: 'secondary',
            description: 'Löschen eines Seminamoduls',
            icon: 'fas fa-trash',
            iconOnly: true,

            visibleAt: ['ReportPage', 'Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                // executes meteor method
            }
        },
    ]
});