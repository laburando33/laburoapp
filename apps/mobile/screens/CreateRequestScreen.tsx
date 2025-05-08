// apps/mobile/screens/CreateRequestScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import { createRequest } from "../services/RequestsService";

export default function CreateRequestScreen() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const result = await createRequest({ description, category, location });
      console.log("Solicitud creada:", result);
      setFeedback("¡Solicitud creada con éxito!");
      // Reinicia los campos
      setDescription("");
      setCategory("");
      setLocation("");
    } catch (err: any) {
      setFeedback("Error: " + err.message);
      console.error("Error creando la solicitud:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Solicitud</Text>

      <Text>Descripción</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Text>Categoría</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <Text>Ubicación</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Button title="Crear" onPress={handleCreate} color="#FFC107" />
      )}

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 8,
    padding: 8,
    borderRadius: 4,
  },
  feedback: {
    marginTop: 12,
    color: "green",
    fontWeight: "600",
  },
});
