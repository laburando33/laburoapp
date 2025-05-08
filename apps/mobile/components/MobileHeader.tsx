import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        {/* Ícono hamburguesa a la izquierda */}
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuIcon}>
          <Ionicons name="menu" size={28} color="#fcb500" />
        </TouchableOpacity>

        {/* Logo a la derecha */}
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* MENÚ DESPLEGADO A PANTALLA COMPLETA */}
      {menuOpen && (
        <View style={styles.fullScreenMenu}>
          {/* Botón de cierre */}
          <TouchableOpacity
            onPress={() => setMenuOpen(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          {/* Ítems del menú */}
          <View style={styles.menuItems}>
            <Text style={styles.menuText}>Inicio</Text>
            <Text style={styles.menuText}>¿Cómo funciona?</Text>
            <Text style={styles.menuText}>Preguntas Frecuentes</Text>
            <Text style={styles.menuText}>Contacto</Text>

            {/* Botón justo abajo de “Contacto” */}
            <TouchableOpacity style={styles.laburarBtn}>
              <Text style={styles.laburarText}>¡Quiero laburar!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: "#fff",
    },
    menuIcon: {
      padding: 6,
    },
    logo: {
      width: 120,
      height: 32,
    },
    fullScreenMenu: {
      position: "absolute",
      top: 0,
      left: 0,
      height: screenHeight,
      width: "100%",
      backgroundColor: "#fff",
      zIndex: 100,
      paddingTop: 60,
      paddingHorizontal: 30,
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 30,
    },
    menuItems: {
      marginTop: 60,
    },
    menuText: {
      fontSize: 22,
      marginBottom: 28,
      color: "#333",
      fontWeight: "500",
    },
    laburarBtn: {
      marginTop: 10,
      backgroundColor: "#fcb500",
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    laburarText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
  });
  