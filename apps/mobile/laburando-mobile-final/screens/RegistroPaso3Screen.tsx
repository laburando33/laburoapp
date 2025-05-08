import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function RegistroPaso3Screen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSendMagicLink = async () => {
    if (!email) {
      Alert.alert("Campo vacío", "Por favor ingresá tu email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "laburando://auth/callback",
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
      <Text style={styles.title}>Paso 3: Ingresá tu email</Text>

      <TextInput
        style={styles.input}
        placeholder="ejemplo@mail.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Button
        title={loading ? "Enviando..." : "Enviar link de acceso"}
        onPress={handleSendMagicLink}
        disabled={loading}
      />

      {confirmationSent && (
        <Text style={styles.confirmation}>
          Revisa tu correo y hacé clic en el enlace para completar tu registro.
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  confirmation: {
    marginTop: 16,
    color: "green",
    fontSize: 16,
    textAlign: "center",
  },
});
