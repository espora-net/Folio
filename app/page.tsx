'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Calendar } from "lucide-react";
import { CreditCard } from "lucide-react";
import { FileText } from "lucide-react";
import { Sparkles } from "lucide-react";
import AppLogo from "@/components/AppLogo";

const modules = [
  {
    title: "Estudiar hoy",
    description: "Revisa las tarjetas y preguntas programadas para hoy",
    href: "/estudiar-hoy",
    icon: Calendar,
    accent: "from-sky-400/25 via-sky-500/10 to-transparent",
  },
  {
    title: "Temario",
    description: "Explora y estudia los temas de la oposición",
    href: "/temario",
    icon: BookOpen,
    accent: "from-emerald-400/25 via-emerald-500/10 to-transparent",
  },
  {
    title: "Tarjetas",
    description: "Practica con flashcards de memorización",
    href: "/tarjetas",
    icon: CreditCard,
    accent: "from-purple-400/25 via-purple-500/10 to-transparent",
  },
  {
    title: "Test",
    description: "Pon a prueba tus conocimientos con preguntas tipo test",
    href: "/test",
    icon: FileText,
    accent: "from-orange-400/25 via-orange-500/10 to-transparent",
  },
];

export default function Home() {
  return (
    <div className="relative max-w-6xl mx-auto space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute right-0 top-28 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-[0_25px_80px_rgba(59,130,246,0.25)]">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <AppLogo className="shadow-2xl ring-1 ring-white/10" size="w-16 h-16" />
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                <Sparkles className="h-4 w-4" /> Estilo iOS
              </p>
              <h1 className="text-4xl font-bold text-white">Bienvenido a Folio</h1>
              <p className="mt-3 text-lg text-zinc-200">
                Un espacio de estudio moderno para la oposición de Técnico Auxiliar de Bibliotecas (C1).
                Organiza tus rutas de repaso con una estética inspirada en iOS.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/estudiar-hoy"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/25"
                >
                  Estudiar hoy
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/temario"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white/90 hover:border-white/70"
                >
                  Ver temario
                </Link>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
            {[
              {
                title: "Progreso activo",
                value: "Plan diario",
                detail: "Repaso espaciado automático",
              },
              {
                title: "Material curado",
                value: "+200 tarjetas",
                detail: "Temas, tests y casos",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-wide text-white/60">{item.title}</p>
                <p className="text-lg font-semibold">{item.value}</p>
                <p className="text-xs text-white/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.accent}`} />
              <div className="relative flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 shadow-inner">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{module.title}</h2>
                  <p className="mt-2 text-sm text-white/80">{module.description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                    Continuar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Sobre Folio</h3>
            <p className="mt-2 text-sm text-white/80">
              Una interfaz limpia, con tipografía nítida y tarjetas suaves inspiradas en iOS para que tu estudio
              se sienta tan agradable como efectivo. Mantén tus test, temario y flashcards siempre a mano.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/10 px-3 py-1">Repaso espaciado</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Seguimiento de progreso</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Diseño centrado en foco</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Modo claro/oscuro</p>
              <p className="text-base font-semibold">Conmutador rápido</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Experiencia móvil</p>
              <p className="text-base font-semibold">Listo para iOS</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
