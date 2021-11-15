import { z } from 'zod';
import { Precinct } from './election';
import { IdSchema } from './generic';

export enum PrecinctSelectionKind {
  SinglePrecinct = 'SinglePrecinct',
  AllPrecincts = 'AllPrecincts',
}

export const PrecinctSelectionKindSchema = z.nativeEnum(PrecinctSelectionKind);

export type PrecinctSelection =
  | { kind: PrecinctSelectionKind.AllPrecincts }
  | { kind: PrecinctSelectionKind.SinglePrecinct; precinctId: Precinct['id'] };

export const PrecinctSelectionSchema: z.ZodSchema<PrecinctSelection> = z.union([
  z.object({ kind: z.literal(PrecinctSelectionKind.AllPrecincts) }),
  z.object({
    kind: z.literal(PrecinctSelectionKind.SinglePrecinct),
    precinctId: IdSchema,
  }),
]);