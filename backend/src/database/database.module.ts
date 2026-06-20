import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCatalog } from '../catalog/entities/item-catalog.entity';
import { Category } from '../categories/entities/category.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Proforma } from '../proformas/entities/proforma.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Customer,
      Proforma,
      Category,
      ItemCatalog,
    ]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
