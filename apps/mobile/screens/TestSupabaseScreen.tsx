// apps/mobile/screens/TestSupabaseScreen.tsx

import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../../../packages/utils/supabaseClient";
// Ajusta la ruta si tus TSconfig paths o alias son diferentes

export default function TestSupabaseScreen() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadProfessionals() {
    // Llamada a la tabla "professionals"
    let { data, error } = await supabase.from("professionals").select("*");
    if (error) {
      setError(error.message);
    } else {
      setProfessionals(data ?? []);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Button title="Cargar Professionals" onPress={loadProfessionals} />
      {error && <Text style={styles.error}>{error}</Text>}
      {professionals.map((pro) => (
        <View key={pro.id} style={styles.item}>
          <Text style={styles.name}>{pro.full_name}</Text>
          <Text>Categoría: {pro.category}</Text>
          <Text>Ubicación: {pro.location}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40, 
    paddingHorizontal: 16,
  },
  error: {
    color: "red",
    marginVertical: 8,
  },
  item: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 8,
    padding: 8,
  },
  name: {
    fontWeight: "bold",
  },
});
