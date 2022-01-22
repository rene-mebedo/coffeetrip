
import { EnumControltypes, EnumFieldTypes } from "/imports/api/consts";

import { IGenericApp } from "/imports/api/types/app-types";
import { MebedoWorld } from "../../mebedo-world";
import { getAppStore } from "/imports/api/lib/core";

import { Akademie } from "..";
import { DefaultAppActions, DefaultAppFields, DefaultReportActions } from "../../defaults";
import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";

export interface Dozent extends IGenericApp {
    imageUrl: string
    position: string
    unternehmen: string
    fachgebiete: string
}

export const Dozenten = Akademie.createApp<Dozent>('dozenten', {
    title: "Dozenten",
    description: "Definition und kleiner Steckbrief von unseren Dozenten",
    icon: 'fa-fw fas fa-chalkboard-teacher',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Dozent', ohneArtikel: 'Dozent' },
        plural: { mitArtikel: 'die Dozenten', ohneArtikel: 'Dozenten' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {
            activityRecordInserted: 'hat den Dozenten erstellt'
        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EVERYBODY'],

    fields: {
        ...DefaultAppFields.title(['EVERYBODY']),
        ...DefaultAppFields.description(['EVERYBODY']),

        imageUrl: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Bildinformation', 'die', 'Bildinformationen' ),
            ...defaultSecurityLevel
        },

        position: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Position', 'die', 'Positionen' ),
            ...defaultSecurityLevel
        },

        unternehmen: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('das', 'Unternehmen', 'die', 'Unternehmen' ),
            ...defaultSecurityLevel
        },

        fachgebiete: {
            type: EnumFieldTypes.ftString, 
            rules: [ ],
            ...FieldNamesAndMessages('die', 'Fachgebietsbeschreibung', 'die', 'Fachgebietsbeschreibungen' ),
            ...defaultSecurityLevel
        },
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                
                { field: 'imageUrl', controlType: EnumControltypes.ctStringInput },
                { field: 'position', controlType: EnumControltypes.ctStringInput },
                { field: 'unternehmen', controlType: EnumControltypes.ctStringInput },
                { field: 'fachgebiete', controlType: EnumControltypes.ctTextInput },
            ]
        },
    },

    actions: {
        ...DefaultAppActions.newDocument(['EVERYBODY']),
        ...DefaultAppActions.editDocument(['ADMIN', 'EMPLOYEE', 'OWNER']),
    },

    methods: {

    },

    dashboardPicker: () => 'default',
    dashboards: {
        default: { 
            rows: [
                {
                    elements: [
                        { _id:'daschboard-dozenten-all', width: { xs:24, sm:24, md:24, lg:{offset:2, span:20}, xl:{ offset:5, span:14 }, xxl: { offset:6, span:12 } },  type: 'report', details: { type: 'card', reportId: 'dozenten-all' } },
                    ]
                },
            ]
        },
    },
});


export const ReportDozentenAll = MebedoWorld.createReport<Dozent, never>('dozenten-all', {  
    title: 'Alle Dozenten',
    description: 'Zeigt alle Dozenten der MEBEDO Akademie GmbH.',

    isStatic: false,
    liveDatasource: ({ isServer, publication, currentUser }) => {
        if (isServer && !currentUser) return publication?.ready();
        
        const appStore = isServer ? Dozenten : getAppStore('dozenten');

        return appStore.find({}, { sort: { title: 1 } });
    },

    type: 'card',
    cardDetails: {
        width: { xs:24, sm:24, md:8, lg:8, xl:8, xxl:8 },

        cover: doc => <img src={doc.imageUrl} />,
        title: doc => doc.title,
        description: (doc, { Typography }) => {
            const { Paragraph } = Typography;
            return <div>
                <div>{doc.position}<br />{doc.unternehmen}</div>
                <Paragraph style={{marginTop:16, paddingTop:16, borderTop:'1px solid #eee'}} ellipsis={{ rows: 3, expandable: true, symbol: 'mehr lesen' }} >
                    { doc.fachgebiete }
                </Paragraph>
            </div>
        }
    },
    
    actions: [
        DefaultReportActions.openDocument(['EVERYBODY'], Dozenten),
        DefaultReportActions.shareDocument(['EVERYBODY'], Dozenten, { type: 'secondary' }),
        DefaultReportActions.removeDocument(['ADMIN'], Dozenten, { type: 'more' })
    ]
});