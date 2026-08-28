import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, Card, Button, Badge, Input, BottomSheet, Toast } from '../../components/ui';
import { Address } from '@wunabuy/types';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors, borderRadius } from '@wunabuy/design-tokens';

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    label: 'Home',
    latitude: 4.0510564,
    longitude: 9.7678687,
    address_text: 'Rue Joss, Akwa',
    city: 'Douala',
    is_default: true,
  },
  {
    id: 'addr_2',
    label: 'Office',
    latitude: 4.0551000,
    longitude: 9.7690000,
    address_text: 'Boulevard de la Liberté, Bonanjo',
    city: 'Douala',
    is_default: false,
  },
];

export const AddressManagerScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Address Form State
  const [label, setLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Douala');

  const openCreateModal = () => {
    setEditingAddressId(null);
    setLabel('');
    setAddressText('');
    setCity('Douala');
    setIsModalVisible(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setLabel(addr.label);
    setAddressText(addr.address_text);
    setCity(addr.city);
    setIsModalVisible(true);
  };

  const handleSaveAddress = () => {
    if (!label.trim() || !addressText.trim()) return;

    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddressId
            ? { ...a, label: label.trim(), address_text: addressText.trim(), city: city.trim() }
            : a
        )
      );
      setToastMessage('Address updated successfully!');
    } else {
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        label: label.trim(),
        latitude: 4.0510564,
        longitude: 9.7678687,
        address_text: addressText.trim(),
        city: city.trim(),
        is_default: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddress]);
      setToastMessage('New address saved!');
    }

    setLabel('');
    setAddressText('');
    setEditingAddressId(null);
    setIsModalVisible(false);
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
    setToastMessage('Default delivery address updated.');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.is_default)) {
        remaining[0].is_default = true;
      }
      return remaining;
    });
    setToastMessage('Address removed.');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else if (navigation?.reset) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'BuyerApp' }],
                });
              }
            }}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text variant="h1" bold style={styles.headerTitle}>
            Saved Addresses
          </Text>
        </View>
        <Text variant="bodyMedium" secondary style={styles.headerSubtitle}>
          Manage delivery destinations for rapid 1-tap escrow checkout.
        </Text>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={[styles.addressCard, { borderColor: item.is_default ? colors.primary[500] : theme.border }]}>
            <View style={styles.addressHeader}>
              <View style={styles.labelRow}>
                <Text variant="h3" bold>
                  📍 {item.label}
                </Text>
                {item.is_default && <Badge label="DEFAULT" variant="primary" />}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openEditModal(item)}
                  style={styles.iconBtn}
                >
                  <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDeleteAddress(item.id)}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.semantic.error[500]} />
                </TouchableOpacity>
              </View>
            </View>

            <Text variant="bodyMedium" secondary style={styles.addressText}>
              {item.address_text}, {item.city}
            </Text>

            {!item.is_default && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSetDefault(item.id)}
                style={styles.setDefaultBtn}
              >
                <Text variant="caption" bold color={colors.primary[500]}>
                  Set as Default Delivery Address
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}
      />

      <Button
        title="+ Add New Address"
        variant="primary"
        onPress={openCreateModal}
        style={styles.addButton}
      />

      <BottomSheet
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
      >
        <Input
          label="Address Label"
          placeholder="e.g. Home, Work, Boutique"
          value={label}
          onChangeText={setLabel}
        />

        <Input
          label="Street Address / Quarter"
          placeholder="e.g. Rue Joss, Akwa"
          value={addressText}
          onChangeText={setAddressText}
        />

        <Input
          label="City"
          placeholder="Douala"
          value={city}
          onChangeText={setCity}
        />

        <Button
          title={editingAddressId ? 'Update Address' : 'Save Address'}
          variant="primary"
          onPress={handleSaveAddress}
          style={styles.saveButton}
        />
      </BottomSheet>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  headerSubtitle: {
    lineHeight: 20,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  addressCard: {
    borderWidth: 1.5,
    padding: spacing.base,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: 6,
  },
  addressText: {
    lineHeight: 20,
    marginTop: 2,
  },
  setDefaultBtn: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  addButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
