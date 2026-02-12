/**
 * Tela dedicada – visualização e gestão da foto do veículo
 * Premium: Alterar foto | Remover foto. Sem moldura infantil.
 */

import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

export default function VehiclePhotoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadPhoto = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('veiculo').select('foto_url, id').limit(1).single();
      if (data?.foto_url) setFotoUrl(data.foto_url);
      else setFotoUrl(null);
      if (data?.id) setVehicleId(data.id);
      else setVehicleId(null);
    } catch {
      setFotoUrl(null);
      setVehicleId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhoto();
  }, [loadPhoto]);

  async function handleChangePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0].base64) return;

    if (!vehicleId) {
      Alert.alert('Atenção', 'Adicione os dados do veículo na tela Meu Carro primeiro.');
      return;
    }
    setUploading(true);
    try {

      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `FOTO_CARRO/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(result.assets[0].base64), { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(filePath);
      await supabase.from('veiculo').update({ foto_url: publicUrl }).eq('id', vehicleId);

      setFotoUrl(publicUrl);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível alterar a foto.');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    Alert.alert('Remover foto', 'Deseja remover a foto do veículo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          if (!vehicleId) return;
          setUploading(true);
          try {
            await supabase.from('veiculo').update({ foto_url: null }).eq('id', vehicleId);
            setFotoUrl(null);
            router.back();
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a foto.');
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header discreto */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceTint,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={[typography.screenTitle, { flex: 1, color: colors.text, textAlign: 'center', marginRight: 40 }]}>Foto do veículo</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <>
          {/* Área protagonista – imagem ou placeholder */}
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            {fotoUrl ? (
              <Image
                source={{ uri: fotoUrl }}
                style={{
                  width: SCREEN_WIDTH - 40,
                  height: IMAGE_HEIGHT,
                  borderRadius: 12,
                  backgroundColor: colors.surfaceTint,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: SCREEN_WIDTH - 40,
                  height: IMAGE_HEIGHT,
                  borderRadius: 12,
                  backgroundColor: colors.surfaceTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon size={48} color={colors.textTertiary} strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textTertiary, marginTop: 12 }}>
                  Nenhuma foto
                </Text>
              </View>
            )}

            {uploading && (
              <View
                style={{
                  position: 'absolute',
                  top: 24,
                  left: 20,
                  right: 20,
                  height: IMAGE_HEIGHT,
                  borderRadius: 12,
                  backgroundColor: colors.overlayDark,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="large" color="white" />
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'white', marginTop: 12 }}>
                  Enviando...
                </Text>
              </View>
            )}
          </View>

          {/* Ações – espaço e tipografia, sem caixa branca */}
          <View style={{ paddingHorizontal: 20, paddingTop: 32, gap: 12 }}>
            <Pressable
              onPress={handleChangePhoto}
              disabled={uploading}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                backgroundColor: colors.accent,
                borderRadius: 12,
                backgroundColor: uploading ? colors.accentMutedSolid : colors.accent,
                transform: [{ scale: !uploading && pressed ? 0.98 : 1 }],
              })}
            >
              <Camera size={20} color={colors.iconOnAccent} strokeWidth={2} />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.iconOnAccent, marginLeft: 10 }}>
                {fotoUrl ? 'Alterar foto' : 'Adicionar foto'}
              </Text>
            </Pressable>

            {fotoUrl && (
              <Pressable
                onPress={handleRemovePhoto}
                disabled={uploading}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  backgroundColor: 'transparent',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Trash2 size={20} color={colors.danger} strokeWidth={2} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.danger, marginLeft: 10 }}>
                  Remover foto
                </Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
