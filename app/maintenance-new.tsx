import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, Save } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableDropdown from '../components/searchable-dropdown';
import { fetchOficinasNomes, OFICINAS_FALLBACK } from '../lib/oficinas-nomes';
import { fetchServicos, SERVICOS_FALLBACK } from '../lib/servicos';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { formatBR, parseBR, toISODate } from '../lib/dates';
import { getActiveVehicleId } from '../lib/vehicle';

export default function MaintenanceFormScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados do Formulário
  const [tipo, setTipo] = useState('');
  const [dateInput, setDateInput] = useState(() => formatBR(new Date())); 
  const [km, setKm] = useState('');
  const [valor, setValor] = useState('');
  const [oficina, setOficina] = useState('');
  const [notas, setNotas] = useState('');
  const [dropdownTipo, setDropdownTipo] = useState(false);
  const [dropdownOficina, setDropdownOficina] = useState(false);
  const [servicosList, setServicosList] = useState<string[]>([...SERVICOS_FALLBACK]);
  const [oficinasList, setOficinasList] = useState<string[]>([...OFICINAS_FALLBACK]);

  useFocusEffect(useCallback(() => {
    fetchServicos().then(setServicosList);
    fetchOficinasNomes().then(setOficinasList);
  }, []));

  async function handleSave() {
    const vehicleId = await getActiveVehicleId();
    if (!vehicleId) {
      Alert.alert("Atenção", "Cadastre um veículo em Meu Carro antes de adicionar manutenções.");
      return;
    }
    if (!tipo || !valor) {
      Alert.alert("Atenção", "Preencha o Tipo de serviço e o Valor.");
      return;
    }
    setLoading(true);
    try {
      const valorFormatado = parseFloat(valor.replace(',', '.'));
      const kmFormatado = km ? parseInt(km.replace(/\D/g, '')) : null;
      const dataFinal = parseBR(dateInput) || new Date();
      const notasCompletas = [oficina, notas].filter(Boolean).join(' | ');
      const { error } = await supabase.from('manutencoes').insert({
        vehicle_id: vehicleId,
        tipo,
        data: toISODate(dataFinal),
        km: kmFormatado,
        valor: valorFormatado,
        notas: notasCompletas || null,
      });
      if (error) throw error;
      Alert.alert("Sucesso!", "Manutenção registrada.");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={28} color="#333" />
          </TouchableOpacity>
          <Text style={[typography.screenTitle, { color: colors.text }]}>Novo Registro</Text>
        </View>

        <ScrollView className="flex-1 px-5 py-6" keyboardShouldPersistTaps="handled">
          
          {/* Tipo - dropdown com busca */}
          <Text className="text-gray-500 font-medium mb-2">O que foi feito?</Text>
          <TouchableOpacity
            onPress={() => setDropdownTipo(true)}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between mb-6"
          >
            <Text className={tipo ? 'text-[#333] text-base' : 'text-gray-400 text-base'}>{tipo || 'Selecionar ou buscar…'}</Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <SearchableDropdown
            value={tipo}
            onSelect={setTipo}
            options={servicosList}
            placeholder="Ex: Troca de Óleo"
            searchPlaceholder="Buscar tipo…"
            visible={dropdownTipo}
            onClose={() => setDropdownTipo(false)}
          />

          {/* Data e KM */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-500 font-medium mb-2">Data</Text>
              <TextInput 
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-[#333]"
                placeholder="DD/MM/AAAA"
                value={dateInput}
                onChangeText={setDateInput}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 font-medium mb-2">KM Atual</Text>
              <TextInput 
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-[#333]"
                placeholder="Ex: 50000"
                keyboardType="numeric"
                value={km}
                onChangeText={setKm}
              />
            </View>
          </View>

          {/* Valor */}
          <Text className="text-gray-500 font-medium mb-2">Valor Total (R$)</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base mb-6 text-[#333]"
            placeholder="0,00"
            keyboardType="numeric"
            value={valor}
            onChangeText={setValor}
          />

          {/* Oficina - dropdown com busca */}
          <Text className="text-gray-500 font-medium mb-2">Oficina Executante (Opcional)</Text>
          <TouchableOpacity
            onPress={() => setDropdownOficina(true)}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between mb-6"
          >
            <Text className={oficina ? 'text-[#333] text-base' : 'text-gray-400 text-base'}>{oficina || 'Selecionar da Rede Glam…'}</Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <SearchableDropdown
            value={oficina}
            onSelect={setOficina}
            options={oficinasList}
            placeholder="Oficina"
            searchPlaceholder="Buscar oficina…"
            visible={dropdownOficina}
            onClose={() => setDropdownOficina(false)}
          />

          {/* Notas (oficina e observações são salvos juntos no campo notas) */}
          <Text className="text-gray-500 font-medium mb-2">Observações / Peças (Opcional)</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base mb-8 text-[#333] h-32"
            placeholder="Detalhes adicionais, peças trocadas..."
            multiline
            textAlignVertical="top"
            value={notas}
            onChangeText={setNotas}
          />

        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View className="p-5 border-t border-gray-100 bg-white">
            <TouchableOpacity 
                onPress={handleSave}
                disabled={loading}
                style={{ backgroundColor: loading ? colors.accentMutedSolid : colors.accent, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
            >
                <Save size={20} color="white" style={{marginRight: 8}} />
                <Text className="text-white font-bold text-lg">
                    {loading ? 'Salvando...' : 'Salvar Manutenção'}
                </Text>
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}