import { useRouter } from 'expo-router';
import { FileCheck, MessageCircle } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrilhoIcon, ChavesIcon } from '../components/icons';
import { colors } from '../src/theme/colors';

export default function IAModuleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 8 }}
          >
            <Text style={{ color: colors.headerBg, fontFamily: 'Inter-Regular' }} className="text-base">Voltar</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.rosaClaro, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <BrilhoIcon size={24} color={colors.iconPrimary} />
            </View>
            <View>
              <Text style={{ color: colors.rosaEscuro, fontFamily: 'LoveloBlack', textTransform: 'uppercase' }} className="text-xl font-bold">
                Assistente Glam
              </Text>
              <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-sm">
                Verificador, Leninha e dúvidas
              </Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.rosaMedio, borderRadius: 16, padding: 4, marginBottom: 16 }}>
          <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-xs px-2 py-1">
            Escolha uma opção abaixo. Em breve: respostas com IA usando o manual do seu carro e histórico.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/verificador-laudos')}
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 2,
            borderColor: colors.headerBg,
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.8}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.headerBg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <FileCheck size={26} color={colors.iconOnAccent} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.rosaEscuro, fontFamily: 'MontserratAlternates-Medium' }} className="text-lg font-bold">
              Verificador de Laudos
            </Text>
            <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-sm mt-1">
              Analise orçamentos e laudos antes de autorizar serviços
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ai/manual-chat')}
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.rosaMedio,
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.rosaClaro, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <MessageCircle size={26} color={colors.iconPrimary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.rosaEscuro, fontFamily: 'MontserratAlternates-Medium' }} className="text-lg font-bold">
              Leninha
            </Text>
            <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-sm mt-1">
              Assistente IA da Oficina Glam – tire dúvidas sobre o seu carro
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ai/manual-chat')}
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.rosaMedio,
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.rosaClaro, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <ChavesIcon size={26} color={colors.iconPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.rosaEscuro, fontFamily: 'MontserratAlternates-Medium' }} className="text-lg font-bold">
              Dúvidas sobre orçamentos
            </Text>
            <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular' }} className="text-sm mt-1">
              Manual do carro e histórico para orientar em serviços mecânicos
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
