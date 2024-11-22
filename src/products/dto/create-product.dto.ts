import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator"


export class CreateProductDto {

    @IsString()
    @Min(1)
    @IsNotEmpty()
    title: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock: number

    @IsString({ each: true })
    @IsArray()
    sizes: string[]

    @IsIn(['men', 'woman', 'unisex', 'kids'])
    gender: string

}
