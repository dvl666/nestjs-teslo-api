import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });

        /**
         * Invistigar funcionamiento de super() y configService
         */

    }

    async validate(payload: JwtPayload) {
        const { email } = payload;

        const user = await this.userRepository.findOneBy({ email });

        if ( !user ) throw new UnauthorizedException('Token inválido');

        if ( !user.isActive ) throw new UnauthorizedException('Usuario inactivo');

        return user;
    }

}