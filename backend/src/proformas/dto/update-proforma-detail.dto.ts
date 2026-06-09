import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/** DTO de validación para una línea de rubro al editar una proforma existente */
export class UpdateProformaDetailDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del rubro es obligatoria' })
  descripcion: string;

  @IsOptional()
  @IsString()
  tiempo?: string;

  @IsString()
  @IsNotEmpty({ message: 'La unidad del rubro es obligatoria' })
  unidad: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'El costo unitario debe ser un número válido' })
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costoUnitario: number;
}
