import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import MobileHeader from "../components/MobileHeader";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
export default function InvitadoHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState("Seleccionar ubicación");
  const [showAllServices, setShowAllServices] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true);
      await new Promise((res) => setTimeout(res, 1500));
      setUserLocation("Av. Corrientes 1234, Buenos Aires");
      setLoadingLocation(false);
    };
    fetchLocation();
  }, []);

  const allServices = [
    { id: 1, name: "Albañil", icon: "hammer" },
    { id: 2, name: "Aire Acond.", icon: "snow" },
    { id: 3, name: "Electricista", icon: "flash" },
    { id: 4, name: "Durlock", icon: "layers" },
    { id: 5, name: "Impermeab.", icon: "rainy" },
    { id: 6, name: "Pintor", icon: "color-palette" },
    { id: 7, name: "Plomería", icon: "water" },
    { id: 8, name: "Fletes", icon: "car" },
    { id: 9, name: "Redes balcón", icon: "wifi" },
    { id: 10, name: "Vidriería", icon: "apps" },
  ];

  const displayedServices = showAllServices ? allServices : allServices.slice(0, 6);

  const reviews = [
    {
      id: "1",
      author: "Carlos Rivas",
      text: "Buen profesional, resolvió el problema rápidamente.",
      rating: 4,
      avatar: require("../assets/users/carlos.jpg"),
    },
    {
      id: "2",
      author: "German Rossi",
      text: "Muy buen servicio, trato y predisposición.",
      rating: 5,
      avatar: require("../assets/users/german.jpg"),
    },
    {
      id: "3",
      author: "Vanesa Cardozo",
      text: "Muy profesional con su equipo. Excelentes.",
      rating: 4,
      avatar: require("../assets/users/vanesa.jpg"),
    },
  ];

  const handleSubmitRequest = async () => {
    if (!selectedService || !email || !jobDescription) {
      Alert.alert("Error", "Por favor, completá todos los campos.");
      return;
    }

    const { error } = await supabase.from("requests").insert([
      {
        user_email: email,
        job_description: jobDescription,
        category: selectedService,
        location: userLocation,
      },
    ]);

    if (error) {
      Alert.alert("Error", "No se pudo enviar el presupuesto.");
    } else {
      Alert.alert("Éxito", "Solicitud enviada correctamente.");
      setSelectedService("");
      setJobDescription("");
      setEmail("");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <MobileHeader />

      <Text style={styles.title}>¡Soluciones para tu hogar al TOQUE!</Text>
      <Text style={styles.subtitle}>
        Conectá con expertos que quieren laburar. ¡Rápido y sin vueltas!
      </Text>

      {/* Búsqueda */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="¿Qué servicio necesitás?"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Ubicación */}
      <TouchableOpacity style={styles.locationBtn}>
        <Ionicons name="location-outline" size={20} color="#333" />
        <Text style={styles.locationText}>
          {loadingLocation ? "Cargando ubicación..." : userLocation}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      {/* Servicios */}
      <Text style={styles.sectionTitle}>Servicios Destacados</Text>
      <View style={styles.grid}>
        {displayedServices.map((item) => (
          <View key={item.id} style={styles.serviceCard}>
            <Ionicons name={item.icon as any} size={28} color="#fff" />
            <Text style={styles.serviceText}>{item.name}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowAllServices(!showAllServices)}
      >
        <Text style={styles.toggleText}>
          {showAllServices ? "Mostrar menos" : "Ver más servicios"}
        </Text>
      </TouchableOpacity>

      {/* Beneficios */}
      <Text style={styles.sectionTitle}>¿Por qué elegir Laburando?</Text>
      <View style={styles.benefits}>
        <Benefit icon="cash-outline" title="Es gratuito" text="Recibí presupuestos sin costo." />
        <Benefit icon="scale-outline" title="Compará precios" text="Recibí varias ofertas." />
        <Benefit icon="checkmark-circle-outline" title="Confiá" text="Opiniones verificadas." />
      </View>

      {/* Opiniones */}
      <Text style={styles.sectionTitle}>Opiniones de usuarios</Text>
      {reviews.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Image source={r.avatar} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
            <Text style={styles.reviewAuthor}>{r.author}</Text>
          </View>
          <Text style={styles.reviewText}>“{r.text}”</Text>
          <Text>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
        </View>
      ))}

      {/* Formulario */}
      <Text style={styles.sectionTitle}>Pedir Presupuesto</Text>
      <View style={styles.formGroup}>
        <Text>Servicio</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Plomería"
          value={selectedService}
          onChangeText={setSelectedService}
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.formGroup}>
        <Text>Descripción del trabajo</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Contanos en detalle qué necesitás..."
          multiline
          value={jobDescription}
          onChangeText={setJobDescription}
        />
      </View>
      <TouchableOpacity style={styles.ctaButton} onPress={handleSubmitRequest}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar Solicitud</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Benefit = ({ icon, title, text }: { icon: any; title: string; text: string }) => (
  <View style={styles.benefitCard}>
    <Ionicons name={icon} size={50} color="#fcb500" />
    <Text style={styles.benefitTitle}>{title}</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 6,
    borderColor: "#ddd",
    borderWidth: 1,
    marginTop: 4,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  locationText: { marginHorizontal: 8, color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  serviceCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#fcb500",
    borderRadius: 10,
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceText: { color: "#fff", fontSize: 12, marginTop: 6, textAlign: "center" },
  toggleButton: { alignItems: "center", marginVertical: 10 },
  toggleText: { color: "#007AFF", fontWeight: "bold" },
  benefits: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  benefitCard: { width: "30%", alignItems: "center", marginBottom: 16 },
  benefitTitle: { fontWeight: "bold", marginTop: 8, fontSize: 14 },
  benefitText: { fontSize: 12, color: "#555", textAlign: "center", marginTop: 4 },
  reviewCard: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewText: { fontStyle: "italic", marginBottom: 6 },
  reviewAuthor: { fontSize: 14, fontWeight: "bold" },
  formGroup: { marginBottom: 14 },
  ctaButton: {
    backgroundColor: "#fcb500",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
});
