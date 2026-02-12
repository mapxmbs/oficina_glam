import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { colors } from '../src/theme/colors';
import { Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullscreenPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
  title?: string;
}

export default function FullscreenPhotoModal({
  visible,
  onClose,
  imageUri,
  title = 'Foto',
}: FullscreenPhotoModalProps) {
  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.overlayDarkest }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={24} color={colors.iconOnAccent} strokeWidth={2} />
            </TouchableOpacity>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.7, maxHeight: 600 }}
              resizeMode="contain"
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
