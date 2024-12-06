import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  
  constructor(
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
    
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['email', 'password']
    });

    if ( !user ) throw new UnauthorizedException('Credenciales incorrectas');

    // Comparar contraseñas
    if( !bcrypt.compareSync( password, user.password ) ) throw new UnauthorizedException('Credenciales incorrectas');
    delete user.password; // No devolver la contraseña
   
    return user;
  }
  
  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create( 
        { 
          ...userData, 
          password: bcrypt.hashSync( password, 10 ) 
        }
      );
      await this.userRepository.save(user);
      delete user.password; // No devolver la contraseña

      return user
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
