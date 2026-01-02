import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, BarChart3, Calendar, DollarSign, Droplet, Plus, Trash2, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';

// Utilitário para formatar moeda
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function FuelScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar o Modal de Detalhes
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Métricas do Dashboard
  const [metrics, setMetrics] = useState({
    avgConsumption: 0,    // Km/L (mantém para referência)
    weeklyLiters: 0,      // Litros consumidos esta semana
    monthlySpend: 0,      // Gasto este mês em R$
    lastMonthSpend: 0,    // Gasto mês passado
    bestFuel: 'N/D',      // Qual rende mais (simulado)
    trend: 'stable' as 'up' | 'down' | 'stable'
  });

  async function fetchFuel() {
    setLoading(true);
    const { data, error } = await supabase
      .from('abastecimentos')
      .select('*')
      .order('id', { ascending: false }); // Do mais novo pro mais antigo

    if (!error && data) {
      setLogs(data);
      calculateMetrics(data);
    }
    setLoading(false);
  }

  // O CÉREBRO DA TELA: Cálculos Automáticos
  function calculateMetrics(data: any[]) {
    if (data.length === 0) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calcular início da semana (domingo)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 1. Consumo SEMANAL em Litros
    const thisWeekLogs = data.filter(d => {
      const [day, month, year] = d.data.split('/');
      const logDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return logDate >= weekStart;
    });
    const weeklyLiters = thisWeekLogs.reduce((acc, curr) => acc + curr.litros, 0);

    // 2. Gasto MENSAL em Dinheiro
    const thisMonthLogs = data.filter(d => {
      const [day, month, year] = d.data.split('/');
      return parseInt(month) - 1 === currentMonth && parseInt(year) === currentYear;
    });
    const spendThisMonth = thisMonthLogs.reduce((acc, curr) => acc + curr.valor_total, 0);

    // 3. Média Km/L (mantém para referência)
    let avg = 0;
    if (data.length >= 2) {
      const totalKm = data[0].km - data[data.length - 1].km;
      const totalLitros = data.reduce((acc, curr) => acc + curr.litros, 0);
      avg = totalLitros > 0 ? (totalKm / totalLitros) : 0;
    }

    setMetrics({
      avgConsumption: parseFloat(avg.toFixed(1)),
      weeklyLiters: parseFloat(weeklyLiters.toFixed(1)),
      monthlySpend: spendThisMonth,
      lastMonthSpend: 0,
      bestFuel: 'Gasolina',
      trend: avg > 10 ? 'up' : 'down'
    });
  }

  useFocusEffect(
    useCallback(() => {
      fetchFuel();
    }, [])
  );

  // FUNÇÃO DELETAR
  async function handleDelete(id: number) {
    Alert.alert(
      "Excluir Abastecimento",
      "Tem certeza? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
            
            if (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            } else {
              // Atualiza a lista removendo o item deletado
              const updatedLogs = logs.filter(item => item.id !== id);
              setLogs(updatedLogs);
              calculateMetrics(updatedLogs);
              
              // Se o item deletado estiver aberto no modal, fecha o modal
              if (selectedItem?.id === id) setSelectedItem(null);
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        className="flex-1 px-5 pt-4"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFuel} colors={[colors.rosaClaro]} />}
      >

        <Text 
          style={{ 
            color: colors.rosaEscuro,
            fontFamily: 'LoveloBlack',
            textTransform: 'uppercase'
          }} 
          className="text-2xl font-bold mb-6"
        >
          ⛽ Combustível
        </Text>

        {/* 1. DASHBOARD SEMANAL - FOCO PRINCIPAL */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.rosaMedio,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4
          }}
          className="p-5 rounded-3xl mb-6 border relative overflow-hidden"
        >
          {/* Decoração */}
          <View 
            style={{ 
              backgroundColor: colors.rosaSuper,
              position: 'absolute',
              right: -20,
              top: -20,
              width: 100,
              height: 100,
              borderRadius: 50
            }}
          />
          
          <View className="flex-row items-center mb-4 relative z-10">
            <View 
              style={{ backgroundColor: colors.rosaClaro }} 
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
            >
              <Droplet size={24} color="white" />
            </View>
            <View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs uppercase font-bold"
              >
                Consumo Semanal
              </Text>
              <Text 
                style={{ 
                  color: colors.text,
                  fontFamily: 'MontserratAlternates-Medium'
                }} 
                className="text-sm"
              >
                Últimos 7 dias
              </Text>
            </View>
          </View>

          <View className="relative z-10">
            <View className="flex-row items-baseline mb-2">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'LoveloBlack'
                }} 
                className="text-5xl"
              >
                {metrics.weeklyLiters || '0'}
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium'
                }} 
                className="text-lg ml-2"
              >
                litros
              </Text>
            </View>
            
            <View 
              style={{ backgroundColor: colors.rosaSuper }} 
              className="p-3 rounded-xl mt-2"
            >
              <Text 
                style={{ 
                  color: colors.text,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-sm"
              >
                💡 {metrics.weeklyLiters > 0 
                  ? `Média de ${(metrics.weeklyLiters / 7).toFixed(1)}L por dia` 
                  : 'Nenhum abastecimento esta semana'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. CARDS SECUNDÁRIOS - MENSAL E MÉDIA */}
        <View className="flex-row justify-between mb-6">
          
          {/* Card Gasto Mensal */}
          <View 
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.rosaMedio,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2
            }}
            className="w-[48%] p-4 rounded-3xl border relative overflow-hidden"
          >
            <View 
              style={{ backgroundColor: colors.rosaSuper }} 
              className="w-16 h-16 rounded-full absolute -right-4 -top-4"
            />
            
            <View className="relative z-10">
              <View 
                style={{ backgroundColor: colors.rosaClaro }} 
                className="w-10 h-10 rounded-full items-center justify-center mb-2"
              >
                <DollarSign size={20} color="white" />
              </View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs uppercase font-bold mb-1"
              >
                Gasto Mensal
              </Text>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium'
                }} 
                className="text-xl font-bold"
              >
                {formatCurrency(metrics.monthlySpend)}
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs mt-1"
              >
                {new Date().toLocaleString('pt-BR', { month: 'long' })}
              </Text>
            </View>
          </View>

          {/* Card Média Km/L */}
          <View 
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.rosaMedio,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2
            }}
            className="w-[48%] p-4 rounded-3xl border relative overflow-hidden"
          >
            <View 
              style={{ backgroundColor: colors.rosaSuper }} 
              className="w-16 h-16 rounded-full absolute -right-4 -top-4"
            />
            
            <View className="relative z-10">
              <View 
                style={{ backgroundColor: colors.rosaClaro }} 
                className="w-10 h-10 rounded-full items-center justify-center mb-2"
              >
                <BarChart3 size={20} color="white" />
              </View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs uppercase font-bold mb-1"
              >
                Média
              </Text>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium'
                }} 
                className="text-xl font-bold"
              >
                {metrics.avgConsumption > 0 ? metrics.avgConsumption : '---'}
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs mt-1"
              >
                km por litro
              </Text>
            </View>
          </View>
        </View>

        {/* Alerta de Consumo Alto */}
        {metrics.avgConsumption < 8 && metrics.avgConsumption > 0 && (
          <View 
            style={{ 
              backgroundColor: colors.danger + '20',
              borderColor: colors.danger,
              borderWidth: 1
            }} 
            className="p-3 rounded-2xl mb-6 flex-row items-center"
          >
            <AlertTriangle size={20} color={colors.danger} />
            <Text 
              style={{ 
                color: colors.danger,
                fontFamily: 'Inter-Regular'
              }} 
              className="text-sm ml-2 flex-1"
            >
              Atenção: Consumo acima do esperado. Verifique calibragem dos pneus.
            </Text>
          </View>
        )}

        {/* BOTÃO DE AÇÃO */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: colors.rosaClaro,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
          className="flex-row items-center justify-center p-4 rounded-2xl mb-8"
          onPress={() => router.push('/forms/add-fuel')}
        >
          <Plus size={24} color="white" />
          <Text 
            style={{ 
              color: 'white',
              fontFamily: 'MontserratAlternates-Medium'
            }} 
            className="font-bold text-lg ml-2"
          >
            Adicionar Abastecimento
          </Text>
        </TouchableOpacity>

        {/* LISTA HISTÓRICA */}
        <Text 
          style={{ 
            color: colors.textLight,
            fontFamily: 'MontserratAlternates-Medium'
          }} 
          className="font-bold mb-4 ml-1"
        >
          Histórico Completo
        </Text>
        
        {loading && <ActivityIndicator color={colors.rosaClaro} />}

        {logs.map((log) => (
          <TouchableOpacity 
            key={log.id}
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1
            }}
            className="p-4 rounded-2xl mb-3 flex-row items-center justify-between border"
            activeOpacity={0.7}
            onPress={() => setSelectedItem(log)}
            onLongPress={() => handleDelete(log.id)}
            delayLongPress={500}
          >
            <View className="flex-row items-center">
              <View 
                style={{ 
                  backgroundColor: log.tipo === 'Etanol' ? colors.success + '20' : colors.danger + '20',
                  borderWidth: 2,
                  borderColor: log.tipo === 'Etanol' ? colors.success : colors.danger
                }}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Droplet size={18} color={log.tipo === 'Etanol' ? colors.success : colors.danger} />
              </View>
              <View>
                <Text 
                  style={{ 
                    color: colors.text,
                    fontFamily: 'MontserratAlternates-Medium'
                  }} 
                  className="font-bold text-base"
                >
                  {log.posto}
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter-Regular'
                  }} 
                  className="text-xs"
                >
                  {log.data} • {log.litros}L
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium'
                }} 
                className="font-bold"
              >
                {formatCurrency(log.valor_total)}
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular'
                }} 
                className="text-xs mt-1"
              >
                KM {log.km}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-10" /> 
      </ScrollView>

      {/* MODAL DE DETALHES */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
            
            {/* Caixa do Modal */}
            <View className="bg-white w-full rounded-2xl p-6 shadow-2xl">
                
                {/* Header do Modal */}
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center">
                        <View className={`p-2 rounded-lg mr-3 ${selectedItem?.tipo === 'Etanol' ? 'bg-green-100' : 'bg-red-100'}`}>
                             <Droplet size={24} color={selectedItem?.tipo === 'Etanol' ? '#2E7D32' : '#C62828'} />
                        </View>
                        <View>
                             <Text className="text-gray-500 text-xs uppercase font-bold">Abastecimento</Text>
                             <Text className="text-xl font-bold text-[#333]">
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
                            <Text className="text-gray-400 text-xs mb-1">Data</Text>
                            <View className="flex-row items-center">
                                <Calendar size={16} color="#666" style={{marginRight: 4}}/>
                                <Text className="text-base font-medium text-gray-800">{selectedItem?.data}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-400 text-xs mb-1">Valor Total</Text>
                            <View className="flex-row items-center">
                                <Text className="text-lg font-bold text-[#E91E63]">{selectedItem ? formatCurrency(selectedItem.valor_total) : ''}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Linha 2: Posto e Litros */}
                    <View className="flex-row justify-between mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs mb-1">Posto</Text>
                            <Text className="text-base font-medium text-gray-800">{selectedItem?.posto}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-400 text-xs mb-1">Litros</Text>
                            <Text className="text-base font-medium text-gray-800">{selectedItem?.litros}L</Text>
                        </View>
                    </View>

                    {/* Linha 3: KM */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs mb-1">Quilometragem</Text>
                        <Text className="text-base font-medium text-gray-800">{selectedItem?.km} Km</Text>
                    </View>

                    {/* Linha 4: Observações (se houver) */}
                    {selectedItem?.observacoes && (
                        <View className="bg-gray-50 p-4 rounded-xl">
                            <Text className="text-gray-400 text-xs mb-2 font-bold uppercase">Observações</Text>
                            <Text className="text-gray-600 text-base leading-6">
                                {selectedItem.observacoes}
                            </Text>
                        </View>
                    )}

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