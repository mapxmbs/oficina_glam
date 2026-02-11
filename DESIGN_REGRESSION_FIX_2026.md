# Correção de Regressão de Design – Janeiro 2026

Design system restaurado para a versão elegante e minimalista acordada.

## Arquivos alterados

| Arquivo | Alterações |
|---------|------------|
| `components/FloatingChatButton.tsx` | Novo – bolha de chat com Leninha, mensagem "Em que posso ajudar?", abre /ia-module |
| `components/SearchModal.tsx` | Novo – modal de pesquisa global (unidades, IA, meu carro, serviços, documentos, etc.) |
| `src/theme/colors.ts` | Paleta nova com accent, accentSoft, iconPrimary, iconOnAccent, iconNeutral, iconMuted; remoção da paleta rosa antiga; aliases legado para compatibilidade |
| `src/theme/design-patterns.ts` | Mantido (já usava accent) |
| `src/theme/icon-colors.ts` | Mantido (já usava tokens) |
| `app/(tabs)/_layout.tsx` | Tab bar clara/translúcida, FloatingChatButton (substitui FloatingIAButton) |
| `app/_layout.tsx` | Logo na entrada, tela de carregamento com logo |
| `app/(tabs)/index.tsx` | Central de IAs (Leninha + Verificador), ícone Search no header, SearchModal |
| `app/(tabs)/maintenance.tsx` | Correção de sintaxe `}{showFilters`, tokens rosa→semânticos, MapPin iconPrimary |
| `app/(tabs)/fuel.tsx` | Tokens rosa→semânticos, ícones iconPrimary/iconOnAccent |
| `app/(tabs)/vehicle.tsx` | Tokens rosa→semânticos, ícones com contraste |
| `app/(tabs)/workshops.tsx` | Tokens rosa→semânticos |
| `app/profile.tsx` | background neutro, tokens, ícones |
| `app/notifications.tsx` | Tokens, Switch trackColor/thumbColor |
| `app/ia-module.tsx` | Tokens border |
| `app/verificador-laudos.tsx` | Tokens |
| `app/view-document.tsx` | Tokens |
| `app/maintenance-new.tsx` | iconOnAccent em botões |
| `components/searchable-dropdown.tsx` | Tokens |
| `components/image-crop-modal.tsx` | accentSoft |
| `tailwind.config.js` | glam.primary → #B91C5C, glam.light → accentSoft |
| `app.json` | Splash: logo.png, backgroundColor #F8F7F9 |

## Regras aplicadas

- **Base neutra:** #F8F7F9, #FFFFFF
- **Rosa só como accent:** #B91C5C
- **Tab bar:** fundo claro translúcido, borda discreta
- **Ícones:** fundo claro → iconPrimary; fundo accent → iconOnAccent
- **Cards:** sombra OU borda, nunca os dois
- **Tokens:** iconPrimary, iconOnAccent, iconNeutral, iconMuted
