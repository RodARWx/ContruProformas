import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca un endpoint como público, exento de validación de X-API-KEY */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
