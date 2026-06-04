import { z } from 'zod'
import { BadUserInputError } from '../../error'

export const validateOrThrow = async <T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
): Promise<T> => {
  const parsed = await schema.safeParseAsync(payload)

  if (!parsed.success) {
    throw new BadUserInputError(parsed.error.flatten())
  }

  return parsed.data
}
