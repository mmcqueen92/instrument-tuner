import { Audio } from "expo-av";
import { useEffect, useState, useRef } from "react";
import { Alert } from "react-native";
import Pitchfinder from "pitchfinder";
import { mapFrequencyToNote } from "../utils/frequencyUtils";
import * as FileSystem from "expo-file-system";

const detectPitch = Pitchfinder.AMDF();

export default function useTuner(referenceFrequency = 440) {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isTuning, setIsTuning] = useState(false);
  const [deviation, setDeviation] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null); // Use useRef for recording
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const startTuning = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      console.error("Microphone permission denied");
      return;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync();
    await recording.startAsync();
    recordingRef.current = recording;
    setIsTuning(true);

    intervalIdRef.current = setInterval(() => {
      console.log("Interval running");
      if (recordingRef.current) {
        processAudio(recordingRef.current);
      }
    }, 100);

    console.log("Interval ID set:", intervalIdRef.current);
  };

  const processAudio = async (recording: Audio.Recording) => {
    console.log("Starting processAudio...");
    const audioBuffer = await extractAudioData(recording);
    // console.log("Extracted audio data buffer length:", audioBuffer.length);

    // Log a few samples to inspect audio data
    // console.log("First few audio buffer values:", audioBuffer.slice(0, 5));

    // Normalize audio data if needed
    const maxVal = Math.max(...audioBuffer.map(Math.abs));
    const normalizedBuffer =
      maxVal > 0
        ? audioBuffer.map((value) => value / maxVal) // Normalizes to -1 to 1 range
        : audioBuffer;

    const detectedFrequency = detectPitch(normalizedBuffer);
    console.log("Detected frequency:", detectedFrequency);

    if (detectedFrequency) {
      setFrequency(detectedFrequency);
      const closestNote = mapFrequencyToNote(
        detectedFrequency,
        referenceFrequency
      );
      console.log("Closest note:", closestNote.note);
      console.log("Deviation:", closestNote.deviation);
      setNote(closestNote.note);
      setDeviation(closestNote.deviation);
    } else {
      console.log("No frequency detected.");
    }
  };

  const stopTuning = async () => {
    console.log("STOP TUNING");
    if (recordingRef.current) {
      console.log("STOP RECORDING");
      await recordingRef.current.stopAndUnloadAsync();
      console.log("RECORDING STOPPED?")
      recordingRef.current = null;
    }
    if (intervalIdRef.current) {
      console.log("CLEAR INTERVAL");
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsTuning(false);
    console.log("isTuning set to false:", isTuning);
  };

  async function extractAudioData(
    recording: Audio.Recording
  ): Promise<Float32Array> {
    try {
      const recordingUri = recording.getURI();
      // console.log("Recording URI:", recordingUri);
      if (!recordingUri) throw new Error("No audio URI found");

      const fileContents = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 string to ArrayBuffer
      const arrayBuffer = Uint8Array.from(atob(fileContents), (c) =>
        c.charCodeAt(0)
      ).buffer;

      // console.log("ArrayBuffer byte length:", arrayBuffer.byteLength);

      // Convert to Float32Array
      return new Float32Array(arrayBuffer);
    } catch (error) {
      console.error("Error extracting audio data:", error);
      return new Float32Array();
    }
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync();
    };
  }, []);

  return { frequency, note, isTuning, startTuning, stopTuning, deviation };
}
