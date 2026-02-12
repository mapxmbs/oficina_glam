/**
 * Oficina Glam – Design estrutural
 * 3 níveis: background | beterraba | branco. Sem excessos.
 * Responsivo: usa tokens de spacing em todas as telas.
 */

import { Platform, Dimensions } from 'react-native';
import { colors } from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const isNarrowScreen = SCREEN_WIDTH < 360;

// ═══════════════════════════════════════════════════════════════════════════
// RADIUS – escala única global (padronizar bordas)
// ═══════════════════════════════════════════════════════════════════════════
export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SOMBRAS – escala refinada, opacidade 0.04–0.06, offset pequeno
// ═══════════════════════════════════════════════════════════════════════════
export const shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  md: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  lg: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cta: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TELA
// ═══════════════════════════════════════════════════════════════════════════
export const screenNeutral = {
  flex: 1,
  backgroundColor: colors.background,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CARDS – branco, sombra elegante e sutil
// ═══════════════════════════════════════════════════════════════════════════
export const cardShadow = shadow.md;

/** Card de conteúdo – branco, bordas suaves, padding generoso */
export const cardContent = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: 24,
  ...cardShadow,
} as const;

export const cardBase = cardContent;

/** Bloco beterraba – headers, alertas */
export const blockAccent = {
  backgroundColor: colors.accent,
  borderRadius: radius.lg,
  padding: isNarrowScreen ? 20 : 24,
  ...shadow.sm,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CHIPS / FILTROS – fundo branco, borda fina
// ═══════════════════════════════════════════════════════════════════════════
export const chipBase = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.08)',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: radius.md,
} as const;

/** Chip ativo – beterraba em destaque, leve sombra interna */
export const chipActive = {
  backgroundColor: colors.accent,
  borderWidth: 0,
  borderTopWidth: 1,
  borderTopColor: 'rgba(0,0,0,0.12)',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: radius.md,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HEADERS DE SEÇÃO – beterraba sólido
// ═══════════════════════════════════════════════════════════════════════════
export const headerAccent = {
  backgroundColor: colors.accent,
  paddingVertical: 20,
  paddingHorizontal: 24,
  borderRadius: 0,
} as const;

export const sectionHeaderAccent = headerAccent;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING – responsivo, vertical refinado
// ═══════════════════════════════════════════════════════════════════════════
export const spacing = {
  screenPadding: isNarrowScreen ? 20 : 24,
  screenPaddingTop: Platform.OS === 'ios' ? 20 : 16,
  screenPaddingBottom: 24,
  /** Espaço para tab bar flutuante (altura + safe area + margem) */
  tabBarBottom: 100,
  /** Entre blocos principais (cards, seções) */
  blockGap: isNarrowScreen ? 18 : 22,
  /** Entre header e conteúdo */
  sectionGap: isNarrowScreen ? 18 : 22,
  /** Espaço compacto entre itens (ex: linhas de lista) */
  itemGap: 12,
  headerPaddingVertical: 18,
  minTouchTarget: Platform.OS === 'ios' ? 44 : 48,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HEADER MINIMAL – títulos sobre fundo claro (accent só em botões/chips)
// ═══════════════════════════════════════════════════════════════════════════
/** Header minimalista – título + subtítulo sobre background */
export const headerMinimal = {
  paddingTop: spacing.screenPaddingTop,
  marginBottom: spacing.blockGap,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ALIASES
// ═══════════════════════════════════════════════════════════════════════════
export const sectionPlaneTint = { backgroundColor: colors.background, paddingVertical: 20, paddingHorizontal: 24 } as const;
export const blockSoft = cardContent;
export const cardFlat = cardContent;
export const cardPrincipal = blockAccent;
export const headerIconWrap = { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' as const, justifyContent: 'center' as const };
export const divider = { height: 1, backgroundColor: colors.divider };
export const inputBase = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12 };
/** CTA primário – beterraba protagonista */
export const ctaPrimary = {
  backgroundColor: colors.accent,
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: radius.md,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  ...shadow.cta,
};
export const stateActive = { backgroundColor: colors.accent };
/** CTA sólido suave – ação secundária, menos contraste que primary */
export const ctaPrimaryMuted = {
  backgroundColor: colors.accentMutedSolid,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: radius.md,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  ...shadow.sm,
};
export const buttonSecondary = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.md, alignItems: 'center' as const, justifyContent: 'center' as const };
export const buttonOnAccent = { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center' as const, justifyContent: 'center' as const };
/** Botão outline beterraba */
export const buttonSecondaryAccent = {
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: colors.accent,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: radius.md,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
export const buttonDanger = { backgroundColor: colors.danger, paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.md, alignItems: 'center' as const, justifyContent: 'center' as const };
export const buttonGhost = { backgroundColor: 'transparent', paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.md, alignItems: 'center' as const, justifyContent: 'center' as const };
