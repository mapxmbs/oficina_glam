import { Bot, Clock, DollarSign, Filter, HelpCircle, Image as ImageIcon, Mail, Map, MapPin, MessageCircle, MessageSquare, Phone, Search, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

// MOCK: Oficinas da Rede Glam
const WORKSHOPS = [
  {
    id: 1,
    name: "Oficina Mecânica da Ana",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    city: "São Paulo",
    uf: "SP",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1000&auto=format&fit=crop",
    services: ["Troca de Óleo", "Freios", "Suspensão"],
    basePrice: "R$ 150",
    whatsapp: "5511999999999",
    phone: "(11) 9999-9999",
    horario: "Seg-Sex: 8h-18h | Sáb: 8h-12h",
    category: "geral"
  },
  {
    id: 2,
    name: "Auto Center Premium",
    address: "Rua Augusta, 500 - Consolação, São Paulo/SP",
    city: "São Paulo",
    uf: "SP",
    rating: 4.5,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1000&auto=format&fit=crop",
    services: ["Alinhamento", "Balanceamento", "Elétrica"],
    basePrice: "R$ 120",
    whatsapp: "5511988888888",
    phone: "(11) 9888-8888",
    horario: "Seg-Sex: 7h-19h",
    category: "especializada"
  },
  {
    id: 3,
    name: "Garage Girls Especializada",
    address: "Rua Oscar Freire, 200 - Jardins, São Paulo/SP",
    city: "São Paulo",
    uf: "SP",
    rating: 5.0,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1597505294881-133d45661d7e?q=80&w=1000&auto=format&fit=crop",
    services: ["Motor", "Câmbio", "Injeção Eletrônica"],
    basePrice: "R$ 200",
    whatsapp: "5511977777777",
    phone: "(11) 9777-7777",
    horario: "Seg-Sex: 8h-17h",
    category: "5estrelas"
  },
  {
    id: 4,
    name: "Oficina da Diva - Rio",
    address: "Av. Atlântica, 3000 - Copacabana, Rio de Janeiro/RJ",
    city: "Rio de Janeiro",
    uf: "RJ",
    rating: 4.8,
    reviews: 256,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1000&auto=format&fit=crop",
    services: ["Troca de Óleo", "Freios", "Ar Condicionado"],
    basePrice: "R$ 180",
    whatsapp: "5521987654321",
    phone: "(21) 9876-5432",
    horario: "Seg-Sáb: 8h-18h",
    category: "geral"
  }
];

export default function WorkshopsScreen() {
  const [filter, setFilter] = useState('todos');
  const [searchCity, setSearchCity] = useState('');
  const [selectedUF, setSelectedUF] = useState('Todos');
  const [showSAC, setShowSAC] = useState(false);
  const [vehicleData, setVehicleData] = useState({ modelo: 'Honda Civic', placa: 'ABC-1234' }); // Mock - virá do banco

  const openWhatsApp = (phone: string, workshopName: string) => {
    const message = encodeURIComponent(
      `Olá! Encontrei sua oficina pelo app Oficina Glam e quero agendar um serviço para meu carro ${vehicleData.modelo} (${vehicleData.placa}). 🚗`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const openSACWhatsApp = () => {
    const message = encodeURIComponent('Olá, equipe Glam! Preciso de ajuda com o app. 💕');
    Linking.openURL(`https://wa.me/551199999999?text=${message}`); // Número SAC Glam (mock)
  };

  // Lógica de Filtragem
  const filteredWorkshops = WORKSHOPS.filter(w => {
    let matchesFilter = true;
    let matchesCity = true;
    let matchesUF = true;

    // Filtro por categoria
    if (filter === '5estrelas') matchesFilter = w.rating === 5.0;
    else if (filter === 'especializada') matchesFilter = w.category === 'especializada';
    else if (filter !== 'todos') matchesFilter = false;

    // Filtro por cidade (busca)
    if (searchCity.trim() !== '') {
      matchesCity = w.city.toLowerCase().includes(searchCity.toLowerCase());
    }

    // Filtro por UF
    if (selectedUF !== 'Todos') {
      matchesUF = w.uf === selectedUF;
    }

    return matchesFilter && matchesCity && matchesUF;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5 pt-4">

        {/* HEADER GLAM COM GRADIENTE */}
        <View 
          style={{ 
            backgroundColor: colors.headerBg,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
          className="p-5 rounded-3xl mb-6 relative overflow-hidden"
        >
          <View 
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full"
          />
          
          <View className="relative z-10">
            <Text 
              style={{ 
                fontFamily: 'LoveloBlack',
                textTransform: 'uppercase'
              }} 
              className="text-white text-3xl font-bold mb-1"
            >
              Rede Glam
            </Text>
            <Text 
              style={{ fontFamily: 'Inter-Regular' }} 
              className="text-white opacity-90 text-sm mb-4"
            >
              Oficinas verificadas e seguras para DIVAs 💅
            </Text>

            {/* Botão SAC Estratégico */}
            <TouchableOpacity
              onPress={() => setShowSAC(true)}
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              className="flex-row items-center justify-center p-3 rounded-xl"
              activeOpacity={0.8}
            >
              <MessageSquare size={18} color="white" />
              <Text 
                style={{ fontFamily: 'MontserratAlternates-Medium' }}
                className="text-white font-bold ml-2"
              >
                SAC Glam - Fale Conosco
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AVISO DE FUNCIONALIDADES FUTURAS */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.rosaMedio
          }}
          className="p-4 rounded-2xl border mb-6"
        >
          <View className="flex-row items-start">
            <Map size={20} color={colors.headerBg} />
            <View className="flex-1 ml-3">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-sm mb-1"
              >
                🗺️ Em breve: Mapa Interativo
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter-Regular' 
                }} 
                className="text-xs"
              >
                Visualize as oficinas no mapa do Brasil e encontre a mais próxima de você!
              </Text>
            </View>
          </View>
        </View>

        {/* FILTROS INTELIGENTES */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4
          }}
          className="p-4 rounded-3xl mb-6"
        >
          <View className="flex-row items-center mb-4">
            <Filter size={20} color={colors.headerBg} />
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="font-bold text-base ml-2"
            >
              Filtros de Busca
            </Text>
          </View>

          {/* Busca por Cidade */}
          <View className="mb-3">
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="text-xs uppercase font-bold mb-2"
            >
              Buscar por Cidade
            </Text>
            <View 
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderColor: colors.rosaMedio
              }}
              className="flex-row items-center px-4 py-3 rounded-xl border"
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
                  fontFamily: 'Inter-Regular'
                }}
              />
            </View>
          </View>

          {/* Filtro por UF */}
          <View className="mb-3">
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="text-xs uppercase font-bold mb-2"
            >
              Estado (UF)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Todos', 'SP', 'RJ', 'MG', 'RS', 'BA'].map((uf) => (
                <TouchableOpacity
                  key={uf}
                  onPress={() => setSelectedUF(uf)}
                  style={{ 
                    backgroundColor: selectedUF === uf ? colors.rosaClaro : colors.surface,
                    borderColor: selectedUF === uf ? colors.rosaClaro : colors.rosaMedio
                  }}
                  className="px-4 py-2 rounded-full mr-2 border"
                >
                  <Text 
                    style={{ 
                      color: selectedUF === uf ? 'white' : colors.text,
                      fontFamily: 'MontserratAlternates-Medium' 
                    }}
                    className="font-bold text-sm"
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
                color: colors.textLight,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="text-xs uppercase font-bold mb-2"
            >
              Categoria
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                onPress={() => setFilter('todos')}
                style={{ 
                  backgroundColor: filter === 'todos' ? colors.rosaClaro : colors.surface,
                  borderColor: filter === 'todos' ? colors.rosaClaro : colors.rosaMedio
                }}
                className="px-4 py-2 rounded-full mr-2 border"
              >
                <Text 
                  style={{ 
                    color: filter === 'todos' ? 'white' : colors.text,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }}
                  className="font-bold text-sm"
                >
                  Todas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFilter('5estrelas')}
                style={{ 
                  backgroundColor: filter === '5estrelas' ? colors.rosaClaro : colors.surface,
                  borderColor: filter === '5estrelas' ? colors.rosaClaro : colors.rosaMedio
                }}
                className="px-4 py-2 rounded-full mr-2 border"
              >
                <Text 
                  style={{ 
                    color: filter === '5estrelas' ? 'white' : colors.text,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }}
                  className="font-bold text-sm"
                >
                  ⭐ 5 Estrelas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setFilter('especializada')}
                style={{ 
                  backgroundColor: filter === 'especializada' ? colors.rosaClaro : colors.surface,
                  borderColor: filter === 'especializada' ? colors.rosaClaro : colors.rosaMedio
                }}
                className="px-4 py-2 rounded-full mr-2 border"
              >
                <Text 
                  style={{ 
                    color: filter === 'especializada' ? 'white' : colors.text,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }}
                  className="font-bold text-sm"
                >
                  Especializadas
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* CONTADOR DE RESULTADOS */}
        <Text 
          style={{ 
            color: colors.textLight,
            fontFamily: 'Inter-Regular' 
          }} 
          className="text-sm mb-4 ml-1"
        >
          {filteredWorkshops.length} oficina{filteredWorkshops.length !== 1 ? 's' : ''} encontrada{filteredWorkshops.length !== 1 ? 's' : ''}
        </Text>

        {/* LISTA DE OFICINAS */}
        {filteredWorkshops.length === 0 ? (
          <View 
            style={{ backgroundColor: colors.surface }}
            className="p-8 rounded-3xl items-center"
          >
            <MapPin size={48} color={colors.rosaMedio} />
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="font-bold text-base mt-4 text-center"
            >
              Nenhuma oficina encontrada
            </Text>
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter-Regular' 
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
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
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
                
                {/* Badge de Avaliação */}
                <View 
                  style={{ backgroundColor: colors.warning }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex-row items-center shadow-lg"
                >
                  <Star size={14} color="white" fill="white" />
                  <Text 
                    style={{ fontFamily: 'MontserratAlternates-Medium' }}
                    className="text-white text-sm font-bold ml-1"
                  >
                    {item.rating}
                  </Text>
                </View>

                {/* Badge "Em Breve: Mais Fotos" */}
                <View 
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full flex-row items-center"
                >
                  <ImageIcon size={12} color="white" />
                  <Text 
                    style={{ fontFamily: 'Inter-Regular' }}
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
                    fontFamily: 'LoveloBlack',
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
                      fontFamily: 'Inter-Regular' 
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
                      fontFamily: 'Inter-Regular' 
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
                      fontFamily: 'MontserratAlternates-Medium' 
                    }} 
                    className="text-sm ml-2 font-bold"
                  >
                    A partir de {item.basePrice}
                  </Text>
                </View>

                {/* Tags de Serviços */}
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
                          fontFamily: 'Inter-Regular' 
                        }} 
                        className="text-xs"
                      >
                        {service}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Avaliações */}
                <View 
                  style={{ backgroundColor: colors.rosaSuper }}
                  className="p-3 rounded-xl mb-4"
                >
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter-Regular' 
                    }} 
                    className="text-xs text-center"
                  >
                    ⭐ {item.reviews} avaliações de DIVAs
                  </Text>
                </View>

                {/* Botões de Ação */}
                <View className="gap-3">
                  {/* Botão Principal: Agendar via WhatsApp */}
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#25D366',
                      shadowColor: '#25D366',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4
                    }}
                    className="flex-row items-center justify-center p-4 rounded-xl"
                    onPress={() => openWhatsApp(item.whatsapp, item.name)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={20} color="white" />
                    <Text 
                      style={{ fontFamily: 'MontserratAlternates-Medium' }}
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
                        fontFamily: 'MontserratAlternates-Medium' 
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
                      fontFamily: 'LoveloBlack',
                      textTransform: 'uppercase' 
                    }} 
                    className="text-xl font-bold"
                  >
                    SAC Glam
                  </Text>
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter-Regular' 
                    }} 
                    className="text-xs"
                  >
                    Como podemos te ajudar? 💕
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSAC(false)}
                style={{ backgroundColor: colors.rosaSuper }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Text style={{ color: colors.rosaInteso }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Canais de Atendimento */}
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'MontserratAlternates-Medium' 
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
                    backgroundColor: '#25D366',
                    shadowColor: '#25D366',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  className="flex-row items-center p-4 rounded-2xl"
                  activeOpacity={0.8}
                >
                  <MessageCircle size={24} color="white" />
                  <View className="flex-1 ml-3">
                    <Text 
                      style={{ fontFamily: 'MontserratAlternates-Medium' }}
                      className="text-white font-bold text-base"
                    >
                      WhatsApp Glam
                    </Text>
                    <Text 
                      style={{ fontFamily: 'Inter-Regular' }}
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
                        fontFamily: 'MontserratAlternates-Medium' 
                      }}
                      className="font-bold text-base"
                    >
                      Chat no App
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter-Regular' 
                      }}
                      className="text-xs"
                    >
                      🚧 Em breve - Chat ao vivo
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
                        fontFamily: 'MontserratAlternates-Medium' 
                      }}
                      className="font-bold text-base"
                    >
                      E-mail
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter-Regular' 
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
                        fontFamily: 'MontserratAlternates-Medium' 
                      }}
                      className="font-bold text-base"
                    >
                      Telefone
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter-Regular' 
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
                  fontFamily: 'MontserratAlternates-Medium' 
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
                        fontFamily: 'MontserratAlternates-Medium' 
                      }}
                      className="font-bold text-base"
                    >
                      FAQ Dinâmica
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter-Regular' 
                      }}
                      className="text-xs"
                    >
                      🚧 Em breve - Perguntas frequentes
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
                        fontFamily: 'MontserratAlternates-Medium' 
                      }}
                      className="font-bold text-base"
                    >
                      Chatbot Glam
                    </Text>
                    <Text 
                      style={{ 
                        color: colors.textLight,
                        fontFamily: 'Inter-Regular' 
                      }}
                      className="text-xs"
                    >
                      🚧 Em breve - IA com base de conhecimento Glam
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
                    fontFamily: 'Inter-Regular' 
                  }}
                  className="text-xs text-center"
                >
                  💡 Estamos trabalhando para trazer mais funcionalidades de atendimento em breve!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}