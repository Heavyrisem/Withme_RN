import React, { useEffect } from 'react';
import { SafeAreaView, Text, TouchableHighlight } from 'react-native';
import Tts from 'react-native-tts';


const TTS = () => {
    Tts.setDefaultLanguage('ko-KR');
    // Tts.setIgnoreSilentSwitch(");

    useEffect(() => {
        Tts.addEventListener('tts-start', (e) => {console.log(e.utteranceId, "started")});
        Tts.addEventListener('tts-finish', (e) => {console.log(e.utteranceId, "finished")});
        Tts.voices().then(voices => {
            for (const v of voices) {
                if (v.language == "ko-KR") console.log(v);
            }
        });
    })

    return (
        <>
            <SafeAreaView>
                <TouchableHighlight onPress={()=>{Tts.speak("한지수 일어나 한지수 일어나 한지수 일어나")}}>
                    <Text style={{fontSize: 30, textAlign: 'center'}}>Speech</Text>
                </TouchableHighlight>
            </SafeAreaView>
        </>
    )
}

export default TTS;