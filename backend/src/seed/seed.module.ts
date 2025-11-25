import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UserModule } from 'src/user/user.module';
import { JwtService } from 'src/auth/jwt.services';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService, JwtService],
  imports: [UserModule, AuthModule],
})
export class SeedModule {}
