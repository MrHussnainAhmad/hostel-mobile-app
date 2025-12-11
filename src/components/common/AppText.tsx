import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextProps } from "react-native";

interface AppTextProps extends TextProps {
  // You can add custom props here if needed
}

const AppText: React.FC<AppTextProps> = ({ style, children, ...rest }) => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === "ur";

  return (
    <Text style={[style, isUrdu && styles.urduText]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  urduText: {
    fontFamily: "NotoNastaliqUrdu",
    fontSize: 14, // <— increase Urdu font size
    lineHeight: 30, // <— adjust line spacing for Nastaliq
    letterSpacing: 0.3,
    fontWeight: undefined, // Nastaliq only supports normal weight
  },
});

export default AppText;
