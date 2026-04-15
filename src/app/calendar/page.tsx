import { Suspense } from "react";
import { Calendar } from "@/features/calendar/calendar";
import { CalendarSkeleton } from "@/features/calendar/skeletons/calendar-skeleton";

export default function CalendarPage() {
	return (
		<main className="my-10 flex max-h-screen flex-col">
			<div className="container p-4 md:mx-auto">
				<div className="flex items-center justify-between">
					<div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<img
							src="/images/turboflow.png"
							alt="TurboFlow"
							className="h-full w-full object-contain opacity-85"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-transparent"></div>
						<div className="absolute inset-x-0 top-0 p-6 md:p-8">
							<div className="inline-flex items-center rounded-full border border-orange-300/40 bg-orange-500 px-3 py-1 text-xs font-bold tracking-wide text-white">
								PLANEJAMENTO COMERCIAL
							</div>
							<p className="mt-3 max-w-2xl text-xl font-extrabold leading-tight text-white md:text-3xl">
								Organize e planeje suas vendas com nosso calendario
							</p>
							<p className="mt-2 max-w-xl text-sm text-slate-100 md:text-base">
								Controle sua operacao com mais previsibilidade, foco e
								produtividade.
							</p>
						</div>
					</div>
				</div>
				<Suspense fallback={<CalendarSkeleton />}>
					<Calendar />
				</Suspense>
			</div>
		</main>
	);
}
