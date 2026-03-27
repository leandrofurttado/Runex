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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';
import { AnimatedRunexLogo } from '@/components/brand/AnimatedRunexLogo';

export default function LoginScreen() {
  const { colors, isDark, toggleDark } = useTheme();
  const insets = useSafeAreaInsets();
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

  const horizontalPad = Math.max(24, insets.left, insets.right);
  const topPad = Math.max(24, insets.top);
  const bottomPad = Math.max(40, insets.bottom) + 24;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableOpacity
        onPress={toggleDark}
        style={[
          styles.themeCornerBtn,
          {
            top: insets.top + 8,
            right: Math.max(16, insets.right + 8),
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={colors.primary} />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPad, paddingTop: topPad, paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <AnimatedRunexLogo size={180} containerStyle={styles.logoMark} />
          <Text style={[styles.logoSub, { color: colors.textMuted }]}>
            CORRA. EVOLUA. TENHA SAÚDE COM DIVERSÃO E COMPETITIVIDADE...
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>

          {!isLogin && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.primary }]}>NICKNAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                placeholder="Seu apelido de corredor"
                placeholderTextColor={colors.textDim}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.primary }]}>EMAIL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.primary }]}>SENHA</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
              placeholder="Sua senha"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.btnDisabled]}
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
            <Text style={[styles.switchText, { color: colors.textMuted }]}>
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
  },
  themeCornerBtn: {
    position: 'absolute',
    zIndex: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
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
  logoMark: {
    marginBottom: 4,
  },
  logoSub: {
    fontSize: 15,
    letterSpacing: 1,
    marginTop: 2,
    textTransform: 'uppercase',
    fontFamily: Fonts.medium,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
    maxWidth: 360,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 22,
    fontFamily: Fonts.bold,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 7,
    fontFamily: Fonts.bold,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
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
    fontSize: 15,
    letterSpacing: 2,
    fontFamily: Fonts.bold,
  },
  switchBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
});
