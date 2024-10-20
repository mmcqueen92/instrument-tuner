export interface NeedleProps {
  deviation: number;
}

export interface TunerDisplayProps {
  frequency: number | null;
  note: string;
  deviation: number;
}

export interface StartStopButtonProps {
  isTuning: boolean;
  startTuning: () => void;
  stopTuning: () => void;
}
