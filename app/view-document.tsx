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
          <Text style={{ color: colors.textLight, fontFamily: 'Inter_400Regular', marginTop: 16 }}>
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
          <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 18, textAlign: 'center' }}>
            Documento não encontrado
          </Text>
          <Text style={{ color: colors.textLight, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Se a tabela "documentos" ainda não existe, execute o SQL em supabase/migrations/001_create_documentos.sql no Supabase.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.accent, marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: colors.iconOnAccent, fontFamily: 'Inter_600SemiBold', fontWeight: 'bold' }}>
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header – discreto */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 12, paddingTop: 16, backgroundColor: colors.background }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: colors.text }}>
          {documentType === 'CNH' ? 'CNH' : documentType === 'CRLV' ? 'CRLV' : 'Documento'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 }}>
        {/* Documento como protagonista */}
        {(() => {
          const docUrl = document.foto_url || document.arquivo_url;
          return docUrl ? (
          <TouchableOpacity onPress={() => setShowFullImage(true)} activeOpacity={0.9} style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden', width: screenWidth - 48, alignSelf: 'center' }}>
              <Image source={{ uri: docUrl }} style={{ width: screenWidth - 48, height: 380 }} resizeMode="contain" />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={18} color="#fff" />
                <Text style={{ color: '#fff', fontFamily: 'Inter_400Regular', fontSize: 13, marginLeft: 8 }}>Ver em tela cheia</Text>
              </View>
            </View>
          </TouchableOpacity>
          ) : (
          <View style={{ height: 200, borderRadius: 12, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <ImageIcon size={40} color={colors.textTertiary} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textTertiary, marginTop: 12 }}>Nenhuma imagem</Text>
          </View>
          );
        })()}

        {/* Ações: editar e excluir */}
        <View style={{ gap: 10 }}>
          {(document.foto_url || document.arquivo_url) ? (
            <>
              <TouchableOpacity onPress={() => setShowFullImage(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
                <Eye size={18} color={colors.text} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.text, marginLeft: 8 }}>Ver em tela cheia</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowImageModal(true)} disabled={uploading} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: colors.accent }}>
                {uploading ? <ActivityIndicator size="small" color="#fff" /> : <><Upload size={18} color="#fff" /><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff', marginLeft: 8 }}>Atualizar</Text></>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.danger }}>
                <Trash2 size={18} color={colors.danger} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.danger, marginLeft: 8 }}>Excluir</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setShowImageModal(true)} disabled={uploading} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: colors.accent }}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <><Upload size={18} color="#fff" /><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff', marginLeft: 8 }}>Enviar documento</Text></>}
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
              <Text style={{ color: 'white', fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>
                {documentType === 'CNH' ? 'CNH' : documentType === 'CRLV' ? 'CRLV' : 'Documento'}
              </Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: document.foto_url || document.arquivo_url }} style={{ width: screenWidth - 32, height: screenHeight * 0.7, maxHeight: 600 }} resizeMode="contain" />
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
