import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "TurboFlow Agenda",
	description: "Pagina da agenda TurboFlow",
	authors: [
		{
			name: "Jeraidi Yassir",
			url: "https://jeraidi.tech",
		},
	],
	keywords: [
		"calendar",
		"big calendar",
		"turboflow agenda",
		"next.js",
		"tailwind css",
		"shadcn ui",
		"events",
		"react.js",
	],
};

export default function CalendarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
