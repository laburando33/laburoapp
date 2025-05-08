// apps/mobile/screens/RegistroConfirmacionScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegistroConfirmacionScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>¡Listo!</Text>
      <Text style={styles.msg}>
        Se enviarán instrucciones a tu correo para completar el proceso de registro.
        Revisa tu bandeja de entrada.
      </Text>
      <Button title="Volver al inicio" onPress={() => navigation.navigate("Welcome")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  bigText: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  msg: { textAlign: "center", marginBottom: 40 },
});
