import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, DollarSign, Gauge, Save, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase'; // Importando nosso banco

export default function AddMaintenanceScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [km, setKm] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('pt-BR'));

  // Função que envia para o Supabase
  async function handleSave() {
    if (!type || !km || !value) {
      Alert.alert("Ops!", "Preencha todos os campos.");
      return;
    }

    setLoading(true);

    // O comando mágico de inserção
    const { error } = await supabase
      .from('manutencoes')
      .insert({
        tipo: type,
        km: Number(km),   // Convertendo texto para número
        valor: Number(value.replace(',', '.')), // Aceita vírgula ou ponto
        data: date
      });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível salvar: " + error.message);
    } else {
      Alert.alert("Sucesso!", "Manutenção registrada.");
      router.back(); // Volta para a tela anterior
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-glam-dark ml-2">Novo Serviço</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        
        <Text className="text-gray-500 mb-6">Preencha os dados do serviço realizado.</Text>

        <View className="mb-5">
          <Text className="text-glam-dark font-bold mb-2 ml-1">O que foi feito?</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <Wrench size={20} color="#E91E63" />
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
            <TextInput 
              className="flex-1 ml-3 text-gray-700 text-base"
              value={date}
              editable={false}
            />
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