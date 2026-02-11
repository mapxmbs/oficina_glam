import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, BarChart3, Calendar, DollarSign, Droplet, Plus, Trash2, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Screen } from '../../components/ui';
import { colors } from '../../src/theme/colors';
import { sectionHeaderAccent, spacing } from '../../src/theme/design-patterns';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type FilterPeriod = 'todos' | 'semana' | 'mes' | 'ano';

export default function FuelScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('todos');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    avgConsumption: 0,
    weeklyLiters: 0,
    monthlySpend: 0,
    lastMonthSpend: 0,
    bestFuel: 'N/D',
    trend: 'stable' as 'up' | 'down' | 'stable',
  });

  async function fetchFuel() {
    setLoading(true);
    const { data, error } = await supabase.from('abastecimentos').select('*').order('id', { ascending: false });
    if (!error && data) {
      setLogs(data);
      calculateMetrics(data);
    } else setLogs([]);
    setLoading(false);
  }

  function calculateMetrics(data: any[]) {
    if (data.length === 0) return;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekLogs = data.filter(d => {
      const [day, month, year] = (d.data || '').split('/');
      if (!day || !month || !year) return false;
      const logDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return logDate >= weekStart;
    });
    const weeklyLiters = thisWeekLogs.reduce((acc, curr) => acc + curr.litros, 0);

    const thisMonthLogs = data.filter(d => {
      const [day, month, year] = (d.data || '').split('/');
      if (!day || !month || !year) return false;
      return parseInt(month) - 1 === currentMonth && parseInt(year) === currentYear;
    });
    const spendThisMonth = thisMonthLogs.reduce((acc, curr) => acc + curr.valor_total, 0);

    let avg = 0;
    if (data.length >= 2) {
      const totalKm = data[0].km - data[data.length - 1].km;
      const totalLitros = data.reduce((acc, curr) => acc + curr.litros, 0);
      avg = totalLitros > 0 ? totalKm / totalLitros : 0;
    }

    setMetrics({
      avgConsumption: parseFloat(avg.toFixed(1)),
      weeklyLiters: parseFloat(weeklyLiters.toFixed(1)),
      monthlySpend: spendThisMonth,
      lastMonthSpend: 0,
      bestFuel: 'Gasolina',
      trend: avg > 10 ? 'up' : 'down',
    });
  }

  useFocusEffect(useCallback(() => { fetchFuel(); }, []));

  const filteredLogs = useMemo(() => {
    if (filterPeriod === 'todos') return logs;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return logs.filter((d) => {
      const [day, month, year] = (d.data || '').split('/');
      if (!day || !month || !year) return false;
      const logDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (filterPeriod === 'semana') return logDate >= weekStart;
      if (filterPeriod === 'mes') return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      if (filterPeriod === 'ano') return logDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [logs, filterPeriod]);

  const displayMetrics = useMemo(() => {
    if (filteredLogs.length === 0) return metrics;
    const data = filteredLogs;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeek = data.filter((d: any) => {
      const [day, month, year] = (d.data || '').split('/');
      if (!day || !month || !year) return false;
      const logDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return logDate >= weekStart;
    });
    const thisMonth = data.filter((d: any) => {
      const [day, month, year] = (d.data || '').split('/');
      if (!day || !month || !year) return false;
      return parseInt(month) - 1 === now.getMonth() && parseInt(year) === now.getFullYear();
    });
    let avg = 0;
    if (data.length >= 2) {
      const sorted = [...data].sort((a: any, b: any) => b.id - a.id);
      const totalKm = sorted[0].km - sorted[sorted.length - 1].km;
      const totalLitros = sorted.reduce((acc: number, curr: any) => acc + curr.litros, 0);
      avg = totalLitros > 0 ? totalKm / totalLitros : 0;
    }
    const spendMonth = thisMonth.reduce((acc: number, curr: any) => acc + curr.valor_total, 0);
    const weeklyL = thisWeek.reduce((acc: number, curr: any) => acc + curr.litros, 0);
    return {
      avgConsumption: parseFloat(avg.toFixed(1)),
      weeklyLiters: parseFloat(weeklyL.toFixed(1)),
      monthlySpend: spendMonth,
      lastMonthSpend: metrics.lastMonthSpend,
      bestFuel: metrics.bestFuel,
      trend: metrics.trend,
    };
  }, [filteredLogs, metrics]);

  async function handleDelete(id: number) {
    Alert.alert("Excluir abastecimento", "Tem certeza? Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
          if (!error) {
            setLogs(prev => prev.filter(item => item.id !== id));
            calculateMetrics(logs.filter(item => item.id !== id));
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
      contentContainerStyle={{ paddingBottom: spacing.screenPaddingBottom + 64 }}
    >
      <View style={[sectionHeaderAccent, { marginBottom: spacing.sectionGap }]}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.iconOnAccent }}>Combustível</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.iconOnAccent, opacity: 0.9, marginTop: 4 }}>Rendimento e histórico</Text>
      </View>

      {/* Filtros compactos */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.sectionGap }}>
        {filters.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilterPeriod(key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: filterPeriod === key ? colors.accent : 'transparent',
              borderWidth: 1,
              borderColor: filterPeriod === key ? colors.accent : colors.border,
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: filterPeriod === key ? colors.iconOnAccent : colors.textSecondary }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insights – surface branca, número accent com peso */}
      <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 16, marginBottom: spacing.sectionGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 44, color: colors.accent }}>{displayMetrics.weeklyLiters || '0'}</Text>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, marginBottom: spacing.sectionGap, backgroundColor: `${colors.danger}12`, borderRadius: 12, borderWidth: 1, borderColor: `${colors.danger}30` }}>
          <AlertTriangle size={18} color={colors.danger} style={{ marginRight: 10 }} />
          <Text style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.danger }}>Consumo acima do esperado. Verifique calibragem dos pneus.</Text>
        </View>
      )}

      {/* CTA accent com presença */}
      <TouchableOpacity
        onPress={() => router.push('/forms/add-fuel')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginBottom: spacing.sectionGap, borderRadius: 16, backgroundColor: colors.accent }}
      >
        <Plus size={22} color={colors.iconOnAccent} />
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.iconOnAccent, marginLeft: 10 }}>Adicionar abastecimento</Text>
      </TouchableOpacity>

      {/* Lista – linhas, sem cards */}
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textTertiary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Histórico</Text>
      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />}
      {filteredLogs.map((log) => (
        <TouchableOpacity
          key={log.id}
          onPress={() => setSelectedItem(log)}
          onLongPress={() => handleDelete(log.id)}
          delayLongPress={500}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, marginBottom: 8, backgroundColor: colors.surface, borderRadius: 12 }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: log.tipo === 'Etanol' ? `${colors.success}18` : `${colors.danger}18`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Droplet size={18} color={log.tipo === 'Etanol' ? colors.success : colors.danger} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text }}>{log.posto}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textTertiary }}>{log.data} · {log.litros} L</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text }}>{formatCurrency(log.valor_total)}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>KM {log.km}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
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
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.text }}>{selectedItem?.data}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textTertiary }}>Valor</Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.accent }}>{selectedItem ? formatCurrency(selectedItem.valor_total) : ''}</Text>
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
