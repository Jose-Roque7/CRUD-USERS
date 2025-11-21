import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import * as dotenv from 'dotenv';
dotenv.config();


@Module({
  imports: [ UserModule, MongooseModule.forRoot(String(process.env.MONGODB)), CommonModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
