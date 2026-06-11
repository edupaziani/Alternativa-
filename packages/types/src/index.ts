import { z } from 'zod';

export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  cpf: z.string().length(11),
});

export type Patient = z.infer<typeof PatientSchema>;
