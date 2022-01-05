//import React from 'react';
import { MebedoWorld } from '/server/app/mebedo-world';

import { getAppStore } from '/imports/api/lib/core';

import { Adresse } from '../apps/adressen';
import { IChartData } from '/imports/api/types/world';
import { ChartData, ChartOptions } from 'chart.js';

export const ChartAdressenByKundenart = MebedoWorld.createReport<Adresse, Adresse>('adressen-by-kundenart.chart', {

    type: 'chart',
    chartType: 'bar',
    
    title: 'Anzahl Adressen gemäß Kundenart',
    description: 'Zählt alle Adressen der angegebenen Kundenart.',

    /*sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],*/

    isStatic: false,

    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();

        const AdressenCounts = getAppStore('adressen.counts');
        
        if (isServer) {
            return AdressenCounts.find({});
        }

        /*return {
            fetch: (): IChartData => {
                let options: ChartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top' as const,
                        },
                        title: {
                            display: true,
                            text: 'Anzahl Adressen gem. Kundenarten',
                        },
                    },
                };

                let data: ChartData = {
                    labels: [] as Array<string>,
                    datasets: [
                        {
                            label: 'Kundenarten',
                            data: [] as Array<number>,
                            backgroundColor: [] as Array<string>,
                        },
                    ],
                };

                AdressenCounts.find({}).forEach( (adrCount: any) => {
                    data.labels?.push(adrCount.title);
                    data.datasets[0].data.push(adrCount.value);
                    (data.datasets[0].backgroundColor as Array<string>).push(adrCount.backgroundColor); 
                });

                return { options, data };
            }
        }*/

        return {
            fetch: (): IChartData => {
                let options: ChartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right' as const,
                        },
                        title: {
                            display: true,
                            text: 'Anzahl Adressen nach Kundenart',
                        },
                    },
                };

                let data: ChartData = {
                    labels: ['Kundenart'], //as Array<string>,
                    datasets: []
                };

                AdressenCounts.find({}).forEach( (adrCount: any) => {                    
                    data.datasets.push({
                        label: adrCount.title,
                        data: [adrCount.value],
                        backgroundColor: adrCount.backgroundColor 
                    });
                });

                return { options, data };
            }
        }
    },

    /*staticDatasource: ({ currentUser }) => {
        if (!currentUser) return [];

        let options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'Anzahl Adressen gem. Kundenarten',
                },
            },
        };

        let data = {
            labels: [] as Array<string>,
            datasets: [
                {
                    label: 'Kundenarten',
                    data: [] as Array<number>,
                    backgroundColor: [] as Array<string>,
                },
            ],
        };

        const AdressenCounts = getAppStore('adressen.counts');
        
        AdressenCounts.find({}).forEach( (adrCount: any) => {
            data.labels.push(adrCount.title);
            data.datasets[0].data.push(adrCount.value);
            data.datasets[0].backgroundColor.push(adrCount.backgroundColor); 
        });

        return { options, data };
    }*/

    /*actions: [
        {
            title: 'Drilldown',
            inGeneral: false,
            type: 'primary',

            description: 'Aufruf des Reports, der alle betroffenen Adressen im Detail zeigt',
            icon: 'fas fa-list-ol',
            iconOnly: true,

            visibleAt: ['Dashboard'],

            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { 
                redirect: '/reports/adressen-by-kundenart?kundenart={{doc.kundenart}}'
            }
        },
    ]*/
});