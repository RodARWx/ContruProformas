import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Proforma } from '../../proformas/entities/proforma.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombreCliente: string;

  @Column({ type: 'text', unique: true })
  rucCedula: string;

  @Column({ type: 'text', nullable: true })
  direccion: string | null;

  @Column({ type: 'text', nullable: true })
  telefono: string | null;

  @Column({ type: 'text', nullable: true })
  correo: string | null;

  @OneToMany(() => Proforma, (proforma) => proforma.customer)
  proformas: Proforma[];
}
