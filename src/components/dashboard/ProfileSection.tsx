import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./dashboardStyles";
import { DashboardColors } from "./types";

interface ProfileSectionProps {
  colors: DashboardColors;
  showAdminUsers: boolean;
  adminUsers: any[];
  onLoadAdminUsers: () => void;
}

// TAB 4: PERFIL / ADMIN
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  colors,
  showAdminUsers,
  adminUsers,
  onLoadAdminUsers,
}) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Mi Cuenta
      </Text>

      <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {user?.email}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          Rol:{" "}
          {user?.is_staff
            ? "🛡️ Administrador del Gimnasio"
            : "👤 Atleta Convencional"}
        </Text>

        {user?.is_staff && (
          <TouchableOpacity
            style={[
              styles.adminActionBtn,
              { alignSelf: "flex-start", marginVertical: 10 },
            ]}
            onPress={onLoadAdminUsers}
          >
            <Text style={styles.btnTextWhite}>
              👥 Ver Todos los Usuarios Registrados
            </Text>
          </TouchableOpacity>
        )}

        {showAdminUsers && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.stepLabel, { color: colors.text }]}>
              Usuarios en la Base de Datos:
            </Text>
            {adminUsers.map((u, i) => (
              <View key={i} style={styles.adminUserItem}>
                <Text style={{ fontWeight: "bold" }}>{u.email}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Rol: {u.is_staff ? "Admin" : "Usuario"} | Rutinas:{" "}
                  {u.routines_count}
                </Text>
              </View>
            ))}
          </View>
        )}

        <AppButton
          title="Cerrar Sesión"
          variant="outline"
          onPress={logout}
          style={{ marginTop: 14 }}
        />
      </View>
    </View>
  );
};
