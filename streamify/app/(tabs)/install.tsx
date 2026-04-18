import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InstallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="download-outline" size={100} color="#6c63ff" />
        <Text style={styles.title}>Install Streamify</Text>
        <Text style={styles.subtitle}>Get the best music experience by installing the app on your home screen.</Text>
        
        <TouchableOpacity style={styles.installBtn}>
           <Text style={styles.installText}>Install Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b1a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 20,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  installBtn: {
    backgroundColor: "#6c63ff",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
  },
  installText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
