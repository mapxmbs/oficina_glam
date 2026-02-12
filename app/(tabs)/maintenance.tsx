import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar, FileText, Plus, Trash2, Wrench, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { formatBR, parseBR, parseISODate, toISOForCompare } from '../../lib/dates';
import { getActiveVehicleId } from '../../lib/vehicle';
import { colors } from '../../src/theme/colors';
import { cardContent, chipActive, chipBase, headerMinimal, spacing } from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

export default function MaintenanceScreen() {
  const router = useRouter();
  const [maintenanceList, setMaintenanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('todos');

  const tiposServico = ['todos', 'Troca de Óleo', 'Revisão', 'Pneus', 'Freios', 'Bateria', 'Alinhamento', 'Balanceamento'];

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const vehicleId = await getActiveVehicleId();
      if (!vehicleId) {
        setMaintenanceList([]);
        return;
      }
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('id', { ascending: false });
      if (!error && data) setMaintenanceList(data);
      else setMaintenanceList([]);
    } catch (e) {
      console.warn('Erro ao buscar manutenções:', e);
      setMaintenanceList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Detecta padrão fora do normal: mesmo serviço em menos de 30 dias */
  const { groupedByTipo, abnormalIds } = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    const abnormal: number[] = [];
    const list = filterType === 'todos' ? maintenanceList : maintenanceList.filter((i: any) => i.tipo === filterType);
    list.forEach((item: any) => {
      if (!grupos[item.tipo]) grupos[item.tipo] = [];
      grupos[item.tipo].push(item);
    });
    const parseDate = (s: string | null | undefined) => parseISODate(s) ?? parseBR(s);
    Object.values(grupos).forEach((items: any[]) => {
      if (items.length < 2) return;
      const sorted = [...items].sort(
        (a, b) => (toISOForCompare(b.data) ?? '').localeCompare(toISOForCompare(a.data) ?? '')
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        const d1 = parseDate(sorted[i].data);
        const d2 = parseDate(sorted[i + 1].data);
        if (!d1 || !d2) continue;
        const dias = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
        if (dias < 30) abnormal.push(sorted[i].id);
      }
    });
    return { groupedByTipo: grupos, abnormalIds: abnormal };
  }, [maintenanceList, filterType]);

  const filteredList = useMemo(() => {
    if (filterType === 'todos') return maintenanceList;
    return maintenanceList.filter((item: any) => item.tipo === filterType);
  }, [maintenanceList, filterType]);

  useFocusEffect(useCallback(() => {
    fetchMaintenance();
  }, [fetchMaintenance]));

  // 2. FUNÇÃO DELETAR (Manteve-se igual)
  async function handleDelete(id: number) {
    Alert.alert(
      "Excluir Registro",
      "Tem certeza? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from('manutencoes').delete().eq('id', id);
            
            if (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            } else {
              setMaintenanceList(prev => prev.filter(item => item.id !== id));
              // Se o item deletado estiver aberto no modal, fecha o modal
              if (selectedItem?.id === id) setSelectedItem(null);
            }
          }
        }
      ]
    );
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingLeft: 14,
        borderTopWidth: index === 0 ? 0 : 1,
        borderTopColor: colors.divider,
        borderLeftWidth: 3,
        borderLeftColor: 'rgba(139, 41, 66, 0.18)',
      }}
      activeOpacity={0.7}
      onPress={() => setSelectedItem(item)}
      onLongPress={() => handleDelete(item.id)}
      delayLongPress={500}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text }}>{item.tipo}</Text>
          {abnormalIds.includes(item.id) && (
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: colors.warning }}>• Padrão atípico</Text>
          )}
        </View>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
          {formatBR(item.data)}{item.oficina ? ` · ${item.oficina}` : ''}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.text }}>{formatCurrency(item.valor)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.screenPadding, paddingTop: spacing.screenPaddingTop, paddingBottom: spacing.screenPaddingBottom }}>
        {/* Header minimalista */}
        <View style={[headerMinimal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={[typography.screenTitle, { color: colors.text }]}>Histórico</Text>
            <Text style={[typography.screenSubtitle, { color: colors.textTertiary, marginTop: 4 }]}>
              {filteredList.length} {filteredList.length === 1 ? 'serviço' : 'serviços'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/maintenance-new')}
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={22} color={colors.iconOnAccent} />
          </TouchableOpacity>
        </View>

        {/* Filtros – chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: spacing.blockGap }}
        >
          {tiposServico.map((tipo) => {
            const isActive = filterType === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                onPress={() => setFilterType(tipo)}
                style={isActive ? chipActive : chipBase}
              >
                <Text
                  style={{
                    fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    fontSize: 13,
                    color: isActive ? colors.iconOnAccent : colors.textSecondary,
                  }}
                >
                  {tipo === 'todos' ? 'Todos' : tipo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textTertiary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Serviços</Text>
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingBottom: spacing.screenPaddingBottom + spacing.tabBarBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchMaintenance} colors={[colors.accent]} tintColor={colors.accent} />
        }
        ListEmptyComponent={
            !loading ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
                    <View 
                      style={{ backgroundColor: colors.surfaceSoft, width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
                    >
                      <FileText size={40} color={colors.accent} />
                    </View>
                    <Text 
                      style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}
                    >
                      {filterType === 'todos' ? 'Nenhum serviço registrado' : `Nenhum serviço de ${filterType}`}
                    </Text>
                    <Text 
                      style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 }}
                    >
                      Toque no botão + para adicionar seu primeiro registro
                    </Text>
                </View>
            ) : null
        }
      />

      {/* --- MODAL DE DETALHES --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedItem}
        onRequestClose={() => setSelectedItem(null)}
      >
        {/* Fundo Escuro Transparente */}
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
            
            {/* Caixa do Modal */}
            <View style={[cardContent, { width: '100%' }]}>
                
                {/* Header do Modal */}
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center">
                        <View style={{ backgroundColor: colors.accentSoft, padding: 10, borderRadius: 12, marginRight: 12 }}>
                             <Wrench size={24} color={colors.accent} />
                        </View>
                        <View>
                             <Text className="text-gray-500 text-xs uppercase font-bold">Serviço</Text>
                             <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text }} className="capitalize">
                                {selectedItem?.tipo}
                             </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedItem(null)}>
                        <X size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Conteúdo do Modal */}
                <ScrollView className="max-h-96">
                    
                    {/* Linha 1: Data e Valor */}
                    <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-4">
                        <View>
                            <Text className="text-gray-400 text-xs mb-1">Data realizada</Text>
                            <View className="flex-row items-center">
                                <Calendar size={16} color="#666" style={{marginRight: 4}}/>
                                <Text className="text-base font-medium text-gray-800">{formatBR(selectedItem?.data)}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-400 text-xs mb-1">Valor Total</Text>
                            <View className="flex-row items-center">
                                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.accent }}>{selectedItem ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedItem.valor) : ''}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Linha 2: KM */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs mb-1">Quilometragem</Text>
                        <Text className="text-base font-medium text-gray-800">{selectedItem?.km} Km</Text>
                    </View>

                    {/* Linha 3: Observações (inclui oficina se foi preenchida no formulário) */}
                    <View style={{ backgroundColor: colors.surfaceSoft, padding: 16, borderRadius: 12 }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.textTertiary, marginBottom: 8, textTransform: 'uppercase' }}>Observações / Peças</Text>
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textSecondary, lineHeight: 24 }}>
                            {selectedItem?.notas || "Nenhuma observação registrada."}
                        </Text>
                    </View>

                </ScrollView>

                {/* Rodapé do Modal: Ações */}
                <View className="mt-6 flex-row gap-3">
                    <TouchableOpacity 
                        onPress={() => handleDelete(selectedItem.id)}
                        style={{ flex: 1, borderWidth: 1, borderColor: colors.danger, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                        <Trash2 size={18} color={colors.danger} style={{ marginRight: 8 }} />
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.danger }}>Excluir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => setSelectedItem(null)}
                        style={{ flex: 1, backgroundColor: colors.surfaceSoft, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                    >
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.textPrimary }}>Fechar</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}