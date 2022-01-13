import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Teilprojekt } from '../apps/teilprojekte';
import { Projekt } from '../apps/projekte';
import { Projektstati } from '../apps/projektstati';
import { AktivitaetenByTeilprojekte } from './aktivitaeten-by-teilprojekte';
import { AppData } from '/imports/api/types/app-types';

/**
 * Darstellung des Aufwands für die entspr. Spalte
 * 
 * @param aufwand 
 * @param akt 
 * @param param2 
 * @returns 
 */
 const renderAufwand = (aufwand: any, tp: AppData<Teilprojekt>/*, { injectables }: TInjectables*/) => {
    //const Einheiten: TOptionValues = injectables.Einheiten;
    //const einheit = Einheiten.find( ({_id}:{_id:any}) => _id == akt.einheit );
    const { singular, plural, faktor, precision } = tp.anzeigeeinheitDetails;
    const displayAufwand = +(Number(aufwand / faktor).toFixed(precision || 0));
    
    //if (!einheit) {
    //    return isExport ? (aufwand || '0') + '!!' + tp.einheit : <Tag>{'!!' + (aufwand || '0 ') + tp.einheit}</Tag>
    //}

    return (displayAufwand || '0') + ' ' + (aufwand === 1 ? singular : plural);
}

export const TeilprojekteByProjekt = MebedoWorld.createReport<Teilprojekt, Projekt>('teilprojekte-by-projekt', {

    type: 'table',
    
    title: 'Teilprojekte',
    description: 'Zeigt alle Teilprojekte für das aktuelle Projekt an.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ document: projekt, mode, isServer, publication, /*currentUser*/ }) => {
        //if (isServer && !publication.userId) return publication.ready();
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = projekt?._id || '';
        check(_id, String);

        const Teilprojekte = getAppStore('teilprojekte');
        
        return Teilprojekte.find({ 'projekt._id': _id }, { sort: { title: 1 } });
    },

    injectables: {
        Projektstati
    },

    nestedReportId: AktivitaetenByTeilprojekte.reportId,

    columns: [
        {
            title: 'Teilprojekt',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, teilprojekt, extras: IReportRendererExtras) => {                
                const { _id } = teilprojekt;
                const { isExport } = extras;

                return (
                    isExport 
                        ? title
                        : <a href={`/consulting/teilprojekte/${_id}`}>{title}</a>
                );
            }
        },
        {
            title: 'Aufwand',
            dataIndex: 'aufwandPlanMinuten',
            key: 'aufwandPlanMinuten',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Ist',
            dataIndex: 'aufwandIstMinuten',
            key: 'aufwandIstMinuten',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Rest',
            dataIndex: 'aufwandRestMinuten',
            key: 'aufwandRestMinuten',
            align: 'right',
            render: renderAufwand
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, _teilprojekt, { injectables, isExport }: IReportRendererExtras ) => {
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
                redirect: '/consulting/teilprojekte/new?projektId={{parentRecord._id}}'
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
                redirect: '/consulting/teilprojekte/{{rowdoc._id}}'
            }
        },
        {
            title: 'Neue Aktivität',
            inGeneral: false,
            type: 'more',

            description: 'Neuzugang einer weiteren Aktivität',
            icon: 'fas fa-plus',
            //iconOnly: true,
            
            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/consulting/aktivitaeten/new?tpId={{rowdoc._id}}'
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