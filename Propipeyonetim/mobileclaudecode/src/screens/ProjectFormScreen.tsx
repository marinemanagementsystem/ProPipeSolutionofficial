import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components';
import { createProject, updateProject, getProjectById } from '../services/projects';
import type { ProjectsStackScreenProps } from '../navigation/types';

type Props = ProjectsStackScreenProps<'ProjectForm'>;

const ProjectFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const projectId = route.params?.projectId;
  const isEditing = !!projectId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const { colors } = useTheme();
  const { currentUserAuth } = useAuth();

  useEffect(() => {
    if (isEditing && projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const project = await getProjectById(projectId!);
      if (project) {
        setName(project.name);
        setLocation(project.location || '');
        setContactPerson(project.contactPerson || '');
        setPhone(project.phone || '');
        setNotes(project.notes || '');
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Tersane adı girin.');
      return;
    }

    try {
      setLoading(true);

      const projectData = {
        name: name.trim(),
        location: location.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email || undefined,
        displayName: currentUserAuth.displayName || undefined,
      } : undefined;

      if (isEditing && projectId) {
        await updateProject(projectId, projectData, user);
      } else {
        await createProject(projectData, user);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Hata', 'Tersane kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Input
          label="Tersane Adı *"
          placeholder="Örn: Tuzla Tersanesi"
          value={name}
          onChangeText={setName}
          leftIcon={<Ionicons name="business-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Konum"
          placeholder="Şehir veya adres"
          value={location}
          onChangeText={setLocation}
          leftIcon={<Ionicons name="location-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="İletişim Kişisi"
          placeholder="Ad Soyad"
          value={contactPerson}
          onChangeText={setContactPerson}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Telefon"
          placeholder="0xxx xxx xx xx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Notlar"
          placeholder="Ek notlar..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button
          title={isEditing ? 'Güncelle' : 'Kaydet'}
          onPress={handleSubmit}
          loading={loading}
          size="large"
          style={{ marginTop: 24, marginBottom: 32 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
});

export default ProjectFormScreen;
