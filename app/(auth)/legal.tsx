// app/(auth)/legal.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'terms' | 'privacy' }>();

  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Use' : 'Privacy Policy';
  const lastUpdated = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        
        <Text style={styles.headerTitle}>{title}</Text>
        
        {/* Spacer */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={styles.metaContainer}>
          <Text style={styles.updated}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TermsContent = () => (
  <>
    <Text style={styles.body}>
      These Terms of Use ("Terms") govern your use of the HOSTELSHUB platform
      ("HOSTELSHUB", "we", "our", "us"). By creating an account or using the
      website, you agree to these Terms.
    </Text>

    <Section title="1. Platform Only">
      <Text style={styles.body}>
        HOSTELSHUB is not a hostel owner. We only provide a platform where
        managers post hostels and students can browse, reserve and book. Any stay,
        payment or agreement is strictly between manager and student.
      </Text>
    </Section>

    <Section title="2. Accounts & Roles">
      <BulletPoint>
        Students use HOSTELSHUB to find accommodation, send reservations, create
        bookings and chat with managers.
      </BulletPoint>
      <BulletPoint>
        Managers list hostels, set room types and prices, and manage student
        bookings.
      </BulletPoint>
      <BulletPoint>
        Admins/Sub-admins review verifications, fees and reports, and may
        moderate accounts.
      </BulletPoint>
      <BulletPoint>
        You are responsible for all activity under your account and for keeping
        your login details secure.
      </BulletPoint>
    </Section>

    <Section title="3. Payments & Responsibility">
      <BulletPoint>
        Payments are made directly between students and managers (e.g.
        Easypaisa, JazzCash, bank transfer). HOSTELSHUB does not hold or guarantee
        your funds.
      </BulletPoint>
      <BulletPoint>
        HOSTELSHUB is not responsible for any scams, non-payment, refund
        disputes or personal agreements between students and managers.
      </BulletPoint>
      <BulletPoint>
        Always use the in-app Chat before sending money and do not send funds if
        something seems suspicious.
      </BulletPoint>
    </Section>

    <Section title="4. Manager Platform Fee">
      <Text style={styles.body}>Managers agree to pay a platform fee of:</Text>
      <BulletPoint>Rs. 100 per student admission (one-time per new student).</BulletPoint>
      <BulletPoint>Rs. 100 per active student per month.</BulletPoint>
      <Text style={styles.body}>
        This fee is paid by managers to keep the HOSTELSHUB platform live.
        Students do not pay this fee directly to Hostels.
      </Text>
    </Section>

    <Section title="5. Behaviour & Misuse">
      <BulletPoint>
        You must not post fake listings, use fake profiles, harass others or
        misuse the reporting/chat features.
      </BulletPoint>
      <BulletPoint>
        You must follow local laws, hostel rules and any lawful instructions
        from relevant authorities.
      </BulletPoint>
      <BulletPoint>
        HOSTELSHUB may suspend or terminate accounts that break these Terms or
        create risk for other users.
      </BulletPoint>
    </Section>

    <Section title="6. Account Actions & Warnings">
      <Text style={styles.body}>
        In case of serious issues (such as scams, fraud or repeated abuse),
        HOSTELSHUB may, at its own discretion:
      </Text>
      <BulletPoint>Temporarily suspend or permanently terminate accounts.</BulletPoint>
      <BulletPoint>
        Add warnings or visible posters/notices for specific hostels or
        students to inform the community.
      </BulletPoint>
    </Section>

    <Section title="7. Changes to Terms">
      <Text style={styles.body}>
        We may update these Terms at any time. Updated versions will be available
        on this page. Your continued use of HOSTELSHUB means you accept the
        updated Terms.
      </Text>
    </Section>
  </>
);

const PrivacyContent = () => (
  <>
    <Text style={styles.body}>
      This Privacy & Safety Policy explains how HOSTELSHUB works, what we are
      responsible for, and what you agree to when you use our platform as a
      student or manager.
    </Text>

    <Section title="1. We are a platform, not hostel owners">
      <Text style={styles.body}>
        HOSTELSHUB is not a hostel owner or property dealer. We only provide an
        online platform where hostel managers post their hostels and students can
        browse, reserve and book those hostels.
      </Text>
    </Section>

    <Section title="2. Payments, scams & responsibility">
      <BulletPoint>
        All payments and agreements are strictly between student and manager.
        HOSTELSHUB does not hold your money and is not responsible for any loss,
        scam or dispute.
      </BulletPoint>
      <BulletPoint>
        Always use the "Chat with Manager" feature before sending money. Confirm
        details (amount, account number, room type, dates, etc.) directly with the
        manager.
      </BulletPoint>
      <BulletPoint>
        Do not send money to anyone without first talking to the manager inside
        the platform. If something feels suspicious, stop immediately and report
        it.
      </BulletPoint>
    </Section>

    <Section title="3. Manager platform fee">
      <Text style={styles.body}>
        To keep HOSTELSHUB running and improve the service, managers agree to pay:
      </Text>
      <BulletPoint>Rs. 100 per student admission (one-time per new student).</BulletPoint>
      <BulletPoint>Rs. 100 per active student per month (monthly platform fee).</BulletPoint>
      <Text style={styles.body}>
        Students do not pay this platform fee directly to HOSTELSHUB. It is
        collected from managers only.
      </Text>
    </Section>

    <Section title="4. Account actions in case of scams">
      <Text style={styles.body}>
        If we receive serious reports or clear proof of fraud, scams or abuse,
        HOSTELSHUB may:
      </Text>
      <BulletPoint>Suspend or permanently terminate manager and/or student accounts.</BulletPoint>
      <BulletPoint>
        Add warnings or visible notices (posters/flags) on specific hostels or
        users to create awareness for others.
      </BulletPoint>
      <Text style={styles.body}>
        These actions are at the discretion of HOSTELSHUB and may be taken even if
        the issue happened outside the platform but is related to a booking
        arranged through HOSTELSHUB.
      </Text>
    </Section>

    <Section title="5. Data we collect & how we use it">
      <Text style={styles.body}>
        We only collect information needed to run the platform and keep it safe,
        such as:
      </Text>
      <BulletPoint>Account details (email, role, basic profile information).</BulletPoint>
      <BulletPoint>
        Student and manager profile data (contact info, hostel details,
        verification data, payment proofs).
      </BulletPoint>
      <BulletPoint>Booking, reservation and fee records.</BulletPoint>
      <BulletPoint>Messages and reports shared through the platform.</BulletPoint>
      <Text style={styles.body}>
        This information is used to operate your account, show hostel listings,
        process bookings and fees, and help detect and investigate abuse or fraud.
        We do not sell your personal data to third parties.
      </Text>
    </Section>

    <Section title="6. Sharing of information">
      <BulletPoint>
        Student details are shared with managers when you book or reserve a
        hostel, so they can contact you and manage your stay.
      </BulletPoint>
      <BulletPoint>
        Manager and hostel details are shown to students so they can decide
        whether to book or reserve.
      </BulletPoint>
      <BulletPoint>
        Admins and support staff can access relevant data to handle
        verifications, fees and reports.
      </BulletPoint>
      <BulletPoint>
        We may share data if required by law or to protect our rights, users or
        the public.
      </BulletPoint>
    </Section>

    <Section title="7. Your responsibilities">
      <BulletPoint>Use real, accurate information in your profile and verification.</BulletPoint>
      <BulletPoint>Follow hostel rules and local laws.</BulletPoint>
      <BulletPoint>
        Do not misuse chat, bookings or reports to harass, spam or falsely
        accuse others.
      </BulletPoint>
    </Section>

    <Section title="8. Changes to this policy">
      <Text style={styles.body}>
        We may update this Privacy & Safety Policy from time to time. Updates will
        be published on this page. Continuing to use HOSTELSHUB means you accept
        the latest version.
      </Text>
    </Section>

    <Text style={styles.disclaimer}>
      This page is for general guidance only and does not replace independent
      legal advice. If you have any questions or concerns, please contact us
      through the support or contact options in the app.
    </Text>
  </>
);

// Helper Components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.heading}>{title}</Text>
    {children}
  </View>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  // Meta
  metaContainer: {
    marginBottom: 24,
  },
  updated: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },

  // Content
  contentContainer: {
    flex: 1,
  },

  // Section
  section: {
    marginTop: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },

  // Bullet points
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingRight: 16,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    fontStyle: 'italic',
  },
});