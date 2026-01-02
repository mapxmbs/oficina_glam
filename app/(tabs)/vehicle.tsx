import { decode } from 'base64-arraybuffer'; // Importante para enviar ao Supabase
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { Camera, Car, CheckCircle, Edit2, FileText, Save, Sparkles, UploadCloud } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { colors } from '../../src/theme/colors';

export default function VehicleScreen() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);

  // Form States
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [versao, setVersao] = useState('');
  const [cor, setCor] = useState('');

  // 1. BUSCAR DADOS (Veículo + Documentos)
  async function fetchData() {
    setLoading(true);
    try {
      // Busca Veículo
      const { data: carData } = await supabase.from('veiculo').select('*').limit(1).single();
      
      if (carData) {
        setVehicle(carData);
        setModelo(carData.modelo);
        setPlaca(carData.placa);
        setAno(carData.ano?.toString() || '');
        setVersao(carData.versao || '');
        setCor(carData.cor || '');

        // Busca Documentos desse veículo
        const { data: docData } = await supabase
            .from('documentos')
            .select('*')
            .eq('vehicle_id', carData.id);
        
        setDocumentos(docData || []);
      }
    } catch (err) {
      console.log(err); // Silencioso no MVP
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // 2. LÓGICA DE UPLOAD GENÉRICA
  // TODO - SEGURANÇA FUTURA:
  // - Implementar criptografia em repouso (AES-256) para documentos sensíveis
  // - Adicionar autenticação biométrica (Face ID/Touch ID) antes de acessar CNH e CRLV
  // - Considerar usar Supabase Vault ou AWS KMS para gerenciamento de chaves
  // - Log de acessos aos documentos para auditoria
  async function uploadFile(tipo: 'FOTO_CARRO' | 'CNH' | 'CRLV' | 'OUTROS') {
    // A. Selecionar Imagem ou PDF
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: tipo === 'FOTO_CARRO', // Só permite editar foto do carro
      quality: 0.7, // Comprime um pouco para ser rápido
      base64: true, // Necessário para o Supabase no React Native
    });

    if (result.canceled || !result.assets[0].base64) return;

    setUploading(true);
    try {
        const fileExt = result.assets[0].uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${tipo}/${fileName}`; // Organiza em pastas: FOTO_CARRO/123.jpg

        // B. Enviar para o Bucket 'arquivos'
        const { error: uploadError, data } = await supabase.storage
            .from('arquivos')
            .upload(filePath, decode(result.assets[0].base64), {
                contentType: 'image/jpeg'
            });

        if (uploadError) throw uploadError;

        // C. Pegar URL Pública
        const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(filePath);

        // D. Salvar URL no Banco de Dados
        if (tipo === 'FOTO_CARRO') {
            await supabase.from('veiculo').update({ foto_url: publicUrl }).eq('id', vehicle.id);
            Alert.alert("Sucesso", "Foto do carro atualizada!");
        } else {
            // É documento
            await supabase.from('documentos').insert({
                vehicle_id: vehicle.id,
                tipo: tipo,
                arquivo_url: publicUrl
            });
            Alert.alert("Sucesso", `Documento ${tipo} enviado!`);
        }
        
        // Atualiza tela
        fetchData();

    } catch (error: any) {
        Alert.alert("Erro no Upload", error.message);
    } finally {
        setUploading(false);
    }
  }

  // 3. SALVAR DADOS DE TEXTO
  async function handleSave() {
    // ... (Mantém a lógica de salvar texto que fizemos antes)
    setLoading(true);
    const dadosToSave = { modelo, placa, ano: parseInt(ano) || null, versao, cor };

    try {
      if (vehicle?.id) {
        await supabase.from('veiculo').update(dadosToSave).eq('id', vehicle.id);
      } else {
        await supabase.from('veiculo').insert(dadosToSave);
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar dados.");
    } finally {
      setLoading(false);
    }
  }

  // Helper para saber se já tem documento
  const hasDoc = (tipo: string) => documentos.find(d => d.tipo === tipo);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5 pt-4">
        
        {/* HEADER GLAM COM GRADIENTE */}
        <View 
          style={{ 
            backgroundColor: colors.headerBg,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
          className="p-5 rounded-3xl mb-6 relative overflow-hidden"
        >
          {/* Background decorativo */}
          <View 
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full"
          />
          
          <View className="flex-row justify-between items-center relative z-10">
            <View className="flex-1">
              <Text 
                style={{ 
                  fontFamily: 'LoveloBlack',
                  textTransform: 'uppercase'
                }} 
                className="text-white text-3xl font-bold mb-1"
              >
                Meu Carro
              </Text>
              <Text 
                style={{ fontFamily: 'Inter-Regular' }} 
                className="text-white opacity-90 text-sm"
              >
                {vehicle?.modelo || 'Adicione os dados do seu veículo'} 💖
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              style={{ 
                backgroundColor: isEditing ? colors.success : 'rgba(255,255,255,0.25)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4
              }}
              className="p-4 rounded-full"
            >
              {isEditing ? (
                <Save size={24} color="white" />
              ) : (
                <Edit2 size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- ÁREA DA FOTO DO CARRO COM VISUAL PREMIUM --- */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4
          }}
          className="p-4 rounded-3xl mb-6"
        >
          <View className="flex-row items-center mb-3">
            <View 
              style={{ backgroundColor: colors.rosaClaro }} 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Car size={20} color="white" />
            </View>
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="font-bold text-lg"
            >
              Foto do Veículo
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => uploadFile('FOTO_CARRO')}
            disabled={uploading}
            className="relative"
            activeOpacity={0.9}
          >
            {vehicle?.foto_url ? (
              <Image 
                source={{ uri: vehicle.foto_url }} 
                className="w-full h-48 rounded-2xl bg-gray-200"
                style={{ 
                  width: '100%', 
                  height: 200,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: colors.rosaMedio
                }}
              />
            ) : (
              <View 
                style={{ 
                  backgroundColor: colors.rosaSuper,
                  borderColor: colors.rosaMedio,
                  borderWidth: 2,
                  borderStyle: 'dashed'
                }}
                className="w-full h-48 rounded-2xl items-center justify-center"
              >
                <View 
                  style={{ backgroundColor: colors.rosaClaro }} 
                  className="w-20 h-20 rounded-full items-center justify-center mb-3"
                >
                  <Car size={40} color="white" />
                </View>
                <Text 
                  style={{ 
                    color: colors.rosaInteso,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }} 
                  className="font-bold text-base"
                >
                  Adicionar Foto
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter-Regular' 
                  }} 
                  className="text-sm mt-1"
                >
                  Toque para escolher
                </Text>
              </View>
            )}
            
            {/* Ícone de Câmera sobreposto com estilo DIVA */}
            <View 
              style={{ 
                backgroundColor: colors.headerBg,
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4
              }}
              className="absolute bottom-3 right-3 p-3 rounded-full"
            >
              <Camera size={20} color="white" />
            </View>

            {uploading && (
              <View 
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                className="absolute inset-0 rounded-2xl items-center justify-center"
              >
                <ActivityIndicator size="large" color="white" />
                <Text 
                  style={{ fontFamily: 'Inter-Regular' }}
                  className="text-white mt-2"
                >
                  Enviando...
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* --- DADOS DO CARRO COM VISUAL GLAM --- */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4
          }}
          className="p-5 rounded-3xl mb-6"
        >
          <View className="flex-row items-center mb-5">
            <View 
              style={{ backgroundColor: colors.rosaClaro }} 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Sparkles size={20} color="white" />
            </View>
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="font-bold text-lg"
            >
              Identificação
            </Text>
          </View>

          <View className="gap-4">
            {/* Campo Modelo */}
            <View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Modelo do Veículo
              </Text>
              {isEditing ? (
                <TextInput 
                  value={modelo} 
                  onChangeText={setModelo} 
                  placeholder="Ex: Onix LTZ" 
                  placeholderTextColor={colors.textLight}
                  style={{ 
                    backgroundColor: colors.rosaSuper,
                    borderColor: colors.rosaMedio,
                    color: colors.text,
                    fontFamily: 'Inter-Regular'
                  }}
                  className="p-3 rounded-xl border"
                />
              ) : (
                <View 
                  style={{ backgroundColor: colors.rosaSuper }}
                  className="p-3 rounded-xl"
                >
                  <Text 
                    style={{ 
                      color: colors.text,
                      fontFamily: 'MontserratAlternates-Medium' 
                    }} 
                    className="text-base font-bold"
                  >
                    {vehicle?.modelo || "---"}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Linha 1: Placa e Ano */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }} 
                  className="text-xs uppercase font-bold mb-2"
                >
                  Placa
                </Text>
                {isEditing ? (
                  <TextInput 
                    value={placa} 
                    onChangeText={setPlaca} 
                    placeholder="ABC-1234" 
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="characters" 
                    style={{ 
                      backgroundColor: colors.rosaSuper,
                      borderColor: colors.rosaMedio,
                      color: colors.text,
                      fontFamily: 'Inter-Regular'
                    }}
                    className="p-3 rounded-xl border text-center"
                  />
                ) : (
                  <View 
                    style={{ backgroundColor: colors.rosaClaro }}
                    className="p-3 rounded-xl"
                  >
                    <Text 
                      style={{ fontFamily: 'MontserratAlternates-Medium' }} 
                      className="text-white text-base font-bold text-center"
                    >
                      {vehicle?.placa || "---"}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }} 
                  className="text-xs uppercase font-bold mb-2"
                >
                  Ano
                </Text>
                {isEditing ? (
                  <TextInput 
                    value={ano} 
                    onChangeText={setAno} 
                    placeholder="2024" 
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric" 
                    maxLength={4} 
                    style={{ 
                      backgroundColor: colors.rosaSuper,
                      borderColor: colors.rosaMedio,
                      color: colors.text,
                      fontFamily: 'Inter-Regular'
                    }}
                    className="p-3 rounded-xl border"
                  />
                ) : (
                  <View 
                    style={{ backgroundColor: colors.rosaSuper }}
                    className="p-3 rounded-xl"
                  >
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter-Regular' 
                      }} 
                      className="text-base"
                    >
                      {vehicle?.ano || "---"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Linha 2: Versão e Cor */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }} 
                  className="text-xs uppercase font-bold mb-2"
                >
                  Versão
                </Text>
                {isEditing ? (
                  <TextInput 
                    value={versao} 
                    onChangeText={setVersao} 
                    placeholder="Ex: 1.0 Turbo" 
                    placeholderTextColor={colors.textLight}
                    style={{ 
                      backgroundColor: colors.rosaSuper,
                      borderColor: colors.rosaMedio,
                      color: colors.text,
                      fontFamily: 'Inter-Regular'
                    }}
                    className="p-3 rounded-xl border"
                  />
                ) : (
                  <View 
                    style={{ backgroundColor: colors.rosaSuper }}
                    className="p-3 rounded-xl"
                  >
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter-Regular' 
                      }} 
                      className="text-base"
                    >
                      {vehicle?.versao || "---"}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'MontserratAlternates-Medium' 
                  }} 
                  className="text-xs uppercase font-bold mb-2"
                >
                  Cor
                </Text>
                {isEditing ? (
                  <TextInput 
                    value={cor} 
                    onChangeText={setCor} 
                    placeholder="Ex: Branco" 
                    placeholderTextColor={colors.textLight}
                    style={{ 
                      backgroundColor: colors.rosaSuper,
                      borderColor: colors.rosaMedio,
                      color: colors.text,
                      fontFamily: 'Inter-Regular'
                    }}
                    className="p-3 rounded-xl border"
                  />
                ) : (
                  <View 
                    style={{ backgroundColor: colors.rosaSuper }}
                    className="p-3 rounded-xl"
                  >
                    <Text 
                      style={{ 
                        color: colors.text,
                        fontFamily: 'Inter-Regular' 
                      }} 
                      className="text-base"
                    >
                      {vehicle?.cor || "---"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* --- DOCUMENTOS COM VISUAL PREMIUM E SEGURO --- */}
        <View 
          style={{ 
            backgroundColor: colors.surface,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4
          }}
          className="p-5 rounded-3xl mb-6"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View 
                style={{ backgroundColor: colors.rosaClaro }} 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <FileText size={20} color="white" />
              </View>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-lg"
              >
                Documentos 🔒
              </Text>
            </View>
          </View>

          <View 
            style={{ backgroundColor: colors.rosaSuper }}
            className="p-3 rounded-xl mb-4"
          >
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter-Regular' 
              }} 
              className="text-xs italic"
            >
              ⚠️ Em breve: criptografia e biometria para acessar documentos sensíveis
            </Text>
          </View>
        
          <View className="flex-row gap-4">
            {/* Botão CNH */}
            <TouchableOpacity 
              onPress={() => uploadFile('CNH')}
              disabled={uploading}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: hasDoc('CNH') ? colors.success : colors.surface,
                borderColor: hasDoc('CNH') ? colors.success : colors.rosaMedio,
                shadowColor: hasDoc('CNH') ? colors.success : colors.rosaInteso,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2
              }}
              className="flex-1 p-4 rounded-2xl border-2 items-center"
            >
              {hasDoc('CNH') ? (
                <CheckCircle size={32} color="white" className="mb-2"/>
              ) : (
                <UploadCloud size={32} color={colors.headerBg} className="mb-2"/>
              )}
              <Text 
                style={{ 
                  color: hasDoc('CNH') ? 'white' : colors.text,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold"
              >
                Minha CNH
              </Text>
              <Text 
                style={{ 
                  color: hasDoc('CNH') ? 'rgba(255,255,255,0.9)' : colors.textLight,
                  fontFamily: 'Inter-Regular' 
                }} 
                className="text-xs mt-1 text-center"
              >
                {hasDoc('CNH') ? '✓ Enviado' : 'PDF ou Foto'}
              </Text>
            </TouchableOpacity>

            {/* Botão CRLV */}
            <TouchableOpacity 
              onPress={() => uploadFile('CRLV')}
              disabled={uploading}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: hasDoc('CRLV') ? colors.warning : colors.surface,
                borderColor: hasDoc('CRLV') ? colors.warning : colors.rosaMedio,
                shadowColor: hasDoc('CRLV') ? colors.warning : colors.rosaInteso,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2
              }}
              className="flex-1 p-4 rounded-2xl border-2 items-center"
            >
              {hasDoc('CRLV') ? (
                <CheckCircle size={32} color="white" className="mb-2"/>
              ) : (
                <UploadCloud size={32} color={colors.headerBg} className="mb-2"/>
              )}
              <Text 
                style={{ 
                  color: hasDoc('CRLV') ? 'white' : colors.text,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold"
              >
                Doc. Veículo
              </Text>
              <Text 
                style={{ 
                  color: hasDoc('CRLV') ? 'rgba(255,255,255,0.9)' : colors.textLight,
                  fontFamily: 'Inter-Regular' 
                }} 
                className="text-xs mt-1 text-center"
              >
                {hasDoc('CRLV') ? '✓ CRLV OK' : 'CRLV/DUT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listagem de Arquivos Extras (outros documentos) */}
        {documentos.length > 0 && (
          <View 
            style={{ 
              backgroundColor: colors.surface,
              shadowColor: colors.rosaInteso,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4
            }}
            className="p-5 rounded-3xl mb-8"
          >
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="font-bold text-base mb-4"
            >
              Arquivos Salvos
            </Text>
            {documentos.map(doc => (
              <View 
                key={doc.id} 
                style={{ 
                  backgroundColor: colors.rosaSuper,
                  borderColor: colors.rosaMedio
                }}
                className="flex-row items-center p-4 rounded-xl border mb-2"
              >
                <View 
                  style={{ backgroundColor: colors.rosaClaro }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <FileText size={18} color={colors.headerBg} />
                </View>
                <Text 
                  style={{ 
                    color: colors.text,
                    fontFamily: 'Inter-Regular' 
                  }} 
                  className="flex-1"
                >
                  {doc.tipo}
                </Text>
                <View 
                  style={{ backgroundColor: colors.success }}
                  className="px-3 py-1 rounded-full"
                >
                  <Text 
                    style={{ fontFamily: 'MontserratAlternates-Medium' }}
                    className="text-white text-xs font-bold"
                  >
                    OK
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}