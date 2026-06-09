import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Proforma } from './entities/proforma.entity';
import { ProformaDetail } from './entities/proforma-detail.entity';
import { ProformasController } from './proformas.controller';
import { ProformasService } from './proformas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proforma, ProformaDetail, Profile, Customer]),
  ],
  controllers: [ProformasController],
  providers: [ProformasService],
  exports: [ProformasService],
})
export class ProformasModule {}
