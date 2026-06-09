import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateCatalogItemDto {
  @IsOptional()
  @IsString()
  codigoSugerido?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  descripcion?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La unidad no puede estar vacía' })
  unidad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo unitario debe ser un número válido' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario?: number;
}
