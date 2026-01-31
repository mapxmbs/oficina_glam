/**
 * Detecta problemas recorrentes (não rotinas) no histórico de manutenção.
 * Rotina: ex. 1 alinhamento a cada 6 meses. Problema: ex. 2 alinhamentos em 3 meses.
 */

export type RecurringProblem = {
  tipo: string;
  count: number;
  withinMonths: number;
  events: { id: number; data: string; valor?: number; km?: number }[];
  /** Por que é considerado problema (ex.: "2x em 3 meses") */
  reason: string;
  /** Sugestões da IA sobre o que pode estar acontecendo */
  suggestions: string[];
};

function parseData(d: string): Date | null {
  if (!d || typeof d !== 'string') return null;
  const parts = d.trim().split(/[/-]/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  const dt = new Date(year, month, day);
  return isNaN(dt.getTime()) ? null : dt;
}

/** Intervalos “normais” mínimos (em meses) por tipo. Abaixo disso = possível problema. */
const MIN_INTERVAL_MONTHS: Record<string, number> = {
  'Alinhamento': 4,
  'Balanceamento': 4,
  'Freios': 6,
  'Troca de Óleo': 3,
  'Revisão': 4,
  'Pneus': 8,
  'Bateria': 18,
};

const DEFAULT_MIN_INTERVAL = 3;

function minIntervalMonths(tipo: string): number {
  return MIN_INTERVAL_MONTHS[tipo] ?? DEFAULT_MIN_INTERVAL;
}

/** Sugestões por tipo quando identificado como problema recorrente */
function getSuggestionsForTipo(tipo: string, count: number, withinMonths: number): string[] {
  const list: string[] = [];
  switch (tipo) {
    case 'Alinhamento':
      list.push(
        'Alinhamentos muito próximos costumam indicar desgaste ou direção incorreta.',
        'Vale checar: geometria da direção, bandejas, terminais e hábitos ao dirigir (bordas, buracos).',
        'Se o volante puxar ou o carro “correr” para um lado, peça uma revisão completa da direção.'
      );
      break;
    case 'Balanceamento':
      list.push(
        'Balanceamento repetido em pouco tempo pode indicar pneus desgastados ou cubos com folga.',
        'Confira cubos, rolamentos e estado dos pneus. Vibração no volante ou no assoalho é um sinal.'
      );
      break;
    case 'Freios':
      list.push(
        'Várias trocas de freios em curto período podem indicar problema no sistema ou uso muito intenso.',
        'Vale revisar: discos, cilindros, pastilhas e fluido. Evite “andar no freio” e sobrecarga.'
      );
      break;
    case 'Troca de Óleo':
      list.push(
        'Troca de óleo muito frequente pode sugerir vazamento ou consumo anormal.',
        'Confira vazamentos, nível do óleo e se o carro não está queimando óleo (fumaça azulada).'
      );
      break;
    case 'Revisão':
    case 'Pneus':
    case 'Bateria':
    default:
      list.push(
        `Serviços de "${tipo}" repetidos em pouco tempo merecem uma checagem.`,
        'Considere uma avaliação em oficina para identificar a causa.'
      );
  }
  return list;
}

/** Sugestões para “O que dá mais problema” (por tipo, baseado em frequência/gasto) */
export function getSuggestionsForMostProblems(
  tipo: string,
  count: number,
  valor: number
): string[] {
  const list: string[] = [];
  switch (tipo) {
    case 'Alinhamento':
      list.push(
        'Alinhamentos frequentes podem indicar direção desregulada, desgaste de componentes ou direção incorreta.',
        'Vale checar: geometria, bandejas, terminais e hábitos ao dirigir (bordas, buracos).'
      );
      break;
    case 'Balanceamento':
      list.push(
        'Balanceamento repetido costuma estar ligado a pneus desgastados ou cubos/rolamentos com folga.',
        'Confira cubos, rolamentos e estado dos pneus. Vibração no volante ou no assoalho é um sinal.'
      );
      break;
    case 'Freios':
      list.push(
        'Várias idas ao freio em pouco tempo podem indicar problema no sistema ou uso muito intenso.',
        'Revisar discos, cilindros, pastilhas e fluido. Evite “andar no freio” e sobrecarga.'
      );
      break;
    case 'Troca de Óleo':
      list.push(
        'Troca de óleo muito frequente pode sugerir vazamento ou consumo anormal.',
        'Confira vazamentos, nível do óleo e se o carro não está queimando óleo (fumaça azulada).'
      );
      break;
    case 'Revisão':
      list.push(
        'Muitas revisões em curto período podem indicar falhas recorrentes ou checklist incompleto.',
        'Vale fazer uma avaliação em oficina de confiança para identificar a causa.'
      );
      break;
    case 'Pneus':
      list.push(
        'Desgaste rápido de pneus pode vir de alinhamento/balanceamento, geometria ou pressão incorreta.',
        'Mantenha calibragem e rodízio em dia e evite sobrecarga ou rodar “careca”.'
      );
      break;
    case 'Bateria':
      list.push(
        'Baterias trocadas com frequência podem indicar problema no alternador ou no sistema elétrico.',
        'Vale checar alternador, correia e instalações que gerem fuga de corrente.'
      );
      break;
    default:
      list.push(
        `Serviços de "${tipo}" aparecem bastante no seu histórico.`,
        'Considere uma avaliação em oficina para identificar a causa e evitar retrabalho.'
      );
  }
  return list;
}

/**
 * Agrupa itens por tipo, ordena por data (mais recente primeiro).
 * Considera problema recorrente quando há 2+ ocorrências do mesmo tipo
 * dentro de uma janela (ex.: 3–6 meses), conforme o serviço.
 */
export function findRecurringProblems(
  list: { id: number; tipo: string; data?: string; valor?: number; km?: number }[]
): RecurringProblem[] {
  const byTipo: Record<string, { id: number; data: string; valor?: number; km?: number }[]> = {};

  for (const item of list) {
    const tipo = (item.tipo || 'Outros').trim();
    const data = (item.data || '').trim();
    if (!data) continue;
    if (!byTipo[tipo]) byTipo[tipo] = [];
    byTipo[tipo].push({
      id: item.id,
      data,
      valor: item.valor,
      km: item.km,
    });
  }

  const result: RecurringProblem[] = [];

  for (const [tipo, events] of Object.entries(byTipo)) {
    if (events.length < 2) continue;

    const withDate = events
      .map((e) => ({ ...e, parsed: parseData(e.data) }))
      .filter((e): e is typeof e & { parsed: Date } => e.parsed != null)
      .sort((a, b) => b.parsed.getTime() - a.parsed.getTime());

    if (withDate.length < 2) continue;

    const winMonths = Math.max(minIntervalMonths(tipo), 3);
    const anchor = withDate[0].parsed;
    const windowStart = new Date(anchor);
    windowStart.setMonth(windowStart.getMonth() - winMonths);

    const group = withDate.filter(
      (e) => e.parsed.getTime() >= windowStart.getTime() && e.parsed.getTime() <= anchor.getTime()
    );

    if (group.length < 2) continue;

    const oldest = group[group.length - 1].parsed;
    const withinMonths = Math.ceil(
      (anchor.getTime() - oldest.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
    );

    result.push({
      tipo,
      count: group.length,
      withinMonths,
      events: group.map((g) => ({
        id: g.id,
        data: g.data,
        valor: g.valor,
        km: g.km,
      })),
      reason:
        group.length === 2
          ? `2 vezes em ${withinMonths} ${withinMonths === 1 ? 'mês' : 'meses'}`
          : `${group.length} vezes em ${withinMonths} meses`,
      suggestions: getSuggestionsForTipo(tipo, group.length, withinMonths),
    });
  }

  return result.sort((a, b) => b.count - a.count);
}
