import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';

/**
 * Siembra datos mínimos de prueba al iniciar la aplicación.
 * Garantiza que existan Profile y Customer con id = 1,
 * requeridos por la validación referencial del módulo de proformas.
 */
@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedProfile();
    await this.seedCustomer();
  }

  private async seedProfile(): Promise<void> {
    const exists = await this.profileRepository.exists({ where: { id: 1 } });
    if (exists) {
      return;
    }

    await this.profileRepository.save({
      id: 1,
      nombre: 'Ing. Carlos Métrica',
      cargo: 'Ingeniero Civil',
      registroSenescyt: 'SENESCYT-0001',
      telefono: '0991234567',
      correo: 'ingeniero@construmetrica.com',
    });

    this.logger.log('Perfil de prueba insertado (id: 1)');
  }

  private async seedCustomer(): Promise<void> {
    const exists = await this.customerRepository.exists({ where: { id: 1 } });
    if (exists) {
      return;
    }

    await this.customerRepository.save({
      id: 1,
      nombreCliente: 'Constructora Andina S.A.',
      rucCedula: '1790123456001',
      direccion: 'Av. Amazonas N12-34, Quito',
      telefono: '022345678',
      correo: 'contacto@constructoraandina.com',
    });

    this.logger.log('Cliente de prueba insertado (id: 1)');
  }
}
