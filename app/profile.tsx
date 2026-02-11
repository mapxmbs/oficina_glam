import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { Camera, ChevronLeft, Crown, Edit2, Image as ImageIcon, Mail, Sparkles, Star, User, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors } from '../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);

  // Estados do perfil
  const [profile, setProfile] = useState<any>(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [cpf, setCpf] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Buscar dados do perfil
  async function fetchProfile() {
    setLoading(true);
    try {
      // TODO: Quando auth estiver implementado, pegar user.id
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = não encontrou registros (ok para perfil novo)
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
        setNomeCompleto(data.nome_completo || '');
        setApelido(data.apelido || '');
        setEmail(data.email || '');
        setCelular(data.celular || '');
        setCpf(data.cpf || '');
        setFotoUrl(data.foto_url || '');
      } else {
        // Perfil não existe, usuário novo
        console.log('Perfil não encontrado - criar novo ao salvar');
      }
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err);
      Alert.alert('Erro', 'Não foi possível carregar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // Upload de foto de perfil
  async function uploadFoto(source: 'camera' | 'gallery') {
    try {
      // Solicitar permissões
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos.');
          setShowFotoModal(false);
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher fotos.');
          setShowFotoModal(false);
          return;
        }
      }

      const result = source === 'camera' 
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
          });

      if (result.canceled || !result.assets[0].base64) return;

      setUploading(true);
      
      const fileExt = result.assets[0].uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `PERFIL/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath);

      // Atualiza estado imediatamente para mostrar a foto
      setFotoUrl(publicUrl);
      
      // Atualiza no banco se perfil já existe
      if (profile?.id) {
        const { error: updateError } = await supabase
          .from('perfis')
          .update({ foto_url: publicUrl })
          .eq('id', profile.id);
        
        if (updateError) throw updateError;
        
        // Atualiza o objeto profile também
        setProfile({ ...profile, foto_url: publicUrl });
      }

      setShowFotoModal(false);
      Alert.alert("Sucesso", "Foto atualizada.");
    } catch (error: any) {
      console.error('Erro no upload:', error);
      Alert.alert("Erro", error.message || "Falha ao enviar foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  // Salvar perfil
  async function handleSave() {
    // Validação básica
    if (!nomeCompleto.trim()) {
      Alert.alert("Atenção", "Por favor, preencha seu nome completo.");
      return;
    }

    if (!apelido.trim()) {
      Alert.alert("Atenção", "Como a IA deve te chamar? Preencha seu apelido.");
      return;
    }

    setLoading(true);
    const dados = {
      nome_completo: nomeCompleto.trim(),
      apelido: apelido.trim(),
      email: email.trim(),
      celular: celular.trim(),
      cpf: cpf.trim(),
      foto_url: fotoUrl
    };

    try {
      if (profile?.id) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from('perfis')
          .update(dados)
          .eq('id', profile.id);
        
        if (error) throw error;
      } else {
        // Criar novo perfil
        const { error } = await supabase
          .from('perfis')
          .insert(dados);
        
        if (error) throw error;
      }
      
      setIsEditing(false);
      await fetchProfile();
      Alert.alert("Sucesso", "Perfil atualizado.");
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      Alert.alert("Erro", error.message || "Falha ao salvar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Loading inicial
  if (loading && !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.headerBg} />
          <Text 
            style={{ 
              color: colors.textLight,
              fontFamily: 'Inter_400Regular',
              marginTop: 16
            }}
          >
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1">
        {/* HEADER PREMIUM */}
        <View 
          style={{ 
            backgroundColor: colors.headerBg,
            shadowColor: colors.rosaInteso,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
          className="p-5 pb-20 relative overflow-hidden"
        >
          {/* Background decorativo */}
          <View 
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full"
          />
          <View 
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} 
            className="absolute -left-10 top-20 w-32 h-32 rounded-full"
          />

          <View className="flex-row items-center justify-between mb-4 relative z-10">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              style={{ 
                backgroundColor: loading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                opacity: loading ? 0.6 : 1
              }}
              className="p-3 rounded-full"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : isEditing ? (
                <Text style={{ fontFamily: 'MontserratAlternates-Medium' }} className="text-white font-bold">
                  Salvar
                </Text>
              ) : (
                <Edit2 size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text 
            style={{ 
              fontFamily: 'Inter_700Bold',
              textTransform: 'uppercase'
            }} 
            className="text-white text-3xl font-bold text-center relative z-10"
          >
            Meu Perfil
          </Text>
          <Text 
            style={{ fontFamily: 'Inter_400Regular' }} 
            className="text-white opacity-90 text-sm text-center mt-1 relative z-10"
          >
            Perfil de DIVA
          </Text>
        </View>

        {/* FOTO DE PERFIL (SOBREPOSTA) */}
        <View className="items-center -mt-16 mb-6 relative z-20">
          <TouchableOpacity
            onPress={() => setShowFotoModal(true)}
            disabled={uploading}
            activeOpacity={0.9}
            className="relative"
          >
            {fotoUrl ? (
              <Image
                source={{ uri: fotoUrl }}
                style={{ 
                  width: 120, 
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: 'white'
                }}
              />
            ) : (
              <View 
                style={{ 
                  width: 120, 
                  height: 120,
                  backgroundColor: colors.surface,
                  borderWidth: 4,
                  borderColor: 'white'
                }}
                className="rounded-full items-center justify-center"
              >
                <User size={48} color={colors.rosaMedio} />
              </View>
            )}

            {/* Botão de câmera sobreposto */}
            <View 
              style={{ 
                backgroundColor: colors.headerBg,
                shadowColor: colors.rosaInteso,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                position: 'absolute',
                bottom: 0,
                right: 0
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera size={18} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {/* Nome e Apelido (Preview) */}
          <View className="items-center mt-4">
            <Text 
              style={{ 
                color: colors.rosaEscuro,
                fontFamily: 'MontserratAlternates-Medium' 
              }} 
              className="text-2xl font-bold"
            >
              {nomeCompleto || 'Seu Nome Aqui'}
            </Text>
            {apelido && (
              <View className="flex-row items-center mt-1">
                <Sparkles size={14} color={colors.headerBg} />
                <Text 
                  style={{ 
                    color: colors.headerBg,
                    fontFamily: 'Inter_400Regular' 
                  }} 
                  className="text-sm ml-1"
                >
                  "{apelido}"
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* FORMULÁRIO DE DADOS */}
        <View className="px-5">
          {/* Card Dados Pessoais */}
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
                style={{ backgroundColor: colors.accentSoft }} 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <User size={20} color={colors.iconPrimary} />
              </View>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-lg"
              >
                Dados Pessoais
              </Text>
            </View>

            {/* Nome Completo */}
            <View className="mb-4">
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Nome Completo
              </Text>
              {isEditing ? (
                <TextInput
                  value={nomeCompleto}
                  onChangeText={setNomeCompleto}
                  placeholder="Maria da Silva Santos"
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
                    {nomeCompleto || '---'}
                  </Text>
                </View>
              )}
            </View>

            {/* Apelido */}
            <View className="mb-4">
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Como gostaria de ser chamada?
              </Text>
              {isEditing ? (
                <TextInput
                  value={apelido}
                  onChangeText={setApelido}
                  placeholder="Ex: Mari, Silva, Diva..."
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
                    {apelido || '---'}
                  </Text>
                </View>
              )}
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'Inter_400Regular' 
                }} 
                className="text-xs mt-1 italic"
              >
                A IA e notificações usarão este nome
              </Text>
            </View>
          </View>

          {/* Card Contato */}
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
                style={{ backgroundColor: colors.accentSoft }} 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Mail size={20} color={colors.iconPrimary} />
              </View>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-lg"
              >
                Contato
              </Text>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                E-mail
              </Text>
              {isEditing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                    {email || '---'}
                  </Text>
                </View>
              )}
            </View>

            {/* Celular */}
            <View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                Celular
              </Text>
              {isEditing ? (
                <TextInput
                  value={celular}
                  onChangeText={setCelular}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
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
                    {celular || '---'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card CPF */}
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
                style={{ backgroundColor: colors.accentSoft }} 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Crown size={20} color={colors.iconPrimary} />
              </View>
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="font-bold text-lg"
              >
                Documento
              </Text>
            </View>

            {/* CPF */}
            <View>
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium' 
                }} 
                className="text-xs uppercase font-bold mb-2"
              >
                CPF
              </Text>
              {isEditing ? (
                <TextInput
                  value={cpf}
                  onChangeText={setCpf}
                  placeholder="000.000.000-00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
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
                    {cpf || '---'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Aviso de Segurança */}
          <View 
            style={{ 
              backgroundColor: colors.rosaSuper,
              borderColor: colors.rosaMedio
            }}
            className="p-4 rounded-2xl border mb-8"
          >
            <Text 
              style={{ 
                color: colors.textLight,
                fontFamily: 'Inter_400Regular' 
              }} 
              className="text-xs text-center"
            >
              Seus dados estão seguros e protegidos. Em breve: criptografia avançada e autenticação biométrica.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE SELEÇÃO DE FOTO */}
      <Modal
        visible={showFotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFotoModal(false)}
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
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10
            }}
            className="p-6"
          >
            {/* Header do Modal */}
            <View className="flex-row items-center justify-between mb-6">
              <Text 
                style={{ 
                  color: colors.rosaEscuro,
                  fontFamily: 'MontserratAlternates-Medium',
                  fontSize: 20
                }}
                className="font-bold"
              >
                Escolha sua foto
              </Text>
              <TouchableOpacity 
                onPress={() => setShowFotoModal(false)}
                style={{ backgroundColor: colors.rosaSuper }}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <X size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Opções */}
            <TouchableOpacity
              onPress={() => uploadFoto('camera')}
              disabled={uploading}
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderWidth: 2,
                borderColor: uploading ? colors.rosaMedio : 'transparent'
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
                    fontFamily: 'MontserratAlternates-Medium'
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
                  Use a câmera do celular
                </Text>
              </View>
              {uploading && <ActivityIndicator size="small" color={colors.headerBg} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => uploadFoto('gallery')}
              disabled={uploading}
              style={{ 
                backgroundColor: colors.rosaSuper,
                borderWidth: 2,
                borderColor: uploading ? colors.rosaMedio : 'transparent'
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
                    fontFamily: 'MontserratAlternates-Medium'
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
              {uploading && <ActivityIndicator size="small" color={colors.headerBg} />}
            </TouchableOpacity>

            {/* Botão Cancelar */}
            <TouchableOpacity
              onPress={() => setShowFotoModal(false)}
              disabled={uploading}
              style={{ 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.rosaMedio,
                opacity: uploading ? 0.5 : 1
              }}
              className="p-4 rounded-2xl mt-2"
              activeOpacity={0.7}
            >
              <Text 
                style={{ 
                  color: colors.textLight,
                  fontFamily: 'MontserratAlternates-Medium',
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
    </SafeAreaView>
  );
}
