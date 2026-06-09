import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateProformaDto } from './create-proforma.dto';

/**
 * DTO para la sincronización masiva desde la PWA en modo offline.
 * Recibe un arreglo de proformas pendientes de subir al servidor.
 */
export class SyncProformasDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos una proforma para sincronizar' })
  @ValidateNested({ each: true })
  @Type(() => CreateProformaDto)
  proformas: CreateProformaDto[];
}
