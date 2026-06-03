import { z } from 'zod';

import { PRICE_ROLES } from '@/types/product';

export const haitechClientSchema = z.object({
  storeCustomerId: z.string().nullable().optional(),
  haisupportClientId: z.string().nullable().optional(),
  nombre: z.string().min(2, 'Indique la razón social.'),
  nombreContacto: z.string().min(2, 'Indique el contacto.'),
  rucDni: z
    .string()
    .min(8, 'El RUC/DNI debe tener al menos 8 caracteres.')
    .max(11, 'El RUC/DNI no puede superar 11 caracteres.'),
  telefono: z.string().min(9, 'Introduce un teléfono válido.'),
  direccion: z.string().min(3, 'Indique la dirección.'),
  ciudad: z.string().min(2, 'Indique la ciudad.'),
  tipoCliente: z.enum(PRICE_ROLES),
  email: z.string().email('Correo inválido.').optional().or(z.literal('')),
  notas: z.string().optional(),
});

export type HaitechClientFormValues = z.infer<typeof haitechClientSchema>;

export const EMPTY_HAITECH_CLIENT: HaitechClientFormValues = {
  storeCustomerId: null,
  haisupportClientId: null,
  nombre: '',
  nombreContacto: '',
  rucDni: '',
  telefono: '',
  direccion: '',
  ciudad: 'Lima',
  tipoCliente: 'public',
  email: '',
  notas: '',
};
