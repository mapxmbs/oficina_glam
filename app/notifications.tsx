import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Car, ChevronLeft, Clock, Plus, Settings, Wrench } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

// TODO - FUNCIONALIDADES FUTURAS:
// - Push Notifications nativos (usando expo-notifications)
// - IA para recomendações baseadas no manual do carro
// - Machine Learning para prever próximos serviços com base no uso
// - Integração com calendário do dispositivo
// - Geofencing para lembrete ao passar perto de oficina Glam

export default function NotificationsScreen() {
  const router = useRouter();
  const [lembretes, setLembretes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar lembretes e calcular próximos
  async function fetchLembretes() {
    setLoading(true);
    try {
      // Busca lembretes configurados
      const { data: lembretesData } = await supabase
        .from('lembretes')
        .select('*')
        .order('proximo_alerta', { ascending: true });

      // Busca última manutenção de cada tipo para calcular próximos
      const { data: manutencoesData } = await supabase
        .from('manutencoes')
        .select('*')
        .order('data', { ascending: false });

      setLembretes(lembretesData || []);
      
      // Calcular lembretes automáticos baseados em padrões
      if (manutencoesData && manutencoesData.length > 0) {
        calcularProximosLembretes(manutencoesData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Calcula próximos lembretes baseados em manutenções passadas
  function calcularProximosLembretes(manutencoes: any[]) {
    // TODO - IA FUTURA: Usar machine learning para prever com base no histórico real
    // Por enquanto, usa regras simples baseadas em boas práticas
    
    const ultimaTrocaOleo = manutencoes.find(m => m.tipo.toLowerCase().includes('óleo'));
    const ultimaRevisao = manutencoes.find(m => m.tipo.toLowerCase().includes('revisão'));
    
    console.log('Última troca de óleo:', ultimaTrocaOleo);
    console.log('Última revisão:', ultimaRevisao);
    
    // Lógica de cálculo será implementada aqui
  }

  // Marcar lembrete como feito
  async function marcarComoFeito(lembreteId: number) {
    Alert.alert(
      "Marcar como Feito",
      "Deseja registrar este serviço como realizado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Registrar",
          onPress: async () => {
            // TODO: Abrir formulário de manutenção pré-preenchido
            router.push('/maintenance-new');
          }
        }
      ]
    );
  }

  // Agendar na oficina Glam
  function agendarNaGlam() {
    Alert.alert(
      "Agendar na Glam",
      "Você será direcionado para as oficinas da Rede Glam",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Ver Oficinas",
          onPress: () => router.push('/(tabs)/workshops')
        }
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchLembretes();
    }, [])
  );

  // Lembretes padrão sugeridos
  const lembretesDefault = [
    {
      id: 'default-1',
      tipo: 'Revisão',
      intervalo_tempo: 6, // meses
      intervalo_km: 10000,
      icone: <Wrench size={24} color={colors.headerBg} />,
      descricao: 'A cada 6 meses ou 10.000 km'
    },
    {
      id: 'default-2',
      tipo: 'Troca de Óleo',
      intervalo_tempo: 3, // meses
      intervalo_km: 5000,
      icone: <Car size={24} color={colors.rosaInteso} />,
      descricao: 'A cada 3 meses ou 5.000 km'
    },
    {
      id: 'default-3',
      tipo: 'Calibragem de Pneus',
      intervalo_dias: 15,
      icone: <Clock size={24} color={colors.rosaMedio} />,
      descricao: 'A cada 15 dias'
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b" style={{ borderBottomColor: colors.rosaMedio }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={28} color={colors.rosaEscuro} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={[typography.screenTitle, { color: colors.text }]}>Lembretes</Text>
          <Text style={[typography.screenSubtitle, { color: colors.textSecondary, marginTop: 4 }]}>Mantenha seu carro sempre em dia</Text>
        </View>
        <TouchableOpacity>
          <Settings size={24} color={colors.headerBg} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        
        {/* Card de Avisos Importantes */}
        <View 
          style={{ 
            backgroundColor: colors.headerBg,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 4
          }}
          className="rounded-2xl p-5 mb-6"
        >
          <View className="flex-row items-center mb-3">
            <Bell size={24} color="white" />
            <Text 
              style={{ fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }} 
              className="text-white text-lg font-bold ml-2"
            >
              Próximo Alerta
            </Text>
          </View>
          
          <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-white text-2xl font-bold mb-2">
            Revisão dos 10.000 km
          </Text>
          
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-white opacity-90 text-sm mb-4">
            Faltam aproximadamente 500 km ou 15 dias
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => marcarComoFeito(1)}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-white font-bold">
                Já fiz
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={agendarNaGlam}
              style={{ backgroundColor: 'white' }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text style={{ color: colors.headerBg, fontFamily: 'Inter_500Medium' }} className="font-bold">
                Agendar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lembretes Configurados */}
        <Text 
          style={{ 
            color: colors.rosaEscuro,
            fontFamily: 'Inter_500Medium' 
          }} 
          className="text-lg font-bold mb-3"
        >
          Lembretes Ativos
        </Text>

        {lembretesDefault.map((lembrete) => (
          <View 
            key={lembrete.id}
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.rosaMedio,
              borderWidth: 1
            }}
            className="rounded-xl p-4 mb-3 flex-row items-center"
          >
            <View 
              style={{ backgroundColor: colors.rosaSuper }} 
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
            >
              {lembrete.icone}
            </View>
            
            <View className="flex-1">
              <Text 
                style={{ 
                  color: colors.text,
                  fontFamily: 'Inter_500Medium' 
                }} 
                className="font-bold text-base mb-1"
              >
                {lembrete.tipo}
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_400Regular' 
                }} 
                className="text-xs"
              >
                {lembrete.descricao}
              </Text>
            </View>
            
            <Switch 
              value={true}
              trackColor={{ false: '#D1D5DB', true: colors.rosaMedio }}
              thumbColor={colors.headerBg}
            />
          </View>
        ))}

        {/* Botão Adicionar Lembrete */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.rosaMedio,
            borderWidth: 2,
            borderStyle: 'dashed'
          }}
          className="rounded-xl p-4 items-center flex-row justify-center mb-4"
        >
          <Plus size={20} color={colors.headerBg} />
          <Text 
            style={{ 
              color: colors.headerBg,
              fontFamily: 'Inter_500Medium' 
            }} 
            className="font-bold ml-2"
          >
            Criar Lembrete Personalizado
          </Text>
        </TouchableOpacity>

        {/* Recomendações Inteligentes */}
        <Text 
          style={{ 
            color: colors.rosaEscuro,
            fontFamily: 'Inter_500Medium' 
          }} 
          className="text-lg font-bold mb-3 mt-4"
        >
          Recomendações Inteligentes
        </Text>

        <View 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.rosaMedio,
            borderWidth: 1
          }}
          className="rounded-xl p-4 mb-3"
        >
          <View className="flex-row items-start mb-3">
            <View 
              style={{ backgroundColor: colors.rosaSuper }} 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Car size={20} color={colors.rosaInteso} />
            </View>
            <View className="flex-1">
              <Text 
                style={{ 
                  color: colors.text,
                  fontFamily: 'Inter_500Medium' 
                }} 
                className="font-bold mb-1"
              >
                Baseado no seu histórico
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_400Regular' 
                }} 
                className="text-sm"
              >
                Você costuma fazer troca de óleo a cada 4 meses. Recomendamos agendar para a próxima semana.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.rosaSuper }}
            className="py-2 px-4 rounded-lg self-start"
          >
            <Text 
              style={{ 
                color: colors.rosaInteso,
                fontFamily: 'Inter_500Medium' 
              }} 
              className="font-bold text-xs"
            >
              Ver detalhes
            </Text>
          </TouchableOpacity>
        </View>

        {/* TODO Card */}
        <View 
          style={{ 
            backgroundColor: colors.surfaceTint,
            borderColor: colors.rosaMedio,
            borderWidth: 1
          }}
          className="rounded-xl p-4 mb-6"
        >
          <Text 
            style={{ 
              color: colors.rosaInteso,
              fontFamily: 'Inter_500Medium' 
            }} 
            className="font-bold mb-2"
          >
            Em Breve
          </Text>
          <Text 
            style={{ 
              color: colors.textLight,
              fontFamily: 'Inter_400Regular' 
            }} 
            className="text-xs leading-5"
          >
            • Push notifications com ações rápidas{'\n'}
            • IA baseada no manual do seu carro{'\n'}
            • Previsão de serviços com Machine Learning{'\n'}
            • Integração com calendário{'\n'}
            • Lembrete por localização (ao passar perto de oficina)
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
