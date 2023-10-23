import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";
import { useCallback, useEffect, useState } from "react";

interface IState {
  recognized: string;
  pitch: string;
  error: string;
  end: string;
  started: string;
  results: string[];
  partialResults: string[];
  isRecording: boolean;
}

export const useVoiceRecognition = () => {
  const [state, setState] = useState<IState>({
    recognized: "",
    pitch: "",
    error: "",
    end: "",
    started: "",
    results: [],
    partialResults: [],
    isRecording: false,
  });
  const resetState = useCallback(() => {
    setState({
      recognized: "",
      pitch: "",
      error: "",
      end: "",
      started: "",
      results: [],
      partialResults: [],
      isRecording: false,
    });
  }, [setState]);

  const startRecognizing = useCallback(async () => {
    resetState();
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.log(e);
    }
  }, [resetState]);
  const stopRecognizing = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.log(e);
    }
  }, []);
  const cancelRecognizing = useCallback(async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.log(e);
    }
  }, []);
  const destroyRecognizing = useCallback(async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.log(e);
    }
    resetState();
  }, [resetState]);
  useEffect(() => {
    if (!Voice) {
      console.error("Voice recognition is not available on this platform.");
      return;
    }

    Voice.onSpeechStart = (e: any) => {
      setState((prevstate) => ({
        ...prevstate,
        started: "✅",
        isRecording: true,
      }));
    };
    Voice.onSpeechRecognized = () => {
      setState((prevstate) => ({ ...prevstate, recognized: "✅" }));
    };
    Voice.onSpeechEnd = (e: any) => {
      setState((prevstate) => ({
        ...prevstate,
        end: "✅",
        isRecording: false,
      }));
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setState((prevstate) => ({
        ...prevstate,
        error: JSON.stringify(e.error),
        isRecording: false,
      }));
    };
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      setState((prevstate) => ({ ...prevstate, results: e.value! }));
    };
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      setState((prevstate) => ({ ...prevstate, partialResults: e.value! }));
    };
    Voice.onSpeechVolumeChanged = (e: any) => {
      setState((prevstate) => ({ ...prevstate, pitch: e.value }));
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  return {
    state,
    setState,
    resetState,
    startRecognizing,
    stopRecognizing,
    cancelRecognizing,
    destroyRecognizing,
  };
};
