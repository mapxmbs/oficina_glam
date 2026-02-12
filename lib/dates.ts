/**
 * Helpers de data – ISO (YYYY-MM-DD) para banco, formatação BR para UI
 * Nenhuma lógica deve usar string parsing manual. Todas as datas são DATE/ISO.
 */

/** Formata Date para ISO (YYYY-MM-DD) – enviar ao banco */
export function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Converte DD/MM/AAAA em Date (para input do usuário) */
export function parseBR(s: string | null | undefined): Date | null {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, day, month, year] = m;
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return isNaN(d.getTime()) ? null : d;
}

/** Converte string ISO em Date */
export function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso || typeof iso !== 'string') return null;
  const parsed = new Date(iso);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Formata para exibição em BR (DD/MM/AAAA). Aceita string ISO ou DD/MM/AAAA. */
export function formatBR(d: Date | string | null | undefined): string {
  let date: Date | null = typeof d === 'string' ? parseISODate(d) ?? parseBR(d) : (d ?? null);
  if (!date) return d && typeof d === 'string' ? d : '---';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Início da semana (domingo) em ISO */
export function weekStart(d: Date = new Date()): string {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return toISODate(copy);
}

/** Fim da semana (sábado) em ISO */
export function weekEnd(d: Date = new Date()): string {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (6 - day));
  copy.setHours(23, 59, 59, 999);
  return toISODate(copy);
}

/** Primeiro dia do mês em ISO */
export function monthStart(d: Date = new Date()): string {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return toISODate(copy);
}

/** Último dia do mês em ISO */
export function monthEnd(d: Date = new Date()): string {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + 1, 0);
  return toISODate(copy);
}

/** Primeiro dia do ano em ISO */
export function yearStart(d: Date = new Date()): string {
  const copy = new Date(d);
  copy.setMonth(0, 1);
  copy.setHours(0, 0, 0, 0);
  return toISODate(copy);
}

/** Último dia do ano em ISO */
export function yearEnd(d: Date = new Date()): string {
  const copy = new Date(d);
  copy.setMonth(11, 31);
  return toISODate(copy);
}

/** Converte string (ISO ou DD/MM/AAAA) para ISO para comparação */
export function toISOForCompare(s: string | null | undefined): string | null {
  if (!s || typeof s !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = parseBR(s);
  return d ? toISODate(d) : null;
}

/** Compara data (ISO ou DD/MM/AAAA) com range (>= start e <= end) */
export function isDateInRange(dataStr: string | null | undefined, startISO: string, endISO: string): boolean {
  const iso = toISOForCompare(dataStr);
  if (!iso) return false;
  return iso >= startISO && iso <= endISO;
}

/** Dias até uma data (positivo = futuro, negativo = passado) */
export function daysUntil(iso: string | null | undefined): number | null {
  const d = parseISODate(iso);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
