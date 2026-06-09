import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío' })
  nombreCliente?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El RUC/Cédula no puede estar vacío' })
  rucCedula?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo debe ser válido' })
  correo?: string;
}
