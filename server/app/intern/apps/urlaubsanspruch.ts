import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { Intern } from "/server/app/intern";
import { DefaultAppData, IGenericApp, TAppLink } from "/imports/api/types/app-types";

import { Urlaubskonto } from "./urlaubskonto";
import { StatusUrlaubsanspruch } from "./status-urlaubsanspruch";
import { getAppStore } from "/imports/api/lib/core";
//import { defaults } from "chart.js";

export interface Urlaubsanspruch extends IGenericApp {
    urlaubskonto: TAppLink
    anzahlTage: number
    bemerkung: number
    status: string
    irgendwas: string
    //genehmigungDurch: TAppLink
}


export const Urlaubsanspruch = Intern.createApp<Urlaubsanspruch>({
    _id: 'urlaubsanspruch',
    
    title: "Urlaubsanspruch",
    description: "Urlaubsanspruch aus z.B. 'Frei-für'", 
    icon: 'fa-fw fas fa-plane-departure',
    position: 2,
    
    namesAndMessages: {
        singular: { mitArtikel: 'der Urlaubsanspruch', ohneArtikel: 'Urlaubsanspruch' },
        plural: { mitArtikel: 'die Urlaubsansprüche', ohneArtikel: 'Urlaubsansprüche' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['ADMIN'],

    fields: {
        title: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie den Titel ein.' },    
            ],
            ...FieldNamesAndMessages('der', 'Titel', 'die', 'Titel', { onUpdate: 'den Titel' }),
            ...defaultSecurityLevel
        },

        description: {
            type: EnumFieldTypes.ftString, 
            rules: [
                { required: true, message: 'Bitte geben Sie eine kurze Beschreibung ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Beschreibung', 'die', 'Beschreibung'),
            ...defaultSecurityLevel
        },

        urlaubskonto: {
            type: EnumFieldTypes.ftAppLink,
            appLink: {
                app: Urlaubskonto,
                hasDescription: true,
                hasImage: false,
                linkable: true
            },
            rules: [
                { required: true, message: 'Bitte geben Sie das entsprechende Urlaubskonto an.' },    
            ],
            ...FieldNamesAndMessages('das', 'Urlaubskonto', 'die', 'Urlaubskonten'),
            ...defaultSecurityLevel
        },

        anzahlTage: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Urlaubsanspruch in Tagen ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Anzahl der Tage', 'die', 'Anzahl der Tage'),
            ...defaultSecurityLevel
        },

        bemerkung: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Grund des Urlaubsanspruch an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Bemerkung', 'die', 'Bemerkung'),
            ...defaultSecurityLevel
        },

        status: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Status an.' },    
            ],
            ...FieldNamesAndMessages('die', 'Status', 'die', 'Stati', { onUpdate: 'den Status' }),
            ...defaultSecurityLevel
        },

        irgendwas:{
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie Irgendwas ein.' },    
            ],
            ...FieldNamesAndMessages('die', 'Irgendwas', 'die', 'Irgendwas', { onUpdate: 'Irgendwas' }),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EMPLOYEE'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'urlaubskonto', title: 'Urlaubskonto', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'anzahlTage', controlType: EnumControltypes.ctNumberInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: StatusUrlaubsanspruch },
                { field: 'bemerkung', title: 'Grund für den Anspruch', controlType: EnumControltypes.ctTextInput },
                
                { controlType: EnumControltypes.ctDivider, title: 'Irgendeine Trennlinie' },
                { field: 'irgendwas', controlType: EnumControltypes.ctStringInput }
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Urlaubsanspruch',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/intern/urlaubsanspruch/new' }
        },
    },

    methods: {
        defaults: ({ queryParams }) => {
            let defaults: DefaultAppData<Urlaubsanspruch> = {
                status: 'beantragt'
            };
            
            if (queryParams && queryParams.urlaubskonto) {
                const Urlaubskonten = getAppStore('urlaubskonto');

                const konto = Urlaubskonten.findOne({ _id: queryParams.urlaubskonto }, { fields: {_id:1, title:1, description:1}});
                if (konto) {
                    defaults.urlaubskonto = [konto];
                }
            }
            
            return defaults;
        },

        onAfterInsert:(urlaubsanspruch) => {
            const Konto = getAppStore('urlaubskonto');

            if (urlaubsanspruch.status == 'genehmigt') {
                Konto.update({ _id: urlaubsanspruch.urlaubskonto[0]._id }, {
                    $inc: { zusatzAnspruch: urlaubsanspruch.anzahlTage, _rev:1 }
                });
            }

            return { status: EnumMethodResult.STATUS_OKAY }
        },

        onAfterUpdate: (urlaubsanspruch, urlaubsanspruchAlt) => {
            const Konto = getAppStore('urlaubskonto');
            
            if (urlaubsanspruchAlt.status == 'genehmigt') {
                Konto.update({ _id: urlaubsanspruchAlt.urlaubskonto[0]._id }, {
                    $inc: { zusatzAnspruch: (urlaubsanspruchAlt.anzahlTage * (-1)), _rev:1 }
                });
            }

            if (urlaubsanspruch.status == 'genehmigt') {
                Konto.update({ _id: urlaubsanspruch.urlaubskonto[0]._id }, {
                    $inc: { zusatzAnspruch: urlaubsanspruch.anzahlTage, _rev:1 }
                });
            }
            
            return { status: EnumMethodResult.STATUS_OKAY }
        }
    },

    dashboardPicker: () => {
        /*if (this.user.roles.has('external')) return 'extern';
        if (this.user.roles.has('gf')) return ['default', 'extern'];*/

        return 'default';
    },
    dashboards: {
        default: { 
            rows: [
                
            ]
        },
    },
});