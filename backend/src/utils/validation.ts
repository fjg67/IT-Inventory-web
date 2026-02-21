// Schémas de validation Zod — validation des données entrantes
// Utilisés dans les contrôleurs pour valider les requêtes

import { z } from 'zod';

// --- Authentification ---

export const loginSchema = z.object({
  technicianId: z
    .string()
    .min(1, 'L\'identifiant est requis'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// --- Articles ---

export const articleSchema = z.object({
  reference: z
    .string()
    .min(1, 'La référence est obligatoire')
    .trim(),
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .trim(),
  description: z
    .string()
    .trim()
    .optional(),
  category: z
    .string()
    .min(1, 'La catégorie est obligatoire')
    .trim(),
  codeFamille: z
    .string()
    .trim()
    .optional(),
  articleType: z
    .string()
    .trim()
    .optional(),
  sousType: z
    .string()
    .trim()
    .optional(),
  emplacement: z
    .string()
    .trim()
    .optional(),
  brand: z
    .string()
    .trim()
    .optional(),
  model: z
    .string()
    .trim()
    .optional(),
  barcode: z
    .string()
    .trim()
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .optional(),
  unit: z
    .string()
    .trim()
    .optional(),
  minStock: z
    .number()
    .int('Le stock minimum doit être un entier')
    .min(0, 'Le stock minimum ne peut pas être négatif')
    .optional(),
  siteId: z
    .string()
    .optional(),
  initialStock: z
    .number()
    .int('Le stock initial doit être un entier')
    .min(0, 'Le stock initial ne peut pas être négatif')
    .optional(),
});

// --- Mouvements de stock ---

const baseMovementSchema = z.object({
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER'], {
    errorMap: () => ({ message: 'Le type doit être ENTRY, EXIT, ADJUSTMENT ou TRANSFER' }),
  }),
  articleId: z
    .string()
    .min(1, 'L\'identifiant article est obligatoire'),
  quantity: z
    .number()
    .int('La quantité doit être un entier')
    .positive('La quantité doit être supérieure à 0'),
  siteId: z
    .string()
    .optional(),
  fromSiteId: z
    .string()
    .optional(),
  toSiteId: z
    .string()
    .optional(),
  reason: z
    .string()
    .trim()
    .optional(),
});

// Validation conditionnelle : les transferts nécessitent fromSiteId et toSiteId
export const movementSchema = baseMovementSchema.superRefine((data, ctx) => {
  if (data.type === 'TRANSFER') {
    if (!data.fromSiteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le site d\'origine (fromSiteId) est obligatoire pour un transfert',
        path: ['fromSiteId'],
      });
    }
    if (!data.toSiteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le site de destination (toSiteId) est obligatoire pour un transfert',
        path: ['toSiteId'],
      });
    }
    if (data.fromSiteId && data.toSiteId && data.fromSiteId === data.toSiteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le site d\'origine et le site de destination doivent être différents',
        path: ['toSiteId'],
      });
    }
  } else {
    // Pour les mouvements non-transfert, siteId est requis
    if (!data.siteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le site (siteId) est obligatoire pour ce type de mouvement',
        path: ['siteId'],
      });
    }
  }
});

// --- Sites ---

export const siteSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du site est obligatoire')
    .trim(),
  address: z
    .string()
    .trim()
    .optional(),
});

// --- Utilisateurs ---

export const userSchema = z.object({
  technicianId: z
    .string()
    .min(1, 'L\'identifiant est requis'),
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .trim(),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z
    .enum(['ADMIN', 'TECHNICIAN'], {
      errorMap: () => ({ message: 'Le rôle doit être ADMIN ou TECHNICIAN' }),
    })
    .optional(),
});

// --- Pagination et recherche ---

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  search: z
    .string()
    .trim()
    .optional(),
  sortBy: z
    .string()
    .trim()
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'L\'ordre de tri doit être asc ou desc' }),
    })
    .optional(),
});

// --- Types inférés depuis les schémas ---

export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type MovementInput = z.infer<typeof movementSchema>;
export type SiteInput = z.infer<typeof siteSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
