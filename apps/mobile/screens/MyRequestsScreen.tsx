// apps/mobile/screens/MyRequestsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { listRequests } from "../services/RequestsService";

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadRequests() {
    try {
      const data = await listRequests();
      setRequests(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Button title="Refrescar" onPress={loadRequests} color="#FFC107" />
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {requests.map((req) => (
        <View key={req.user_id} style={styles.card}>
          <Text style={styles.title}>Solicitud: {req.description}</Text>
          <Text>Categoría: {req.category}</Text>
          <Text>Ubicación: {req.location}</Text>
          <Text>Estado: {req.status}</Text>
          {/* ... */}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  error: { color: "red", marginTop: 8 },
  card: {
    backgroundColor: "#eee",
    marginVertical: 8,
    padding: 10,
    borderRadius: 6,
  },
  title: {
    fontWeight: "bold",
  },
});
