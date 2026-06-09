import { z } from 'zod'

export const projectDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required').max(255),
  shortDescription: z.string().min(1, 'shortDescription is required').max(255),
  demo: z.url('Invalid demo Url'),
  github: z.url('Invalid Github Url'),
  features: z.string().min(1, 'features is required'),
  hostingPlatforms: z.string().min(1, 'Hosting platform  is required').max(255),
  languageId: z.coerce.number().int().positive(),
  toolsId: z.coerce.number().int().positive(),
})
