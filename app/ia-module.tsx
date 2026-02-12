import { useRouter } from 'expo-router';
import { ChevronRight, FileCheck, MessageCircle } from 'lucide-react-native';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrilhoIcon, ChavesIcon } from '../components/icons';
import { colors } from '../src/theme/colors';
import { sectionPlaneTint } from '../src/theme/design-patterns';
import { typography } from '../src/theme/typography';

export default function IAModuleScreen() {
  const router = useRouter();

  const items = [
    {
      id: 'verificador',
      icon: <FileCheck size={24} color={colors.iconOnAccent} strokeWidth={2} />,
      iconBg: colors.accent,
      title: 'Verificador de Laudos',
      subtitle: 'Analise orçamentos e laudos antes de autorizar serviços',
      onPress: () => router.push('/verificador-laudos'),
    },
    {
      id: 'leninha',
      icon: <MessageCircle size={24} color={colors.iconPrimary} strokeWidth={2} />,
      iconBg: colors.accentSoft,
      title: 'Leninha',
      subtitle: 'Assistente IA – tire dúvidas sobre o seu carro',
      onPress: () => router.push('/ai/manual-chat'),
    },
    {
      id: 'duvidas',
      icon: <ChavesIcon size={24} color={colors.iconPrimary} />,
      iconBg: colors.accentSoft,
      title: 'Dúvidas sobre orçamentos',
      subtitle: 'Manual do carro e histórico para orientar em serviços mecânicos',
      onPress: () => router.push('/ai/manual-chat'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header – neutro, fundo claro, título escuro */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 0 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 8 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 15 }}>Voltar</Text>
          </TouchableOpacity>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <BrilhoIcon size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.screenTitle, { color: colors.textPrimary, fontSize: 22 }]}>Assistente Leninha</Text>
            <Text style={[typography.screenSubtitle, { color: colors.textSecondary, marginTop: 4 }]}>Verificador, Leninha e dúvidas</Text>
          </View>
        </View>

        {/* Intro – plano surfaceTint, sem card */}
        <View style={[sectionPlaneTint, { borderRadius: 12, marginBottom: 20 }]}>
          <Text style={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            Escolha uma opção abaixo. Em breve: respostas com IA usando o manual do seu carro e histórico.
          </Text>
        </View>

        {/* Lista – plano surfaceTint, linhas com divisores, sem cards brancos */}
        <View style={[sectionPlaneTint, { borderRadius: 12, paddingVertical: 0 }]}>
          {items.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: colors.border,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: item.iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                {item.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>{item.title}</Text>
                <Text style={{ color: colors.textTertiary, fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 }}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
