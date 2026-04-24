import { z } from "zod/v4";

export const eventSchema = z.object({
	title: z.string().min(1, "Escreva um titulo para o agendamento"),
	description: z.string().min(1, "Escreva uma descrição para o agendamento"),
	startDate: z.date("Escreva a data de início do agendamento"),
	endDate: z.date("Escreva a data de término do agendamento"),
	status: z.enum([
		"not_contacted",
		"in_negotiation",
		"not_read",
		"scheduled",
		"finished_sold",
		"finished_not_sold",
	]),
	type: z.enum([
		"meeting",
		"follow_up",
		"delivery",
		"personal",
		"visit",
		"test_drive",
	]),
	priority: z.enum(["frio", "morno", "quente"]),
	userId: z.string().optional(),
	managerId: z.string().optional(),
	customerId: z.string().optional(),
	customerPhone: z.string().optional(),
	color: z.enum(["blue", "green", "red", "yellow", "purple", "orange"]),
});

export type TEventFormData = z.infer<typeof eventSchema>;
