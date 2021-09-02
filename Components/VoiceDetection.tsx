import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, Text, Touchable, TouchableHighlight } from 'react-native';

const VoiceDetection = () => {
    const [result, setresult] = useState<string[]>([""]);

    useEffect(() => {
        Voice.onSpeechStart = onSpeechStartHandler
        Voice.onSpeechEnd = onSpeechEndHandler
        Voice.onSpeechResults = onSpeechResultsHandler
        // Voice.onSpeechPartialResults = onSpeechResultsHandler
        Voice.start("ko-KR")
    }, []);

    function onSpeechStartHandler() {
        console.log("Listning")
    }

    function onSpeechEndHandler() {
        console.log("end");
    }

    function onSpeechResultsHandler(e: SpeechResultsEvent) {
        console.log(e.value);
        setresult((e.value)? e.value:[""]);
    }

    function start() {
    }

    return (
        <>
            <SafeAreaView>
                <Text>{result.join(" ")}</Text>
                <TouchableHighlight onPress={start}>
                    <Text style={{fontSize: 30, textAlign: 'center'}}>TTS</Text>
                </TouchableHighlight>
            </SafeAreaView>
        </>
    )
}

export default VoiceDetection;