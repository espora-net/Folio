import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Añade un parámetro de cache busting a una URL para evitar caché del navegador.
 * Usa un timestamp que se actualiza cada minuto para balancear entre
 * evitar caché y permitir algo de reutilización durante navegación.
 */
export function noCacheUrl(url: string): string {
  // Generar un timestamp que cambia cada minuto
  const cacheBuster = Math.floor(Date.now() / 60000);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${cacheBuster}`;
}

/**
 * Fetch con cache busting incorporado.
 * Ideal para archivos JSON que cambian con cada despliegue.
 */
export async function fetchNoCache(url: string, options?: RequestInit): Promise<Response> {
  return fetch(noCacheUrl(url), {
    ...options,
    cache: 'no-store',
  });
}
