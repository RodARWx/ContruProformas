import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { ProformaDetail } from './proforma-detail.entity';
import { ProformaStatus } from '../enums/proforma-status.enum';

/** Cabecera de la proforma con totales calculados en el backend */
@Entity('proformas')
export class Proforma {
  @PrimaryColumn({ type: 'text' })
  idProforma: string;

  @Column({ type: 'text' })
  nombreProyecto: string;

  @Column({ type: 'text', nullable: true })
  tiempoEjecucion: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @Column({ type: 'real', default: 0 })
  subtotal: number;

  @Column({ type: 'real', default: 0 })
  iva: number;

  @Column({ type: 'real', default: 0 })
  totalGeneral: number;

  @Column({ type: 'boolean', default: true })
  appliesIva: boolean;

  @Column({
    type: 'text',
    enum: ProformaStatus,
    default: ProformaStatus.DRAFT,
  })
  status: ProformaStatus;

  @ManyToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column()
  profileId: number;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: number;

  @OneToMany(() => ProformaDetail, (detail) => detail.proforma, {
    cascade: true,
  })
  detalles: ProformaDetail[];
}
