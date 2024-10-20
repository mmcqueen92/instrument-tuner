import React from "react";
import { Button } from "react-native";
import { StartStopButtonProps } from "../interfaces/types";

const StartStopButton: React.FC<StartStopButtonProps> = ({ isTuning, startTuning, stopTuning }) => {
  return (
    <Button
      title={isTuning ? "Stop Tuning" : "Start Tuning"}
      onPress={isTuning ? stopTuning : startTuning}
    />
  );
};

export default StartStopButton;
