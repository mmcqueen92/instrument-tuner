import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../interfaces/navigation"

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

export default function SettingsScreen({ navigation, route }: SettingsScreenProps) {
  const [referenceFrequency, setReferenceFrequency] = useState(
    route.params?.referenceFrequency || 440
  );

  const handleSave = () => {
    route.params?.onSave(referenceFrequency);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>Reference Frequency (Hz):</Text>
      <TextInput
        style={styles.input}
        value={referenceFrequency.toString()}
        onChangeText={(text) => setReferenceFrequency(Number(text))}
        keyboardType="numeric"
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: 100,
    textAlign: "center",
  },
});
