import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import Pitchfinder from "pitchfinder";
import { mapFrequencyToNote } from "../utils/frequencyUtils";

const detectPitch = Pitchfinder.AMDF();

export default function useTuner(referenceFrequency = 440) {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isTuning, setIsTuning] = useState(false);
  const [deviation, setDeviation] = useState(0);

  let recording: any;

  const startTuning = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.error("Microphone permission denied");
      return;
    }

    recording = new Audio.Recording();
    await recording
      .prepareToRecordAsync
      //   Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY
      ();
    await recording.startAsync();
    setIsTuning(true);
    processAudio(recording);
  };

  const processAudio = async (recording: Audio.Recording) => {
    const audioData = await recording.createNewLoadedSoundAsync();
    audioData.sound.setOnPlaybackStatusUpdate((status) => {});
    const audioBuffer = await extractAudioData(recording);
    const detectedFrequency = detectPitch(audioBuffer);

    if (detectedFrequency) {
      setFrequency(detectedFrequency);
      const closestNote = mapFrequencyToNote(
        detectedFrequency,
        referenceFrequency
      );
      setNote(closestNote.note);
      setDeviation(closestNote.deviation);
    }
  };

  const stopTuning = async () => {
    await recording.stopAndUnloadAsync();
    setIsTuning(false);
  };

  async function extractAudioData(
    recording: Audio.Recording
  ): Promise<Float32Array> {
    try {
      const recordingUri = recording.getURI();

      if (!recordingUri) {
        throw new Error("No audio URI found");
      }

      const fileInfo = await fetch(recordingUri);
      const audioFileBlob = await fileInfo.blob();

      const arrayBuffer = await audioFileBlob.arrayBuffer();

      const audioData = new Float32Array(arrayBuffer);

      return audioData;
    } catch (error) {
      console.error("Error extracting audio data:", error);
      return new Float32Array();
    }
  }

  return { frequency, note, isTuning, startTuning, stopTuning, deviation };
}
