import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { getRedirectUrl } from "@lib/getRedirectUrl"; // nuevo

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Campo requerido", "Ingresá tu email.");
      return;
    }

    setLoading(true);

    const redirectTo = getRedirectUrl();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title={loading ? "Enviando..." : "Enviar link mágico"}
        onPress={handleLogin}
      />
      {sent && (
        <Text style={styles.confirmation}>
          Revisa tu correo y hacé clic en el enlace para ingresar.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  confirmation: {
    marginTop: 16,
    fontSize: 16,
    color: "green",
    textAlign: "center",
  },
});
