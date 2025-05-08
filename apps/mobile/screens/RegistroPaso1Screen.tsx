// apps/mobile/screens/RegistroPaso1Screen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegistroPaso1Screen() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [password, setPassword] = useState("");

  function handleNext() {
    navigation.navigate("RegistroPaso2", { nombre, apellido, whatsapp, email, ubicacion, password });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos Personales</Text>

      <Text style={styles.label}>Nombre/s *</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Apellido/s *</Text>
      <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Ubicación</Text>
      <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} />

      <Text style={styles.label}>Contraseña *</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.btnText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", backgroundColor: "#f9f9f9", padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  button: { width: "100%", backgroundColor: "#fcb500", paddingVertical: 14, alignItems: "center", borderRadius: 8, marginTop: 10 },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
