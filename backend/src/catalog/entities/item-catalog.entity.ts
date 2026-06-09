import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

/** Rubro del catálogo de ítems reutilizables en proformas */
@Entity('item_catalog')
export class ItemCatalog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  codigoSugerido: string | null;

  @Index('idx_item_catalog_descripcion')
  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text' })
  unidad: string;

  @Column({ type: 'real', default: 0 })
  costoUnitario: number;
}
