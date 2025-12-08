// screens/LoginScreen.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { authApi } from "@/api/auth";
import { Button, Input } from "@/components/ui";
import { COLORS, OPACITY } from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";
import { LoginFormData, loginSchema } from "@/utils/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const slowServerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);

      // Start 10-second timer for slow server notification
      slowServerTimeoutRef.current = setTimeout(() => {
        Toast.show({
          type: "info",
          text1: "Ahhh, Here we go slow server",
          text2: "Just few more seconds. Sorry, we're working to change server but it costs 🥴",
          visibilityTime: 5000,
        });
      }, 10000);

      const response = await authApi.login(data);

      // Clear the slow server timeout
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
        slowServerTimeoutRef.current = null;
      }

      if (response.success && response.data) {
        const { user, token } = response.data;

        if (user.role === "ADMIN" || user.role === "SUBADMIN") {
          Toast.show({
            type: "error",
            text1: "Access Denied",
            text2: "Admin accounts cannot access mobile app",
          });
          return;
        }

        await setAuth(user, token);

        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: `Logged in as ${user.email}`,
        });

        if (user.role === "STUDENT") {
          router.replace("/(app)/student");
        } else {
          router.replace("/(app)/manager");
        }
      }
    } catch (error: any) {
      // Clear the slow server timeout
      if (slowServerTimeoutRef.current) {
        clearTimeout(slowServerTimeoutRef.current);
        slowServerTimeoutRef.current = null;
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <Animated.View
            style={styles.header}
            entering={FadeInUp.duration(500).delay(100)}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeLabel}>Welcome back</Text>
              <Text style={styles.title}>Sign in to continue</Text>
              <Text style={styles.subtitle}>
                Access your hostel bookings and manage your stay
              </Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={styles.formSection}
            entering={FadeInDown.duration(500).delay(200)}
          >
            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  leftIcon={<Lock size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            {/* Forgot Password */}
            <Pressable 
              style={({ pressed }) => [
                styles.forgotButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                icon={<ArrowRight size={18} color={COLORS.textInverse} strokeWidth={2} />}
              />
            </View>
          </Animated.View>

          {/* Footer Section */}
          <Animated.View
            style={styles.footer}
            entering={FadeInUp.duration(500).delay(300)}
          >
            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
              >
                <Text style={styles.registerLink}>Create account</Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing in, you agree to our{" "}
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/(auth)/legal?type=terms")}
              >
                Terms
              </Text>{" "}
              and{" "}
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/(auth)/legal?type=privacy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 50,
  },
  titleContainer: {
    alignItems: "center",
  },
  welcomeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Form
  formSection: {
    flex: 1,
  },
  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    marginTop: -8,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 16,
  },

  // Footer
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  registerText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  registerButton: {
    paddingVertical: 4,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "500",
  },
});