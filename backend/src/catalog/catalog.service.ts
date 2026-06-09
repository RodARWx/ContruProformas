import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { ItemCatalog } from './entities/item-catalog.entity';

/** Límite máximo de resultados para autocompletado rápido (< 2 s) */
const MAX_SEARCH_RESULTS = 50;
const DEFAULT_SEARCH_LIMIT = 20;

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ItemCatalog)
    private readonly itemCatalogRepository: Repository<ItemCatalog>,
  ) {}

  async findAll(): Promise<ItemCatalog[]> {
    return this.itemCatalogRepository.find({
      order: { descripcion: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ItemCatalog> {
    const item = await this.itemCatalogRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Rubro del catálogo con id ${id} no encontrado`);
    }

    return item;
  }

  async create(dto: CreateCatalogItemDto): Promise<ItemCatalog> {
    const item = this.itemCatalogRepository.create({
      codigoSugerido: dto.codigoSugerido ?? null,
      descripcion: dto.descripcion.trim(),
      unidad: dto.unidad,
      costoUnitario: dto.costoUnitario,
    });

    return this.itemCatalogRepository.save(item);
  }

  async update(id: number, dto: UpdateCatalogItemDto): Promise<ItemCatalog> {
    const item = await this.findOne(id);

    if (dto.codigoSugerido !== undefined) {
      item.codigoSugerido = dto.codigoSugerido;
    }
    if (dto.descripcion !== undefined) {
      item.descripcion = dto.descripcion.trim();
    }
    if (dto.unidad !== undefined) item.unidad = dto.unidad;
    if (dto.costoUnitario !== undefined) item.costoUnitario = dto.costoUnitario;

    return this.itemCatalogRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.itemCatalogRepository.delete(id);
  }

  /**
   * Búsqueda inteligente por coincidencia parcial (LIKE) sobre descripción
   * y código sugerido, optimizada para autocompletado en la PWA.
   */
  async searchByText(term: string, limit = DEFAULT_SEARCH_LIMIT): Promise<ItemCatalog[]> {
    const normalizedTerm = term.trim();

    if (!normalizedTerm) {
      return [];
    }

    const safeLimit = Math.min(Math.max(limit, 1), MAX_SEARCH_RESULTS);
    const likePattern = `%${normalizedTerm}%`;

    return this.itemCatalogRepository
      .createQueryBuilder('item')
      .where('item.descripcion LIKE :term', { term: likePattern })
      .orWhere('item.codigoSugerido LIKE :term', { term: likePattern })
      .orderBy('item.descripcion', 'ASC')
      .take(safeLimit)
      .getMany();
  }
}
