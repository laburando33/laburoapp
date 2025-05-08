import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
        <Image
          source={require("../assets/logo.png")} // asegurate que el logo esté en assets
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Text style={styles.navItem}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Contacto")}>
          <Text style={styles.navItem}>Contacto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profesionales")}>
          <Text style={styles.navItem}>Profesionales</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "column",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  navItem: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default Header;
