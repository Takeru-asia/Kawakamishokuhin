import { z } from "zod";

export const createTemperatureRecordSchema = z.object({
  facilityId: z.string().uuid("設備を選択してください"),
  temperature: z.coerce.number({ message: "温度を入力してください" }),
  notes: z.string().optional(),
});

export const updateAlertSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["ACKNOWLEDGED", "RESOLVED"]),
  correctiveAction: z.string().optional(),
});

export type CreateTemperatureRecordInput = z.infer<typeof createTemperatureRecordSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
