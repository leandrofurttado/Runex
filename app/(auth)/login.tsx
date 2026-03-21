import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !nickname.trim())) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nickname } },
        });
        if (error) throw error;
        Alert.alert('Conta criada!', 'Verifique seu email para confirmar a conta.');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🏃</Text>
          <Text style={styles.logoTitle}>RUN QUEST</Text>
          <Text style={styles.logoSub}>Corra. Explore. Evolua.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={styles.label}>NICKNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu apelido de corredor"
                placeholderTextColor={Colors.textDim}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>SENHA</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor={Colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>{isLogin ? 'ENTRAR' : 'CRIAR CONTA'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    letterSpacing: 5,
    textShadowColor: Colors.neonGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  logoSub: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.neonGreenBorder,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: Colors.neonGreen,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 7,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
  },
  btn: {
    backgroundColor: Colors.neonGreen,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 2,
  },
  switchBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
