import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { Car, Edit2, FileText, Save } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableDropdown from '../../components/searchable-dropdown';
import { supabase } from '../../lib/supabase';
import { fetchCores, fetchMarcas, fetchModelosByMarca } from '../../lib/marcas-modelos-cores';
import { MARCAS } from '../../lib/car-data';
import { colors } from '../../src/theme/colors';
import { cardContent, cardShadow, headerMinimal, spacing } from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

const PHOTO_HEIGHT = 230;

export default function VehicleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [vehicle, setVehicle] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [versao, setVersao] = useState('');
  const [cor, setCor] = useState('');
  const [apelido, setApelido] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<'marca' | 'modelo' | 'cor' | null>(null);
  const [marcasList, setMarcasList] = useState<string[]>([...MARCAS]);
  const [coresList, setCoresList] = useState<string[]>([]);
  const [modelosList, setModelosList] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    fetchMarcas().then(setMarcasList);
    fetchCores().then(setCoresList);
  }, []));

  useEffect(() => {
    if (marca) fetchModelosByMarca(marca).then(setModelosList);
    else setModelosList([]);
  }, [marca]);

  async function fetchData() {
    setLoading(true);
    try {
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

        const { data: docData } = await supabase
          .from('documentos')
          .select('*')
          .eq('vehicle_id', carData.id);

        setDocumentos(docData || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  async function uploadFile(tipo: 'FOTO_CARRO' | 'CNH' | 'CRLV' | 'OUTROS') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: tipo === 'FOTO_CARRO',
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setUploading(true);
    try {
      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${tipo}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(filePath);

      if (tipo === 'FOTO_CARRO') {
        await supabase.from('veiculo').update({ foto_url: publicUrl }).eq('id', vehicle.id);
        Alert.alert('Sucesso', 'Foto do carro atualizada!');
      } else {
        await supabase.from('documentos').insert({
          vehicle_id: vehicle.id,
          tipo: tipo,
          foto_url: publicUrl,
          titulo: tipo,
        });
        Alert.alert('Sucesso', `Documento ${tipo} enviado!`);
      }

      fetchData();
    } catch (error: any) {
      Alert.alert('Erro no Upload', error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    const dadosToSave = {
      marca,
      modelo,
      placa,
      ano: parseInt(ano) || null,
      versao,
      cor,
      apelido: apelido || null,
    };

    try {
      if (vehicle?.id) {
        await supabase.from('veiculo').update(dadosToSave).eq('id', vehicle.id);
      } else {
        const { data } = await supabase.from('veiculo').insert(dadosToSave).select('id').single();
        if (data) setVehicle({ ...vehicle, id: data.id });
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar dados.');
    } finally {
      setLoading(false);
    }
  }

  const hasDoc = (tipo: string) => documentos.find((d) => d.tipo === tipo);
  const carDisplayName = apelido || modelo || marca || 'Meu Carro';

  const inputStyle = {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: 6,
    color: colors.text,
    fontFamily: 'Inter_500Medium' as const,
    fontSize: 15,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: 0,
          paddingBottom: spacing.screenPaddingBottom + spacing.tabBarBottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header minimalista – nome + placa + ícone editar */}
        <View
          style={[
            headerMinimal,
            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
          ]}
        >
          <View>
            <Text style={[typography.screenTitle, { color: colors.text }]}>
              {carDisplayName}
            </Text>
            <Text style={[typography.screenSubtitle, { color: colors.textTertiary, marginTop: 4 }]}>
              {placa ? `Placa ${placa}` : 'Adicione os dados do veículo'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderWidth: 1,
              borderColor: 'rgba(139, 41, 66, 0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {isEditing ? (
              <Save size={22} color={colors.accent} />
            ) : (
              <Edit2 size={22} color={colors.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* Foto do veículo – card premium com sombra leve */}
        <TouchableOpacity
          onPress={() => router.push('/vehicle-photo')}
          activeOpacity={0.95}
          style={{
            width: '100%',
            height: PHOTO_HEIGHT,
            borderRadius: 24,
            marginBottom: spacing.blockGap,
            overflow: 'hidden',
            ...cardShadow,
          }}
        >
          {vehicle?.foto_url ? (
            <Image
              source={{ uri: vehicle.foto_url }}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: colors.surfaceSoft,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surfaceSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Car size={36} color={colors.textTertiary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 10,
                }}
              >
                Toque para adicionar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Identificação – bloco branco elegante */}
        <View style={[cardContent, { marginBottom: spacing.blockGap }]}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Marca</Text>
              {isEditing ? (
                <>
                  <SearchableDropdown value={marca} onSelect={setMarca} options={marcasList} placeholder="Buscar marca..." searchPlaceholder="Buscar marca..." visible={dropdownOpen === 'marca'} onClose={() => setDropdownOpen(null)} />
                  <TouchableOpacity onPress={() => setDropdownOpen('marca')} style={inputStyle}>
                    <Text style={{ color: marca ? colors.text : colors.textTertiary }}>{marca || 'Selecionar'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{marca || '—'}</Text>
              )}
            </View>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Modelo</Text>
              {isEditing ? (
                <>
                  <SearchableDropdown value={modelo} onSelect={setModelo} options={modelosList} placeholder="Buscar modelo..." searchPlaceholder="Buscar modelo..." visible={dropdownOpen === 'modelo'} onClose={() => setDropdownOpen(null)} />
                  <TouchableOpacity onPress={() => marca && setDropdownOpen('modelo')} disabled={!marca} style={[inputStyle, !marca && { backgroundColor: colors.surfaceTint }]}>
                    <Text style={{ color: modelo ? colors.text : colors.textTertiary }}>{modelo || 'Selecionar'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{modelo || '—'}</Text>
              )}
            </View>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Placa</Text>
              {isEditing ? (
                <TextInput value={placa} onChangeText={setPlaca} placeholder="ABC-1234" placeholderTextColor={colors.textTertiary} autoCapitalize="characters" style={inputStyle} />
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{placa || '—'}</Text>
              )}
            </View>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Ano</Text>
              {isEditing ? (
                <TextInput value={ano} onChangeText={setAno} placeholder="2024" placeholderTextColor={colors.textTertiary} keyboardType="numeric" maxLength={4} style={inputStyle} />
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{ano || '—'}</Text>
              )}
            </View>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Versão</Text>
              {isEditing ? (
                <TextInput value={versao} onChangeText={setVersao} placeholder="Ex: 1.0 Turbo" placeholderTextColor={colors.textTertiary} style={inputStyle} />
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{versao || '—'}</Text>
              )}
            </View>
            <View style={{ width: '50%', paddingHorizontal: 6, marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Cor</Text>
              {isEditing ? (
                <>
                  <SearchableDropdown value={cor} onSelect={setCor} options={coresList} placeholder="Buscar cor..." searchPlaceholder="Buscar cor..." visible={dropdownOpen === 'cor'} onClose={() => setDropdownOpen(null)} />
                  <TouchableOpacity onPress={() => setDropdownOpen('cor')} style={inputStyle}>
                    <Text style={{ color: cor ? colors.text : colors.textTertiary }}>{cor || 'Selecionar'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{cor || '—'}</Text>
              )}
            </View>
            <View style={{ width: '100%', paddingHorizontal: 6 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Apelido (opcional)</Text>
              {isEditing ? (
                <TextInput value={apelido} onChangeText={setApelido} placeholder="Ex: Meu Fusquinha" placeholderTextColor={colors.textTertiary} style={inputStyle} />
              ) : (
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>{apelido || '—'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Documentos – lista simples com divisor sutil */}
        <View style={[cardContent]}>
          <TouchableOpacity
            onPress={() => vehicle?.id && uploadFile('CNH')}
            disabled={uploading || !vehicle?.id}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }}
          >
            <FileText size={20} color={colors.accent} strokeWidth={2} style={{ marginRight: 14 }} />
            <Text style={{ flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>CNH</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textTertiary }}>{hasDoc('CNH') ? 'Enviado' : 'Pendente'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => vehicle?.id && uploadFile('CRLV')}
            disabled={uploading || !vehicle?.id}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
          >
            <FileText size={20} color={colors.accent} strokeWidth={2} style={{ marginRight: 14 }} />
            <Text style={{ flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.text }}>CRLV</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textTertiary }}>{hasDoc('CRLV') ? 'Enviado' : 'Pendente'}</Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: colors.accent,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
              marginTop: spacing.blockGap,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 15, marginLeft: 8 }}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
