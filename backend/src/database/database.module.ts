import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Customer])],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
