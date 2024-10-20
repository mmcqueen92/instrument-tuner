import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Needle from "./Needle";
import { TunerDisplayProps } from "../interfaces/types";

const TunerDisplay: React.FC<TunerDisplayProps> = ({
  frequency,
  note,
  deviation,
}) => (
  <View style={styles.container}>
    <Text>Frequency: {frequency ? `${frequency.toFixed(2)} Hz` : "N/A"}</Text>
    <Text>Note: {note || "N/A"}</Text>
    <Needle deviation={deviation} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
export default TunerDisplay;
