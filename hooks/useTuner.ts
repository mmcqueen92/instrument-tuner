import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import Pitchfinder from "pitchfinder";
import { mapFrequencyToNote } from "../utils/frequencyUtils";
import * as FileSystem from "expo-file-system";

const detectPitch = Pitchfinder.AMDF();

export default function useTuner(referenceFrequency = 440) {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isTuning, setIsTuning] = useState(false);
  const [deviation, setDeviation] = useState(0);

  let recording: Audio.Recording | null = null;
  let intervalId: NodeJS.Timeout | null = null;

  const startTuning = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.error("Microphone permission denied");
      return;
    }

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync();
    await recording.startAsync();
    setIsTuning(true);

    // Start the continuous sampling loop
    intervalId = setInterval(() => {
      processAudio(recording!);
    }, 100); // Process every 100ms for near real-time updates
  };

  const processAudio = async (recording: Audio.Recording) => {
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
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsTuning(false);
  };

async function extractAudioData(
  recording: Audio.Recording
): Promise<Float32Array> {
  try {
    const recordingUri = recording.getURI();
    console.log("Recording URI:", recordingUri);
    if (!recordingUri) throw new Error("No audio URI found");

    const fileContents = await FileSystem.readAsStringAsync(recordingUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 string to ArrayBuffer
    const arrayBuffer = Uint8Array.from(atob(fileContents), (c) =>
      c.charCodeAt(0)
    ).buffer;

    return new Float32Array(arrayBuffer);
  } catch (error) {
    console.error("Error extracting audio data:", error);
    return new Float32Array();
  }
}

  useEffect(() => {
    return () => {
      // Cleanup interval and recording on unmount
      stopTuning();
    };
  }, []);

  return { frequency, note, isTuning, startTuning, stopTuning, deviation };
}
