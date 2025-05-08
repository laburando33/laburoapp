// apps/mobile/screens/ProfessionalDashboardScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { supabase } from "../lib/supabase";

export default function ProfessionalDashboardScreen({ navigation }) {
  // 🔐 Protege esta pantalla: si no hay sesión, redirige
  useProtectedRoute(navigation);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Error al cerrar sesión", error.message);
    } else {
      navigation.replace("Welcome");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Profesional</Text>

      <Text style={styles.subtitle}>
        Acá podrás gestionar tus trabajos, contactos y mensajes.
      </Text>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
