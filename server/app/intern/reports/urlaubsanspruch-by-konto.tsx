import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import Tag from 'antd/lib/image';
import { getAppStore } from '/imports/api/lib/core';
import { check } from 'meteor/check';

import { AppData } from '/imports/api/types/app-types';
import { IReportRendererExtras } from '/imports/api/types/world';
import { EnumDocumentModes } from '/imports/api/consts';
import { Urlaubskonto } from '../apps/urlaubskonto';
import { Urlaubsanspruch } from '../apps/urlaubsanspruch';
import { StatusUrlaubsanspruch } from '../apps/status-urlaubsanspruch';

export const UrlaubsanspruchByKonto = MebedoWorld.createReport<Urlaubsanspruch, Urlaubskonto>('urlaubsanspruch-by-konto', {    
    title: 'Urlaubsansprüche',
    description: 'Zeigt alle Urlaubsansprüche für dieses Urlaubskonto an.',

    isStatic: false,

    liveDatasource: ({ document: urlaubskonto, mode, isServer, publication, /*currentUser*/ }) => {
        if (isServer && mode === EnumDocumentModes.NEW) return publication?.ready();

        const _id = urlaubskonto?._id || '';
        check(_id, String);

        const Urlaubsanspruch = getAppStore('urlaubsanspruch');
        
        return Urlaubsanspruch.find({ 'urlaubskonto._id': _id }, { sort: { createdAt: 1 } });
    },

    injectables: {
        StatusUrlaubsanspruch
    },

    type: 'table',
    tableDetails: {
        columns: [
            {
                title: 'Betreff',
                dataIndex: 'title',
                key: 'title',
                render: (title: any, teilnehmer, extras: IReportRendererExtras) => {                
                    const { _id } = teilnehmer;
                    const { isExport } = extras;

                    return (
                        isExport 
                            ? title
                            : <a href={`/intern/urlaubsanspruch/${_id}`}>{title}</a>
                    );
                }
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string, _urlaubsanspruch: AppData<Urlaubsanspruch>, { injectables, isExport }: IReportRendererExtras ) => {
                    const { StatusUrlaubsanspruch } = injectables;
                    const anspruchStatus = StatusUrlaubsanspruch.find( ({_id}:{_id:any}) => _id == status );
                    
                    if (!anspruchStatus) {
                        return isExport ? '!!' + status : <Tag>{'!!' + status}</Tag>
                    }
                    return (
                        isExport
                            ? anspruchStatus.title
                            : <Tag style={{color:anspruchStatus.color, backgroundColor:anspruchStatus.backgroundColor, borderColor:anspruchStatus.color}}>
                                {anspruchStatus.title}
                            </Tag>
                    );
                },
            },
            {
                title: 'Tage',
                dataIndex: 'anzahlTage',
                key: 'anzahlTage',
            },
        ],
    },

    actions: [
        {
            title: 'Neu',
            inGeneral: true,
            type: 'primary',

            description: 'Neuzugang eines Urlaubsanspruch',
            icon: 'fas fa-plus',

            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            disabled: ({ mode }) => mode == 'NEW',

            onExecute: { 
                redirect: '/intern/urlaubsanspruch/new?urlaubskonto={{parentRecord._id}}'
            }
        },
        /*{
            title: 'Bearbeiten',
            inGeneral: false,
            type: 'primary',

            description: 'Bearbeiten des Urlaubsanspruch',
            icon: 'far fa-edit',
            iconOnly: true,
            
            visibleAt: ['Document'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/intern/urlaubsanspruch/{{rowdoc._id}}'
            }
        }*/
    ]  
})