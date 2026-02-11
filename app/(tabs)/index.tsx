import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Car, ChevronRight, Instagram, MapPin, Search, Shield, Sparkles, TrendingUp, UserCircle, Wrench } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, Linking, Modal, Pressable, ScrollView, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { SearchModal } from '../../components/SearchModal';
import { Button, Card, GlamText, Screen } from '../../components/ui';
import { colors } from '../../src/theme/colors';
import { headerIconWrap, sectionHeaderAccent, spacing } from '../../src/theme/design-patterns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80;

const dicasGlam = [
  { id: 1, categoria: 'Manutenção', frequencia: 'A cada 15 dias', titulo: 'Calibragem dos Pneus', descricao: 'Pneus murchos aumentam o consumo de combustível em até 20% e desgastam mais rápido. Verifique a pressão a cada 15 dias.', facilidade: 'Fácil' },
  { id: 2, categoria: 'Economia', frequencia: 'Mensalmente', titulo: 'Troca de Óleo no Prazo', descricao: 'Óleo velho deixa o motor sujo e consome mais combustível. Troque a cada 5.000 km ou 6 meses, o que vier primeiro.', facilidade: 'Simples' },
  { id: 3, categoria: 'Segurança', frequencia: 'Semanalmente', titulo: 'Verifique os Fluidos', descricao: 'Água do radiador, óleo do motor e fluido de freio são essenciais. Verifique semanalmente e evite problemas sérios.', facilidade: 'Muito fácil' },
  { id: 4, categoria: 'Economia', frequencia: 'A cada 30 mil km', titulo: 'Alinhamento e Balanceamento', descricao: 'Alinhar e balancear os pneus evita desgaste irregular e vibração. Recomendado a cada 30 mil km ou após troca de pneus.', facilidade: 'Simples' },
  { id: 5, categoria: 'Segurança', frequencia: 'Anualmente', titulo: 'Revisão dos Freios', descricao: 'Pastilhas e discos de freio devem ser inspecionados anualmente. Sinais de alerta: ruído ao frear, pedal mole ou tremidão.', facilidade: 'Profissional' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expandedDicaId, setExpandedDicaId] = useState<number | null>(null);
  const [activeDicaIndex, setActiveDicaIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  const [lastMaintenance, setLastMaintenance] = useState<any>(null);
  const [nextRevisionDate, setNextRevisionDate] = useState<string>('---');
  const dicasScrollRef = useRef<ScrollView | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: veiculoData, error: veiculoError } = await supabase.from('veiculo').select('*').limit(1).single();
      if (!veiculoError || veiculoError.code === 'PGRST116') setVehicle(veiculoData);

      const { data: manutencaoData, error: manutencaoError } = await supabase
        .from('manutencoes')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      if (!manutencaoError || manutencaoError.code === 'PGRST116') {
        setLastMaintenance(manutencaoData);
        if (manutencaoData?.data) setNextRevisionDate('Em 6 meses');
      } else setLastMaintenance(null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void loadDashboard(); }, [loadDashboard]));

  return (
    <Screen
      refreshing={loading}
      onRefresh={loadDashboard}
      contentContainerStyle={{ paddingBottom: spacing.screenPaddingBottom + 64 }}
    >
      {/* Header – identidade de marca */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sectionGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.push('/profile')} style={[headerIconWrap]}>
            <UserCircle size={22} color={colors.iconOnAccent} />
          </Pressable>
          <View>
            <GlamText variant="caption" color="textTertiary">Olá, motorista</GlamText>
            <GlamText variant="titleLg" color="text">{vehicle ? vehicle.modelo : 'Seu Carro'}</GlamText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setSearchVisible(true)} style={[headerIconWrap]}>
            <Search size={22} color={colors.iconOnAccent} />
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={[headerIconWrap]}>
            <Bell size={22} color={colors.iconOnAccent} />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
          </Pressable>
        </View>
      </View>

      {/* Único bloco em destaque: próximo alerta */}
      <Card variant="principal" onPress={() => router.push('/notifications')} style={{ marginBottom: spacing.sectionGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color={colors.iconOnAccent} />
            </View>
            <GlamText variant="label" color="iconOnAccent">Próximo alerta</GlamText>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <GlamText variant="caption" color="iconOnAccent">{lastMaintenance ? 'Ativo' : 'Configure'}</GlamText>
          </View>
        </View>
        {lastMaintenance ? (
          <>
            <GlamText variant="title" color="iconOnAccent" style={{ marginBottom: 6 }}>Revisão dos 10.000 km</GlamText>
            <GlamText variant="bodySmall" color="iconOnAccent" style={{ opacity: 0.9, marginBottom: 2 }}>Baseado no serviço de {lastMaintenance.data}</GlamText>
            <GlamText variant="bodyXs" color="iconOnAccent" style={{ opacity: 0.9, marginBottom: 14 }}>Faltam ~500 km ou {nextRevisionDate}</GlamText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button variant="onAccent" label="Já fiz" onPress={() => router.push('/maintenance-new')} style={{ flex: 1 }} />
              <Button variant="secondaryAccent" label="Agendar" onPress={() => router.push('/(tabs)/workshops')} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <>
            <GlamText variant="body" color="iconOnAccent" style={{ opacity: 0.9, marginBottom: 6 }}>Nenhum registro encontrado</GlamText>
            <GlamText variant="titleSm" color="iconOnAccent" style={{ marginBottom: 14 }}>Configure seus lembretes</GlamText>
            <Button variant="secondaryAccent" label="Ver lembretes" onPress={() => router.push('/notifications')} />
          </>
        )}
      </Card>

      {/* Central de IAs – Leninha + Verificador de laudos */}
      <View style={[sectionHeaderAccent, { marginBottom: spacing.sectionGap, paddingBottom: 4 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Sparkles size={22} color={colors.iconOnAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <GlamText variant="titleSm" color="iconOnAccent">Central de IAs</GlamText>
            <GlamText variant="bodyXs" color="iconOnAccent" style={{ opacity: 0.9 }}>Leninha e verificador de laudos</GlamText>
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => router.push('/ia-module')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Sparkles size={20} color={colors.iconOnAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <GlamText variant="titleSm" color="iconOnAccent">Leninha</GlamText>
              <GlamText variant="bodyXs" color="iconOnAccent" style={{ opacity: 0.9 }}>Chat, perguntas e dúvidas sobre seu carro</GlamText>
            </View>
            <ChevronRight size={20} color={colors.iconOnAccent} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/verificador-laudos')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Shield size={20} color={colors.iconOnAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <GlamText variant="titleSm" color="iconOnAccent">Verificador de laudos</GlamText>
              <GlamText variant="bodyXs" color="iconOnAccent" style={{ opacity: 0.9 }}>Análise inteligente do laudo</GlamText>
            </View>
            <ChevronRight size={20} color={colors.iconOnAccent} />
          </Pressable>
        </View>
      </View>

      {/* Atalhos – surface branca, contraste por plano */}
      <View style={{ marginBottom: spacing.sectionGap }}>
        <GlamText variant="label" color="textTertiary" style={{ marginBottom: 12 }}>Acesso rápido</GlamText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/vehicle')}
            style={{ flex: 1, paddingVertical: 18, paddingHorizontal: 18, backgroundColor: colors.surface, borderRadius: 16 }}
          >
            <Car size={22} color={colors.accent} style={{ marginBottom: 8 }} />
            <GlamText variant="caption" color="textTertiary">Veículo</GlamText>
            <GlamText variant="titleSm" color="text" numberOfLines={1} style={{ marginTop: 2 }}>{vehicle ? vehicle.modelo : 'Cadastrar'}</GlamText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/workshops')}
            style={{ flex: 1, paddingVertical: 18, paddingHorizontal: 18, backgroundColor: colors.surface, borderRadius: 16 }}
          >
            <MapPin size={22} color={colors.accent} style={{ marginBottom: 8 }} />
            <GlamText variant="caption" color="textTertiary">Oficinas</GlamText>
            <GlamText variant="titleSm" color="text" style={{ marginTop: 2 }}>Rede Glam</GlamText>
          </Pressable>
        </View>
      </View>

      {/* Dicas da Glam – header accent, carrossel surface */}
      <View style={{ marginBottom: spacing.sectionGap }}>
        <View style={[sectionHeaderAccent, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }]}>
          <GlamText variant="title" color="iconOnAccent">Dicas da Glam</GlamText>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <GlamText variant="caption" color="iconOnAccent">{dicasGlam.length} dicas</GlamText>
          </View>
        </View>
        <ScrollView
          ref={dicasScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: 24, gap: 16 }}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / (CARD_WIDTH + 16));
            if (index !== activeDicaIndex) setActiveDicaIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {dicasGlam.map((item, index) => {
            const isExpanded = expandedDicaId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setExpandedDicaId(isExpanded ? null : item.id)}
                style={{ width: CARD_WIDTH }}
              >
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <GlamText variant="titleSm" color="text" style={{ marginRight: 8 }}>{item.id}</GlamText>
                    <GlamText variant="titleSm" color="text" numberOfLines={1} style={{ flex: 1 }}>{item.titulo}</GlamText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    <View style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <GlamText variant="caption" color="textSecondary">{item.frequencia}</GlamText>
                    </View>
                    <View style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <GlamText variant="caption" color="textSecondary">{item.facilidade}</GlamText>
                    </View>
                  </View>
                  <GlamText variant="bodySmall" color="textSecondary" numberOfLines={isExpanded ? undefined : 2} style={{ marginBottom: 8 }}>{item.descricao}</GlamText>
                  <GlamText variant="label" color="accent">{isExpanded ? 'Ver menos' : 'Ver detalhes'}</GlamText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 }}>
          {dicasGlam.map((_, i) => (
            <View key={i} style={{ width: i === activeDicaIndex ? 14 : 6, height: 6, borderRadius: 3, backgroundColor: i === activeDicaIndex ? colors.accent : colors.border }} />
          ))}
        </View>
      </View>

      {/* Redes – surface branca, ícones accent */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, marginBottom: 40, backgroundColor: colors.surface, borderRadius: 16 }}>
        <View>
          <GlamText variant="titleSm" color="text">Siga a Glam</GlamText>
          <GlamText variant="caption" color="textTertiary">Mais dicas e novidades</GlamText>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => setModalVisible(true)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Instagram size={22} color={colors.iconOnAccent} />
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://tiktok.com/@glamoficina')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color={colors.iconOnAccent} />
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setModalVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 28, width: '90%', maxWidth: 360 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <GlamText variant="title" color="text">Siga a Glam</GlamText>
              <GlamText variant="bodySmall" color="textTertiary" style={{ marginTop: 4 }}>Escolha qual perfil seguir</GlamText>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable onPress={() => { Linking.openURL('https://instagram.com/oficinaglam.br'); setModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: colors.accentSoft }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Instagram size={20} color={colors.iconOnAccent} /></View>
                <View style={{ flex: 1 }}>
                  <GlamText variant="titleSm" color="text">Oficina Glam</GlamText>
                  <GlamText variant="caption" color="textTertiary">@oficinaglam.br</GlamText>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>
              <Pressable onPress={() => { Linking.openURL('https://instagram.com/japurapneus.br'); setModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: colors.accentSoft }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Instagram size={20} color={colors.iconOnAccent} /></View>
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
