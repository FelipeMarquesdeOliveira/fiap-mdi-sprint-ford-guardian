import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, Image, Animated, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { userRepository } from '../../data/repositories';
import { User } from '../../domain/entities/User';
import { FORD_COLORS, SPACING, TYPOGRAPHY } from '../../shared/theme';
import { ROUTES, FORD_LOGO } from '../../shared/constants';
import { Button } from '../components';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.stagger(120, [
        Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(contentAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const loadUser = async () => {
    try {
      const currentUser = await userRepository.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await userRepository.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: ROUTES.LOGIN }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Image source={FORD_LOGO} style={styles.headerLogo} resizeMode="contain" />
        </View>

        {/* User info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[
        styles.content,
        {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        {/* Personal data */}
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <View style={styles.section}>
          <InfoRow label="Nome" value={user?.name || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Telefone" value={user?.phone || '—'} last />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.section}>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.prefTitle}>Notificações</Text>
              <Text style={styles.prefDesc}>Alertas sobre seu veículo</Text>
            </View>
            <Switch
              value={user?.preferences?.notificationsEnabled ?? true}
              trackColor={{ false: '#D8D8D8', true: FORD_COLORS.FORD_BLUE }}
              thumbColor={FORD_COLORS.WHITE}
            />
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.section}>
          <InfoRow label="Versão" value="1.0.0" />
          <InfoRow label="Projeto" value="Ford x FIAP" last />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout" size={18} color={FORD_COLORS.ERROR} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

// Info row component
const InfoRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <View style={[irStyles.row, !last && irStyles.border]}>
    <Text style={irStyles.label}>{label}</Text>
    <Text style={irStyles.value}>{value}</Text>
  </View>
);

const irStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  label: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: FORD_COLORS.FORD_CHARCOAL,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  headerLogo: {
    width: 60,
    height: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
  },
  userInfo: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  userEmail: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: FORD_COLORS.DARK_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  section: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  prefDesc: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: FORD_COLORS.ERROR,
  },
});