import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userRepository } from '../../data/repositories';
import { FORD_COLORS, SPACING } from '../../shared/theme';
import { ROUTES, FORD_LOGO } from '../../shared/constants';
import { Button, Input } from '../components';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.spring(formAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await userRepository.login({ email, password });
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (e) {
      setError('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          styles.header,
          {
            opacity: logoAnim,
            transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}>
          <Image source={FORD_LOGO} style={styles.logo} resizeMode="contain" />
          <View style={styles.line} />
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </Animated.View>

        <Animated.View style={[
          styles.form,
          {
            opacity: formAnim,
            transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          },
        ]}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </Animated.View>

        <Animated.View style={[styles.registerContainer, { opacity: footerAnim }]}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 110,
    height: 44,
    marginBottom: 16,
  },
  line: {
    width: 28,
    height: 2,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: FORD_COLORS.DARK_GRAY,
    letterSpacing: 0.3,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: FORD_COLORS.ERROR,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: FORD_COLORS.DARK_GRAY,
    fontSize: 14,
  },
  registerLink: {
    color: FORD_COLORS.FORD_BLUE,
    fontSize: 14,
    fontWeight: '600',
  },
});