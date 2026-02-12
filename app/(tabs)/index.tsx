import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, ChevronRight, Instagram, Search, Sparkles, TrendingUp, UserCircle, Wrench } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Dimensions, Image, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { SearchModal } from '../../components/SearchModal';
import { Button, Card, GlamText, Screen } from '../../components/ui';
import { colors } from '../../src/theme/colors';
import { cardContent, radius, shadow, spacing } from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';
import { formatBR, isDateInRange, monthEnd, monthStart, toISOForCompare } from '../../lib/dates';
import { getActiveVehicleId } from '../../lib/vehicle';

const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_DICA_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);
const CARD_DICA_MARGIN = 12;

/** 5 dicas da Oficina Glam – espírito glam, elegante */
const dicasGlam = [
  { id: 1, titulo: 'Carro sempre impecável', descricao: 'Organize o interior e mantenha a limpeza. Um carro arrumado reflete quem você é.' },
  { id: 2, titulo: 'Dirija com conforto', descricao: 'Ajuste banco e espelhos antes de sair. Conforto e segurança caminham juntos.' },
  { id: 3, titulo: 'Documentação em dia', descricao: 'CNH, CRLV e documentos sempre acessíveis. Dirigir tranquila é dirigir com estilo.' },
  { id: 4, titulo: 'Economia inteligente', descricao: 'Planeje seus trajetos e mantenha os abastecimentos em dia. Pequenos gestos fazem diferença.' },
  { id: 5, titulo: 'Cuide do seu espaço', descricao: 'Revise periodicamente o que o seu carro precisa. Cuidar bem é um gesto de amor.' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  const [lastMaintenance, setLastMaintenance] = useState<any>(null);
  const [nextRevisionDate, setNextRevisionDate] = useState<string>('---');

  const [fuelMetrics, setFuelMetrics] = useState<{ avgKmL: number; monthlySpend: number }>({ avgKmL: 0, monthlySpend: 0 });

  const [perfil, setPerfil] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: veiculoData, error: veiculoError } = await supabase.from('veiculo').select('*').limit(1).single();
      if (!veiculoError || veiculoError.code === 'PGRST116') setVehicle(veiculoData);

      const { data: perfilData, error: perfilErr } = await supabase.from('perfis').select('foto_url').order('created_at', { ascending: false }).limit(1).single();
      if (!perfilErr && perfilData) setPerfil(perfilData);

      const vehicleId = await getActiveVehicleId();

      let mQuery = supabase.from('manutencoes').select('*').order('data', { ascending: false }).limit(1);
      if (vehicleId) mQuery = mQuery.eq('vehicle_id', vehicleId);
      const { data: manutencaoData, error: manutencaoError } = await mQuery.single();
      if (!manutencaoError || manutencaoError.code === 'PGRST116') {
        setLastMaintenance(manutencaoData);
        if (manutencaoData?.data) setNextRevisionDate('Em 6 meses');
      } else setLastMaintenance(null);

      const { data: fuelData } = await supabase
        .from('abastecimentos')
        .select('*')
        .order('id', { ascending: false });
      if (fuelData && fuelData.length >= 2) {
        const now = new Date();
        const ms = monthStart(now);
        const me = monthEnd(now);
        const thisMonth = fuelData.filter((d: any) => isDateInRange(d.data, ms, me));
        const sorted = [...fuelData].sort((a: any, b: any) =>
          (toISOForCompare(b.data) ?? '').localeCompare(toISOForCompare(a.data) ?? '')
        );
          const totalKm = sorted[0].km - sorted[sorted.length - 1].km;
          const totalLitros = sorted.reduce((acc: number, c: any) => acc + (c.litros || 0), 0);
        const avgKmL = totalLitros > 0 ? totalKm / totalLitros : 0;
        const monthlySpend = thisMonth.reduce((acc: number, c: any) => acc + (c.valor_total || 0), 0);
        setFuelMetrics({ avgKmL: parseFloat(avgKmL.toFixed(1)), monthlySpend });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void loadDashboard(); }, [loadDashboard]));

  return (
    <Screen
      refreshing={loading}
      onRefresh={loadDashboard}
      contentContainerStyle={{ paddingBottom: spacing.screenPaddingBottom + spacing.tabBarBottom, paddingTop: 0 }}
    >
      {/* Header – avatar à esquerda, saudação em Inter, ícones à direita */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sectionGap, paddingTop: spacing.screenPaddingTop, gap: 8 }}>
        <Pressable onPress={() => router.push('/profile')} style={{ width: 40, height: 40, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {perfil?.foto_url ? (
            <Image source={{ uri: perfil.foto_url }} style={{ width: 40, height: 40 }} resizeMode="cover" />
          ) : (
            <UserCircle size={22} color={colors.accent} />
          )}
        </Pressable>
        <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[typography.bodyLg, { color: colors.text }]}>
            Olá, motorista do {vehicle?.apelido || vehicle?.modelo || 'Seu Carro'}
          </Text>
          <Text numberOfLines={1} style={[typography.screenSubtitle, { color: colors.textTertiary, marginTop: 4 }]}>Bem-vinda à Oficina Glam</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Pressable onPress={() => setSearchVisible(true)} style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceTint, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Search size={18} color={colors.iconInactive} />
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceTint, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Bell size={18} color={colors.iconInactive} />
            <View style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent }} />
          </Pressable>
        </View>
      </View>

      {/* Métricas reais – card branco */}
      {(fuelMetrics.avgKmL > 0 || fuelMetrics.monthlySpend > 0) && (
        <View style={[cardContent, { flexDirection: 'row', gap: spacing.blockGap, marginBottom: spacing.blockGap }]}>
          {fuelMetrics.avgKmL > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Média consumo</Text>
              <Text style={[typography.dataLg, { color: colors.accent }]}>{fuelMetrics.avgKmL} km/L</Text>
            </View>
          )}
          {fuelMetrics.monthlySpend > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Gasto do mês</Text>
              <Text style={[typography.dataLg, { color: colors.text }]}>{formatCurrency(fuelMetrics.monthlySpend)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Alerta – card branco com destaque accent */}
      <Card variant="base" onPress={() => router.push('/notifications')} style={{ marginBottom: spacing.blockGap, borderLeftWidth: 4, borderLeftColor: colors.accent }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color={colors.accent} />
            </View>
            <GlamText variant="label" color="textSecondary">Próximo alerta</GlamText>
          </View>
          <View style={{ backgroundColor: colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm }}>
            <GlamText variant="caption" color="accent" style={{ color: colors.accent }}>{lastMaintenance ? 'Ativo' : 'Configure'}</GlamText>
          </View>
        </View>
        {lastMaintenance ? (
          <>
            <GlamText variant="title" color="text" style={{ marginBottom: 6 }}>Revisão dos 10.000 km</GlamText>
            <GlamText variant="bodySmall" color="textSecondary" style={{ marginBottom: 2 }}>Baseado no serviço de {formatBR(lastMaintenance.data)}</GlamText>
            <GlamText variant="bodyXs" color="textTertiary" style={{ marginBottom: 14 }}>Faltam ~500 km ou {nextRevisionDate}</GlamText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="primary" label="Já fiz" onPress={() => router.push('/maintenance-new')} style={{ flex: 1 }} />
              <Button variant="secondaryAccent" label="Agendar" onPress={() => router.push('/(tabs)/workshops')} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <>
            <GlamText variant="body" color="textSecondary" style={{ marginBottom: 6 }}>Nenhum registro encontrado</GlamText>
            <GlamText variant="titleSm" color="text" style={{ marginBottom: 14 }}>Configure seus lembretes</GlamText>
            <Button variant="primary" label="Ver lembretes" onPress={() => router.push('/notifications')} />
          </>
        )}
      </Card>

      {/* Assistente inteligente */}
      <Pressable
        onPress={() => router.push('/ia-module')}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.blockGap, borderWidth: 1, borderColor: colors.border, ...shadow.sm, transform: [{ scale: pressed ? 0.99 : 1 }] })}
      >
        <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Sparkles size={22} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <GlamText variant="titleSm" color="text">Sua assistente inteligente</GlamText>
          <GlamText variant="caption" color="textTertiary">Chat, laudos e mais para cuidar do seu carro</GlamText>
        </View>
        <ChevronRight size={20} color={colors.textTertiary} />
      </Pressable>

      {/* Dicas da Glam – carrossel */}
      <View style={{ marginBottom: spacing.blockGap }}>
        <GlamText variant="label" color="textTertiary" style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dicas da Glam</GlamText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: spacing.screenPadding }}
          decelerationRate="fast"
          snapToInterval={CARD_DICA_WIDTH + CARD_DICA_MARGIN}
          snapToAlignment="start"
        >
          {dicasGlam.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => ({
                width: CARD_DICA_WIDTH,
                marginRight: CARD_DICA_MARGIN,
                padding: 24,
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                ...shadow.md,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <GlamText variant="titleSm" color="text" style={{ marginBottom: 8 }}>{item.titulo}</GlamText>
              <GlamText variant="bodySmall" color="textSecondary" numberOfLines={3}>{item.descricao}</GlamText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <GlamText variant="caption" color="accent" style={{ color: colors.accent }}>Ler mais</GlamText>
                <ChevronRight size={14} color={colors.accent} style={{ marginLeft: 2 }} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Redes */}
      <View style={[cardContent, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }]}>
        <View>
          <GlamText variant="titleSm" color="text">Siga a Glam</GlamText>
          <GlamText variant="caption" color="textTertiary">Mais dicas e novidades</GlamText>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => setModalVisible(true)} style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Instagram size={22} color={colors.iconOnAccent} />
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://tiktok.com/@glamoficina')} style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color={colors.iconOnAccent} />
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlayDark }} onPress={() => setModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 28, width: '90%', maxWidth: 360 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <GlamText variant="title" color="text">Siga a Glam</GlamText>
              <GlamText variant="bodySmall" color="textTertiary" style={{ marginTop: 4 }}>Escolha qual perfil seguir</GlamText>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable onPress={() => { Linking.openURL('https://instagram.com/oficinaglam.br'); setModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Instagram size={20} color={colors.iconOnAccent} /></View>
                <View style={{ flex: 1 }}>
                  <GlamText variant="titleSm" color="text">Oficina Glam</GlamText>
                  <GlamText variant="caption" color="textTertiary">@oficinaglam.br</GlamText>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>
              <Pressable onPress={() => { Linking.openURL('https://instagram.com/japurapneus.br'); setModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Instagram size={20} color={colors.iconOnAccent} /></View>
                <View style={{ flex: 1 }}>
                  <GlamText variant="titleSm" color="text">Japurá Pneus</GlamText>
                  <GlamText variant="caption" color="textTertiary">@japurapneus.br</GlamText>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
            <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 16, paddingVertical: 10, alignItems: 'center' }}>
              <GlamText variant="bodySmall" color="textTertiary">Fechar</GlamText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </Screen>
  );
}
