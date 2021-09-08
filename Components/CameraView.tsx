import React, { useEffect, useRef, useState } from "react"
import { Dimensions, SafeAreaView, StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";

import { RNCamera } from "react-native-camera";
import Sound from 'react-native-sound';
import { Colors } from "react-native/Libraries/NewAppScreen";
import VoiceDetection from "./VoiceDetection";

const CameraView = () => {
	const isDarkMode = useColorScheme() === 'dark';

	const DarkModeStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        color: isDarkMode ? Colors.lighter : Colors.darker
	};
    const CameraRef = useRef<RNCamera>(null);
    const [STT, setSTT] = useState<string>("음성 인식 결과가 여기에 표시됩니다.");
    let isRunning = false;
    let VoiceDetec: VoiceDetection | undefined;


    useEffect(() => {
        VoiceDetec = new VoiceDetection("지수야", [{
            keyWords: ["앞에 뭐가 보여", "뭐가 있어", "뭐가 보여", "뭐가 보이니", "앞에 뭐가 있니", "앞에 뭐가 있는지 설명해줘"],
            action: () => (Run_AI("caption"))
        },
        {
            keyWords: ["앞에 있는것좀 읽어줘", "글자좀 읽어줘", "글좀 읽어줘", "읽어줘"],
            action: () => (Run_AI("ocr"))
        }], function (str: string) {
            setSTT(str);
        });
    }, []);

    async function Capture(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (CameraRef.current) {
                const data = await CameraRef.current.takePictureAsync({
                    quality: 0.5,
                    exif: true,
                    base64: true,
                    width: Dimensions.get("screen").width / 0.8,
                    
                });
                return resolve(data.base64 as string);
            }
        })
    }

    async function Run_AI(type: "caption" | "ocr") {
        if (isRunning || !VoiceDetec) return;
        isRunning = true;
        console.log("Run_AI", type);
        clearTimeout(VoiceDetec.SpeechTimer);
        VoiceDetec.STT.stop();
        
        const image = await Capture();
        let timer = Date.now();
        let voice: {result?: {shortText: string, url: string}[], err?: string} = await (await fetch(`https://withme.heavyrisem.xyz/v2/${type}`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                imageData: image
            })
        })).json();

        if (voice.result) {
            console.log("Requset", Date.now() - timer, 'ms');
            for (const Audio of voice.result) await PlaySound(Audio.url);
        } else {
            console.log('err', voice.err);
        }
        isRunning = false;
        VoiceDetec.STT.start("ko-KR");
    }

    function PlaySound(URL: string): Promise<void> {
        return new Promise(resolve => {
            console.log(URL);
            const sound = new Sound(decodeURI(URL), '', (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    return;
                }
                // loaded successfully
                console.log('duration in seconds: ' + sound.getDuration() + 'number of channels: ' + sound.getNumberOfChannels());
            
                // Play the sound with an onEnd callback
                sound.play((success) => {
                    if (success) {
                        console.log('successfully finished playing');
                    } else {
                        console.log('playback failed due to audio decoding errors');
                    }
                    return resolve();
                });
            })
        })
    }
    
    return (
        <>
			 <RNCamera ref={CameraRef} style={{width: Dimensions.get("screen").width, height: Dimensions.get("screen").height, alignItems: 'center'}} type={RNCamera.Constants.Type.back} captureAudio={false}></RNCamera>
             <View style={{position: 'absolute', width: Dimensions.get("screen").width, height: Dimensions.get("screen").height, alignItems: 'center'}}>
                <View style={{position: 'absolute', bottom: 0, width: Dimensions.get("screen").width * 0.8, padding: "5%", margin: "10%", borderRadius: 100, ...DarkModeStyle}}>
                    <Text>{STT}</Text>
                </View>
            </View>
        </>
    )
}

export default CameraView;