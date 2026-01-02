import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, Droplet, Gauge, MapPin, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function AddFuelScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Dados do formulário
  const [station, setStation] = useState('');
  const [liters, setLiters] = useState('');
  const [type, setType] = useState('Gasolina'); // Valor padrão
  const [total, setTotal] = useState('');
  const [km, setKm] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('pt-BR'));

  async function handleSave() {
    if (!station || !liters || !total || !km) {
      Alert.alert("Ops!", "Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('abastecimentos')
      .insert({
        posto: station,
        litros: Number(liters.replace(',', '.')),
        tipo: type,
        valor_total: Number(total.replace(',', '.')),
        km: Number(km),
        data: date
      });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso!", "Abastecimento registrado.");
      router.back();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-glam-dark ml-2">Novo Abastecimento</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        
        {/* Posto */}
        <View className="mb-5">
          <Text className="text-glam-dark font-bold mb-2 ml-1">Qual Posto?</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <MapPin size={20} color="#E91E63" />
            <TextInput 
              className="flex-1 ml-3 text-gray-700 text-base"
              placeholder="Ex: Posto Ipiranga"
              value={station}
              onChangeText={setStation}
            />
          </View>
        </View>

        <View className="flex-row justify-between">
          {/* Litros */}
          <View className="mb-5 w-[48%]">
            <Text className="text-glam-dark font-bold mb-2 ml-1">Litros</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
              <Droplet size={20} color="#9E9E9E" />
              <TextInput 
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="00"
                keyboardType="numeric"
                value={liters}
                onChangeText={setLiters}
              />
            </View>
          </View>

          {/* Tipo (Botões simples) */}
          <View className="mb-5 w-[48%]">
             <Text className="text-glam-dark font-bold mb-2 ml-1">Tipo</Text>
             <View className="flex-row h-14 justify-between">
                <TouchableOpacity 
                   onPress={() => setType('Gasolina')}
                   className={`flex-1 items-center justify-center rounded-l-2xl border ${type === 'Gasolina' ? 'bg-glam-light border-glam-primary' : 'bg-gray-50 border-gray-200'}`}
                >
                   <Text className={type === 'Gasolina' ? 'text-glam-primary font-bold' : 'text-gray-400'}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => setType('Etanol')}
                   className={`flex-1 items-center justify-center rounded-r-2xl border-t border-b border-r ${type === 'Etanol' ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200'}`}
                >
                   <Text className={type === 'Etanol' ? 'text-green-700 font-bold' : 'text-gray-400'}>E</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>

        <View className="flex-row justify-between">
           {/* Total Pago */}
           <View className="mb-5 w-[48%]">
            <Text className="text-glam-dark font-bold mb-2 ml-1">Total (R$)</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
              <DollarSign size={20} color="#9E9E9E" />
              <TextInput 
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="0.00"
                keyboardType="numeric"
                value={total}
                onChangeText={setTotal}
              />
            </View>
          </View>

          {/* KM */}
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
        </View>

        <TouchableOpacity 
          className="bg-glam-primary h-14 rounded-2xl flex-row items-center justify-center shadow-md mt-4 mb-10"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
             <>
               <Save size={20} color="white" />
               <Text className="text-white font-bold text-lg ml-2">Salvar Abastecimento</Text>
             </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}