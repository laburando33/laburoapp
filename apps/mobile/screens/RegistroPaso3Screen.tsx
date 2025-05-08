// apps/mobile/screens/RegistroPaso3Screen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Platform, StyleSheet, Linking } from "react-native";
import { supabase } from "../lib/supabase";
import * as ExpoLinking from "expo-linking";

export default function RegistroPaso3Screen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSendMagicLink = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresá tu email");
      return;
    }

    setLoading(true);

    const redirectUrl =
      Platform.OS === "web"
        ? "http://localhost:3000/auth/callback"
        : ExpoLinking.createURL("auth/callback");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setConfirmationSent(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paso 3: Ingresá tu correo</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@mail.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button title={loading ? "Enviando..." : "Enviar link mágico"} onPress={handleSendMagicLink} />
      {confirmationSent && (
        <Text style={styles.confirmation}>
          ✅ Te enviamos un enlace mágico. Abrí tu correo y hacé clic para continuar.{"\n"}Si estás en el celu y no abre, copiá el link o revisá en tu app de Gmail.
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
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  confirmation: {
    marginTop: 16,
    color: "green",
    textAlign: "center",
  },
});
