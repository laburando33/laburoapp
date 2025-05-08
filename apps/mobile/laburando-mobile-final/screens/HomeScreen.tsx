import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { redirectByUserRole } from "../lib/roleRedirect";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectByUserRole(session.user.id, navigation);
      } else {
        setCheckingSession(false); // Solo mostramos el home si no hay sesión
      }
    };

    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fcb500" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/1.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("InvitadoHome")}
      >
        <Text style={styles.btnText}>Entrar sin registro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RegistroPaso1")}
      >
        <Text style={styles.btnText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.btnText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 32,
  },
  button: {
    width: 250,
    height: 50,
    backgroundColor: "#fcb500",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 12,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
});
