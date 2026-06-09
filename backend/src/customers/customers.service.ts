import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proforma } from '../proformas/entities/proforma.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Proforma)
    private readonly proformaRepository: Repository<Proforma>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ order: { nombreCliente: 'ASC' } });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    await this.assertRucCedulaAvailable(dto.rucCedula);

    const customer = this.customerRepository.create({
      nombreCliente: dto.nombreCliente,
      rucCedula: dto.rucCedula,
      direccion: dto.direccion ?? null,
      telefono: dto.telefono ?? null,
      correo: dto.correo ?? null,
    });

    return this.customerRepository.save(customer);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (dto.rucCedula !== undefined && dto.rucCedula !== customer.rucCedula) {
      await this.assertRucCedulaAvailable(dto.rucCedula, id);
      customer.rucCedula = dto.rucCedula;
    }

    if (dto.nombreCliente !== undefined) customer.nombreCliente = dto.nombreCliente;
    if (dto.direccion !== undefined) customer.direccion = dto.direccion;
    if (dto.telefono !== undefined) customer.telefono = dto.telefono;
    if (dto.correo !== undefined) customer.correo = dto.correo;

    return this.customerRepository.save(customer);
  }

  /**
   * Elimina un cliente solo si no está referenciado por proformas existentes.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const proformasCount = await this.proformaRepository.count({
      where: { customerId: id },
    });

    if (proformasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el cliente ${id}: está asociado a ${proformasCount} proforma(s)`,
      );
    }

    await this.customerRepository.delete(id);
  }

  private async assertRucCedulaAvailable(
    rucCedula: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.customerRepository.findOne({
      where: { rucCedula },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `El RUC/Cédula "${rucCedula}" ya está registrado`,
      );
    }
  }
}
