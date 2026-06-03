import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}
      >
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
