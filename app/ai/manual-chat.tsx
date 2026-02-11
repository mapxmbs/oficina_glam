import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Send, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* HEADER ESPECÍFICO PARA O BOT  */}
      <View className="bg-white px-5 py-4 border-b border-gray-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <View className="w-10 h-10 bg-glam-primary rounded-full items-center justify-center mr-3">
          <Sparkles size={20} color="white" />
        </View>
        <View>
          <Text className="text-glam-dark font-bold text-lg">Glam IA</Text>
          <Text className="text-gray-500 text-xs">Baseada no Manual do Proprietário</Text>
        </View>
      </View>

      {/* ÁREA DE CHAT */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1" 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200} // Ajuste fino
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              className={`flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar do Bot se for msg do bot */}
              {msg.sender === 'bot' && (
                <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 mr-2 self-end mb-1">
                   <BookOpen size={14} color="#E91E63" />
                </View>
              )}

              {/* Balão de Mensagem */}
              <View 
                className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-glam-primary rounded-tr-none' 
                    : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                }`}
              >
                <Text 
                  className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* INPUT DE TEXTO */}
        <View className="p-4 bg-white border-t border-gray-100 pb-8">
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <TextInput 
              className="flex-1 text-base text-gray-700 h-10"
              placeholder="Pergunte sobre seu carro..."
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity 
              onPress={sendMessage}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${inputText.trim() ? 'bg-glam-primary' : 'bg-gray-300'}`}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}