'use client';

import Link from "next/link";
import { Calendar, BookOpen, CreditCard, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bienvenido a Folio</h1>
        <p className="text-zinc-400 text-lg">
          Tu aplicación de estudio para la oposición de Técnico Auxiliar de Bibliotecas (C1)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          href="/estudiar-hoy"
          className="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Estudiar hoy</h2>
          </div>
          <p className="text-zinc-400">
            Revisa las tarjetas y preguntas programadas para hoy
          </p>
        </Link>

        <Link 
          href="/temario"
          className="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20">
              <BookOpen className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Temario</h2>
          </div>
          <p className="text-zinc-400">
            Explora y estudia los temas de la oposición
          </p>
        </Link>

        <Link 
          href="/tarjetas"
          className="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Tarjetas</h2>
          </div>
          <p className="text-zinc-400">
            Practica con flashcards de memorización
          </p>
        </Link>

        <Link 
          href="/test"
          className="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20">
              <FileText className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold">Test</h2>
          </div>
          <p className="text-zinc-400">
            Pon a prueba tus conocimientos con preguntas tipo test
          </p>
        </Link>
      </div>

      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <h3 className="text-lg font-semibold mb-2">Sobre Folio</h3>
        <p className="text-zinc-400 mb-4">
          Folio es una aplicación diseñada específicamente para ayudarte a preparar 
          la oposición de Técnico Auxiliar de Bibliotecas (C1). Organiza tu estudio 
          con temas, flashcards y tests, todo en un solo lugar.
        </p>
        <div className="flex gap-4 text-sm text-zinc-500">
          <div>
            <span className="font-semibold text-zinc-300">✓</span> Repaso espaciado
          </div>
          <div>
            <span className="font-semibold text-zinc-300">✓</span> Seguimiento de progreso
          </div>
          <div>
            <span className="font-semibold text-zinc-300">✓</span> Tests personalizados
          </div>
        </div>
      </div>
    </div>
  );
}
