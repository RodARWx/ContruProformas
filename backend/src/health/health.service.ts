import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { ItemCatalog } from '../catalog/entities/item-catalog.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Proforma } from '../proformas/entities/proforma.entity';

export type HealthReport = {
  status: 'ok' | 'degraded';
  service: string;
  database: {
    connected: boolean;
    path: string;
    fileExists: boolean;
    inMemory: boolean;
    synchronize: boolean;
    counts: {
      profiles: number;
      customers: number;
      categories: number;
      catalogItems: number;
      proformas: number;
    };
    error?: string;
  };
  seed: {
    profilesOnStartup: boolean;
    customerOnStartup: boolean;
    catalogFromExcel: string;
  };
};

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ItemCatalog)
    private readonly itemCatalogRepository: Repository<ItemCatalog>,
    @InjectRepository(Proforma)
    private readonly proformaRepository: Repository<Proforma>,
  ) {}

  async getReport(): Promise<HealthReport> {
    const databasePath =
      process.env.DATABASE_PATH ?? 'data/construproformas.db';
    const inMemory = databasePath === ':memory:';
    const synchronize = process.env.DB_SYNCHRONIZE !== 'false';

    try {
      const [profiles, customers, categories, catalogItems, proformas] =
        await Promise.all([
          this.profileRepository.count(),
          this.customerRepository.count(),
          this.categoryRepository.count(),
          this.itemCatalogRepository.count(),
          this.proformaRepository.count(),
        ]);

      return {
        status: 'ok',
        service: 'construproformas-api',
        database: {
          connected: true,
          path: databasePath,
          fileExists: inMemory ? true : existsSync(databasePath),
          inMemory,
          synchronize,
          counts: {
            profiles,
            customers,
            categories,
            catalogItems,
            proformas,
          },
        },
        seed: {
          profilesOnStartup: true,
          customerOnStartup: true,
          catalogFromExcel:
            'Manual: npm run seed:catalog (productos.xlsx no se lee al arrancar)',
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido de SQLite';

      return {
        status: 'degraded',
        service: 'construproformas-api',
        database: {
          connected: false,
          path: databasePath,
          fileExists: inMemory ? false : existsSync(databasePath),
          inMemory,
          synchronize,
          counts: {
            profiles: 0,
            customers: 0,
            categories: 0,
            catalogItems: 0,
            proformas: 0,
          },
          error: message,
        },
        seed: {
          profilesOnStartup: true,
          customerOnStartup: true,
          catalogFromExcel:
            'Manual: npm run seed:catalog (productos.xlsx no se lee al arrancar)',
        },
      };
    }
  }
}
