import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheet, Text, Input, Button, Avatar } from '../../components/ui';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { colors, spacing, borderRadius } from '@wunabuy/design-tokens';
import { AuthService } from '../../services/api';

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUri(user.avatar_url || null);
      setError(null);
    }
  }, [visible, user]);

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is needed to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. If avatar was changed, upload to server
      let finalAvatarUrl = user?.avatar_url;
      if (avatarUri && avatarUri !== user?.avatar_url) {
        const uploadRes = await AuthService.uploadAvatar(avatarUri);
        if (uploadRes.success && uploadRes.avatar_url) {
          finalAvatarUrl = uploadRes.avatar_url;
        }
      }

      // 2. Update profile details
      const payload: { full_name: string; email?: string; phone?: string; avatar_url?: string } = {
        full_name: fullName.trim(),
        avatar_url: finalAvatarUrl || undefined,
      };
      if (email.trim()) {
        payload.email = email.trim();
      }
      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      await AuthService.updateProfile(payload);
      onSuccess?.('Profile updated successfully! ✓');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Edit Profile Details">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text variant="caption" secondary style={styles.subtitle}>
            Keep your personal and contact details up to date for deliveries and verification.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.semantic.error[500]} />
              <Text variant="caption" color={colors.semantic.error[500]} style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* Avatar Photo Edit Widget */}
          <View style={styles.avatarEditContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickAvatar}
              style={styles.avatarPickerWrapper}
            >
              <Avatar
                url={avatarUri}
                name={fullName || user?.full_name || 'Member'}
                size={72}
                showBorder
              />
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handlePickAvatar} style={{ marginTop: 6 }}>
              <Text variant="caption" bold color={colors.primary[500]}>
                Change Profile Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldWrapper}>
            <Input
              label="Full Name *"
              placeholder="e.g. Marie Claire Ngono"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (error) setError(null);
              }}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary[500]} />}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Input
              label="Phone Number"
              placeholder="e.g. +237 670 123 456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={colors.primary[500]} />}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Input
              label="Email Address"
              placeholder="e.g. name@example.cm"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary[500]} />}
            />
          </View>

          <View style={styles.btnRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              variant="primary"
              size="medium"
              onPress={handleSave}
              disabled={loading}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    width: '100%',
  },
  content: {
    paddingBottom: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
  },
  fieldWrapper: {
    marginBottom: spacing.md,
  },
  avatarEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarPickerWrapper: {
    position: 'relative',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primary[500],
  },
});
