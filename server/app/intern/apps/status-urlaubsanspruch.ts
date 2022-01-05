import { Colors } from '/imports/api/colors';
import { TOptionValues } from '/imports/api/types/app-types';

export const StatusUrlaubsanspruch: TOptionValues = [
    { _id: 'beantragt', title:'Beantragt', ...Colors.blue, icon: 'fa fa-question' }, 
    { _id: 'genehmigt', title:'Genehmigt',  ...Colors.green, icon: 'fa fa-check' },
    { _id: 'abgelehnt', title:'Abgelehnt', ...Colors.red, icon: 'fa fa-times' },
];