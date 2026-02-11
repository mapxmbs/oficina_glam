/**
 * Modal de pesquisa global – localizar no app (unidades, ajuda, IA, meu carro, serviços, etc.)
 * Adaptável iOS e Android.
 */

import { useRouter } from 'expo-router';
import {
  Car,
  ChevronRight,
  FileText,
  HelpCircle,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

export type SearchItem = {
  id: string;
  label: string;
  subtitle?: string;
  route: string;
  icon: React.ReactNode;
  category: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  { id: '1', label: 'Unidades e oficinas', subtitle: 'Encontrar lojas Glam', route: '/(tabs)/workshops', icon: <MapPin size={20} color={colors.accent} />, category: 'Localização' },
  { id: '2', label: 'Chat com Leninha', subtitle: 'IA da Oficina Glam', route: '/ia-module', icon: <MessageCircle size={20} color={colors.accent} />, category: 'IA' },
  { id: '3', label: 'Verificador de laudos', subtitle: 'Análise inteligente', route: '/verificador-laudos', icon: <FileText size={20} color={colors.accent} />, category: 'IA' },
  { id: '4', label: 'Meu carro', subtitle: 'Dados e documentos', route: '/(tabs)/vehicle', icon: <Car size={20} color={colors.accent} />, category: 'Veículo' },
  { id: '5', label: 'Combustível', subtitle: 'Abastecimentos', route: '/(tabs)/fuel', icon: <Sparkles size={20} color={colors.accent} />, category: 'Serviços' },
  { id: '6', label: 'Histórico de manutenção', subtitle: 'Serviços realizados', route: '/(tabs)/maintenance', icon: <Wrench size={20} color={colors.accent} />, category: 'Serviços' },
  { id: '7', label: 'Documentos', subtitle: 'Documentos do veículo', route: '/(tabs)/vehicle', icon: <FileText size={20} color={colors.accent} />, category: 'Veículo' },
  { id: '8', label: 'Notificações', subtitle: 'Alertas e lembretes', route: '/notifications', icon: <MessageCircle size={20} color={colors.accent} />, category: 'Ajuda' },
  { id: '9', label: 'Ajuda e suporte', subtitle: 'Central de suporte', route: '/profile', icon: <HelpCircle size={20} color={colors.accent} />, category: 'Ajuda' },
];

const categories = [...new Set(SEARCH_ITEMS.map((i) => i.category))];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SearchModal({ visible, onClose }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS;

  const handleSelect = useCallback(
    (item: SearchItem) => {
      onClose();
      setQuery('');
      router.push(item.route as any);
    },
    [onClose, router]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 20),
          }}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: Platform.OS === 'ios' ? 14 : 12,
              }}
            >
              <Search size={22} color={colors.textTertiary} style={{ marginRight: 12 }} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Pesquisar unidades, ajuda, IA, meu carro..."
                placeholderTextColor={colors.textTertiary}
                style={{
                  flex: 1,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  color: colors.text,
                  padding: 0,
                }}
                autoFocus
              />
            </View>
          </View>
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((cat) => {
              const items = filtered.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <View key={cat} style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 12,
                      color: colors.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 10,
                      marginHorizontal: 24,
                    }}
                  >
                    {cat}
                  </Text>
                  {items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 24,
                        backgroundColor: pressed ? colors.background : 'transparent',
                      })}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.accentSoft,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        {item.icon}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 16,
                            color: colors.text,
                          }}
                        >
                          {item.label}
                        </Text>
                        {item.subtitle && (
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 13,
                              color: colors.textTertiary,
                              marginTop: 2,
                            }}
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                      <ChevronRight size={20} color={colors.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
