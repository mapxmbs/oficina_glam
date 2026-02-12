import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Car, Disc, Droplet, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function EditVehicleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Dados Básicos
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [placa, setPlaca] = useState('');
  const [versao, setVersao] = useState('');
  
  // Dados Técnicos (Fidelidade ao PDF pag 5 e 15) [cite: 51, 183]
  const [oleo, setOleo] = useState('');
  const [pneus, setPneus] = useState('');
  const [manualUrl, setManualUrl] = useState(''); // Futuro: Upload de PDF

  // Foto
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  }

  async function handleSave() {
    if (!marca || !modelo || !placa) {
      Alert.alert("Ops!", "Marca, Modelo e Placa são obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      let publicUrl = null;
      if (imageBase64) {
        const fileName = `car_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('arquivos').upload(fileName, decode(imageBase64), { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('arquivos').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      // Salvar com os novos campos técnicos
      const { error: dbError } = await supabase
        .from('veiculo')
        .insert({ 
          marca, modelo, ano, placa, versao, 
          foto_url: publicUrl,
          oleo_recomendado: oleo,
          pressao_pneus: pneus,
          manual_url: manualUrl
        });

      if (dbError) throw dbError;
      Alert.alert("Sucesso!", "Veículo e dados técnicos salvos.");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={[typography.screenTitle, { color: colors.text, marginLeft: 8 }]}>Dados do Veículo</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {/* FOTO */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center border-2 border-gray-200 overflow-hidden">
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <Car size={40} color="#ccc" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-glam-primary p-2 rounded-full border-2 border-white">
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-glam-primary font-bold mt-2">Foto do Carro</Text>
        </View>

        {/* --- DADOS BÁSICOS --- */}
        <Text className="text-gray-900 font-bold mb-3 text-lg">Identificação</Text>
        <View className="mb-4"><Text className="text-gray-500 mb-1 ml-1">Marca</Text><View className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 justify-center"><TextInput value={marca} onChangeText={setMarca} placeholder="Ex: Honda" /></View></View>
        <View className="mb-4"><Text className="text-gray-500 mb-1 ml-1">Modelo</Text><View className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 justify-center"><TextInput value={modelo} onChangeText={setModelo} placeholder="Ex: Fit" /></View></View>
        <View className="flex-row gap-4 mb-4">
            <View className="flex-1"><Text className="text-gray-500 mb-1 ml-1">Ano</Text><View className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 justify-center"><TextInput value={ano} onChangeText={setAno} placeholder="2020" keyboardType="numeric" /></View></View>
            <View className="flex-1"><Text className="text-gray-500 mb-1 ml-1">Placa</Text><View className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 justify-center"><TextInput value={placa} onChangeText={setPlaca} placeholder="ABC-1234" /></View></View>
        </View>

        {/* --- DADOS TÉCNICOS (PDF Pag 5)  --- */}
        <Text className="text-gray-900 font-bold mb-3 mt-4 text-lg">Dados Técnicos (Manual)</Text>
        <Text className="text-gray-400 text-xs mb-4">Esses dados ajudam na hora da manutenção.</Text>

        <View className="mb-4">
            <Text className="text-gray-500 mb-1 ml-1">Óleo Recomendado</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-12">
                <Droplet size={20} color="#F57C00" />
                <TextInput className="flex-1 ml-3" value={oleo} onChangeText={setOleo} placeholder="Ex: 5W-30 Sintético" />
            </View>
        </View>

        <View className="mb-8">
            <Text className="text-gray-500 mb-1 ml-1">Calibragem Pneus (PSI)</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 h-12">
                <Disc size={20} color="#4A4A4A" />
                <TextInput className="flex-1 ml-3" value={pneus} onChangeText={setPneus} placeholder="Ex: 32 Diant / 30 Tras" />
            </View>
        </View>

        <TouchableOpacity onPress={handleSave} disabled={loading} className="bg-glam-primary h-14 rounded-2xl flex-row items-center justify-center shadow-md mb-10">
          {loading ? <ActivityIndicator color="white" /> : <><Save size={20} color="white" /><Text className="text-white font-bold text-lg ml-2">Salvar Tudo</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}