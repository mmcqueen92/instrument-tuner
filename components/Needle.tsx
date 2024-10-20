import React from "react";
import { View, StyleSheet } from "react-native";
import { NeedleProps } from "../interfaces/types";

const Needle: React.FC<NeedleProps> = ({ deviation }) => {
  const rotation = deviation * 10; // Adjust this multiplier based on sensitivity

  return (
    <View
      style={{ ...styles.needle, transform: [{ rotate: `${rotation}deg` }] }}
    >
      <View style={styles.indicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  needle: {
    height: 150,
    width: 2,
    backgroundColor: "black",
    position: "relative",
  },
  indicator: {
    height: 30,
    width: 10,
    backgroundColor: "red",
    position: "absolute",
    bottom: 0,
    left: -4,
  },
});
export default Needle;
