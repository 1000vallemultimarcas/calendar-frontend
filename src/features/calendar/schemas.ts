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
		"initial_contact",
		"proposal_sent",
		"test_drive",
		"waiting_response",
		"closing",
		"completed",
	]),
	priority: z.enum(["cold", "warm", "hot"]),
	userId: z.string().optional(),
	managerId: z.string().optional(),
	customerId: z.string().optional(),
	customerPhone: z.string().optional(),
	color: z.enum(["blue", "green", "red", "yellow", "purple", "orange"]),
});

export type TEventFormData = z.infer<typeof eventSchema>;
