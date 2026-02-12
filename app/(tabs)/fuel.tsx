import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, Droplet, Plus, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { formatBR, isDateInRange, monthEnd, monthStart, toISOForCompare, weekEnd, weekStart } from '../../lib/dates';
import { Screen } from '../../components/ui';
import { colors } from '../../src/theme/colors';
import { cardContent, chipActive, chipBase, headerMinimal, spacing } from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type FilterPeriod = 'todos' | 'semana' | 'mes' | 'ano';

export default function FuelScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('todos');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchFuel = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('abastecimentos')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data) setLogs(data);
      else setLogs([]);
    } catch (e) {
      console.warn('Erro ao buscar abastecimentos:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchFuel();
  }, [fetchFuel]));

  const { filteredLogs, displayMetrics } = useMemo(() => {
    const now = new Date();
    const ws = weekStart(now);
    const we = weekEnd(now);
    const ms = monthStart(now);
    const me = monthEnd(now);
    const ys = `${now.getFullYear()}-01-01`;
    const ye = `${now.getFullYear()}-12-31`;

    let filtered = logs;
    if (filterPeriod === 'semana') filtered = logs.filter((d) => isDateInRange(d.data, ws, we));
    else if (filterPeriod === 'mes') filtered = logs.filter((d) => isDateInRange(d.data, ms, me));
    else if (filterPeriod === 'ano') filtered = logs.filter((d) => isDateInRange(d.data, ys, ye));

    const thisWeek = filtered.filter((d) => isDateInRange(d.data, ws, we));
    const thisMonth = filtered.filter((d) => isDateInRange(d.data, ms, me));
    const weeklyLiters = thisWeek.reduce((acc, c) => acc + (c.litros || 0), 0);
    const monthlySpend = thisMonth.reduce((acc, c) => acc + (c.valor_total || 0), 0);

    let avgConsumption = 0;
    if (filtered.length >= 2) {
      const sorted = [...filtered].sort(
        (a, b) => (toISOForCompare(b.data) ?? '').localeCompare(toISOForCompare(a.data) ?? '')
      );
      const totalKm = sorted[0].km - sorted[sorted.length - 1].km;
      const totalLitros = sorted.reduce((acc, c) => acc + (c.litros || 0), 0);
      avgConsumption = totalLitros > 0 ? totalKm / totalLitros : 0;
    }

    const displayMetrics = {
      avgConsumption: parseFloat(avgConsumption.toFixed(1)),
      weeklyLiters: parseFloat(weeklyLiters.toFixed(1)),
      monthlySpend,
      bestFuel: 'N/D' as string,
      trend: (avgConsumption > 10 ? 'up' : 'down') as 'up' | 'down' | 'stable',
    };
    return { filteredLogs: filtered, displayMetrics };
  }, [logs, filterPeriod]);

  async function handleDelete(id: number) {
    Alert.alert("Excluir abastecimento", "Tem certeza? Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
          if (!error) {
            setLogs((prev) => prev.filter((item) => item.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
          } else Alert.alert("Erro", "Não foi possível excluir.");
        },
      },
    ]);
  }

  const filters: { key: FilterPeriod; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mês' },
    { key: 'ano', label: 'Ano' },
  ];

  return (
    <Screen
      refreshing={loading}
      onRefresh={fetchFuel}
      contentContainerStyle={{ paddingBottom: spacing.screenPaddingBottom + spacing.tabBarBottom }}
    >
      {/* Header minimalista */}
      <View style={headerMinimal}>
        <Text style={[typography.screenTitle, { color: colors.text }]}>Combustível</Text>
        <Text style={[typography.screenSubtitle, { color: colors.textTertiary, marginTop: 4 }]}>Rendimento e histórico</Text>
      </View>

      {/* Filtros – chips brancos, ativo beterraba */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.blockGap }}>
        {filters.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilterPeriod(key)}
            style={filterPeriod === key ? chipActive : chipBase}
          >
            <Text style={{ fontFamily: filterPeriod === key ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13, color: filterPeriod === key ? colors.iconOnAccent : colors.textSecondary }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insights – card branco */}
      <View style={[cardContent, { marginBottom: spacing.blockGap }]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
          <Text style={[typography.dataLg, { fontSize: 44, lineHeight: 50, color: colors.accent }]}>{displayMetrics.weeklyLiters || '0'}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.textTertiary, marginLeft: 8 }}>litros esta semana</Text>
        </View>
        {displayMetrics.weeklyLiters > 0 && (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textTertiary }}>
            Média de {(displayMetrics.weeklyLiters / 7).toFixed(1)} L por dia
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: 32, marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gasto do mês</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text }}>{formatCurrency(displayMetrics.monthlySpend)}</Text>
          </View>
          <View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Média</Text>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text }}>{displayMetrics.avgConsumption > 0 ? `${displayMetrics.avgConsumption} km/L` : '---'}</Text>
          </View>
        </View>
      </View>

      {/* Alerta só quando relevante */}
      {displayMetrics.avgConsumption < 8 && displayMetrics.avgConsumption > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, marginBottom: spacing.blockGap, backgroundColor: `${colors.danger}12`, borderRadius: 12, borderWidth: 1, borderColor: `${colors.danger}30` }}>
          <AlertTriangle size={18} color={colors.danger} style={{ marginRight: 10 }} />
          <Text style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.danger }}>Consumo acima do esperado. Verifique calibragem dos pneus.</Text>
        </View>
      )}

      {/* CTA primário */}
      <Pressable
        onPress={() => router.push('/forms/add-fuel')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 16,
          marginBottom: spacing.blockGap,
          borderRadius: 28,
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Plus size={22} color={colors.iconOnAccent} />
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.iconOnAccent, marginLeft: 10 }}>Adicionar abastecimento</Text>
      </Pressable>

      {/* Lista limpa – sem bordas decorativas, valor à direita, data discreta */}
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textTertiary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Histórico</Text>
      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />}
      <View style={{ marginBottom: spacing.blockGap }}>
      {filteredLogs.map((log, idx) => (
        <TouchableOpacity
          key={log.id}
          onPress={() => setSelectedItem(log)}
          onLongPress={() => handleDelete(log.id)}
          delayLongPress={500}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: colors.border }}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text }}>{log.posto}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{formatBR(log.data)} · {log.litros} L · {log.km} km</Text>
          </View>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text }}>{formatCurrency(log.valor_total)}</Text>
        </TouchableOpacity>
      ))}
      </View>

      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={{ flex: 1, backgroundColor: colors.overlayDark, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 28, width: '100%', maxWidth: 360 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: selectedItem?.tipo === 'Etanol' ? `${colors.success}20` : `${colors.danger}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Droplet size={22} color={selectedItem?.tipo === 'Etanol' ? colors.success : colors.danger} />
                </View>
                <View>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary }}>Abastecimento</Text>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text }}>{selectedItem?.tipo}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedItem(null)}><X size={22} color={colors.textTertiary} /></TouchableOpacity>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>Data</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.text }}>{formatBR(selectedItem?.data)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>Valor</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{selectedItem ? formatCurrency(selectedItem.valor_total) : ''}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>Posto</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.text }}>{selectedItem?.posto}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>Litros / KM</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.text }}>{selectedItem?.litros} L · {selectedItem?.km} km</Text>
              </View>
              {selectedItem?.observacoes ? (
                <View style={{ marginBottom: 16, padding: 12, backgroundColor: colors.background, borderRadius: 10 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary, marginBottom: 4 }}>Observações</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.text }}>{selectedItem.observacoes}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => selectedItem && handleDelete(selectedItem.id)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.danger, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.danger }}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.text }}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
