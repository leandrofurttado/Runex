import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.code, { color: colors.primary }]}>404</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>Esta tela não existe.</Text>
        <Link href="/(app)" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Ir para o início →</Text>
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
    padding: 24,
  },
  code: {
    fontSize: 72,
    fontFamily: Fonts.bold,
  },
  message: {
    fontSize: 16,
    marginTop: 8,
    fontFamily: Fonts.regular,
  },
  link: {
    marginTop: 24,
  },
  linkText: {
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: Fonts.medium,
  },
});
