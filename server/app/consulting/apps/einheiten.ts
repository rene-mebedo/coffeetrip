import { Colors } from '/imports/api/colors'
import { TOptionValues } from '/imports/api/types/app-types';

export const Einheiten: TOptionValues = [
    { _id: 'min', title:'Minute', pluralTitle: 'Minuten', ...Colors.orange },
    { _id: 'std', title:'Stunde', pluralTitle: 'Stunden', ...Colors.blue }, 
    { _id: 'tage', title:'Tag', pluralTitle: 'Tage',  ...Colors.red },
];