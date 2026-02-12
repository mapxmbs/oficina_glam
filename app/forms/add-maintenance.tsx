import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, DollarSign, Gauge, Save, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { formatBR, toISODate } from '../../lib/dates';
import { getActiveVehicleId } from '../../lib/vehicle';

export default function AddMaintenanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [km, setKm] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  async function handleSave() {
    if (!type || !value) {
      Alert.alert("Ops!", "Preencha tipo e valor.");
      return;
    }
    const vehicleId = await getActiveVehicleId();
    if (!vehicleId) {
      Alert.alert("Atenção", "Cadastre um veículo em Meu Carro antes de adicionar manutenções.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('manutencoes').insert({
      vehicle_id: vehicleId,
      tipo: type,
      km: km ? Number(km.replace(/\D/g, '')) : null,
      valor: Number(value.replace(',', '.')),
      data: toISODate(date),
    });
    setLoading(false);
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso!", "Manutenção registrada.");
      router.back();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={[typography.screenTitle, { color: colors.text, marginLeft: 8 }]}>Novo Serviço</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        
        <Text className="text-gray-500 mb-6">Preencha os dados do serviço realizado.</Text>

        <View className="mb-5">
          <Text className="text-glam-dark font-bold mb-2 ml-1">O que foi feito?</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <Wrench size={20} color={colors.accent} />
            <TextInput 
              className="flex-1 ml-3 text-gray-700 text-base"
              placeholder="Ex: Troca de Óleo"
              value={type}
              onChangeText={setType}
            />
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="mb-5 w-[48%]">
            <Text className="text-glam-dark font-bold mb-2 ml-1">KM Atual</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
              <Gauge size={20} color="#9E9E9E" />
              <TextInput 
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="00000"
                keyboardType="numeric"
                value={km}
                onChangeText={setKm}
              />
            </View>
          </View>

          <View className="mb-5 w-[48%]">
            <Text className="text-glam-dark font-bold mb-2 ml-1">Valor (R$)</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
              <DollarSign size={20} color="#9E9E9E" />
              <TextInput 
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="0.00"
                keyboardType="numeric"
                value={value}
                onChangeText={setValue}
              />
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-glam-dark font-bold mb-2 ml-1">Data</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 opacity-60">
            <Calendar size={20} color="#9E9E9E" />
            <Text className="flex-1 ml-3 text-gray-700 text-base">{formatBR(date)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-glam-primary h-14 rounded-2xl flex-row items-center justify-center shadow-md mb-10"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Salvar Histórico</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}