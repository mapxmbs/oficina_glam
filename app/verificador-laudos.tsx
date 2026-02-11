import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, Camera, CheckCircle, ChevronLeft, FileText, Image as ImageIcon, Shield, Trash2, XCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';

type LaudoStatus = 'confiavel' | 'atencao' | 'suspeito';

interface Laudo {
  id: string;
  arquivo_url: string;
  tipo_arquivo: 'foto' | 'pdf';
  status: LaudoStatus;
  analise_resumo: string;
  servicos_identificados: string[];
  alertas: string[];
  oficina_nome?: string;
  created_at: string;
}

export default function VerificadorLaudosScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [selectedLaudo, setSelectedLaudo] = useState<Laudo | null>(null);

  // Carregar laudos do banco
  async function loadLaudos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('laudos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar laudos:', error);
      } else if (data) {
        setLaudos(data);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadLaudos();
    }, [])
  );

  // Upload de foto
  async function uploadFoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      await processUpload(result.assets[0].base64, 'foto', 'jpg');
    } catch (error: any) {
      console.error('Erro upload foto:', error);
      Alert.alert('Erro', 'Falha ao enviar foto.');
    }
  }

  // Upload de galeria
  async function uploadGaleria() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      await processUpload(result.assets[0].base64, 'foto', 'jpg');
    } catch (error: any) {
      console.error('Erro upload galeria:', error);
      Alert.alert('Erro', 'Falha ao enviar imagem.');
    }
  }

  // Upload de PDF
  async function uploadPDF() {
    Alert.alert(
      'Upload de PDF',
      'Funcionalidade em desenvolvimento!\n\nPor enquanto, tire uma foto do documento com a câmera.\n\nEm breve você poderá enviar arquivos PDF diretamente.'
    );
    setShowUploadModal(false);
  }

  // Processar upload e salvar no banco
  async function processUpload(base64: string, tipo: 'foto' | 'pdf', ext: string) {
    setUploading(true);
    setShowUploadModal(false);

    try {
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `LAUDOS/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(base64), {
          contentType: tipo === 'foto' ? 'image/jpeg' : 'application/pdf'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath);

      // Análise mockada (simulando IA)
      const analiseMock = gerarAnaliseMock();

      const laudoData = {
        arquivo_url: publicUrl,
        tipo_arquivo: tipo,
        status: analiseMock.status,
        analise_resumo: analiseMock.resumo,
        servicos_identificados: analiseMock.servicos,
        alertas: analiseMock.alertas,
        oficina_nome: analiseMock.oficina,
      };

      const { data, error } = await supabase
        .from('laudos')
        .insert(laudoData)
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Laudo Analisado', 'Análise concluída. Confira o resultado abaixo.');
      await loadLaudos();
      
      // Abrir detalhes do laudo recém-criado
      if (data) setSelectedLaudo(data);
    } catch (error: any) {
      console.error('Erro ao processar:', error);
      Alert.alert('Erro', error.message || 'Falha ao processar laudo.');
    } finally {
      setUploading(false);
    }
  }

  // Gerar análise mockada (simula IA)
  function gerarAnaliseMock() {
    const oficinas = [
      'Auto Center Silva',
      'Oficina Mecânica JR',
      'Centro Automotivo Premium',
      'Mega Auto Peças e Serviços',
      'Oficina do João',
      'Speed Car Manutenção'
    ];

    const scenarios = [
      {
        status: 'confiavel' as LaudoStatus,
        oficina: oficinas[Math.floor(Math.random() * oficinas.length)],
        resumo: 'Orçamento dentro do esperado. Serviços necessários e preços justos.',
        servicos: ['Troca de óleo', 'Filtro de ar', 'Alinhamento'],
        alertas: []
      },
      {
        status: 'atencao' as LaudoStatus,
        oficina: oficinas[Math.floor(Math.random() * oficinas.length)],
        resumo: 'Alguns serviços podem não ser urgentes. Verifique a necessidade.',
        servicos: ['Troca de pastilhas', 'Fluido de freio', 'Balanceamento', 'Limpeza de bicos'],
        alertas: [
          'Balanceamento: Você fez há 3 semanas',
          'Preço acima da média: Limpeza de bicos (R$150 vs média R$90)'
        ]
      },
      {
        status: 'suspeito' as LaudoStatus,
        oficina: oficinas[Math.floor(Math.random() * oficinas.length)],
        resumo: 'ALERTA! Serviços redundantes detectados. Possível tentativa de fraude.',
        servicos: ['Alinhamento', 'Troca de pneus', 'Revisão completa', 'Suspensão'],
        alertas: [
          'Alinhamento: Feito há 2 semanas (última manutenção)',
          'Pneus novos: Instalados há 1 mês',
          'Preço muito acima: Revisão (R$800 vs média R$350)'
        ]
      }
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  // Deletar laudo
  async function deletarLaudo(laudo: Laudo) {
    Alert.alert(
      'Deletar Laudo',
      'Tem certeza que deseja remover este laudo do histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Deletar arquivo do storage
              const filePath = laudo.arquivo_url.split('/').pop();
              if (filePath) {
                await supabase.storage.from('arquivos').remove([`LAUDOS/${filePath}`]);
              }

              // Deletar registro do banco
              const { error } = await supabase.from('laudos').delete().eq('id', laudo.id);
              if (error) throw error;

              Alert.alert('Sucesso', 'Laudo removido.');
              setSelectedLaudo(null);
              loadLaudos();
            } catch (error: any) {
              Alert.alert('Erro', 'Falha ao deletar laudo.');
            }
          }
        }
      ]
    );
  }

  // Status colors
  const getStatusColor = (status: LaudoStatus) => {
    switch (status) {
      case 'confiavel': return colors.success;
      case 'atencao': return colors.warning;
      case 'suspeito': return colors.danger;
    }
  };

  const getStatusIcon = (status: LaudoStatus) => {
    switch (status) {
      case 'confiavel': return CheckCircle;
      case 'atencao': return AlertTriangle;
      case 'suspeito': return XCircle;
    }
  };

  const getStatusText = (status: LaudoStatus) => {
    switch (status) {
      case 'confiavel': return 'Confiável';
      case 'atencao': return 'Atenção';
      case 'suspeito': return 'Suspeito';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View 
        style={{ 
          backgroundColor: colors.headerBg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          paddingHorizontal: 20,
          paddingVertical: 16
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <View className="flex-row items-center">
              <Shield size={24} color="white" />
              <Text 
                style={{ 
                  fontFamily: 'Inter_700Bold',
                  textTransform: 'uppercase',
                  marginLeft: 8
                }} 
                className="text-white text-xl font-bold"
              >
                Verificador
              </Text>
            </View>
            <Text 
              style={{ fontFamily: 'Inter_400Regular' }} 
              className="text-white opacity-90 text-xs mt-1"
            >
              Proteção Anti-Golpe
            </Text>
          </View>

          <View className="w-8" />
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLaudos} colors={[colors.headerBg]} />
        }
      >
        <View className="p-5">
          {/* INFO BANNER */}
          <View 
            style={{ 
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: colors.headerBg
            }}
            className="p-4 rounded-2xl mb-6"
          >
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16
              }} 
              className="font-bold mb-2"
            >
              Como funciona?
            </Text>
            <Text 
              style={{ 
                color: colors.text,
                fontFamily: 'Inter_400Regular',
                lineHeight: 20
              }} 
              className="text-sm"
            >
              1. Tire foto ou envie PDF do orçamento{'\n'}
              2. Nossa IA analisa os serviços e preços{'\n'}
              3. Compara com seu histórico de manutenções{'\n'}
              4. Receba análise detalhada e recomendações
            </Text>
            <View 
              style={{ 
                backgroundColor: colors.rosaSuper,
                marginTop: 12,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignSelf: 'flex-start'
              }}
            >
              <Text 
                style={{ 
                  color: colors.headerBg,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12
                }}
                className="font-bold"
              >
                IA em breve - Análise mockada por enquanto
              </Text>
            </View>
          </View>

          {/* BOTÃO UPLOAD */}
          <TouchableOpacity
            onPress={() => setShowUploadModal(true)}
            disabled={uploading}
            style={{ 
              backgroundColor: colors.headerBg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 6,
              opacity: uploading ? 0.6 : 1,
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              alignItems: 'center'
            }}
            activeOpacity={0.8}
          >
            {uploading ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="white" />
                <Text 
                  style={{ 
                    fontFamily: 'Inter_600SemiBold',
                    marginTop: 16,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                >
                  Analisando laudo...
                </Text>
                <Text 
                  style={{ 
                    fontFamily: 'Inter_400Regular',
                    marginTop: 6,
                    color: 'white',
                    opacity: 0.85,
                    fontSize: 13
                  }}
                >
                  Aguarde, isso leva alguns segundos
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                >
                  <Shield size={36} color="white" strokeWidth={2.5} />
                </View>
                <Text 
                  style={{ 
                    fontFamily: 'Inter_700Bold',
                    textTransform: 'uppercase',
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                    letterSpacing: 0.5
                  }}
                >
                  Analisar Novo Laudo
                </Text>
                <Text 
                  style={{ 
                    fontFamily: 'Inter_400Regular',
                    marginTop: 8,
                    color: 'white',
                    opacity: 0.9,
                    fontSize: 14
                  }}
                >
                  Foto ou PDF - Análise em segundos
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* HISTÓRICO */}
          <View className="mb-4">
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_700Bold',
                textTransform: 'uppercase'
              }} 
              className="text-lg font-bold mb-3"
            >
              Histórico de Análises
            </Text>
          </View>

          {laudos.length === 0 ? (
            <View 
              style={{ backgroundColor: colors.surface }}
              className="p-8 rounded-3xl items-center"
            >
              <FileText size={48} color={colors.rosaMedio} />
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_600SemiBold',
                  marginTop: 16
                }} 
                className="text-center"
              >
                Nenhum laudo analisado ainda
              </Text>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_400Regular',
                  marginTop: 8
                }} 
                className="text-center text-sm"
              >
                Envie seu primeiro orçamento para análise!
              </Text>
            </View>
          ) : (
            laudos.map((laudo) => {
              const StatusIcon = getStatusIcon(laudo.status);
              return (
                <TouchableOpacity
                  key={laudo.id}
                  onPress={() => setSelectedLaudo(laudo)}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusColor(laudo.status),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2
                  }}
                  className="p-5 rounded-2xl mb-3"
                  activeOpacity={0.7}
                >
                  {/* Título com nome da oficina */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text 
                        style={{ 
                          color: colors.rosaEscuro,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 17
                        }} 
                        className="font-bold mb-1"
                        numberOfLines={1}
                      >
                        {laudo.oficina_nome 
                          ? `Diagnóstico ${laudo.oficina_nome}`
                          : 'Diagnóstico'}
                      </Text>
                      <View className="flex-row items-center">
                        <StatusIcon size={16} color={getStatusColor(laudo.status)} />
                        <Text 
                          style={{ 
                            color: getStatusColor(laudo.status),
                            fontFamily: 'Inter_600SemiBold',
                            marginLeft: 6,
                            fontSize: 13
                          }} 
                          className="font-bold"
                        >
                          {getStatusText(laudo.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Informações da oficina e data */}
                  <View 
                    style={{ 
                      backgroundColor: colors.rosaSuper,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      marginBottom: 12
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Text 
                          style={{ 
                            color: colors.textLight,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 12
                          }}
                        >
                          {laudo.oficina_nome || 'Oficina não identificada'}
                        </Text>
                      </View>
                      <Text 
                        style={{ 
                          color: colors.textLight,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          marginLeft: 8
                        }}
                      >
                        {new Date(laudo.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>

                  <Text 
                    style={{ 
                      color: colors.text,
                      fontFamily: 'Inter_400Regular',
                      lineHeight: 20
                    }} 
                    className="text-sm mb-3"
                    numberOfLines={2}
                  >
                    {laudo.analise_resumo}
                  </Text>

                  <Text 
                    style={{ 
                      color: colors.headerBg,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 13
                    }} 
                    className="font-bold"
                  >
                    Ver análise completa →
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* MODAL DE UPLOAD */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          className="flex-1 items-center justify-center p-5"
        >
          <View 
            style={{ 
              backgroundColor: colors.surface,
              borderRadius: 24,
              width: '100%',
              maxWidth: 400
            }}
            className="p-6"
          >
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                marginBottom: 4
              }}
              className="font-bold"
            >
              Escolha como enviar
            </Text>
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter_400Regular',
                marginBottom: 24
              }}
              className="text-sm"
            >
              Selecione a melhor opção para você
            </Text>

            {/* Tirar Foto */}
            <TouchableOpacity
              onPress={() => {
                setShowUploadModal(false);
                uploadFoto();
              }}
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderWidth: 2,
                borderColor: 'transparent'
              }}
              className="flex-row items-center p-4 rounded-2xl mb-3"
              activeOpacity={0.7}
            >
              <View 
                style={{ backgroundColor: colors.headerBg }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Camera size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.text,
                    fontFamily: 'Inter_600SemiBold'
                  }}
                  className="font-bold text-base"
                >
                  Tirar Foto
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter_400Regular'
                  }}
                  className="text-sm"
                >
                  Fotografe o orçamento agora
                </Text>
              </View>
            </TouchableOpacity>

            {/* Galeria */}
            <TouchableOpacity
              onPress={() => {
                setShowUploadModal(false);
                uploadGaleria();
              }}
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderWidth: 2,
                borderColor: 'transparent'
              }}
              className="flex-row items-center p-4 rounded-2xl mb-3"
              activeOpacity={0.7}
            >
              <View 
                style={{ backgroundColor: colors.rosaMedio }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <ImageIcon size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.text,
                    fontFamily: 'Inter_600SemiBold'
                  }}
                  className="font-bold text-base"
                >
                  Escolher da Galeria
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter_400Regular'
                  }}
                  className="text-sm"
                >
                  Selecione uma foto existente
                </Text>
              </View>
            </TouchableOpacity>

            {/* PDF */}
            <TouchableOpacity
              onPress={() => uploadPDF()}
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderWidth: 2,
                borderColor: 'transparent'
              }}
              className="flex-row items-center p-4 rounded-2xl mb-3"
              activeOpacity={0.7}
            >
              <View 
                style={{ backgroundColor: colors.rosaInteso }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <FileText size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text 
                  style={{ 
                    color: colors.text,
                    fontFamily: 'Inter_600SemiBold'
                  }}
                  className="font-bold text-base"
                >
                  Enviar PDF
                </Text>
                <Text 
                  style={{ 
                    color: colors.textLight,
                    fontFamily: 'Inter_400Regular'
                  }}
                  className="text-sm"
                >
                  Arquivo digital do orçamento
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => setShowUploadModal(false)}
              style={{ 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.rosaMedio
              }}
              className="p-4 rounded-2xl mt-2"
              activeOpacity={0.7}
            >
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_600SemiBold',
                  textAlign: 'center'
                }}
                className="font-bold"
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE DETALHES DO LAUDO */}
      <Modal
        visible={selectedLaudo !== null}
        animationType="slide"
        onRequestClose={() => setSelectedLaudo(null)}
      >
        {selectedLaudo && (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View 
              style={{ 
                backgroundColor: getStatusColor(selectedLaudo.status),
                paddingHorizontal: 20,
                paddingVertical: 16
              }}
            >
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setSelectedLaudo(null)} className="p-2 -ml-2">
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                
                <Text 
                  style={{ 
                    fontFamily: 'Inter_700Bold',
                    textTransform: 'uppercase'
                  }} 
                  className="text-white text-lg font-bold"
                >
                  Análise Completa
                </Text>

                <TouchableOpacity 
                  onPress={() => deletarLaudo(selectedLaudo)}
                  className="p-2 -mr-2"
                >
                  <Trash2 size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1">
              <View className="p-5">
                {/* Status Card */}
                <View 
                  style={{ 
                    backgroundColor: colors.surface,
                    borderTopWidth: 4,
                    borderTopColor: getStatusColor(selectedLaudo.status)
                  }}
                  className="p-5 rounded-3xl mb-6"
                >
                  {(() => {
                    const StatusIcon = getStatusIcon(selectedLaudo.status);
                    return (
                      <View className="items-center">
                        <View 
                          style={{ 
                            backgroundColor: getStatusColor(selectedLaudo.status),
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 16
                          }}
                        >
                          <StatusIcon size={32} color="white" />
                        </View>
                        <Text 
                          style={{ 
                            color: getStatusColor(selectedLaudo.status),
                            fontFamily: 'Inter_700Bold',
                            textTransform: 'uppercase',
                            fontSize: 24
                          }} 
                          className="font-bold mb-2"
                        >
                          {getStatusText(selectedLaudo.status)}
                        </Text>
                        <Text 
                          style={{ 
                            color: colors.text,
                            fontFamily: 'Inter_400Regular',
                            textAlign: 'center',
                            lineHeight: 22
                          }} 
                          className="text-base"
                        >
                          {selectedLaudo.analise_resumo}
                        </Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Imagem do Laudo */}
                {selectedLaudo.tipo_arquivo === 'foto' && (
                  <View 
                    style={{ 
                      backgroundColor: colors.surface,
                      marginBottom: 24,
                      borderRadius: 16,
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      source={{ uri: selectedLaudo.arquivo_url }}
                      style={{ width: '100%', height: 300 }}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* Serviços Identificados */}
                <View 
                  style={{ backgroundColor: colors.surface }}
                  className="p-5 rounded-3xl mb-6"
                >
                  <Text 
                    style={{ 
                      color: colors.rosaEscuro,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 18
                    }} 
                    className="font-bold mb-4"
                  >
                    Serviços Identificados
                  </Text>
                  {selectedLaudo.servicos_identificados.map((servico, idx) => (
                    <View 
                      key={idx}
                      style={{ 
                        backgroundColor: colors.rosaSuper,
                        marginBottom: 8
                      }}
                      className="p-3 rounded-xl flex-row items-center"
                    >
                      <View 
                        style={{ 
                          backgroundColor: colors.rosaMedio,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginRight: 12
                        }}
                      />
                      <Text 
                        style={{ 
                          color: colors.text,
                          fontFamily: 'Inter_400Regular'
                        }}
                        className="flex-1"
                      >
                        {servico}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Alertas */}
                {selectedLaudo.alertas.length > 0 && (
                  <View 
                    style={{ 
                      backgroundColor: colors.surface,
                      borderLeftWidth: 4,
                      borderLeftColor: getStatusColor(selectedLaudo.status)
                    }}
                    className="p-5 rounded-3xl mb-6"
                  >
                    <Text 
                      style={{ 
                        color: colors.rosaEscuro,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 18
                      }} 
                      className="font-bold mb-4"
                    >
                      Alertas Detectados
                    </Text>
                    {selectedLaudo.alertas.map((alerta, idx) => (
                      <View 
                        key={idx}
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedLaudo.status)}15`,
                          marginBottom: 8
                        }}
                        className="p-3 rounded-xl"
                      >
                        <Text 
                          style={{ 
                            color: colors.text,
                            fontFamily: 'Inter_400Regular',
                            lineHeight: 20
                          }}
                        >
                          {alerta}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recomendações */}
                <View 
                  style={{ backgroundColor: colors.headerBg }}
                  className="p-5 rounded-3xl mb-6"
                >
                  <Text 
                    style={{ 
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 18
                    }} 
                    className="text-white font-bold mb-3"
                  >
                    Recomendações
                  </Text>
                  {selectedLaudo.status === 'confiavel' ? (
                    <Text 
                      style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }} 
                      className="text-white"
                    >
                      Orçamento parece justo e serviços necessários. Você pode prosseguir com segurança.
                    </Text>
                  ) : selectedLaudo.status === 'atencao' ? (
                    <Text 
                      style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }} 
                      className="text-white"
                    >
                      Recomendamos questionar alguns serviços com a oficina ou buscar uma segunda opinião em uma oficina da Rede Glam.
                    </Text>
                  ) : (
                    <Text 
                      style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }} 
                      className="text-white"
                    >
                      CUIDADO! Este orçamento apresenta sinais de fraude. Não autorize os serviços. Busque uma oficina confiável da Rede Glam imediatamente.
                    </Text>
                  )}

                  {selectedLaudo.status !== 'confiavel' && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLaudo(null);
                        router.push('/(tabs)/workshops');
                      }}
                      style={{ 
                        backgroundColor: 'white',
                        marginTop: 16
                      }}
                      className="p-4 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text 
                        style={{ 
                          color: colors.headerBg,
                          fontFamily: 'Inter_600SemiBold'
                        }}
                        className="font-bold"
                      >
                        Ver Oficinas Confiáveis →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Data da Análise */}
                <View className="items-center mb-8">
                  <Text 
                    style={{ 
                      color: colors.textLight,
                      fontFamily: 'Inter_400Regular'
                    }}
                    className="text-xs"
                  >
                    Análise realizada em {new Date(selectedLaudo.created_at).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}
