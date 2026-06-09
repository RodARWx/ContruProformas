import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCatalogItemDto {
  @IsOptional()
  @IsString()
  codigoSugerido?: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del rubro es obligatoria' })
  descripcion: string;

  @IsString()
  @IsNotEmpty({ message: 'La unidad es obligatoria' })
  unidad: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El costo unitario debe ser un número válido' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario: number;
}
