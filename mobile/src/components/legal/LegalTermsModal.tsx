import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '../ui';
import { colors, spacing, shadows } from '@wunabuy/design-tokens';
import { useThemeStore } from '../../stores/theme.store';

export type LegalDocType = 'terms' | 'privacy';

export interface LegalTermsModalProps {
  visible: boolean;
  initialTab?: LegalDocType;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  visible,
  initialTab = 'terms',
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const surfaceColor = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: surfaceColor }]}>
          <View style={styles.headerTitleRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
              <Text variant="caption" bold style={{ color: '#0D9488', marginLeft: 6 }}>
                LEGAL COMPLIANCE
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              accessibilityLabel="Close Legal Documents"
            >
              <Ionicons name="close" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text variant="h2" bold style={[styles.title, { color: textColor }]}>
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </Text>
          <Text variant="caption" style={[styles.metaText, { color: subtextColor }]}>
            Effective Date: September 15, 2026 • Version 3.7 • Cameroon & CEMAC Region
          </Text>

          {/* Segmented Tab Switcher */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' }]}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'terms' && [styles.activeTabItem, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }],
              ]}
              onPress={() => setActiveTab('terms')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="document-text-outline"
                size={16}
                color={activeTab === 'terms' ? '#0D9488' : subtextColor}
                style={{ marginRight: 6 }}
              />
              <Text
                variant="caption"
                bold={activeTab === 'terms'}
                style={{ color: activeTab === 'terms' ? '#0D9488' : subtextColor }}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'privacy' && [styles.activeTabItem, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }],
              ]}
              onPress={() => setActiveTab('privacy')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={activeTab === 'privacy' ? '#0D9488' : subtextColor}
                style={{ marginRight: 6 }}
              />
              <Text
                variant="caption"
                bold={activeTab === 'privacy'}
                style={{ color: activeTab === 'privacy' ? '#0D9488' : subtextColor }}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Legal Document Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {activeTab === 'terms' ? (
            <TermsOfServiceContent isDark={isDark} />
          ) : (
            <PrivacyPolicyContent isDark={isDark} />
          )}
        </ScrollView>

        {/* Action Footer */}
        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor: surfaceColor }]}>
          {showAcceptButton ? (
            <View style={styles.footerButtonRow}>
              <Button
                title="Decline & Close"
                variant="outline"
                onPress={onClose}
                style={styles.declineButton}
              />
              <Button
                title="I Agree & Accept ✓"
                variant="primary"
                onPress={() => {
                  if (onAccept) onAccept();
                  onClose();
                }}
                style={styles.acceptButton}
              />
            </View>
          ) : (
            <Button
              title="Close Legal Document"
              variant="secondary"
              onPress={onClose}
              style={{ width: '100%' }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ==========================================
// 1. TERMS OF SERVICE CONTENT
// ==========================================
const TermsOfServiceContent: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#475569';
  const sectionBg = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <View style={styles.docWrapper}>
      <View style={[styles.highlightBox, { backgroundColor: sectionBg, borderColor }]}>
        <Text variant="caption" bold style={{ color: '#0D9488', marginBottom: 4 }}>
          SUMMARY IN PLAIN LANGUAGE
        </Text>
        <Text variant="caption" style={{ color: subtextColor, lineHeight: 20 }}>
          Wunabuy protects all purchases with an automated Escrow Vault. When a buyer pays, money is safely held
          until the customer receives and verifies the parcel. Sellers get guaranteed payment upon delivery, and
          transporters earn instant fees for completed trips. By signing up, you agree to fair trading, authentic
          goods, and our community safety guidelines.
        </Text>
      </View>

      <SectionTitle number="1" title="Acceptance of Terms & Corporate Entity" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        Welcome to Wunabuy (referred to as "Wunabuy", "we", "us", or "our"), operated by Wunabuy Technologies SARL,
        duly registered under the laws of the Republic of Cameroon. By downloading, accessing, browsing, or
        registering an account on the Wunabuy Mobile Application or Web Portals, you ("User", "you") agree to be
        legally bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of
        these Terms, you must cease using our platform immediately.
      </Paragraph>

      <SectionTitle number="2" title="Eligibility & Multi-Workspace Account Integrity" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        To register on Wunabuy, you must be at least eighteen (18) years of age and possess legal capacity to enter into
        binding commercial contracts. You agree to provide true, accurate, and complete information, including a valid
        E.164 Cameroon mobile phone number (+237) and a secure 6-digit PIN. You are solely responsible for maintaining
        the confidentiality of your credentials. Wunabuy supports three user roles:
      </Paragraph>
      <BulletItem bold="Buyer Workspace: " text="Browse verified catalog items, lock funds in escrow, and track deliveries in real time." subtextColor={subtextColor} />
      <BulletItem bold="Seller (Store Owner) Workspace: " text="Requires business information, location verification, and adherence to authentic merchandise standards." subtextColor={subtextColor} />
      <BulletItem bold="Transporter (Driver) Workspace: " text="Requires valid driver license, vehicle roadworthiness (carte grise, insurance), and GPS dispatch conformity." subtextColor={subtextColor} />

      <SectionTitle number="3" title="Escrow Financial Protection & Mobile Money Settlement" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        Wunabuy implements an automated, dual-entry Escrow Engine designed to eliminate commerce fraud in emerging markets:
      </Paragraph>
      <BulletItem bold="Escrow Fund Locking: " text="When an order is created, buyer funds (paid via MTN MoMo, Orange Money, or In-App Wallet) are transferred into an escrow lock status (balance_escrow_locked). Sellers and transporters are notified to fulfill the order." subtextColor={subtextColor} />
      <BulletItem bold="Automated Release: " text="Upon the buyer confirming physical delivery (via OTP code or signature), escrow funds are instantly released: 96.5% net sales credit to Seller wallet, delivery fee credit to Transporter wallet, and 3.5% marketplace commission settled." subtextColor={subtextColor} />
      <BulletItem bold="48-Hour Auto-Completion: " text="If delivery proof is submitted by the carrier and the buyer neither confirms nor files a legitimate dispute within 48 hours, the system automatically finalizes the transaction." subtextColor={subtextColor} />
      <BulletItem bold="Registration Shopping Reward: " text="Promotional sign-up credits (such as 100 FCFA registration reward) are non-withdrawable and may only be applied toward eligible in-app purchases." subtextColor={subtextColor} />

      <SectionTitle number="4" title="Parcel Custody, Encrypted QR Codes & Logistics" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        Sellers generate cryptographically signed HMAC-SHA256 parcel shipping tags. Transporters must inspect and scan the
        physical parcel QR code with hardware camera sensors to verify parcel-trip match before dispatch. Buyers must verify
        parcel integrity before providing the final delivery completion code.
      </Paragraph>

      <SectionTitle number="5" title="Prohibited Items, Counterfeits & Zero-Fraud Policy" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        Sellers warrant that all goods listed are authentic, brand new or accurately graded, and legally acquired. The
        following are strictly prohibited: counterfeit goods, weapons, controlled narcotics, hazardous substances, and
        stolen property. Any merchant listing fraudulent items will face immediate account termination, forfeiture of escrow
        balances, and reporting to legal law enforcement authorities in Cameroon.
      </Paragraph>

      <SectionTitle number="6" title="Dispute Resolution & Legal Arbitration" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        If a product is damaged, missing, or materially not as described, the buyer may file a dispute through the app before
        the 48-hour release window expires. Wunabuy's legal adjudication team reviews photo evidence, GPS breadcrumbs, and
        carrier logs to issue a binding resolution:
      </Paragraph>
      <BulletItem bold="Buyer Refund: " text="100% of the principal is reversed to buyer's mobile money/wallet account." subtextColor={subtextColor} />
      <BulletItem bold="Seller Release: " text="Dispute dismissed if proof of accurate fulfillment is verified." subtextColor={subtextColor} />
      <BulletItem bold="Split Resolution: " text="50/50 compromise if partial fault is established." subtextColor={subtextColor} />

      <SectionTitle number="7" title="Account Deletion & Data Eradication" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        In compliance with Google Play Store User Data policies, any registered member may request the permanent deletion
        of their account and associated profile data via the in-app profile settings or by contacting privacy@wunabuy.com.
        Account deletion removes identity credentials and active sessions, while non-PII financial ledger entries are
        retained strictly as required by commercial tax regulations.
      </Paragraph>

      <SectionTitle number="8" title="Governing Law & Jurisdiction" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        These Terms shall be governed by and construed in accordance with the laws of the Republic of Cameroon and the
        OHADA uniform commercial acts. Any unresolved dispute arising out of or in connection with these Terms shall be
        submitted to the competent commercial courts of Douala, Littoral Region, Cameroon.
      </Paragraph>

      <View style={{ height: spacing.xl }} />
    </View>
  );
};

// ==========================================
// 2. PRIVACY POLICY CONTENT
// ==========================================
const PrivacyPolicyContent: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#475569';
  const sectionBg = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <View style={styles.docWrapper}>
      <View style={[styles.highlightBox, { backgroundColor: sectionBg, borderColor }]}>
        <Text variant="caption" bold style={{ color: '#0D9488', marginBottom: 4 }}>
          GOOGLE PLAY PRIVACY COMPLIANCE NOTICE
        </Text>
        <Text variant="caption" style={{ color: subtextColor, lineHeight: 20 }}>
          Wunabuy values your trust and strictly protects your privacy. We collect only the data necessary to process
          escrow payments, connect you with verified sellers, and navigate parcel deliveries directly to your doorstep.
          We NEVER sell your personal information to third-party advertisers.
        </Text>
      </View>

      <SectionTitle number="1" title="Information We Collect" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        We collect information that you directly provide when creating an account, browsing, or transacting:
      </Paragraph>
      <BulletItem bold="Account Credentials: " text="Full name, telephone number (+237 E.164), optional email address, and encrypted 6-digit PIN hash." subtextColor={subtextColor} />
      <BulletItem bold="Delivery Information: " text="Physical delivery addresses, street landmarks, neighborhood names, and recipient contact numbers." subtextColor={subtextColor} />
      <BulletItem bold="Financial Metadata: " text="Transaction IDs, MTN MoMo / Orange Money reference codes, wallet balances, and payout withdrawal records (we never store banking PINs)." subtextColor={subtextColor} />
      <BulletItem bold="Profile Media: " text="Avatar profile pictures, store branding logos, and product catalog imagery that you upload." subtextColor={subtextColor} />

      <SectionTitle number="2" title="Hardware Permissions & Justifications" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        In accordance with Google Play Store device permission guidelines, Wunabuy requests access to specific hardware
        features solely for core functionality:
      </Paragraph>
      <BulletItem bold="Precise Location (GPS): " text="Used during active orders to calculate dynamic delivery fees, route transporters from store to customer doorstep, and display real-time tracking markers on the map." subtextColor={subtextColor} />
      <BulletItem bold="Camera Access: " text="Used for scanning encrypted parcel QR tags, product barcode scanning (EAN-13 / UPC), and taking delivery proof photos upon arrival." subtextColor={subtextColor} />
      <BulletItem bold="Photo Library / Storage: " text="Used solely when you choose to upload a user avatar, store logo, or product catalog photos from your device storage." subtextColor={subtextColor} />

      <SectionTitle number="3" title="How We Use Your Data" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        We use the collected information exclusively for legitimate platform operations:
      </Paragraph>
      <BulletItem bold="Order Execution & Escrow: " text="Facilitating item purchases, securing buyer funds in escrow, and releasing payouts upon verified delivery." subtextColor={subtextColor} />
      <BulletItem bold="Customer Support & Safety: " text="Investigating non-delivery reports, adjudicating buyer-seller disputes, and preventing unauthorized account takeover." subtextColor={subtextColor} />
      <BulletItem bold="Platform Optimization: " text="Monitoring API response latencies, server stability, and network performance in Cameroon urban centers." subtextColor={subtextColor} />

      <SectionTitle number="4" title="Data Sharing & Third-Party Disclosures" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        Wunabuy does not sell, rent, or trade your personal data. Disclosures occur only in the following necessary contexts:
      </Paragraph>
      <BulletItem bold="Telecom / Mobile Money Carriers: " text="MTN Cameroon and Orange Cameroun for USSD payment authentication (*126# / #150*50#)." subtextColor={subtextColor} />
      <BulletItem bold="Assigned Delivery Transporters: " text="Recipient name, telephone number, and delivery address are shared with the designated carrier strictly for the duration of the active delivery." subtextColor={subtextColor} />
      <BulletItem bold="Legal Compliance: " text="When strictly required by binding court orders or statutory law enforcement directives in Cameroon." subtextColor={subtextColor} />

      <SectionTitle number="5" title="Data Security & Encryption Standards" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        All data transmitted between the mobile application and Wunabuy backend servers is encrypted in transit using
        Transport Layer Security (TLS 1.3 / HTTPS). Sensitive access tokens are stored securely in hardware-backed
        device storage (Android Keystore / iOS Keychain via SecureTokenService). Session tokens auto-refresh and
        feature automated timeout protections.
      </Paragraph>

      <SectionTitle number="6" title="User Rights & Account Deletion Request" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        You have the right to access, review, update, or correct your personal information at any time. Under Google Play
        User Data standards, you can request full account deletion and data erasure by navigating to Profile &gt; Settings &gt;
        Delete Account, or by sending a written notice to privacy@wunabuy.com with your registered phone number.
      </Paragraph>

      <SectionTitle number="7" title="Contact Us & Data Protection Officer" textColor={textColor} />
      <Paragraph textColor={subtextColor}>
        If you have questions, inquiries, or grievances regarding our privacy practices, please reach out to:
      </Paragraph>
      <BulletItem bold="Corporate Entity: " text="Wunabuy Technologies SARL" subtextColor={subtextColor} />
      <BulletItem bold="Headquarters: " text="Akwa Business Center, Boulevard de la Liberté, Douala, Cameroon" subtextColor={subtextColor} />
      <BulletItem bold="Legal & Privacy Email: " text="privacy@wunabuy.com • support@wunabuy.com" subtextColor={subtextColor} />
      <BulletItem bold="Customer Telephone: " text="+237 682 656 287" subtextColor={subtextColor} />

      <View style={{ height: spacing.xl }} />
    </View>
  );
};

