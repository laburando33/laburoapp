// apps/mobile/screens/RegistroPaso2Screen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function RegistroPaso2Screen() {
  const route = useRoute();
  const navigation = useNavigation();

  // Recibir los datos del paso anterior
  const { nombre, apellido, whatsapp, email, ubicacion, password } = route.params;

  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  function handleNext() {
    navigation.navigate("RegistroPaso3", {
      nombre,
      apellido,
      whatsapp,
      email,
      ubicacion,
      password,
      categoria,
      descripcion,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos Profesionales</Text>

      <Text style={styles.label}>Categoría (Ej. Albañil, Carpintero) *</Text>
      <TextInput
        style={styles.input}
        value={categoria}
        onChangeText={setCategoria}
        placeholder="Ejemplo: Electricista"
      />

      <Text style={styles.label}>Descripción del trabajo *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        placeholder="Describe tu experiencia y habilidades..."
      />

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
  textArea: { height: 100, textAlignVertical: "top" },
  button: { width: "100%", backgroundColor: "#fcb500", paddingVertical: 14, alignItems: "center", borderRadius: 8, marginTop: 10 },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
