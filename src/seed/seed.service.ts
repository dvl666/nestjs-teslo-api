import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data-seed';

@Injectable()
export class SeedService {

    constructor(
        private readonly productsService: ProductsService
    ) { }

    async seed() {
        await this.seedProducts();
        return 'SEED EXECUTED';
    }
    
    async seedProducts() {
        await this.productsService.deleteAllProducts();

        const products = initialData.products;

        const insertPromises = [];

        products.forEach( (product) => {
            insertPromises.push(  this.productsService.create( product ) );
        });

        const result = await Promise.all(insertPromises);

        return result
    }

}
