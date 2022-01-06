import { FieldNamesAndMessages } from "/imports/api/lib/helpers";
import { defaultSecurityLevel } from "../../security";
import { EnumControltypes, EnumFieldTypes, EnumMethodResult } from "/imports/api/consts";

import { IAppLink, IAppMethodResult, IGenericApp, TAppLink } from "/imports/api/types/app-types";
import { Consulting } from "..";
import { StatusField } from "../../akademie/apps/seminare";
import { Adresse, Adressen } from "../../allgemein/apps/adressen";
import { Projektstati } from "./projektstati";
import { TeilprojekteByProjekt } from "../reports/teilprojekte-by-projekt";
import { Teilprojekte } from "./teilprojekte";

export interface Projekt extends IGenericApp {
    kunde: TAppLink
    projektname: string
    zeitraum: Array<Date>
    status: string
    dlGesamt: number
    dlVerbraucht: number
    dlRest: number
}


export const Projekte = Consulting.createApp<Projekt>({
    _id: 'projekte',
    
    title: "Projekte",
    description: "Alle Projekte der Consulting", 
    icon: 'fa-fw fas fa-atlas',
    position: 1,
    
    namesAndMessages: {
        singular: { mitArtikel: 'das Projekt', ohneArtikel: 'Projekt' },
        plural: { mitArtikel: 'die Projekte', ohneArtikel: 'Projekte' },

        // wenn vorhanden, dann wird die Message genutzt - ansonsten wird
        // die Msg generisch mit singular oder plural generiert
        messages: {

        }
    },
    
    sharedWith: [],
    sharedWithRoles: ['EMPLOYEE'],

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

        kunde: {
            type: EnumFieldTypes.ftAppLink,
            appLink: < IAppLink<Adresse> > {
                app: Adressen,
                hasDescription: true,                
                hasImage: false,
                linkable: false
            },
            rules: [
                { required: true, message: 'Bitte geben Sie den Kunden an.' },
            ],
            ...FieldNamesAndMessages('der', 'Kunde', 'die', 'Kunden'),
            ...defaultSecurityLevel
        },

        projektname: {
            type: EnumFieldTypes.ftString,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektnamen an.' },    
            ],
            ...FieldNamesAndMessages('der', 'Projektname', 'die', 'Projektnamen', { onUpdate: 'den Projektnamen' }),
            ...defaultSecurityLevel
        },

        zeitraum: {
            type: EnumFieldTypes.ftDatespan,
            rules: [
                { required: true, message: 'Bitte geben Sie den Durchführungszeitraum an.' },
            ],
            ...FieldNamesAndMessages('der', 'Zeitraum', 'die', 'Zeiträume', { onUpdate: 'den Zeitraum' } ),
            ...defaultSecurityLevel
        },

        status: StatusField,
        
        dlGesamt: {
            type: EnumFieldTypes.ftInteger,
            rules: [
                { required: true, message: 'Bitte geben Sie den Projektaufwand (Gesamt) an.' },
            ],
            ...FieldNamesAndMessages('der', 'Projektaufwand', 'die', 'Projektaufwände', { onUpdate: 'den Projektaufwand' } ),
            ...defaultSecurityLevel
        },
        
        dlVerbraucht: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'verbrauchte Projektaufwand', 'die', 'verbrauchten Projektaufwände', { onUpdate: 'den Projektaufwand (Verbrauch)' } ),
            ...defaultSecurityLevel
        },

        dlRest: {
            type: EnumFieldTypes.ftInteger,
            rules: [ ],
            ...FieldNamesAndMessages('der', 'verbleibende Projektaufwand', 'die', 'verbleibenden Projektaufwände', { onUpdate: 'den Projektaufwand (Rest)' } ),
            ...defaultSecurityLevel
        }
    },

    layouts: {
        default: {
            title: 'Standard-layout',
            description: 'dies ist ein universallayout für alle Operationen',

            visibleBy: ['EVERYBODY'],
            
            elements: [
                { field: 'title', controlType: EnumControltypes.ctStringInput },
                { field: 'description', title: 'Beschreibung', controlType: EnumControltypes.ctStringInput },
                { field: 'kunde', controlType: EnumControltypes.ctSingleModuleOption },
                { field: 'zeitraum', controlType: EnumControltypes.ctDatespanInput },
                { field: 'status', controlType: EnumControltypes.ctOptionInput, values: Projektstati },
                { controlType: EnumControltypes.ctReport, reportId: TeilprojekteByProjekt.reportId }
            ]
        },
    },

    actions: {
        neu: {
            isPrimaryAction: true,

            description: 'Neuzugang eines Projektes',
            icon: 'fas fa-plus',
            
            visibleBy: [ 'ADMIN', 'EMPLOYEE' ],
            executeBy: [ 'ADMIN', 'EMPLOYEE' ],

            onExecute: { redirect: '/consulting/projekte/new' }
        },
    },

    methods: {
        defaults: () => {
            return {}
        },

        onAfterUpdate: async (projektId, NEW, OLD, session): Promise<IAppMethodResult> => {    
            const statusChanged = NEW.status !== OLD.status;

            if (statusChanged) {
                // soll das Projekt abgesagt werden, so muss geprüft werden, ob es nicht schon
                // Einzelleistungen bestätigt oder abgerechnet wurden. In diesem Fall
                // kann das Gesamtprojekt nicht mehr abgesagt werden.
                const tps = await Teilprojekte.rawCollection().find({ 'projekt._id' : projektId }, { session }).toArray();

                let i:number, max:number=tps.length;
                for (i = 0; i < max; i++) {
                    const tp = tps[i];

                    const result = await Teilprojekte.updateOne(tp._id, {
                        status: NEW.status
                    }, { session });

                    if (result.status != EnumMethodResult.STATUS_OKAY) {
                        return result;
                    }
                }
            }

            return { status: EnumMethodResult.STATUS_OKAY };
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

        extern: {
            rows: [
                
            ]
        },
    },
});