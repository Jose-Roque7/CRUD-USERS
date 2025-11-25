import { Controller, Get, UseGuards} from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiKeyGuard } from 'src/guards/api-key/api-key.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Get()
  executedSeed() {
    return this.seedService.executedSeed();
  }
}
