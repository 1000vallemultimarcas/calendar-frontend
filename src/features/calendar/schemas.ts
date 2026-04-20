import { z } from "zod/v4";

export const eventSchema = z.object({
	title: z.string().min(1, "Escreva um titulo para o agendamento"),
	description: z.string().min(1, "Escreva uma descrição para o agendamento"),
	startDate: z.date("Escreva a data de início do agendamento"),
	endDate: z.date("Escreva a data de término do agendamento"),
	status: z.enum([
		"scheduled",
		"confirmed",
		"cancelled",
		"attended",
		"rescheduled",
		"not_attended",
	]),
	type: z.enum([
		"meeting",
		"follow_up",
		"delivery",
		"personal",
		"visit",
		"test_drive",
	]),
	priority: z.enum(["low", "normal", "high", "urgent"]),
	userId: z.string().optional(),
	customerId: z.string().optional(),
	customerPhone: z.string().optional(),
	color: z.enum(["blue", "green", "red", "yellow", "purple", "orange"]),
});

export type TEventFormData = z.infer<typeof eventSchema>;
