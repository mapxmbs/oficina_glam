import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Car, FileCheck, Instagram, MapPin, Shield, Sparkles, TrendingUp, UserCircle, Wrench, X } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Linking, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
// o arquivo existe em src/theme/colors.ts
import { colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80; // Largura do card de dica (com padding)

// DICAS DA GLAM - 3 dicas rotativas
const dicasGlam = [
  {
    id: 1,
    categoria: 'MANUTENÇÃO',
    frequencia: 'A CADA 15 DIAS',
    titulo: 'Calibragem dos Pneus',
    descricao: 'Pneus murchos aumentam o consumo de combustível em até 20% e desgastam mais rápido. Verifique a pressão a cada 15 dias e economize! 💚',
    facilidade: 'Fácil de fazer',
    icone: '🛞'
  },
  {
    id: 2,
    categoria: 'ECONOMIA',
    frequencia: 'MENSALMENTE',
    titulo: 'Troca de Óleo no Prazo',
    descricao: 'Óleo velho deixa o motor sujo e consome mais combustível. Troque a cada 5.000km ou 6 meses, o que vier primeiro! 🛢️',
    facilidade: 'Simples',
    icone: '💧'
  },
  {
    id: 3,
    categoria: 'SEGURANÇA',
    frequencia: 'SEMANALMENTE',
    titulo: 'Verifique os Fluidos',
    descricao: 'Água do radiador, óleo do motor e fluido de freio são essenciais. Verifique semanalmente e evite problemas sérios! ⚠️',
    facilidade: 'Muito fácil',
    icone: '🔧'
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [currentDicaIndex, setCurrentDicaIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para dados reais
  const [vehicle, setVehicle] = useState<any>(null);
  const [lastMaintenance, setLastMaintenance] = useState<any>(null);
  const [nextRevisionDate, setNextRevisionDate] = useState<string>('---');

  async function loadDashboard() {
    setLoading(true);
    try {
        // 1. Buscar Veículo Principal
        const { data: veiculoData, error: veiculoError } = await supabase
            .from('veiculo')
            .select('*')
            .limit(1)
            .single();

        if (veiculoError && veiculoError.code !== 'PGRST116') {
            console.error("Erro ao buscar veículo:", veiculoError);
        } else {
            setVehicle(veiculoData);
        }

        // 2. Buscar Última Manutenção
        const { data: manutencaoData, error: manutencaoError } = await supabase
            .from('manutencoes')
            .select('*')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (manutencaoError && manutencaoError.code !== 'PGRST116') {
             setLastMaintenance(null);
        } else {
             setLastMaintenance(manutencaoData);
             if (manutencaoData && manutencaoData.data) {
                setNextRevisionDate("Em 6 meses"); 
             }
        }

    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        refreshControl={
            <RefreshControl 
                refreshing={loading} 
                onRefresh={loadDashboard} 
                colors={[colors.primary]} 
                tintColor={colors.primary}
            />
        }
      >
        
        {/* 1. CABEÇALHO (Perfil + Notificação) */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-3">
            {/* Botão Perfil */}
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              style={{ backgroundColor: colors.surface, borderColor: colors.rosaMedio, borderWidth: 1 }}
              className="p-2 rounded-full shadow-sm"
            >
              <UserCircle size={24} color={colors.rosaInteso} />
            </TouchableOpacity>

            <View>
              <Text style={{ color: colors.textLight, fontSize: 14, fontWeight: '500', fontFamily: 'Inter-Regular' }}>Olá, motorista do</Text>
              <Text style={{ color: colors.rosaEscuro, fontSize: 24, fontWeight: 'bold', fontFamily: 'LoveloBlack', textTransform: 'uppercase' }}>
                {vehicle ? `${vehicle.modelo} ✨` : 'Seu Carro ✨'}
              </Text>
            </View>
          </View>
          
          {/* Botão Notificações */}
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={{ backgroundColor: colors.surface, borderColor: colors.rosaMedio, borderWidth: 1 }}
            className="p-2 rounded-full shadow-sm"
          >
            <Bell size={24} color={colors.headerBg} />
            <View style={{ backgroundColor: colors.danger }} className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        {/* 2. CARD DESTAQUE CLICÁVEL - PRÓXIMA REVISÃO */}
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push('/notifications')}
            style={{ 
                backgroundColor: colors.headerBg,
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8 
            }}
            className="rounded-3xl p-6 mb-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View style={{ backgroundColor: colors.rosaClaro, padding: 8, borderRadius: 12 }}>
                  <Wrench color={colors.rosaEscuro} size={20} />
              </View>
              <Text style={{ fontFamily: 'LoveloBlack', textTransform: 'uppercase' }} className="text-white font-bold text-lg ml-3">🔔 Próximo Alerta</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} className="px-3 py-1 rounded-full">
              <Text style={{ fontFamily: 'MontserratAlternates-Medium' }} className="text-white text-xs font-bold">
                {lastMaintenance ? 'ATIVO' : 'CONFIGURE'}
              </Text>
            </View>
          </View>
          
          {lastMaintenance ? (
            <>
              <Text style={{ fontFamily: 'MontserratAlternates-Medium' }} className="text-white text-2xl font-bold mb-2">
                Revisão dos 10.000 km
              </Text>
              <Text style={{ color: colors.rosaSuper, fontFamily: 'Inter-Regular' }} className="text-base mb-1">
                Baseado no serviço de {lastMaintenance.data}
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular' }} className="text-white opacity-90 text-sm mb-4">
                ⚡ Faltam aproximadamente 500 km ou {nextRevisionDate}
              </Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/maintenance-new');
                  }}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} 
                  className="flex-1 py-3 rounded-xl items-center"
                >
                  <Text style={{ fontFamily: 'MontserratAlternates-Medium' }} className="text-white font-bold">✓ Já fiz</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/(tabs)/workshops');
                  }}
                  style={{ backgroundColor: 'white' }} 
                  className="flex-1 py-3 rounded-xl items-center"
                >
                  <Text style={{ color: colors.headerBg, fontFamily: 'MontserratAlternates-Medium' }} className="font-bold">Agendar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
             <>
              <Text style={{ color: colors.rosaSuper, fontFamily: 'Inter-Regular' }} className="text-base mb-1">Nenhum registro encontrado</Text>
              <Text style={{ fontFamily: 'MontserratAlternates-Medium' }} className="text-white text-xl font-bold mb-4">Configure seus lembretes</Text>
              
              <View className="bg-white rounded-xl p-3 items-center">
                <Text style={{ color: colors.headerBg, fontFamily: 'LoveloBlack', textTransform: 'uppercase' }} className="font-bold">Ver Lembretes</Text>
              </View>
             </>
          )}
        </TouchableOpacity>

        {/* 2.5 CARD IA ASSISTENTE - DISCRETO E ESTRATÉGICO */}
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push('/ai/manual-chat')}
            style={{ 
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.rosaMedio,
            }}
            className="rounded-2xl p-4 mb-6 flex-row items-center"
        >
          <View 
            style={{ backgroundColor: colors.rosaClaro }} 
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
          >
            <Sparkles size={20} color="white" />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-base"
              >
                🤖 Assistente IA
              </Text>
              <View 
                style={{ backgroundColor: colors.rosaMedio }} 
                className="ml-2 px-2 py-0.5 rounded-full"
              >
                <Text 
                  style={{ fontFamily: 'Inter-Regular' }} 
                  className="text-white text-xs"
                >
                  em breve
                </Text>
              </View>
            </View>
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter-Regular' 
              }} 
              className="text-xs"
            >
              Tire dúvidas sobre o manual do seu carro
            </Text>
          </View>
          
          <View className="items-center">
            <Text 
              style={{ color: colors.headerBg, fontFamily: 'Inter-Regular' }} 
              className="text-xs"
            >
              Conhecer ›
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2.6 CARD VERIFICADOR DE LAUDOS - ANTI-GOLPE 🛡️ */}
        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push('/verificador-laudos')}
            style={{ 
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.headerBg,
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4
            }}
            className="rounded-2xl p-5 mb-6"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View 
              style={{ 
                backgroundColor: colors.headerBg,
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4
              }}
            >
              <Shield size={24} color="white" />
            </View>
            
            <View 
              style={{ 
                backgroundColor: colors.danger,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12
              }}
            >
              <Text 
                style={{ fontFamily: 'MontserratAlternates-Medium' }} 
                className="text-white text-xs font-bold"
              >
                🚨 NOVO
              </Text>
            </View>
          </View>
          
          <Text 
            style={{ 
              color: colors.rosaEscuro,
              fontFamily: 'LoveloBlack',
              textTransform: 'uppercase',
              fontSize: 18
            }} 
            className="font-bold mb-2"
          >
            Verificador de Laudos
          </Text>
          
          <Text 
            style={{ 
              color: colors.text,
              fontFamily: 'Inter-Regular',
              lineHeight: 20
            }} 
            className="text-sm mb-3"
          >
            Recebeu um orçamento suspeito? Nossa IA analisa o laudo e te protege de golpes! 🛡️✨
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <FileCheck size={16} color={colors.success} />
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular',
                  marginLeft: 6
                }} 
                className="text-xs"
              >
                Análise inteligente com IA
              </Text>
            </View>
            
            <View 
              style={{ 
                backgroundColor: colors.headerBg,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20
              }}
            >
              <Text 
                style={{ fontFamily: 'MontserratAlternates-Medium' }} 
                className="text-white font-bold text-sm"
              >
                Analisar →
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. GRID DE ATALHOS */}
        <View className="flex-row justify-between mb-6">
          
          {/* Card Meus Documentos */}
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/vehicle')}
            style={{ 
                backgroundColor: colors.surface, 
                borderColor: colors.rosaMedio, borderWidth: 1,
                shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
            }}
            className="w-[48%] p-4 rounded-3xl"
          >
            <View style={{ backgroundColor: colors.rosaClaro }} className="w-10 h-10 rounded-full items-center justify-center mb-3">
              <Car size={20} color="white" />
            </View>
            <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-xs font-medium uppercase" numberOfLines={1}>Veículo</Text>
            <Text style={{ color: colors.text, fontFamily: 'MontserratAlternates-Medium' }} className="text-lg font-bold mt-1" numberOfLines={1}>
                {vehicle ? vehicle.modelo : 'Cadastrar'}
            </Text>
            <Text style={{ color: colors.rosaEscuro, fontFamily: 'Inter-Regular' }} className="text-xs mt-1 font-bold" numberOfLines={1}>Ver documentos</Text>
          </TouchableOpacity>

          {/* Card Rede Glam */}
          <TouchableOpacity 
             onPress={() => router.push('/(tabs)/workshops')}
             style={{ 
                backgroundColor: colors.surface, 
                borderColor: colors.rosaMedio, borderWidth: 1,
                shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
            }}
             className="w-[48%] p-4 rounded-3xl"
          >
            <View style={{ backgroundColor: colors.rosaClaro }} className="w-10 h-10 rounded-full items-center justify-center mb-3">
              <MapPin size={20} color="white" />
            </View>
            <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-xs font-medium uppercase" numberOfLines={1}>Oficinas</Text>
            <Text style={{ color: colors.text, fontFamily: 'MontserratAlternates-Medium' }} className="text-lg font-bold mt-1" numberOfLines={1}>Rede Glam</Text>
            <Text style={{ color: colors.rosaEscuro, fontFamily: 'Inter-Regular' }} className="text-xs mt-1 font-bold" numberOfLines={1}>Encontre ajuda</Text>
          </TouchableOpacity>
        </View>

        {/* 4. DICA DA GLAM - CAROUSEL DESLIZÁVEL */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <View className="flex-row items-center">
              <Text className="text-4xl mr-2">💡</Text>
              <View>
                <Text 
                  style={{ fontFamily: 'LoveloBlack', textTransform: 'uppercase', color: colors.rosaEscuro }} 
                  className="text-xl font-bold"
                >
                  Dica da Glam
                </Text>
                <Text 
                  style={{ fontFamily: 'Inter-Regular', color: colors.textLight }} 
                  className="text-xs"
                >
                  Deslize para ver mais →
                </Text>
              </View>
            </View>
            <View 
              style={{ backgroundColor: colors.rosaSuper, borderWidth: 1, borderColor: colors.rosaMedio }}
              className="px-3 py-1 rounded-full"
            >
              <Text 
                style={{ fontFamily: 'MontserratAlternates-Medium' }} 
                className="text-white text-xs font-bold"
              >
                {currentDicaIndex + 1}/3
              </Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={dicasGlam}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
              setCurrentDicaIndex(index);
            }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  // Aqui pode abrir modal com detalhes ou navegar para tela de dicas
                  console.log('Dica clicada:', item.titulo);
                }}
                style={{ 
                  width: CARD_WIDTH,
                  marginHorizontal: 10,
                  backgroundColor: colors.rosaClaro,
                  shadowColor: colors.rosaInteso,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6
                }}
                className="rounded-3xl p-6 relative overflow-hidden"
              >
                {/* Background decorativo */}
                <View 
                  style={{ backgroundColor: colors.rosaMedio, opacity: 0.3 }}
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
                />
                <View 
                  style={{ backgroundColor: colors.rosaMedio, opacity: 0.2 }} 
                  className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full"
                />

                <View className="flex-row items-center mb-4 relative z-10">
                  <View 
                    style={{ backgroundColor: colors.rosaEscuro }} 
                    className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  >
                    <Text className="text-4xl">{item.icone}</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ fontFamily: 'LoveloBlack', textTransform: 'uppercase', color: colors.rosaEscuro }} 
                      className="text-xl font-bold"
                    >
                      Dica #{item.id}
                    </Text>
                    <Text 
                      style={{ fontFamily: 'Inter-Regular', color: colors.textLight }} 
                      className="text-xs mt-1"
                    >
                      Toque para ver mais detalhes
                    </Text>
                  </View>
                </View>

                <View 
                  style={{ backgroundColor: 'rgba(255,255,255,0.95)' }} 
                  className="rounded-2xl p-5 relative z-10"
                >
                  <View className="flex-row items-start mb-3">
                    <View 
                      style={{ backgroundColor: colors.rosaClaro }} 
                      className="px-3 py-1 rounded-full mr-2"
                    >
                      <Text 
                        style={{ 
                          color: "white",
                          fontFamily: 'MontserratAlternates-Medium' 
                        }} 
                        className="text-xs font-bold"
                      >
                        {item.categoria}
                      </Text>
                    </View>
                    <View 
                      style={{ backgroundColor: colors.rosaClaro }} 
                      className="px-3 py-1 rounded-full"
                    >
                      <Text 
                        style={{ 
                          color: "white",
                          fontFamily: 'MontserratAlternates-Medium' 
                        }} 
                        className="text-xs font-bold"
                      >
                        {item.frequencia}
                      </Text>
                    </View>
                  </View>

                  <Text 
                    style={{ 
                      color: colors.rosaEscuro,
                      fontFamily: 'MontserratAlternates-Medium' 
                    }} 
                    className="font-bold text-xl mb-2"
                  >
                    {item.titulo}
                  </Text>
                  
                  <Text 
                    style={{ 
                      color: colors.text,
                      fontFamily: 'Inter-Regular',
                      lineHeight: 20
                    }} 
                    className="text-sm mb-4"
                  >
                    {item.descricao}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View 
                      style={{ backgroundColor: colors.rosaClaro }} 
                      className="px-3 py-1.5 rounded-lg"
                    >
                      <Text 
                        style={{ 
                          color: "white",
                          fontFamily: 'MontserratAlternates-Medium' 
                        }} 
                        className="text-xs font-bold"
                      >
                        ✓ {item.facilidade}
                      </Text>
                    </View>
                    
                    <Text 
                      style={{ 
                        color: colors.headerBg,
                        fontFamily: 'MontserratAlternates-Medium' 
                      }} 
                      className="text-sm font-bold"
                    >
                      Ver detalhes ›
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Indicadores de página */}
          <View className="flex-row justify-center mt-4 gap-2">
            {dicasGlam.map((_, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: currentDicaIndex === index ? 'white' : 'rgba(255,255,255,0.3)',
                  width: currentDicaIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4
                }}
              />
            ))}
          </View>
        </View>

        {/* 5. REDES SOCIAIS - SEÇÃO ESTRATÉGICA E DISCRETA */}
        <View 
          style={{ 
            backgroundColor: colors.rosaClaro,
            borderColor: colors.rosaMedio
          }}
          className="p-4 rounded-2xl border mb-8"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text 
                style={{ 
                  fontFamily: 'MontserratAlternates-Medium',
                  color: colors.rosaEscuro
                }} 
                className="text-sm font-bold mb-1"
              >
                Siga a Glam nas redes 💕
              </Text>
              <Text 
                style={{ 
                  fontFamily: 'Inter-Regular',
                  color: colors.textLight
                }} 
                className="text-xs"
              >
                Mais dicas e novidades
              </Text>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ 
                  backgroundColor: colors.rosaEscuro,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Instagram size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => Linking.openURL('https://tiktok.com/@glamoficina')}
                style={{ 
                  backgroundColor: colors.rosaEscuro,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <TrendingUp size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Modal de Redes Sociais */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            style={{ backgroundColor: colors.background }} 
            className="w-11/12 max-w-md rounded-3xl p-6 relative"
          >
            {/* Botão Fechar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <X size={24} color={colors.textLight} />
            </TouchableOpacity>

            {/* Título */}
            <View className="items-center mb-6">
              <Instagram size={48} color={colors.rosaEscuro} />
              <Text 
                style={{ 
                  fontFamily: 'LoveloBlack',
                  textTransform: 'uppercase',
                  color: colors.rosaEscuro
                }} 
                className="text-2xl mt-3"
              >
                Siga a Glam
              </Text>
              <Text 
                style={{ 
                  fontFamily: 'Inter-Regular',
                  color: colors.textLight
                }} 
                className="text-sm mt-1 text-center"
              >
                Escolha qual perfil você quer seguir
              </Text>
            </View>

            {/* Botões de Instagram */}
            <View className="gap-3">
              {/* Oficina Glam */}
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://instagram.com/oficinaglam.br');
                  setModalVisible(false);
                }}
                style={{ 
                  backgroundColor: colors.rosaClaro,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }}
                className="rounded-2xl p-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View 
                    style={{ backgroundColor: colors.rosaEscuro }} 
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  >
                    <Instagram size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ 
                        fontFamily: 'MontserratAlternates-Medium',
                        color: colors.rosaEscuro
                      }} 
                      className="text-base font-semibold"
                    >
                      Oficina Glam
                    </Text>
                    <Text 
                      style={{ 
                        fontFamily: 'Inter-Regular',
                        color: colors.textLight
                      }} 
                      className="text-sm"
                    >
                      @oficinaglam.br
                    </Text>
                  </View>
                  <Sparkles size={20} color={colors.rosaEscuro} />
                </View>
              </TouchableOpacity>

              {/* Japurá Pneus */}
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://instagram.com/japurapneus.br');
                  setModalVisible(false);
                }}
                style={{ 
                  backgroundColor: colors.rosaClaro,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }}
                className="rounded-2xl p-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View 
                    style={{ backgroundColor: colors.rosaEscuro }} 
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  >
                    <Instagram size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ 
                        fontFamily: 'MontserratAlternates-Medium',
                        color: colors.rosaEscuro
                      }} 
                      className="text-base font-semibold"
                    >
                      Japurá Pneus
                    </Text>
                    <Text 
                      style={{ 
                        fontFamily: 'Inter-Regular',
                        color: colors.textLight
                      }} 
                      className="text-sm"
                    >
                      @japurapneus.br
                    </Text>
                  </View>
                  <Car size={20} color={colors.rosaInteso} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Botão Cancelar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-4 p-3 items-center"
              activeOpacity={0.7}
            >
              <Text 
                style={{ 
                  fontFamily: 'Inter-Regular',
                  color: colors.textLight
                }} 
                className="text-sm"
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}