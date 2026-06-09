import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proforma } from '../proformas/entities/proforma.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Proforma)
    private readonly proformaRepository: Repository<Proforma>,
  ) {}

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Perfil con id ${id} no encontrado`);
    }

    return profile;
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create({
      nombre: dto.nombre,
      cargo: dto.cargo,
      registroSenescyt: dto.registroSenescyt ?? null,
      telefono: dto.telefono ?? null,
      correo: dto.correo ?? null,
    });

    return this.profileRepository.save(profile);
  }

  async update(id: number, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOne(id);

    if (dto.nombre !== undefined) profile.nombre = dto.nombre;
    if (dto.cargo !== undefined) profile.cargo = dto.cargo;
    if (dto.registroSenescyt !== undefined) {
      profile.registroSenescyt = dto.registroSenescyt;
    }
    if (dto.telefono !== undefined) profile.telefono = dto.telefono;
    if (dto.correo !== undefined) profile.correo = dto.correo;

    return this.profileRepository.save(profile);
  }

  /**
   * Elimina un perfil solo si no está referenciado por proformas existentes,
   * preservando la integridad referencial del módulo de proformas.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const proformasCount = await this.proformaRepository.count({
      where: { profileId: id },
    });

    if (proformasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el perfil ${id}: está asociado a ${proformasCount} proforma(s)`,
      );
    }

    await this.profileRepository.delete(id);
  }
}
