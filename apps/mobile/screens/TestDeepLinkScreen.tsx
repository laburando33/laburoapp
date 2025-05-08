// apps/mobile/screens/TestDeepLinkScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet, Alert, Linking } from "react-native";

export default function TestDeepLinkScreen() {
  const handleTestDeepLink = async () => {
    try {
      const url = "laburando://auth/callback";
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se puede abrir el deep link.");
      }
    } catch (error) {
      Alert.alert("Error", "Falló al intentar abrir el deep link.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test de Deep Link</Text>
      <Text style={styles.subtitle}>
        Tocá el botón para probar si laburando://auth/callback se abre en esta app.
      </Text>
      <Button title="Probar deep link" onPress={handleTestDeepLink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
});
