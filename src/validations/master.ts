import { z } from "zod";

export const createProductSchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  unit: z.string().min(1, "単位を入力してください"),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid(),
});

export const createMaterialSchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  unit: z.string().min(1, "単位を入力してください"),
  supplier: z.string().optional(),
});

export const updateMaterialSchema = createMaterialSchema.extend({
  id: z.string().uuid(),
});

export const createFacilitySchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  type: z.enum(["REFRIGERATOR", "FREEZER", "HEATER", "OTHER"]),
  tempLowerLimit: z.string().optional(),
  tempUpperLimit: z.string().optional(),
  location: z.string().optional(),
});

export const updateFacilitySchema = createFacilitySchema.extend({
  id: z.string().uuid(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  role: z.enum(["ADMIN", "MANAGER", "WORKER"]),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "WORKER"]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
