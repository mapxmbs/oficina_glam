import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Send, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

// Mensagem Tipo
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  loading?: boolean;
};

export default function ManualChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  
  // Estado inicial com mensagem de boas-vindas do Bot [cite: 136]
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: 'Olá! Sou sua assistente técnica Glam.\nPosso ler o manual do seu carro. Qual sua dúvida sobre luzes, óleo ou manutenção?', 
      sender: 'bot' 
    }
  ]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 1. Adiciona mensagem da usuária
    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // Scroll para baixo
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // 2. Simula "Digitando..." (Inteligência Artificial processando)
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, { id: loadingId, text: '...', sender: 'bot', loading: true }]);

    // 3. Simulação de Resposta (Aqui entra a API do Gemini/OpenAI depois)
    setTimeout(() => {
      // Remove o loading e adiciona resposta
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      const botResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        text: 'De acordo com o manual do seu veículo, essa luz indica baixa pressão nos pneus. Recomendo calibrar com 32 PSI (dianteiros) o quanto antes. [cite: 132]', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header – padrão das outras telas */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 8 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Sparkles size={20} color={colors.accent} />
        </View>
        <View>
          <Text style={[typography.screenTitle, { color: colors.text, fontSize: 22 }]}>Glam IA</Text>
          <Text style={[typography.screenSubtitle, { color: colors.textMedium, marginTop: 4 }]}>Baseada no Manual do Proprietário</Text>
        </View>
      </View>

      {/* Área de chat */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={{ flexDirection: 'row', marginBottom: 16, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
            >
              {msg.sender === 'bot' && (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 8, alignSelf: 'flex-end', marginBottom: 4 }}>
                  <BookOpen size={14} color={colors.accent} />
                </View>
              )}
              <View 
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 20,
                  maxWidth: '80%',
                  backgroundColor: msg.sender === 'user' ? colors.accent : colors.surface,
                  borderTopRightRadius: msg.sender === 'user' ? 4 : 20,
                  borderTopLeftRadius: msg.sender === 'bot' ? 4 : 20,
                  borderWidth: msg.sender === 'bot' ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: msg.sender === 'user' ? colors.iconOnAccent : colors.text }}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceTint, borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 }}>
            <TextInput 
              style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: colors.text, height: 40 }}
              placeholder="Pergunte sobre seu carro..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              onPress={sendMessage}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8, backgroundColor: inputText.trim() ? colors.accent : colors.surfaceTint }}
              disabled={!inputText.trim()}
            >
              <Send size={18} color={inputText.trim() ? colors.iconOnAccent : colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}