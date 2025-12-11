import { COLORS } from '@/constants/colors';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <AppText style={styles.title}>Page not found</AppText>
        <Link href="/" style={styles.link}>
          <AppText style={styles.linkText}>Go to home</AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgPrimary,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.primary,
  },
});