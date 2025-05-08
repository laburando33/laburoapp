// apps/mobile/screens/SolicitudScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { createRequest } from "../services/RequestsService"; // Asegurate que el path sea correcto

export default function SolicitudScreen() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category || !description) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);

    try {
      await createRequest({ category, description, location });
      Alert.alert("Éxito", "Tu solicitud fue enviada correctamente.");
      setCategory("");
      setDescription("");
      setLocation("");
    } catch (error: any) {
      console.error("Error al crear solicitud:", error);
      Alert.alert("Error", error.message || "Hubo un problema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pedir Presupuesto</Text>

      <TextInput
        style={styles.input}
        placeholder="Categoría del trabajo"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción del trabajo"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Ubicación (opcional)"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar solicitud"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: "#fcb500",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
