import { World } from '../../imports/api/lib/world'

// in diesem Project müssen nachfolgende packages installiert sein
// meteor add aldeed:collection2
// meteor npm install simpl-schema
export const MebedoWorld = new World();

MebedoWorld.createWorld({
    title: 'MEBEDOWorld',
    description: 'Hallo Welt!',
    logoUrl: 'a', 
});