import { World } from "./world";
import { App } from "./app";
import { IApp } from '/imports/api/types/app-types';
import { IProduct } from '/imports/api/types/world';
import { ProductSchema } from './schemas';

export class Product {
    private world: World;
    public productId: string;

    constructor(world: World, productDef:IProduct){
        this.world = world;

        const Products = world.productCollection;
        const p = {...productDef, apps:[] };

        try {
            ProductSchema.validate(p);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        this.productId = Products.insert(p);
    }

    public createApp<T>(appDef: IApp<T>): App<T> {
        const app = new App(this.world, this, appDef);
        //const Products = this.world.productCollection;

        /*Products.update(this.productId, {
            $push: {
                apps: { _id: app.appId, title: appDef.title, icon: appDef.icon, position: appDef.position || 1 } 
            }
        })*/

        return app;
    }
}
