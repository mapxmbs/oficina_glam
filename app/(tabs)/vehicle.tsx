import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { Camera, Car, CheckCircle, Edit2, Eye, FileText, Save, Sparkles, Trash2, UploadCloud } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableDropdown from '../../components/searchable-dropdown';
import { supabase } from '../../lib/supabase';
import { CORES, getModelosByMarca, MARCAS } from '../../lib/car-data';
import { colors } from '../../src/theme/colors';

export default function VehicleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);

  // Form States
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [versao, setVersao] = useState('');
  const [cor, setCor] = useState('');
  const [apelido, setApelido] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<'marca' | 'modelo' | 'cor' | null>(null);

  // 1. BUSCAR DADOS (Veículo + Documentos)
  async function fetchData() {
    setLoading(true);
    try {
      // Busca Veículo
      const { data: carData } = await supabase.from('veiculo').select('*').limit(1).single();
      
      if (carData) {
        setVehicle(carData);
        setMarca(carData.marca || '');
        setModelo(carData.modelo || '');
        setPlaca(carData.placa || '');
        setAno(carData.ano?.toString() || '');
        setVersao(carData.versao || '');
        setCor(carData.cor || '');
        setApelido(carData.apelido || '');

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
    const dadosToSave = { marca, modelo, placa, ano: parseInt(ano) || null, versao, cor, apelido: apelido || null };

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
        
        {/* Header */}
        <View 
          style={{ 
            backgroundColor: colors.accent,
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View className="flex-1">
              <Text 
                style={{ fontFamily: 'Inter_700Bold' }} 
                className="text-white text-2xl font-bold mb-1"
              >
                {apelido || vehicle?.modelo || 'Meu Carro'}
              </Text>
              <Text 
                style={{ fontFamily: 'Inter_400Regular' }} 
                className="text-white opacity-90 text-sm"
              >
                {placa ? `Placa ${placa}` : 'Adicione os dados do seu veículo'}
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

        {/* Foto do veículo */}
        <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 16, marginBottom: 24 }}>
          <View className="flex-row items-center mb-3">
            <View 
              style={{ backgroundColor: colors.accentSoft }} 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Car size={20} color={colors.iconPrimary} />
            </View>
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_600SemiBold' 
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
                style={{ width: '100%', height: 200, borderRadius: 12 }}
              />
            ) : (
              <View style={{ backgroundColor: colors.background, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.accent, borderRadius: 12, width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <View 
                  style={{ backgroundColor: colors.accentSoft }} 
                  className="w-20 h-20 rounded-full items-center justify-center mb-3"
                >
                  <Car size={40} color={colors.iconPrimary} />
                </View>
                <Text 
                  style={{ 
                    color: colors.rosaInteso,
                    fontFamily: 'Inter_600SemiBold' 
                  }} 
                  className="font-bold text-base"
                >
                  Adicionar Foto
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter_400Regular' 
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
                  style={{ fontFamily: 'Inter_400Regular' }}
                  className="text-white mt-2"
                >
                  Enviando...
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dados do carro */}
        <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 16, marginBottom: 24 }}>
          <View className="flex-row items-center mb-5">
            <View 
              style={{ backgroundColor: colors.accentSoft }} 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Sparkles size={20} color={colors.iconPrimary} />
            </View>
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_600SemiBold' 
              }} 
              className="font-bold text-lg"
            >
              Identificação
            </Text>
          </View>

          <View className="gap-4">
            {/* Campo Marca */}
            <View>
              <Text 
                style={{ color: colors.textLight, fontFamily: 'Inter_600SemiBold' }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Marca
              </Text>
              {isEditing ? (
                <SearchableDropdown
                  value={marca}
                  onSelect={setMarca}
                  options={[...MARCAS]}
                  placeholder="Buscar marca..."
                  searchPlaceholder="Buscar marca..."
                  visible={dropdownOpen === 'marca'}
                  onClose={() => setDropdownOpen(null)}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => isEditing && setDropdownOpen('marca')}
                style={{ backgroundColor: colors.rosaSuper, borderColor: colors.rosaMedio, borderWidth: isEditing ? 1 : 0 }}
                className="p-3 rounded-xl"
              >
                <Text style={{ color: colors.text, fontFamily: 'Inter_400Regular' }} className="text-base">
                  {marca || '---'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campo Modelo */}
            <View>
              <Text 
                style={{ color: colors.textLight, fontFamily: 'Inter_600SemiBold' }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Modelo
              </Text>
              {isEditing ? (
                <SearchableDropdown
                  value={modelo}
                  onSelect={setModelo}
                  options={getModelosByMarca(marca)}
                  placeholder="Buscar modelo..."
                  searchPlaceholder="Buscar modelo..."
                  visible={dropdownOpen === 'modelo'}
                  onClose={() => setDropdownOpen(null)}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => isEditing && marca && setDropdownOpen('modelo')}
                style={{ backgroundColor: colors.rosaSuper, borderColor: colors.rosaMedio, borderWidth: isEditing ? 1 : 0 }}
                className="p-3 rounded-xl"
              >
                <Text style={{ color: colors.text, fontFamily: 'Inter_400Regular' }} className="text-base">
                  {modelo || '---'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campo Modelo (fallback se marca não selecionada) - removido, usando dropdown acima */}

            {/* Campo Apelido (opcional) */}
            <View>
              <Text 
                style={{ color: colors.textLight, fontFamily: 'Inter_600SemiBold' }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Apelido do carro (opcional)
              </Text>
              {isEditing ? (
                <TextInput 
                  value={apelido} 
                  onChangeText={setApelido} 
                  placeholder="Ex: Meu Fusquinha" 
                  placeholderTextColor={colors.textLight}
                  style={{ 
                    backgroundColor: colors.rosaSuper,
                    borderColor: colors.rosaMedio,
                    color: colors.text,
                    fontFamily: 'Inter_400Regular'
                  }}
                  className="p-3 rounded-xl border"
                />
              ) : (
                <View 
                  style={{ backgroundColor: colors.rosaSuper }}
                  className="p-3 rounded-xl"
                >
                  <Text 
                    style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }} 
                    className="text-base"
                  >
                    {apelido || '---'}
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
                    fontFamily: 'Inter_600SemiBold' 
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
                      fontFamily: 'Inter_400Regular'
                    }}
                    className="p-3 rounded-xl border text-center"
                  />
                ) : (
                  <View 
                    style={{ backgroundColor: colors.accentSoft }}
                    className="p-3 rounded-xl"
                  >
                    <Text 
                      style={{ color: colors.iconPrimary, fontFamily: 'Inter_600SemiBold' }} 
                      className="text-base font-bold text-center"
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
                    fontFamily: 'Inter_600SemiBold' 
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
                      fontFamily: 'Inter_400Regular'
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
                        fontFamily: 'Inter_400Regular' 
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
                    fontFamily: 'Inter_600SemiBold' 
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
                      fontFamily: 'Inter_400Regular'
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
                        fontFamily: 'Inter_400Regular' 
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
                  style={{ color: colors.textLight, fontFamily: 'Inter_600SemiBold' }} 
                  className="text-xs uppercase font-bold mb-2"
                >
                  Cor
                </Text>
                {isEditing ? (
                  <>
                    <SearchableDropdown
                      value={cor}
                      onSelect={setCor}
                      options={[...CORES]}
                      placeholder="Buscar cor..."
                      searchPlaceholder="Buscar cor..."
                      visible={dropdownOpen === 'cor'}
                      onClose={() => setDropdownOpen(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setDropdownOpen('cor')}
                      style={{ backgroundColor: colors.rosaSuper, borderColor: colors.rosaMedio, borderWidth: 1 }}
                      className="p-3 rounded-xl"
                    >
                      <Text style={{ color: colors.text, fontFamily: 'Inter_400Regular' }} className="text-base">
                        {cor || '---'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                <View style={{ backgroundColor: colors.rosaSuper }} className="p-3 rounded-xl">
                  <Text style={{ color: colors.text, fontFamily: 'Inter_400Regular' }} className="text-base">
                    {vehicle?.cor || "---"}
                  </Text>
                </View>
              )}
              </View>
            </View>
          </View>
        </View>

        {/* Documentos */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <FileText size={20} color={colors.textSecondary} />
            </View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text }}>Documentos</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => uploadFile('CNH')}
              disabled={uploading}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: hasDoc('CNH') ? colors.success : colors.border,
                backgroundColor: hasDoc('CNH') ? `${colors.success}12` : colors.surface,
                alignItems: 'center',
              }}
            >
              {hasDoc('CNH') ? <CheckCircle size={24} color={colors.success} /> : <UploadCloud size={24} color={colors.textSecondary} />}
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: hasDoc('CNH') ? colors.success : colors.text, marginTop: 6 }}>CNH</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{hasDoc('CNH') ? 'Enviado' : 'Enviar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => uploadFile('CRLV')}
              disabled={uploading}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: hasDoc('CRLV') ? colors.success : colors.border,
                backgroundColor: hasDoc('CRLV') ? `${colors.success}12` : colors.surface,
                alignItems: 'center',
              }}
            >
              {hasDoc('CRLV') ? <CheckCircle size={24} color={colors.success} /> : <UploadCloud size={24} color={colors.textSecondary} />}
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: hasDoc('CRLV') ? colors.success : colors.text, marginTop: 6 }}>CRLV</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{hasDoc('CRLV') ? 'Enviado' : 'Enviar'}</Text>
            </TouchableOpacity>
          </View>

          {documentos.length > 0 && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
              {documentos.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => router.push(`/view-document?id=${doc.id}&type=${doc.tipo}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: documentos.indexOf(doc) < documentos.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <FileText size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.text }}>{doc.tipo}</Text>
                  <Eye size={18} color={colors.accent} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Botão Salvar no final da tela */}
        {isEditing && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4
            }}
            className="flex-row items-center justify-center p-4 rounded-2xl mb-10"
          >
            {loading ? (
              <ActivityIndicator color={colors.iconOnAccent} />
            ) : (
              <>
                <Save size={22} color={colors.iconOnAccent} />
                <Text style={{ color: colors.iconOnAccent, fontFamily: 'Inter_600SemiBold' }} className="font-bold text-base ml-2">
                  Salvar alterações
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}