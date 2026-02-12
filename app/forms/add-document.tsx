import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Camera, ChevronDown, FileText, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableDropdown from '../../components/searchable-dropdown';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { parseBR, toISODate } from '../../lib/dates';
import { getActiveVehicleId } from '../../lib/vehicle';

export default function AddDocumentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Outro');
  const [validadeInput, setValidadeInput] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dropdownTipo, setDropdownTipo] = useState(false);

  // Selecionar Imagem
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  }

  async function handleSave() {
    if (!titulo || !imageUri) {
      Alert.alert("Atenção", "Dê um nome ao documento e anexe uma foto.");
      return;
    }
    const vehicleId = await getActiveVehicleId();
    if (!vehicleId) {
      Alert.alert("Atenção", "Cadastre um veículo em Meu Carro antes de adicionar documentos.");
      return;
    }
    setLoading(true);
    try {
      let publicUrl = null;
      if (imageBase64) {
        const fileName = `doc_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('arquivos')
          .upload(fileName, decode(imageBase64), { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('arquivos').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
      const validadeDate = parseBR(validadeInput);
      const { error: dbError } = await supabase.from('documentos').insert({
        vehicle_id: vehicleId,
        titulo,
        validade: validadeDate ? toISODate(validadeDate) : null,
        foto_url: publicUrl,
        tipo,
      });
      if (dbError) throw dbError;
      Alert.alert("Sucesso", "Documento salvo com segurança.");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={[typography.screenTitle, { color: colors.text, marginLeft: 8 }]}>Novo Documento</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        
        {/* Preview da Imagem */}
        <TouchableOpacity onPress={pickImage} className="w-full h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center mb-6 overflow-hidden">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
          ) : (
            <View className="items-center">
              <Camera size={32} color="#9E9E9E" />
              <Text className="text-gray-400 mt-2 font-medium">Toque para adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Campos */}
        <View className="mb-5">
          <Text className="text-glam-dark font-bold mb-2 ml-1">Tipo de Documento</Text>
          <TouchableOpacity
            onPress={() => setDropdownTipo(true)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 mb-5"
          >
            <Text className={tipo ? 'text-gray-700' : 'text-gray-400'}>{tipo}</Text>
            <ChevronDown size={20} color={colors.accent} />
          </TouchableOpacity>
          <SearchableDropdown
            value={tipo}
            onSelect={setTipo}
            options={['CNH', 'CRLV', 'IPVA', 'Seguro', 'Outro']}
            placeholder="Tipo"
            searchPlaceholder="Buscar…"
            visible={dropdownTipo}
            onClose={() => setDropdownTipo(false)}
          />
        </View>

        <View className="mb-5">
          <Text className="text-glam-dark font-bold mb-2 ml-1">Nome do Documento</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <FileText size={20} color={colors.accent} />
            <TextInput 
              className="flex-1 ml-3 text-gray-700"
              placeholder="Ex: Minha CNH"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-glam-dark font-bold mb-2 ml-1">Validade (Opcional)</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <Calendar size={20} color="#9E9E9E" />
            <TextInput 
              className="flex-1 ml-3 text-gray-700"
              placeholder="DD/MM/AAAA"
              value={validadeInput}
              onChangeText={setValidadeInput}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-glam-primary h-14 rounded-2xl flex-row items-center justify-center shadow-md mb-10"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <>
              <Save size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Salvar Documento</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}