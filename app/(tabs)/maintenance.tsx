import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar, ChevronDown, FileText, Filter, MapPin, Plus, Trash2, Wrench, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';

export default function MaintenanceScreen() {
  const router = useRouter();
  const [maintenanceList, setMaintenanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar o Modal de Detalhes
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Estados de Filtros
  const [filterType, setFilterType] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  
  const tiposServico = ['todos', 'Troca de Óleo', 'Revisão', 'Pneus', 'Freios', 'Bateria', 'Alinhamento', 'Balanceamento'];

  // 1. BUSCAR DADOS
  async function fetchMaintenance() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setMaintenanceList(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Ops!", "Não conseguimos carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }

  // Agrupa por tipo e detecta padrões anormais (mesmo serviço em menos de 30 dias)
  const { groupedByTipo, abnormalIds } = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    const abnormal: number[] = [];
    const list = filterType === 'todos' ? maintenanceList : maintenanceList.filter((i: any) => i.tipo === filterType);
    list.forEach((item: any) => {
      if (!grupos[item.tipo]) grupos[item.tipo] = [];
      grupos[item.tipo].push(item);
    });
    Object.values(grupos).forEach((items: any[]) => {
      if (items.length < 2) return;
      const sorted = [...items].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      for (let i = 0; i < sorted.length - 1; i++) {
        const d1 = new Date(sorted[i].data);
        const d2 = new Date(sorted[i + 1].data);
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

  useFocusEffect(
    useCallback(() => {
      fetchMaintenance();
    }, [])
  );

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

  // 3. RENDERIZAÇÃO DE CADA ITEM (Card com Timeline)
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View className="flex-row mb-4">
      {/* Timeline Line */}
      <View className="items-center mr-4">
        {/* Dot */}
        <View 
          style={{ backgroundColor: colors.headerBg }} 
          className="w-3 h-3 rounded-full shadow-md"
        />
        {/* Vertical Line */}
        {index < filteredList.length - 1 && (
          <View 
            style={{ backgroundColor: colors.rosaMedio, opacity: 0.3 }} 
            className="w-0.5 flex-1 mt-1"
          />
        )}
      </View>

      {/* Card Content */}
      <TouchableOpacity 
        style={{ 
          backgroundColor: colors.surface,
          borderLeftWidth: 3,
          borderLeftColor: colors.headerBg,
          flex: 1
        }}
        className="rounded-2xl p-4 shadow-sm"
        activeOpacity={0.7}
        onPress={() => setSelectedItem(item)}
        onLongPress={() => handleDelete(item.id)}
        delayLongPress={500}
      >
        {/* Header do Card */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text 
                style={{ color: colors.rosaEscuro, fontFamily: 'Inter_600SemiBold' }} 
                className="text-lg font-bold capitalize"
              >
                {item.tipo}
              </Text>
              {abnormalIds.includes(item.id) && (
                <View style={{ backgroundColor: colors.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: colors.warning, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>Padrão fora do normal</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Calendar size={12} color={colors.textLight} />
              <Text 
                style={{ color: colors.textLight, fontFamily: 'Inter_400Regular' }} 
                className="text-xs ml-1"
              >
                {item.data}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <Text 
              style={{ 
                color: colors.headerBg,
                fontFamily: 'Inter_600SemiBold' 
              }} 
              className="text-lg font-bold"
            >
              R$ {item.valor}
            </Text>
            <Text 
              style={{ color: colors.textLight, fontFamily: 'Inter_400Regular' }} 
              className="text-xs mt-1"
            >
              {item.km} km
            </Text>
          </View>
        </View>

        {/* Oficina */}
        {item.oficina && (
          <View 
            style={{ backgroundColor: colors.accentSoft }} 
            className="flex-row items-center p-2 rounded-lg mb-2"
          >
            <MapPin size={12} color={colors.iconPrimary} />
            <Text 
              style={{ color: colors.iconPrimary, fontFamily: 'Inter_400Regular' }} 
              className="text-xs ml-1 flex-1" 
              numberOfLines={1}
            >
              {item.oficina}
            </Text>
          </View>
        )}

        {/* Preview das notas */}
        {item.notas && (
          <Text 
            style={{ color: colors.textLight, fontFamily: 'Inter_400Regular' }} 
            className="text-xs italic" 
            numberOfLines={2}
          >
            {item.notas}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: 16 }}>
      {/* Cabecalho */}
      <View className="px-5 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_700Bold',
                textTransform: 'uppercase' 
              }} 
              className="text-2xl font-bold"
            >
              Histórico
            </Text>
            <Text 
              style={{ color: colors.textLight, fontFamily: 'Inter_400Regular' }} 
              className="text-sm mt-1"
            >
              {filteredList.length} {filteredList.length === 1 ? 'serviço registrado' : 'serviços registrados'}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/maintenance-new')}
            style={{ 
              backgroundColor: colors.headerBg,
              shadowColor: colors.rosaInteso,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5
            }}
            className="w-14 h-14 rounded-full items-center justify-center"
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.rosaMedio,
            borderWidth: 1
          }}
          className="p-3 rounded-xl flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <Filter size={18} color={colors.headerBg} />
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'Inter_600SemiBold' 
              }} 
              className="font-semibold ml-2"
            >
              Filtrar por tipo
            </Text>
          </View>
          <View className="flex-row items-center">
            {filterType !== 'todos' && (
              <View 
                style={{ backgroundColor: colors.rosaClaro }} 
                className="w-2 h-2 rounded-full mr-2"
              />
            )}
            <ChevronDown 
              size={20} 
              color={colors.textLight} 
              style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {abnormalIds.length > 0 && (
        <View className="px-5 mb-4">
          <View style={{ backgroundColor: colors.accentSoft, padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.accent }}>
            <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Em breve: análise inteligente de frequência</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 }}>A IA vai identificar padrões fora do normal automaticamente.</Text>
          </View>
        </View>
      )}

      {showFilters && (
        <View className="px-5 mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            {tiposServico.map((tipo) => {
              const isActive = filterType === tipo;
              return (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => setFilterType(tipo)}
                  style={{
                    backgroundColor: isActive ? colors.headerBg : colors.surface,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: colors.rosaMedio,
                    shadowColor: isActive ? colors.rosaInteso : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: isActive ? 3 : 0
                  }}
                  className="px-5 py-2.5 rounded-full"
                >
                  <Text 
                    style={{
                      color: isActive ? colors.surface : colors.text,
                      fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular'
                    }}
                    className="font-medium"
                  >
                    {tipo === 'todos' ? 'Todos' : tipo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Lista com Timeline */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchMaintenance} colors={[colors.headerBg]} tintColor={colors.headerBg} />
        }
        ListEmptyComponent={
            !loading ? (
                <View className="items-center justify-center mt-20">
                    <View 
                      style={{ backgroundColor: colors.rosaSuper }} 
                      className="w-24 h-24 rounded-full items-center justify-center mb-4"
                    >
                      <FileText size={48} color={colors.rosaMedio} />
                    </View>
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }} 
                      className="text-lg text-center mb-2"
                    >
                      {filterType === 'todos' ? 'Nenhum serviço registrado' : `Nenhum serviço de ${filterType}`}
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }} 
                      className="text-sm text-center px-8"
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
            <View className="bg-white w-full rounded-2xl p-6 shadow-2xl">
                
                {/* Header do Modal */}
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center">
                        <View className="bg-pink-100 p-2 rounded-lg mr-3">
                             <Wrench size={24} color="#E91E63" />
                        </View>
                        <View>
                             <Text className="text-gray-500 text-xs uppercase font-bold">Serviço</Text>
                             <Text className="text-xl font-bold text-[#333] capitalize">
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
                                <Text className="text-base font-medium text-gray-800">{selectedItem?.data}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-400 text-xs mb-1">Valor Total</Text>
                            <View className="flex-row items-center">
                                <Text className="text-lg font-bold text-[#E91E63]">R$ {selectedItem?.valor}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Linha 2: KM */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs mb-1">Quilometragem</Text>
                        <Text className="text-base font-medium text-gray-800">{selectedItem?.km} Km</Text>
                    </View>

                    {/* Linha 2.5: Oficina (se houver) */}
                    {selectedItem?.oficina && (
                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs mb-1">Oficina Executante</Text>
                            <View className="flex-row items-center">
                                <MapPin size={16} color="#E91E63" style={{marginRight: 4}}/>
                                <Text className="text-base font-medium text-gray-800">{selectedItem.oficina}</Text>
                            </View>
                        </View>
                    )}

                    {/* Linha 3: Foto da NF (se houver) */}
                    {selectedItem?.foto_nf_url && (
                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs mb-2">Nota Fiscal</Text>
                            <Image 
                                source={{ uri: selectedItem.foto_nf_url }} 
                                className="w-full h-48 rounded-xl bg-gray-100"
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    {/* Linha 4: Observações Completas */}
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="text-gray-400 text-xs mb-2 font-bold uppercase">Observações / Peças</Text>
                        <Text className="text-gray-600 text-base leading-6">
                            {selectedItem?.notas || "Nenhuma observação registrada."}
                        </Text>
                    </View>

                </ScrollView>

                {/* Rodapé do Modal: Ações */}
                <View className="mt-6 flex-row gap-3">
                    <TouchableOpacity 
                        onPress={() => handleDelete(selectedItem.id)}
                        className="flex-1 border border-red-200 py-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Trash2 size={18} color="#EF4444" style={{marginRight: 8}}/>
                        <Text className="text-red-500 font-bold">Excluir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => setSelectedItem(null)}
                        className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                    >
                        <Text className="text-gray-700 font-bold">Fechar</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}