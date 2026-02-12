import { Search, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../src/theme/colors';

type Props = {
  value: string;
  onSelect: (v: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  visible: boolean;
  onClose: () => void;
  disabled?: boolean;
};

export default function SearchableDropdown({
  value,
  onSelect,
  options,
  placeholder = 'Selecionar…',
  searchPlaceholder = 'Buscar…',
  visible,
  onClose,
  disabled,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = useCallback(
    (item: string) => {
      onSelect(item);
      setQuery('');
      onClose();
    },
    [onSelect, onClose]
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.box}>
          <View style={styles.header}>
            <View style={styles.searchWrap}>
              <Search size={18} color={colors.textLight} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textLight}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={22} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  item === value && styles.itemSelected,
                ]}
                onPress={() => handleSelect(item)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    item === value && styles.itemTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhum resultado</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  box: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.rosaMedio,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rosaMedio,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rosaSuper,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    maxHeight: 320,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rosaMedio,
  },
  itemSelected: {
    backgroundColor: 'rgba(172, 23, 84, 0.08)',
  },
  itemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text,
  },
  itemTextSelected: {
    color: colors.headerBg,
    fontWeight: '600',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textLight,
  },
});
