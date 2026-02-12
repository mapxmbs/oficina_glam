import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Bot, Clock, DollarSign, Filter, Heart, HelpCircle, Image as ImageIcon, Mail, Map, MapPin, MessageCircle, MessageSquare, Phone, Search, Star, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';
import { cardContent, chipActive, chipBase, headerMinimal, spacing } from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1000&auto=format&fit=crop';

type WorkshopItem = {
  id: number;
  name: string;
  address: string;
  city: string;
  uf: string;
  rating: number | null;
  reviews?: number;
  image: string;
  services: string[];
  basePrice: string;
  whatsapp: string;
  phone: string;
  horario: string;
  category: string;
};

const FAVORITES_KEY = '@glam_workshop_favorites';
const LAST_USED_KEY = '@glam_last_workshop';

function mapOficinaToWorkshop(raw: any): WorkshopItem {
  const horarioSeg = raw.horario_seg_sex || '';
  const horarioSab = raw.horario_sabado || '';
  const horario = [horarioSeg, horarioSab].filter(Boolean).join(' | ') || 'Consultar';
  const uf = typeof raw.estado === 'string' ? raw.estado.trim() : String(raw.estado || '');
  return {
    id: raw.id,
    name: raw.nome || 'Oficina',
    address: raw.endereco || '',
    city: raw.cidade || '',
    uf: uf.length >= 2 ? uf : uf,
    rating: null,
    image: PLACEHOLDER_IMAGE,
    services: [],
    basePrice: 'Consultar',
    whatsapp: raw.whatsapp || raw.telefone || '',
    phone: raw.telefone || '',
    horario,
    category: raw.tipo || 'loja',
  };
}

