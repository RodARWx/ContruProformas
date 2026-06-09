import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Proforma } from '../../proformas/entities/proforma.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  cargo: string;

  @Column({ type: 'text', nullable: true })
  registroSenescyt: string | null;

  @Column({ type: 'text', nullable: true })
  telefono: string | null;

  @Column({ type: 'text', nullable: true })
  correo: string | null;

  @OneToMany(() => Proforma, (proforma) => proforma.profile)
  proformas: Proforma[];
}
