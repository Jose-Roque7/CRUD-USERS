import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [ UserModule, MongooseModule.forRoot('mongodb://localhost:27017/nest-practica'), CommonModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
