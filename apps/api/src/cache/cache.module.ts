import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // Make CacheService available everywhere without importing the module
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
