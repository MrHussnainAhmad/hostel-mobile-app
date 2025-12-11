// app/(auth)/legal.tsx

import AppText from "@/components/common/AppText";
import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'terms' | 'privacy' }>();
  const { t, i18n } = useTranslation();

  const isTerms = type === 'terms';
  const title = isTerms ? t('legal.terms.title') : t('legal.privacy.title');

  const locale = i18n.language === 'ur' ? 'ur-PK' : 'en-PK';
  const lastUpdated = new Date().toLocaleDateString(locale, {
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
        
        <AppText style={styles.headerTitle}>{title}</AppText>
        
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
          <AppText style={styles.updated}>
            {t('legal.last_updated', { date: lastUpdated })}
          </AppText>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TermsContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppText style={styles.body}>
        {t('legal.terms.intro')}
      </AppText>

      <Section title={t('legal.terms.section1_title')}>
        <AppText style={styles.body}>
          {t('legal.terms.section1_body1')}
        </AppText>
      </Section>

      <Section title={t('legal.terms.section2_title')}>
        <BulletPoint>
          {t('legal.terms.section2_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section2_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section2_bullet3')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section2_bullet4')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.terms.section3_title')}>
        <BulletPoint>
          {t('legal.terms.section3_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section3_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section3_bullet3')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.terms.section4_title')}>
        <AppText style={styles.body}>
          {t('legal.terms.section4_body1')}
        </AppText>
        <BulletPoint>
          {t('legal.terms.section4_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section4_bullet2')}
        </BulletPoint>
        <AppText style={styles.body}>
          {t('legal.terms.section4_body2')}
        </AppText>
      </Section>

      <Section title={t('legal.terms.section5_title')}>
        <BulletPoint>
          {t('legal.terms.section5_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section5_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section5_bullet3')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.terms.section6_title')}>
        <AppText style={styles.body}>
          {t('legal.terms.section6_body1')}
        </AppText>
        <BulletPoint>
          {t('legal.terms.section6_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.terms.section6_bullet2')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.terms.section7_title')}>
        <AppText style={styles.body}>
          {t('legal.terms.section7_body1')}
        </AppText>
      </Section>
    </>
  );
};

const PrivacyContent = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppText style={styles.body}>
        {t('legal.privacy.intro')}
      </AppText>

      <Section title={t('legal.privacy.section1_title')}>
        <AppText style={styles.body}>
          {t('legal.privacy.section1_body1')}
        </AppText>
      </Section>

      <Section title={t('legal.privacy.section2_title')}>
        <BulletPoint>
          {t('legal.privacy.section2_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section2_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section2_bullet3')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.privacy.section3_title')}>
        <AppText style={styles.body}>
          {t('legal.privacy.section3_body1')}
        </AppText>
        <BulletPoint>
          {t('legal.privacy.section3_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section3_bullet2')}
        </BulletPoint>
        <AppText style={styles.body}>
          {t('legal.privacy.section3_body2')}
        </AppText>
      </Section>

      <Section title={t('legal.privacy.section4_title')}>
        <AppText style={styles.body}>
          {t('legal.privacy.section4_body1')}
        </AppText>
        <BulletPoint>
          {t('legal.privacy.section4_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section4_bullet2')}
        </BulletPoint>
        <AppText style={styles.body}>
          {t('legal.privacy.section4_body2')}
        </AppText>
      </Section>

      <Section title={t('legal.privacy.section5_title')}>
        <AppText style={styles.body}>
          {t('legal.privacy.section5_body1')}
        </AppText>
        <BulletPoint>
          {t('legal.privacy.section5_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section5_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section5_bullet3')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section5_bullet4')}
        </BulletPoint>
        <AppText style={styles.body}>
          {t('legal.privacy.section5_body2')}
        </AppText>
      </Section>

      <Section title={t('legal.privacy.section6_title')}>
        <BulletPoint>
          {t('legal.privacy.section6_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section6_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section6_bullet3')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section6_bullet4')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.privacy.section7_title')}>
        <BulletPoint>
          {t('legal.privacy.section7_bullet1')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section7_bullet2')}
        </BulletPoint>
        <BulletPoint>
          {t('legal.privacy.section7_bullet3')}
        </BulletPoint>
      </Section>

      <Section title={t('legal.privacy.section8_title')}>
        <AppText style={styles.body}>
          {t('legal.privacy.section8_body1')}
        </AppText>
      </Section>

      <AppText style={styles.disclaimer}>
        {t('legal.privacy.disclaimer')}
      </AppText>
    </>
  );
};

// Helper Components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <AppText style={styles.heading}>{title}</AppText>
    {children}
  </View>
);

const BulletPoint = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bulletDot} />
    <AppText style={styles.bulletText}>{children}</AppText>
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