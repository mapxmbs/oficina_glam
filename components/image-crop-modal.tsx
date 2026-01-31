import * as ImagePicker from 'expo-image-picker';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_WIDTH * 0.7;

interface ImageCropModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (uri: string, base64: string) => void;
  aspect?: [number, number];
  title?: string;
  loading?: boolean;
}

export default function ImageCropModal({
  visible,
  onClose,
  onConfirm,
  aspect = [1, 1],
  title = 'Ajustar Foto',
  loading = false,
}: ImageCropModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      setPicking(true);

      // Solicitar permissões
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos.');
          setPicking(false);
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher fotos.');
          setPicking(false);
          return;
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            base64: true,
          });

      if (result.canceled || !result.assets[0]) {
        setPicking(false);
        return;
      }

      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
    } catch (error: any) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    } finally {
      setPicking(false);
    }
  };

  const handleConfirm = () => {
    if (imageUri && imageBase64) {
      onConfirm(imageUri, imageBase64);
      // Resetar estados
      setImageUri(null);
      setImageBase64(null);
    }
  };

  const handleClose = () => {
    setImageUri(null);
    setImageBase64(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          {/* Header */}
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={24} color={colors.iconOnAccent} />
            </TouchableOpacity>

            <Text
              style={{
                color: 'white',
                fontFamily: 'MontserratAlternates-Medium',
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              {title}
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* Preview da Imagem */}
          {imageUri ? (
            <View
              style={{
                width: PREVIEW_SIZE,
                height: aspect[0] === aspect[1] ? PREVIEW_SIZE : PREVIEW_SIZE * (aspect[1] / aspect[0]),
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderWidth: 3,
                borderColor: colors.rosaClaro,
                marginBottom: 30,
                shadowColor: colors.rosaClaro,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={{
                width: PREVIEW_SIZE,
                height: aspect[0] === aspect[1] ? PREVIEW_SIZE : PREVIEW_SIZE * (aspect[1] / aspect[0]),
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                borderStyle: 'dashed',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  textAlign: 'center',
                  paddingHorizontal: 20,
                }}
              >
                {picking ? 'Processando...' : 'Selecione uma foto'}
              </Text>
            </View>
          )}

          {/* Botões de Ação */}
          {imageUri ? (
            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading}
                style={{
                  backgroundColor: colors.rosaClaro,
                  paddingVertical: Platform.OS === 'ios' ? 16 : 14,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.rosaClaro,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.iconOnAccent} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={20} color={colors.iconOnAccent} />
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Inter-Regular',
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginLeft: 8,
                      }}
                    >
                      Confirmar Foto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                }}
                disabled={loading}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingVertical: Platform.OS === 'ios' ? 14 : 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  Escolher Outra
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={() => pickImage('camera')}
                disabled={picking}
                style={{
                  backgroundColor: colors.headerBg,
                  paddingVertical: Platform.OS === 'ios' ? 16 : 14,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.headerBg,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                  opacity: picking ? 0.7 : 1,
                }}
              >
                {picking ? (
                  <ActivityIndicator size="small" color={colors.iconOnAccent} />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    Tirar Foto
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage('gallery')}
                disabled={picking}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingVertical: Platform.OS === 'ios' ? 16 : 14,
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  opacity: picking ? 0.7 : 1,
                }}
              >
                {picking ? (
                  <ActivityIndicator size="small" color={colors.iconOnAccent} />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    Escolher da Galeria
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
