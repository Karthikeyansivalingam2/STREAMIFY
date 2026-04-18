import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROFILE HEADER (DRAWER STYLE) */}
        <View style={styles.profileBox}>
            <View style={styles.avatarLarge}>
               <Text style={styles.avatarTextLarge}>K</Text>
            </View>
            <View style={styles.profileTextInfo}>
                <Text style={styles.profileName} numberOfLines={1}>karthikeyansivalingam2006@gmail.com</Text>
                <Text style={styles.viewProfile}>View profile</Text>
            </View>
        </View>

        <View style={styles.menuContainer}>
           <TouchableOpacity style={styles.menuItem}>
               <Ionicons name="add" size={24} color="#fff" />
               <Text style={styles.menuText}>Add account</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem}>
               <Ionicons name="time-outline" size={24} color="#fff" />
               <Text style={styles.menuText}>Recents</Text>
           </TouchableOpacity>

           <View style={styles.divider} />

           <TouchableOpacity style={styles.menuItem}>
               <Ionicons name="settings-outline" size={24} color="#fff" />
               <Text style={styles.menuText}>Settings and privacy</Text>
           </TouchableOpacity>

           <TouchableOpacity onPress={() => router.replace('/login')} style={styles.menuItem}>
               <Ionicons name="log-out-outline" size={24} color="#ff4d4d" />
               <Text style={[styles.menuText, { color: '#ff4d4d' }]}>Log out</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b1a",
  },
  scrollContent: {
    padding: 20,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileTextInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  viewProfile: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  menuText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  }
});
