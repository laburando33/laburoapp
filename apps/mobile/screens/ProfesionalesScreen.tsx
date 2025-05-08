import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../../../packages/utils/supabaseClient"; // Ajusta tu ruta real

export default function ProfesionalesScreen() {
  const [pros, setPros] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadPros() {
    const { data, error } = await supabase
      .from("professionals")
      .select("*"); // Devuelve todos

    if (error) {
      setError(error.message);
    } else {
      setPros(data || []);
    }
  }

  useEffect(() => {
    loadPros();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Button title="Refrescar" onPress={loadPros} />
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {pros.map((pro) => (
        <View key={pro.id} style={styles.card}>
          <Text style={styles.name}>{pro.full_name}</Text>
          <Text>Categoría: {pro.category}</Text>
          <Text>Ubicación: {pro.location}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  error: { color: "red", marginVertical: 8 },
  card: { marginBottom: 12, padding: 10, backgroundColor: "#eee" },
  name: { fontWeight: "bold", fontSize: 16 }
});