export default function WorkshopsScreen() {
  const [filter, setFilter] = useState('todos');
  const [searchCity, setSearchCity] = useState('');
  const [selectedUF, setSelectedUF] = useState('Todos');
  const [showSAC, setShowSAC] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [lastUsedId, setLastUsedId] = useState<number | null>(null);
  const [vehicleData, setVehicleData] = useState({ modelo: 'Honda Civic', placa: 'ABC-1234' });
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  const fetchWorkshops = useCallback(async () => {
    setLoadingWorkshops(true);
    try {
      const { data, error } = await supabase
        .from('oficinas')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (!error && data) {
        setWorkshops(data.map(mapOficinaToWorkshop));
      } else {
        setWorkshops([]);
      }
    } catch (e) {
      console.warn('Erro ao buscar oficinas:', e);
      setWorkshops([]);
    } finally {
      setLoadingWorkshops(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchWorkshops();
  }, [fetchWorkshops]));

  const loadFavorites = useCallback(async () => {
    try {
      const s = await AsyncStorage.getItem(FAVORITES_KEY);
      if (s) setFavorites(JSON.parse(s));
    } catch (_) {}
  }, []);

  const loadLastUsed = useCallback(async () => {
    try {
      const s = await AsyncStorage.getItem(LAST_USED_KEY);
      if (s) setLastUsedId(parseInt(s, 10));
    } catch (_) {}
  }, []);

  useEffect(() => { loadFavorites(); loadLastUsed(); }, [loadFavorites, loadLastUsed]);

  const toggleFavorite = async (id: number) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  const saveLastUsed = async (id: number) => {
    setLastUsedId(id);
    try {
      await AsyncStorage.setItem(LAST_USED_KEY, String(id));
    } catch (_) {}
  };

  const openWhatsApp = (phone: string, workshopName: string, workshopId: number) => {
    saveLastUsed(workshopId);
    const message = encodeURIComponent(
      `Olá! Encontrei sua oficina pelo app Oficina Glam e quero agendar um serviço para meu carro ${vehicleData.modelo} (${vehicleData.placa}).`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const openSACWhatsApp = () => {
    const message = encodeURIComponent('Olá, equipe Glam! Preciso de ajuda com o app.');
    Linking.openURL(`https://wa.me/551199999999?text=${message}`); // Número SAC Glam (mock)
  };

  /** Estados onde existem lojas da rede Glam (derivado dos dados) */
  const availableUFs = useMemo(() => {
    const ufs = [...new Set(workshops.map((w) => w.uf).filter(Boolean))].sort();
    return ['Todos', ...ufs];
  }, [workshops]);

  const filteredWorkshops = workshops.filter(w => {
    let matchesFilter = true;
    let matchesCity = true;
    let matchesUF = true;

    if (filter === 'favoritas') matchesFilter = favorites.includes(w.id);
    else if (filter === '5estrelas') matchesFilter = w.rating === 5.0;
    else if (filter === 'especializada') matchesFilter = w.category === 'especializada';
    else if (filter !== 'todos') matchesFilter = false;

    if (searchCity.trim() !== '') {
      matchesCity = w.city.toLowerCase().includes(searchCity.toLowerCase());
    }

    if (selectedUF !== 'Todos') {
      matchesUF = w.uf === selectedUF;
    }

    return matchesFilter && matchesCity && matchesUF;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingTop: spacing.screenPaddingTop, paddingBottom: spacing.screenPaddingBottom + spacing.tabBarBottom }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header minimalista – padrão das outras abas */}
        <View style={[headerMinimal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={[typography.screenTitle, { color: colors.text }]}>Rede Glam</Text>
            <Text style={[typography.screenSubtitle, { color: colors.textTertiary, marginTop: 4 }]}>
              Oficinas verificadas e seguras
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSAC(true)}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: colors.accent,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
            }}
          >
            <MessageSquare size={18} color={colors.accent} />
            <Text style={{ color: colors.accent, fontFamily: 'Inter_600SemiBold', marginLeft: 6, fontSize: 13 }}>
              SAC
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aviso */}
        <View style={[cardContent, { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.blockGap }]}>
          <Map size={20} color={colors.accent} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.textPrimary, marginBottom: 4 }}>
              Em breve: Mapa e Proximidade
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary }}>
              Mapa interativo e notificação por proximidade (com sua permissão).
            </Text>
          </View>
        </View>

        {/* Filtros – bloco branco elegante */}
        <View style={[cardContent, { marginBottom: spacing.blockGap }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Filter size={20} color={colors.accent} />
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginLeft: 10 }}>
              Filtros
            </Text>
          </View>

          {/* Busca por Cidade */}
          <View style={{ marginBottom: 16 }}>
            <Text 
              style={{ 
                color: colors.textSecondary,
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Buscar por cidade
            </Text>
            <View 
              style={{ 
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Search size={18} color={colors.textLight} />
              <TextInput
                value={searchCity}
                onChangeText={setSearchCity}
                placeholder="Ex: São Paulo, Rio de Janeiro..."
                placeholderTextColor={colors.textLight}
                style={{ 
                  flex: 1,
                  marginLeft: 8,
                  color: colors.text,
                  fontFamily: 'Inter_400Regular'
                }}
              />
            </View>
          </View>

          {/* Filtro por UF – somente estados com lojas Glam */}
          <View style={{ marginBottom: 16 }}>
            <Text 
              style={{ 
                color: colors.textSecondary,
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Estado
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {availableUFs.map((uf: string) => (
                <TouchableOpacity
                  key={uf}
                  onPress={() => setSelectedUF(uf)}
                  style={[selectedUF === uf ? chipActive : chipBase, { marginRight: 8 }]}
                >
                  <Text
                    style={{
                      color: selectedUF === uf ? colors.iconOnAccent : colors.textSecondary,
                      fontFamily: selectedUF === uf ? 'Inter_600SemiBold' : 'Inter_500Medium',
                      fontSize: 13,
                    }}
                  >
                    {uf}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro por Categoria */}
          <View>
            <Text 
              style={{ 
                color: colors.textSecondary,
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Categoria
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity 
                onPress={() => setFilter('todos')}
                style={[filter === 'todos' ? chipActive : chipBase, { marginRight: 8 }]}
              >
                <Text 
                  style={{ color: filter === 'todos' ? colors.iconOnAccent : colors.textSecondary, fontFamily: filter === 'todos' ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13 }}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFilter('favoritas')}
                style={[filter === 'favoritas' ? chipActive : chipBase, { marginRight: 8, flexDirection: 'row', alignItems: 'center' }]}
              >
                <Heart size={14} color={filter === 'favoritas' ? colors.iconOnAccent : colors.text} fill={filter === 'favoritas' ? colors.iconOnAccent : 'transparent'} />
                <Text 
                  style={{ color: filter === 'favoritas' ? colors.iconOnAccent : colors.textSecondary, fontFamily: filter === 'favoritas' ? 'Inter_600SemiBold' : 'Inter_500Medium', marginLeft: 6, fontSize: 13 }}
                >
                  Favoritas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFilter('5estrelas')}
                style={[filter === '5estrelas' ? chipActive : chipBase, { marginRight: 8 }]}
              >
                <Text 
                  style={{ 
                    color: filter === '5estrelas' ? colors.iconOnAccent : colors.textSecondary,
                    fontFamily: filter === '5estrelas' ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    fontSize: 13,
                  }}
                >
                  5 Estrelas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFilter('especializada')}
                style={[filter === 'especializada' ? chipActive : chipBase, { marginRight: 8 }]}
              >
                <Text 
                  style={{ 
                    color: filter === 'especializada' ? colors.iconOnAccent : colors.textSecondary,
                    fontFamily: filter === 'especializada' ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    fontSize: 13,
                  }}
                >
                  Especializadas
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {lastUsedId && workshops.find((w) => w.id === lastUsedId) && (
          <View style={{ backgroundColor: colors.accentSoft, padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={18} color={colors.iconPrimary} />
            <Text style={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 12, marginLeft: 8, flex: 1 }}>
              Última loja usada: {workshops.find((w) => w.id === lastUsedId)?.name}
            </Text>
          </View>
        )}

        {/* CONTADOR DE RESULTADOS */}
        <Text 
          style={{ color: colors.textLight, fontFamily: 'Inter_400Regular' }} 
          className="text-sm mb-4 ml-1"
        >
          {filteredWorkshops.length} oficina{filteredWorkshops.length !== 1 ? 's' : ''} encontrada{filteredWorkshops.length !== 1 ? 's' : ''}
        </Text>

        {/* LISTA DE OFICINAS */}
        {loadingWorkshops ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: colors.textTertiary, fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 12 }}>Carregando oficinas…</Text>
          </View>
        ) : filteredWorkshops.length === 0 ? (
          <View 
            style={{ backgroundColor: colors.surface }}
            className="p-8 rounded-3xl items-center"
          >
            <MapPin size={48} color={colors.rosaMedio} />
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'Inter_600SemiBold' 
              }} 
              className="font-bold text-base mt-4 text-center"
            >
              Nenhuma oficina encontrada
            </Text>
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter_400Regular' 
              }} 
              className="text-sm mt-2 text-center"
            >
              Tente ajustar os filtros de busca
            </Text>
          </View>
        ) : (
          filteredWorkshops.map((item) => (
            <View 
              key={item.id}
              style={{ 
                backgroundColor: colors.surface,
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 4
              }}
              className="rounded-3xl mb-6 overflow-hidden"
            >
              {/* Imagem da Oficina */}
              <View className="relative">
                <Image 
                  source={{ uri: item.image }} 
                  style={{ width: '100%', height: 180 }}
                  resizeMode="cover"
                />
                
                {/* Botão Favoritar */}
                <TouchableOpacity
                  onPress={() => toggleFavorite(item.id)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', width: 36, height: 36, borderRadius: 18, position: 'absolute', top: 12, left: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Heart size={18} color={favorites.includes(item.id) ? colors.accent : colors.textSecondary} fill={favorites.includes(item.id) ? colors.accent : 'transparent'} />
                </TouchableOpacity>

                {item.rating != null && (
                <View 
                  style={{ backgroundColor: colors.warning }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex-row items-center shadow-lg"
                >
                  <Star size={14} color="white" fill="white" />
                  <Text 
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                    className="text-white text-sm font-bold ml-1"
                  >
                    {item.rating}
                  </Text>
                </View>
                )}

                {/* Badge "Em Breve: Mais Fotos" */}
                <View 
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full flex-row items-center"
                >
                  <ImageIcon size={12} color="white" />
                  <Text 
                    style={{ fontFamily: 'Inter_400Regular' }}
                    className="text-white text-xs ml-1"
                  >
                    +3 fotos (em breve)
                  </Text>
                </View>
              </View>

              {/* Informações da Oficina */}
              <View className="p-5">
                <Text 
                  style={{ 
                    color: colors.rosaEscuro,
                    fontFamily: 'Inter_700Bold',
                    textTransform: 'uppercase' 
                  }} 
                  className="text-xl font-bold mb-2"
                >
                  {item.name}
                </Text>
                
                {/* Endereço */}
                <View className="flex-row items-start mb-3">
                  <MapPin size={16} color={colors.rosaMedio} className="mt-0.5" />
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter_400Regular' 
                    }} 
                    className="text-sm ml-2 flex-1"
                  >
                    {item.address}
                  </Text>
                </View>

                {/* Horário */}
                <View className="flex-row items-center mb-3">
                  <Clock size={16} color={colors.rosaMedio} />
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter_400Regular' 
                    }} 
                    className="text-sm ml-2"
                  >
                    {item.horario}
                  </Text>
                </View>

                {/* Preço Base */}
                <View className="flex-row items-center mb-4">
                  <DollarSign size={16} color={colors.success} />
                  <Text 
                    style={{ 
                      color: colors.text,
                      fontFamily: 'Inter_600SemiBold' 
                    }} 
                    className="text-sm ml-2 font-bold"
                  >
                    A partir de {item.basePrice}
                  </Text>
                </View>

                {/* Tags de Serviços */}
                {item.services.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                  {item.services.map((service, index) => (
                    <View 
                      key={index}
                      style={{ backgroundColor: colors.rosaSuper }}
                      className="px-3 py-1.5 rounded-lg mr-2 mb-2"
                    >
                      <Text 
                        style={{ 
                          color: colors.rosaInteso,
                          fontFamily: 'Inter_400Regular' 
                        }} 
                        className="text-xs"
                      >
                        {service}
                      </Text>
                    </View>
                  ))}
                </View>
                )}

                {/* Avaliações */}
                <View 
                  style={{ backgroundColor: colors.rosaSuper }}
                  className="p-3 rounded-xl mb-4"
                >
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter_400Regular' 
                    }} 
                    className="text-xs text-center"
                  >
                    {item.reviews ?? 0} avaliações de DIVAs
                  </Text>
                </View>

                {/* Botões de Ação */}
                <View className="gap-3">
                  {/* Botão Principal: Agendar via WhatsApp */}
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: colors.whatsapp,
                      shadowColor: '#25D366',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4
                    }}
                    className="flex-row items-center justify-center p-4 rounded-xl"
                    onPress={() => openWhatsApp(item.whatsapp, item.name, item.id)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={20} color="white" />
                    <Text 
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                      className="text-white font-bold ml-2 text-base"
                    >
                      Quero Agendar via WhatsApp
                    </Text>
                  </TouchableOpacity>

                  {/* Botão Secundário: Ligar */}
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: colors.rosaMedio,
                      borderWidth: 2
                    }}
                    className="flex-row items-center justify-center p-3 rounded-xl"
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    activeOpacity={0.8}
                  >
                    <Phone size={18} color={colors.headerBg} />
                    <Text 
                      style={{ 
                        color: colors.headerBg,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold ml-2"
                    >
                      {item.phone}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View className="h-10" />
      </ScrollView>

      {/* MODAL SAC GLAM */}
      <Modal
        visible={showSAC}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSAC(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View 
            style={{ 
              backgroundColor: colors.surface,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32
            }}
            className="p-6"
          >
            {/* Header do Modal */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: colors.rosaSuper }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <MessageSquare size={24} color={colors.headerBg} />
                </View>
                <View>
                  <Text 
                    style={{ 
                      color: colors.rosaEscuro,
                      fontFamily: 'Inter_700Bold',
                      textTransform: 'uppercase' 
                    }} 
                    className="text-xl font-bold"
                  >
                    SAC Glam
                  </Text>
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter_400Regular' 
                    }} 
                    className="text-xs"
                  >
                    Como podemos te ajudar?
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSAC(false)}
                style={{ backgroundColor: colors.rosaSuper }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <X size={20} color={colors.accent} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Canais de Atendimento */}
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'Inter_600SemiBold' 
              }} 
              className="font-bold text-base mb-4"
            >
              Canais de Atendimento
            </Text>

            <ScrollView className="max-h-96">
              <View className="gap-3 mb-6">
                {/* WhatsApp (Funcional) */}
                <TouchableOpacity
                  onPress={openSACWhatsApp}
                  style={{ 
                    backgroundColor: colors.whatsapp,
                    shadowColor: '#25D366',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                  activeOpacity={0.8}
                >
                  <MessageCircle size={24} color="white" />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                      className="text-white font-bold text-base"
                    >
                      WhatsApp Glam
                    </Text>
                    <Text 
                      style={{ fontFamily: 'Inter_400Regular' }}
                      className="text-white opacity-90 text-xs"
                    >
                      Atendimento rápido e direto
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Chat no App (Em Breve) */}
                <TouchableOpacity
                  style={{ 
                    backgroundColor: colors.rosaSuper,
                    borderColor: colors.rosaMedio,
                    borderWidth: 2
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                  activeOpacity={0.6}
                  disabled
                >
                  <MessageSquare size={24} color={colors.rosaMedio} />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold text-base"
                    >
                      Chat no App
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }}
                      className="text-xs"
                    >
                      Em breve - Chat ao vivo
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:contato@glamoficina.com.br')}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.rosaMedio,
                    borderWidth: 2
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                  activeOpacity={0.8}
                >
                  <Mail size={24} color={colors.headerBg} />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold text-base"
                    >
                      E-mail
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }}
                      className="text-xs"
                    >
                      contato@glamoficina.com.br
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Telefone */}
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:08007071234')}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.rosaMedio,
                    borderWidth: 2
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                  activeOpacity={0.8}
                >
                  <Phone size={24} color={colors.headerBg} />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold text-base"
                    >
                      Telefone
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }}
                      className="text-xs"
                    >
                      0800 707 1234 (Seg-Sex, 9h-18h)
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* FAQ e Chatbot (Em Breve) */}
              <Text 
                style={{ 
                  color: colors.text,
                  fontFamily: 'Inter_600SemiBold' 
                }} 
                className="font-bold text-base mb-4"
              >
                Autoatendimento
              </Text>

              <View className="gap-3 mb-4">
                {/* FAQ Dinâmica */}
                <View
                  style={{ 
                    backgroundColor: colors.rosaSuper,
                    borderColor: colors.rosaMedio,
                    borderWidth: 2
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                >
                  <HelpCircle size={24} color={colors.rosaMedio} />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold text-base"
                    >
                      FAQ Dinâmica
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }}
                      className="text-xs"
                    >
                      Em breve - Perguntas frequentes
                    </Text>
                  </View>
                </View>

                {/* Chatbot Glam */}
                <View
                  style={{ 
                    backgroundColor: colors.rosaSuper,
                    borderColor: colors.rosaMedio,
                    borderWidth: 2
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                >
                  <Bot size={24} color={colors.rosaMedio} />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter_600SemiBold' 
                      }}
                      className="font-bold text-base"
                    >
                      Chatbot Glam
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter_400Regular' 
                      }}
                      className="text-xs"
                    >
                      Em breve - IA com base de conhecimento Glam
                    </Text>
                  </View>
                </View>
              </View>

              {/* Nota sobre funcionalidades futuras */}
              <View 
                style={{ backgroundColor: colors.rosaSuper }}
                className="p-3 rounded-xl mb-4"
              >
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter_400Regular' 
                  }}
                  className="text-xs text-center"
                >
                  Estamos trabalhando para trazer mais funcionalidades de atendimento em breve.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}