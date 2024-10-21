import { useState } from "react";
import { Button } from "react-native";
import TunerDisplay from "../components/TunerDisplay";
import StartStopButton from "../components/StartStopButton";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../interfaces/navigation";
import useTuner from "../hooks/useTuner";

type TunerScreenProps = NativeStackScreenProps<RootStackParamList, "Tuner">;

export default function TunerScreen({ navigation }: TunerScreenProps) {
  const [referenceFrequency, setReferenceFrequency] = useState(440);

  const { frequency, note, isTuning, startTuning, stopTuning, deviation } =
    useTuner(referenceFrequency);

  const goToSettings = () => {
    navigation.navigate("Settings", {
      referenceFrequency,
      onSave: (newFrequency: number) => {
        setReferenceFrequency(newFrequency);
      },
    });
  };

  return (
    <>
      <Button title="Go to Settings" onPress={goToSettings} />

      <TunerDisplay
        frequency={frequency || referenceFrequency}
        note={note || "A4"}
        deviation={deviation || 0}
      />

      <StartStopButton
        isTuning={isTuning}
        startTuning={startTuning}
        stopTuning={stopTuning}
      />
    </>
  );
}
