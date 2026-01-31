import { decode } from 'base64-arraybuffer';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Eye, Image as ImageIcon, Trash2, Upload } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCropModal from '../components/image-crop-modal';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';

export default function ViewDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const documentId = params.id as string;
  const documentType = params.type as string;
  
  const [loading, setLoading] = useState(!!documentId);
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Buscar documento (id no Supabase pode ser number ou string)
  async function fetchDocument() {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const id = Number(documentId) || documentId;
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDocument(data);
      setNotFound(false);
    } catch (error: any) {
      console.error('Erro ao buscar documento:', error);
      setNotFound(true);
      Alert.alert('Erro', 'Não foi possível carregar o documento. Verifique se a tabela "documentos" existe no Supabase.');
    } finally {
      setLoading(false);
    }
  }

  // Atualizar documento após confirmação no crop
  async function handleImageConfirm(uri: string, base64: string) {
    if (!document) return;

    setUploading(true);
    setShowImageModal(false);
    
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${documentType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arquivos').getPublicUrl(filePath);

      // Atualizar documento no banco
      const id = Number(documentId) || documentId;
      const { error: updateError } = await supabase
        .from('documentos')
        .update({ foto_url: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      Alert.alert("Sucesso", "Documento atualizado!");
      await fetchDocument();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao atualizar documento.");
    } finally {
      setUploading(false);
    }
  }

  // Deletar documento
  async function handleDelete() {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este documento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const id = Number(documentId) || documentId;
              const { error } = await supabase
                .from('documentos')
                .delete()
                .eq('id', id);

              if (error) throw error;
              Alert.alert("Sucesso", "Documento excluído!");
              router.back();
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Falha ao excluir documento.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  // Carregar documento ao abrir
  useFocusEffect(
    useCallback(() => {
      fetchDocument();
    }, [documentId])
  );

  if (loading && !document) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.headerBg} />
          <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular', marginTop: 16 }}>
            Carregando documento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && !document && (notFound || !documentId)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-5">
          <Text style={{ color: colors.text, fontFamily: 'MontserratAlternates-Medium', fontSize: 18, textAlign: 'center' }}>
            Documento não encontrado
          </Text>
          <Text style={{ color: colors.textLight, fontFamily: 'Inter-Regular', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Se a tabela "documentos" ainda não existe, execute o SQL em supabase/migrations/001_create_documentos.sql no Supabase.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.rosaClaro, marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontFamily: 'MontserratAlternates-Medium', fontWeight: 'bold' }}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View 
        style={{ 
          backgroundColor: colors.headerBg,
          shadowColor: colors.rosaInteso,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4
        }}
        className="p-5 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={24} color={colors.iconOnAccent} />
          </TouchableOpacity>
          <Text 
            style={{ 
              fontFamily: 'LoveloBlack',
              textTransform: 'uppercase',
              color: 'white',
              fontSize: 20
            }}
          >
            {documentType === 'CNH' ? 'CNH' : documentType === 'CRLV' ? 'CRLV' : 'Documento'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {/* Status do Documento */}
        <View 
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: document.foto_url ? colors.success : colors.rosaMedio,
            borderWidth: 2
          }}
          className="p-4 rounded-2xl mb-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                Status
              </Text>
              <Text 
                style={{ 
                  color: document.foto_url ? colors.success : colors.textLight,
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  marginTop: 4
                }}
              >
                {document.foto_url ? `${documentType} enviada` : `${documentType} não enviada`}
              </Text>
            </View>
            {document.foto_url && (
              <View 
                style={{ backgroundColor: colors.success }}
                className="px-3 py-1 rounded-full"
              >
                <Text 
                  style={{ 
                    color: 'white',
                    fontFamily: 'MontserratAlternates-Medium',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                >
                  Enviado
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Preview da Imagem */}
        {document.foto_url ? (
          <TouchableOpacity
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.9}
            className="mb-6"
          >
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.rosaMedio,
                borderWidth: 2,
                borderRadius: 16,
                overflow: 'hidden',
                width: screenWidth - 40,
                alignSelf: 'center',
              }}
            >
              <Image
                source={{ uri: document.foto_url }}
                style={{ width: screenWidth - 40, height: 400 }}
                resizeMode="contain"
              />
              <View 
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                className="absolute bottom-0 left-0 right-0 p-4"
              >
                <View className="flex-row items-center justify-center">
                  <Eye size={20} color={colors.iconOnAccent} />
                  <Text 
                    style={{ 
                      color: 'white',
                      fontFamily: 'Inter-Regular',
                      marginLeft: 8,
                      fontSize: 14
                    }}
                  >
                    Toque para visualizar em tela cheia
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View 
            style={{ 
              backgroundColor: colors.rosaSuper,
              borderColor: colors.rosaMedio,
              borderWidth: 2,
              borderStyle: 'dashed'
            }}
            className="h-64 rounded-2xl items-center justify-center mb-6"
          >
            <ImageIcon size={48} color={colors.textLight} />
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter-Regular',
                marginTop: 12,
                fontSize: 14
              }}
            >
              Nenhuma imagem enviada
            </Text>
          </View>
        )}

        {/* Botões de Ação */}
        <View className="gap-3 mb-8">
          {document.foto_url ? (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowFullImage(true)}
                style={{ backgroundColor: colors.headerBg }}
                className="flex-row items-center justify-center p-4 rounded-2xl"
              >
                <Eye size={20} color={colors.iconOnAccent} />
                <Text 
                  style={{ 
                    color: 'white',
                    fontFamily: 'MontserratAlternates-Medium',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginLeft: 8
                  }}
                >
                  Visualizar em Tela Cheia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowImageModal(true)}
                disabled={uploading}
                style={{ 
                  backgroundColor: colors.headerBg,
                  opacity: uploading ? 0.7 : 1
                }}
                className="flex-row items-center justify-center p-4 rounded-2xl"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.iconOnAccent} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} color={colors.iconOnAccent} />
                    <Text 
                      style={{ 
                        color: 'white',
                        fontFamily: 'MontserratAlternates-Medium',
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginLeft: 8
                      }}
                    >
                      Atualizar Documento
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowImageModal(true)}
              disabled={uploading}
              style={{ backgroundColor: colors.headerBg }}
              className="flex-row items-center justify-center p-4 rounded-2xl"
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.iconOnAccent} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} color={colors.iconOnAccent} />
                  <Text 
                    style={{ 
                      color: 'white',
                      fontFamily: 'MontserratAlternates-Medium',
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}
                  >
                    Enviar Documento
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {document.foto_url && (
            <TouchableOpacity
              onPress={handleDelete}
              style={{ 
                backgroundColor: 'transparent',
                borderColor: colors.danger,
                borderWidth: 2
              }}
              className="flex-row items-center justify-center p-4 rounded-2xl"
            >
              <Trash2 size={20} color={colors.danger} />
              <Text 
                style={{ 
                  color: colors.danger,
                  fontFamily: 'MontserratAlternates-Medium',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginLeft: 8
                }}
              >
                Excluir Documento
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Imagem em Tela Cheia */}
      <Modal
        visible={showFullImage}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between p-4">
              <TouchableOpacity
                onPress={() => setShowFullImage(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              >
                <ChevronLeft size={24} color={colors.iconOnAccent} />
              </TouchableOpacity>
              <Text style={{ color: 'white', fontFamily: 'MontserratAlternates-Medium', fontSize: 18 }}>
                {documentType === 'CNH' ? 'CNH' : documentType === 'CRLV' ? 'CRLV' : 'Documento'}
              </Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: document.foto_url }}
                style={{ width: screenWidth - 32, height: screenHeight * 0.7, maxHeight: 600 }}
                resizeMode="contain"
              />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Modal de Crop para Atualizar */}
      <ImageCropModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onConfirm={handleImageConfirm}
        aspect={[1, 1]}
        title={`${documentType === 'CNH' ? 'CNH' : documentType === 'CRLV' ? 'CRLV' : 'Documento'}`}
        loading={uploading}
      />
    </SafeAreaView>
  );
}
