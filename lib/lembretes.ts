// Utilitários para cálculo de lembretes inteligentes

// TODO - FUNCIONALIDADES FUTURAS COM IA:
// 1. Integração com API de IA (OpenAI/Anthropic) para análise do manual do carro
// 2. Machine Learning para prever padrões de uso baseado no histórico
// 3. Análise preditiva de falhas com base em dados de manutenções
// 4. Recomendações personalizadas por modelo de carro e condições de uso

export interface Lembrete {
  id?: number;
  tipo: string;
  descricao: string;
  proximo_alerta: string;
  baseado_em: 'tempo' | 'km' | 'dias' | 'combinado';
  intervalo_meses?: number;
  intervalo_km?: number;
  intervalo_dias?: number;
  ativo: boolean;
}

/**
 * Calcula a próxima data de manutenção baseada em tempo
 * @param ultimaData Data da última manutenção (formato DD/MM/AAAA)
 * @param meses Intervalo em meses
 */
export function calcularProximaDataPorTempo(ultimaData: string, meses: number): string {
  try {
    const [dia, mes, ano] = ultimaData.split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setMonth(data.getMonth() + meses);
    
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
}

/**
 * Calcula falta de km até próxima manutenção
 * @param kmAtual KM atual do veículo
 * @param kmUltima KM da última manutenção
 * @param intervaloKm Intervalo em KM
 */
export function calcularProximaManutencaoPorKm(
  kmAtual: number,
  kmUltima: number,
  intervaloKm: number
): { proximoKm: number; faltam: number } {
  const proximoKm = kmUltima + intervaloKm;
  const faltam = proximoKm - kmAtual;
  
  return { proximoKm, faltam };
}

/**
 * Verifica qual critério (tempo ou km) está mais próximo
 */
export function verificarCriterioMaisProximo(
  dataAtual: Date,
  proximaData: Date,
  faltamKm: number,
  kmPorDia: number = 50 // Média estimada
): 'tempo' | 'km' {
  const diasAteData = Math.floor((proximaData.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24));
  const diasAteKm = Math.floor(faltamKm / kmPorDia);
  
  return diasAteKm < diasAteData ? 'km' : 'tempo';
}

/**
 * Formata mensagem de alerta humanizada
 */
export function formatarMensagemAlerta(
  tipo: 'tempo' | 'km' | 'dias',
  valor: number
): string {
  switch (tipo) {
    case 'tempo':
      if (valor <= 0) return 'Atrasado!';
      if (valor <= 7) return `Em ${valor} ${valor === 1 ? 'dia' : 'dias'}`;
      if (valor <= 30) return `Em ${Math.ceil(valor / 7)} ${Math.ceil(valor / 7) === 1 ? 'semana' : 'semanas'}`;
      return `Em ${Math.ceil(valor / 30)} ${Math.ceil(valor / 30) === 1 ? 'mês' : 'meses'}`;
      
    case 'km':
      if (valor <= 0) return 'Passou do KM!';
      if (valor < 100) return `Faltam ${valor} km`;
      return `Faltam ${(valor / 1000).toFixed(1)}mil km`;
      
    case 'dias':
      if (valor <= 0) return 'Atrasado!';
      if (valor === 1) return 'Amanhã';
      if (valor <= 7) return `Em ${valor} dias`;
      return `Em ${Math.ceil(valor / 7)} semanas`;
      
    default:
      return 'Verificar';
  }
}

/**
 * Regras de manutenção padrão (baseadas em boas práticas da indústria)
 * TODO: Substituir por IA que lê o manual específico do carro
 */
export const regrasPadraoManutencao = {
  'Troca de Óleo': {
    intervalo_meses: 6,
    intervalo_km: 10000,
    descricao: 'Essencial para a saúde do motor',
    prioridade: 'alta'
  },
  'Revisão': {
    intervalo_meses: 12,
    intervalo_km: 15000,
    descricao: 'Manutenção preventiva completa',
    prioridade: 'alta'
  },
  'Troca de Filtro de Ar': {
    intervalo_meses: 12,
    intervalo_km: 15000,
    descricao: 'Melhora desempenho e consumo',
    prioridade: 'média'
  },
  'Alinhamento': {
    intervalo_meses: 6,
    intervalo_km: 10000,
    descricao: 'Evita desgaste irregular dos pneus',
    prioridade: 'média'
  },
  'Balanceamento': {
    intervalo_meses: 6,
    intervalo_km: 10000,
    descricao: 'Reduz vibrações e melhora dirigibilidade',
    prioridade: 'média'
  },
  'Calibragem de Pneus': {
    intervalo_dias: 15,
    descricao: 'Previne desgaste e melhora economia',
    prioridade: 'média'
  },
  'Freios': {
    intervalo_meses: 12,
    intervalo_km: 20000,
    descricao: 'Segurança em primeiro lugar',
    prioridade: 'alta'
  },
  'Bateria': {
    intervalo_meses: 24,
    descricao: 'Verificação e troca se necessário',
    prioridade: 'média'
  },
};

/**
 * Gera recomendações inteligentes baseadas no histórico
 * TODO: Implementar com Machine Learning
 */
export function gerarRecomendacoesInteligentes(
  manutencoes: any[]
): string[] {
  const recomendacoes: string[] = [];
  
  // Análise simples - será substituída por IA
  if (manutencoes.length < 3) {
    recomendacoes.push('Crie um histórico mais completo para receber recomendações personalizadas');
  }
  
  // Verifica padrões de tempo entre manutenções
  const trocasOleo = manutencoes.filter(m => 
    m.tipo.toLowerCase().includes('óleo')
  );
  
  if (trocasOleo.length >= 2) {
    // Calcular média de tempo entre trocas
    recomendacoes.push('Você tem um bom histórico de troca de óleo. Continue assim!');
  }
  
  // TODO: Implementar análise com IA:
  // - Prever próximos serviços com base em padrões
  // - Detectar anomalias no histórico
  // - Sugerir otimizações de custos
  // - Alertar sobre serviços esquecidos
  
  return recomendacoes;
}

/**
 * Calcula score de saúde do veículo (0-100)
 * TODO: Usar IA para análise mais precisa
 */
export function calcularScoreSaude(manutencoes: any[]): number {
  if (manutencoes.length === 0) return 50;
  
  // Análise básica
  let score = 100;
  
  // Penaliza se última manutenção foi há muito tempo
  const ultimaManutencao = manutencoes[0];
  const diasDesdeUltima = calcularDiasDesde(ultimaManutencao.data);
  
  if (diasDesdeUltima > 180) score -= 20;
  else if (diasDesdeUltima > 365) score -= 40;
  
  return Math.max(0, Math.min(100, score));
}

function calcularDiasDesde(data: string): number {
  try {
    const [dia, mes, ano] = data.split('/').map(Number);
    const dataManutencao = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    
    return Math.floor((hoje.getTime() - dataManutencao.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
