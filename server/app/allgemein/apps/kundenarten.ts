import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export const Kundenarten: TOptionValues = [
    { _id: 'kunde', title:'Kunde', pluralTitle: 'Kunden', ...Colors.blue, icon: 'fa fa-building' }, 
    { _id: 'interessent', title:'Interessent',  pluralTitle: 'Interessenten', ...Colors.red, icon: 'fa fa-building' },
    { _id: 'partner', title:'Partner', pluralTitle: 'Partner', ...Colors.green, icon: 'fa fa-handshake' },
    { _id: 'hotel', title: 'Hotel', pluralTitle: 'Hotels', ...Colors.orange, icon: 'fa fa-bed' },
    { _id: 'sonstiges', title:'Sonstiges', pluralTitle: 'Sonstige', ...Colors.grey, icon: 'fa fa-questionmark' }, 
];