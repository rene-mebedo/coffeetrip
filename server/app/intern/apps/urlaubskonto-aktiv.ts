import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export const UrlaubskontoAktiv: TOptionValues = [
    { _id: 'ja', title:'Ja', ...Colors.green, icon: 'fa fa-check' }, 
    { _id: 'nein', title:'Nein',  ...Colors.orange, icon: 'fa fa-times' },
    { _id: 'gesperrt', title:'Gesperrt', ...Colors.red, icon: 'fa fa-ban' },
];