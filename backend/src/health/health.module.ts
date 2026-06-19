import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { ItemCatalog } from '../catalog/entities/item-catalog.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Proforma } from '../proformas/entities/proforma.entity';
import { HealthService } from './health.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Customer,
      Category,
      ItemCatalog,
      Proforma,
    ]),
  ],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
