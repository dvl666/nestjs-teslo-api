import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {

  // Create a logger instance -> This will be used to log the messages
  private readonly logger = new Logger('ProductsService');

  constructor(
    
    // Inject the product repository for database operations
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

  ) {}

  async create(createProductDto: CreateProductDto) {
    
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );
    
      return product;
    } catch (error) { 
      this.handleDuplicateError(error) 
    };

  }

  findAll(paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit, // take de toma
      skip: offset // skip de salto
    });

  }

  //FindOneBy != FindOne
  async findOne(term: string) {

    let product: Product;

    // Validar si el término es un UUID
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
      return product
    }

    // Usar QueryBuilder para buscar por slug o título
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    product = await queryBuilder
    .select('product')
    .where('LOWER(product.title) = :slug OR LOWER(product.slug) = :title ', {
      slug: term.toLowerCase(), 
      title: term.toLowerCase() 
    }).getOne();
    
    if (!product) throw new NotFoundException(`Product with ${term} not found`);
    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({ // preload() es una función de TypeORM que carga los datos de la base de datos en la entidad
      id: id,
      ...updateProductDto
    })

    if ( !product ) throw new NotFoundException(`Product with id ${id} not found`);
    
    try {
      this.productRepository.save( product ); // save() es una función de TypeORM que guarda los datos en la base de datos
      return product;
    } catch ( error ) {
      this.handleDuplicateError(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if ( !product ) throw new NotFoundException(`Product with id ${id} not found`);
    await this.productRepository.remove( product );
    return `Product with id ${id} removed`;
  }

  private handleDuplicateError(error: any) {

    if ( error.code === '23505' ) throw new BadRequestException(`error: ${error.detail}`);
    this.logger.error(error);
    throw new InternalServerErrorException('Error, please check the logs');

  }

}
