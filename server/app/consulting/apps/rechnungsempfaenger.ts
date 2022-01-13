import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export const Rechnungsempfaenger: TOptionValues = [
    { _id: 'kunde', title:'Kundenanschrift gemäß Stammdaten', ...Colors.green },
    { _id: 'abweichend', title:'abweichende Rechnungsanschrift für dieses Projekt', ...Colors.blue }, 
    { _id: 'distributor', title:'Distributor',  ...Colors.orange },
];