import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userRepository } from '../../data/repositories';
import { User } from '../../domain/entities/User';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Button, Card, FordLogo } from '../components';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

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
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.avatarBadge}>
            <FordLogo size={20} color={FORD_COLORS.FORD_BLUE} />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>
        </Card>

        <Card style={styles.preferencesCard}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Notificações</Text>
              <Text style={styles.preferenceDescription}>Alertas sobre seu veículo</Text>
            </View>
            <Switch
              value={user?.preferences?.notificationsEnabled ?? true}
              trackColor={{ false: FORD_COLORS.MEDIUM_GRAY, true: FORD_COLORS.FORD_BLUE }}
              thumbColor={FORD_COLORS.WHITE}
            />
          </View>
        </Card>

        <Card style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Versão</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Projeto</Text>
            <Text style={styles.aboutValue}>Ford x FIAP</Text>
          </View>
        </Card>

        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  header: {
    backgroundColor: FORD_COLORS.FORD_DARK_BLUE,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FORD_COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_BLUE,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FORD_COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  content: {
    padding: SPACING.lg,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: FORD_COLORS.LIGHT_GRAY,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  preferencesCard: {
    marginBottom: SPACING.md,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  preferenceDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  aboutCard: {
    marginBottom: SPACING.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  aboutLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  aboutValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  logoutButton: {
    marginBottom: SPACING.xl,
  },
});