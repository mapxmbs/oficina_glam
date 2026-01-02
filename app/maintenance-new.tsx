import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ChevronLeft, Image as ImageIcon, MapPin, Save, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function MaintenanceFormScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados do Formulário
  const [tipo, setTipo] = useState('');
  const [dataService, setDataService] = useState(''); 
  const [km, setKm] = useState('');
  const [valor, setValor] = useState('');
  const [oficina, setOficina] = useState('');
  const [notas, setNotas] = useState('');
  const [fotoNF, setFotoNF] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estado para armazenar o ID do carro real
  const [vehicleId, setVehicleId] = useState<number | null>(null);

  // Lista de oficinas da Rede Glam para autocomplete
  const oficinasGlam = [
    "Oficina Mecânica da Ana - Paulista",
    "Auto Center Premium - Augusta",
    "Glam Motors Express - Faria Lima",
    "Casa do Mecânico - Pinheiros",
    "Speed Service - Vila Madalena",
    "Oficina VIP - Itaim Bibi"
  ];

  const sugestoes = ["Troca de Óleo", "Revisão", "Pneus", "Freios", "Bateria", "Alinhamento", "Balanceamento", "Suspensão"];

  // 1. Ao abrir a tela, descobre qual é o carro do usuário
  useEffect(() => {
    async function getVehicle() {
      const { data, error } = await supabase
        .from('veiculo') // Confirme se o nome da tabela é 'veiculo' ou 'vehicles'
        .select('id')
        .limit(1)
        .single();

      if (data) {
        setVehicleId(data.id);
        console.log("Veículo encontrado ID:", data.id);
      } else {
        console.error("Erro ao buscar veículo:", error);
        Alert.alert("Aviso", "Você precisa cadastrar um carro antes de adicionar manutenções!");
      }
    }
    getVehicle();
  }, []);

  // Função para upload de foto da NF
  async function handlePhotoUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setUploadingPhoto(true);
    try {
      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `NF_${Date.now()}.${fileExt}`;
      const filePath = `notas_fiscais/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(filePath);
      setFotoNF(publicUrl);
      Alert.alert("Sucesso", "Foto da NF anexada!");
    } catch (error: any) {
      Alert.alert("Erro no Upload", error.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  // 2. Função de Salvar Corrigida
  async function handleSave() {
    // Validações básicas
    if (!vehicleId) {
      Alert.alert("Erro", "Nenhum veículo identificado para vincular esta manutenção.");
      return;
    }
    if (!tipo || !valor) {
      Alert.alert("Atenção", "Preencha o Tipo de serviço e o Valor.");
      return;
    }

    setLoading(true);

    try {
        // Formatações para o Banco (Converter texto para número)
        const valorFormatado = parseFloat(valor.replace(',', '.'));
        const kmFormatado = km ? parseInt(km.replace(/\D/g, '')) : null; // Remove pontos/traços se houver

        // DEBUG: Mostra no console o que está sendo enviado
        console.log("Enviando dados:", { 
            vehicle_id: vehicleId, 
            tipo, 
            data: dataService, 
            valor: valorFormatado 
        });

        const { error } = await supabase.from('manutencoes').insert({
            vehicle_id: vehicleId, // <--- Agora usa o ID real recuperado do banco
            tipo,
            data: dataService || new Date().toLocaleDateString('pt-BR'), // Se vazio, usa data de hoje
            km: kmFormatado,
            valor: valorFormatado,
            oficina: oficina || null,
            notas,
            foto_nf_url: fotoNF || null
        });

        if (error) {
            throw error; // Joga para o catch abaixo
        }

        Alert.alert("Sucesso!", "Manutenção registrada.");
        router.back();

    } catch (error: any) {
        console.error("ERRO AO SALVAR:", error.message, error.details);
        Alert.alert("Erro ao Salvar", `O banco recusou: ${error.message}`);
    } finally {
        setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={28} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#333]">Novo Registro</Text>
        </View>

        <ScrollView className="flex-1 px-5 py-6" keyboardShouldPersistTaps="handled">
          
          {/* Tipo */}
          <Text className="text-gray-500 font-medium mb-2">O que foi feito?</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base mb-3 text-[#333]"
            placeholder="Ex: Troca de Óleo"
            value={tipo}
            onChangeText={setTipo}
          />
          
          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-2" style={{maxHeight: 50}}>
            {sugestoes.map((sugestao) => (
              <TouchableOpacity 
                key={sugestao} 
                onPress={() => setTipo(sugestao)}
                className={`px-4 py-2 rounded-full border ${tipo === sugestao ? 'bg-pink-100 border-[#E91E63]' : 'bg-white border-gray-200'}`}
              >
                <Text className={`${tipo === sugestao ? 'text-[#E91E63] font-bold' : 'text-gray-600'}`}>{sugestao}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Data e KM */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-500 font-medium mb-2">Data</Text>
              <TextInput 
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-[#333]"
                placeholder="DD/MM/AAAA"
                value={dataService}
                onChangeText={setDataService}
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

          {/* Oficina Executante */}
          <Text className="text-gray-500 font-medium mb-2">Oficina Executante (Opcional)</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base mb-3 text-[#333]"
            placeholder="Digite ou escolha da Rede Glam"
            value={oficina}
            onChangeText={setOficina}
          />
          
          {/* Sugestões de Oficinas da Rede Glam */}
          {oficina === '' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-2" style={{maxHeight: 50}}>
              {oficinasGlam.map((ofc) => (
                <TouchableOpacity 
                  key={ofc} 
                  onPress={() => setOficina(ofc)}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 flex-row items-center"
                >
                  <MapPin size={14} color="#E91E63" style={{marginRight: 4}} />
                  <Text className="text-gray-600 text-xs">{ofc.split(' - ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Upload de Foto da NF */}
          <Text className="text-gray-500 font-medium mb-2">Nota Fiscal (Opcional)</Text>
          <TouchableOpacity 
            onPress={handlePhotoUpload}
            disabled={uploadingPhoto}
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 items-center justify-center"
            style={{minHeight: 120}}
          >
            {uploadingPhoto ? (
              <ActivityIndicator color="#E91E63" />
            ) : fotoNF ? (
              <View className="relative w-full">
                <Image source={{ uri: fotoNF }} className="w-full h-32 rounded-lg" />
                <TouchableOpacity 
                  onPress={() => setFotoNF(null)}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ImageIcon size={32} color="#9CA3AF" />
                <Text className="text-gray-400 mt-2">Toque para adicionar foto da NF</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Notas */}
          <Text className="text-gray-500 font-medium mb-2">Observações</Text>
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
                className={`bg-[#E91E63] py-4 rounded-xl flex-row justify-center items-center shadow-md ${loading ? 'opacity-70' : ''}`}
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