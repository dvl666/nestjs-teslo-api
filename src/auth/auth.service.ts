import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  
  ) {}

  async create(createUserDto: CreateUserDto) {

    const user = this.userRepository.create( createUserDto );
    
    try {
      
      return await this.userRepository.save(user)

    } catch (error) {

      this.handleException(error);

    }

  }

  private handleException(error: any): never {

    if ( error.code === '23505' ) throw new BadRequestException( error.detail );
    console.log(error);

    throw new BadRequestException('Error en el servidor');
    
  }

}
