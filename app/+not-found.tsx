import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.message}>Esta tela não existe.</Text>
        <Link href="/(app)" style={styles.link}>
          <Text style={styles.linkText}>Ir para o início →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  code: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 16,
    marginTop: 8,
  },
  link: {
    marginTop: 24,
  },
  linkText: {
    color: Colors.neonGreen,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
