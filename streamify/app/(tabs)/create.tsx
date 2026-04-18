import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useLibrary } from '../../context/LibraryContext';
import { Ionicons } from '@expo/vector-icons';

export default function CreateScreen() {
  const [name, setName] = useState('');
  const { createPlaylist } = useLibrary();
  const router = useRouter();

  const handleCreate = async () => {
    if (name.trim()) {
      await createPlaylist(name.trim());
      Alert.alert("Success", "Playlist created!");
      router.replace("/library");
    } else {
      Alert.alert("Error", "Please enter a name");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Playlist</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="musical-notes" size={60} color="#fff" />
        </View>

        <Text style={styles.label}>Give your playlist a name.</Text>
        <TextInput
          style={styles.input}
          placeholder="My Playlist"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.btnText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconBox: { width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  label: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 30 },
  input: { borderBottomWidth: 1, borderBottomColor: '#6c63ff', width: '100%', color: '#fff', fontSize: 22, textAlign: 'center', paddingBottom: 10, marginBottom: 40 },
  createBtn: { backgroundColor: '#6c63ff', paddingHorizontal: 50, paddingVertical: 15, borderRadius: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
