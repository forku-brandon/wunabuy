import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ScreenContainer, Text, Card, Button, Badge, Input, BottomSheet } from '../../components/ui';
import { Address } from '@wunabuy/types';
import { useThemeStore } from '../../stores/theme.store';
import { spacing, colors } from '@wunabuy/design-tokens';

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    label: 'Home',
    latitude: 4.0510564,
    longitude: 9.7678687,
    address_text: 'Rue Joss, Akwa, Douala',
    city: 'Douala',
    is_default: true,
  },
  {
    id: 'addr_2',
    label: 'Office',
    latitude: 4.0551000,
    longitude: 9.7690000,
    address_text: 'Boulevard de la Liberté, Bonanjo, Douala',
    city: 'Douala',
    is_default: false,
  },
];

export const AddressManagerScreen = () => {
  const { theme } = useThemeStore();
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New Address Form State
  const [label, setLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [city, setCity] = useState('Douala');

  const handleAddAddress = () => {
    if (!label.trim() || !addressText.trim()) return;

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      label: label.trim(),
      latitude: 4.0510564,
      longitude: 9.7678687,
      address_text: addressText.trim(),
      city: city.trim(),
      is_default: addresses.length === 0,
    };

    setAddresses([...addresses, newAddress]);
    setLabel('');
    setAddressText('');
    setIsModalVisible(false);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" bold>
          Saved Addresses
        </Text>
        <Text variant="bodyMedium" secondary>
          Manage delivery destinations for rapid escrow checkout.
        </Text>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text variant="h3" bold>
                📍 {item.label}
              </Text>
              {item.is_default && <Badge label="DEFAULT" variant="primary" />}
            </View>

            <Text variant="bodyMedium" secondary style={styles.addressText}>
              {item.address_text}, {item.city}
            </Text>
          </Card>
        )}
      />

      <Button
        title="+ Add New Address"
        variant="outline"
        onPress={() => setIsModalVisible(true)}
        style={styles.addButton}
      />

      <BottomSheet
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add Delivery Address"
      >
        <Input
          label="Address Label"
          placeholder="e.g. Home, Work, Aunt's House"
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
          title="Save Address"
          variant="primary"
          onPress={handleAddAddress}
          style={styles.saveButton}
        />
      </BottomSheet>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addressCard: {
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  addressText: {
    lineHeight: 20,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