// ==========================================
// HELPER SUBCOMPONENTS
// ==========================================
const SectionTitle: React.FC<{ number: string; title: string; textColor: string }> = ({ number, title, textColor }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionNumberBadge}>
      <Text variant="caption" bold style={{ color: '#FFFFFF', fontSize: 11 }}>
        {number}
      </Text>
    </View>
    <Text variant="bodyLarge" bold style={[styles.sectionTitleText, { color: textColor }]}>
      {title}
    </Text>
  </View>
);

const Paragraph: React.FC<{ children: React.ReactNode; textColor: string }> = ({ children, textColor }) => (
  <Text variant="bodyMedium" style={[styles.paragraphText, { color: textColor }]}>
    {children}
  </Text>
);

const BulletItem: React.FC<{ bold: string; text: string; subtextColor: string }> = ({ bold, text, subtextColor }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletPoint}>•</Text>
    <Text variant="caption" style={[styles.bulletText, { color: subtextColor }]}>
      <Text variant="caption" bold style={{ color: subtextColor }}>{bold}</Text>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#0D948818',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 2,
  },
  metaText: {
    marginBottom: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    marginTop: spacing.xs,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    ...shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  docWrapper: {
    width: '100%',
  },
  highlightBox: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sectionTitleText: {
    fontSize: 15,
    flex: 1,
  },
  paragraphText: {
    lineHeight: 22,
    marginBottom: spacing.sm,
    fontSize: 13.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  bulletPoint: {
    color: '#0D9488',
    fontSize: 16,
    lineHeight: 20,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  footerButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1.4,
  },
});
