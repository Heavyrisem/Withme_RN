import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { Dimensions, SafeAreaView, StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";

import { RNCamera } from "react-native-camera";
import Sound from 'react-native-sound';
import { Colors } from "react-native/Libraries/NewAppScreen";
import VoiceDetection from "./VoiceDetection";

// import SvgUri from "react-native-svg-uri";
// import caption_activated from '../src/caption_activated.svg';

const CameraView = () => {
	const isDarkMode = useColorScheme() === 'dark';

	const DarkModeStyle: StyleProp<ViewStyle> = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
	};
    const CameraRef = useRef<RNCamera>(null);
    const [STT, setSTT] = useState<string>("음성 인식 결과가 여기에 표시됩니다.");
    const [ActionType, setActionType] = useState<string>("이미지");
    let isRunning = false;
    let VoiceDetec: VoiceDetection | undefined;


    useEffect(() => {
        VoiceDetec = new VoiceDetection("믿음이", [{
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
                    quality: 1,
                    exif: true,
                    base64: true,
                    orientation: RNCamera.Constants.Orientation.portrait
                    // width: Dimensions.get("screen").width / 0.8,
                    
                });
                return resolve(data.base64 as string);
            }
        })
    }

    async function Run_AI(type: "caption" | "ocr") {
        if (isRunning || !VoiceDetec) return;
        isRunning = true;
        console.log("Run_AI", type);
        
        switch (type) {
            case "caption": setActionType("이미지"); break;
            case "ocr": setActionType("텍스트"); break;
        }

        clearTimeout(VoiceDetec.SpeechTimer);
        VoiceDetec.STT.stop();
        
        const image = await Capture();
        let timer = Date.now();
        try {
            let voice: {result?: {shortText: string, url: string}[], err?: string} = await (await fetch(`http://10.184.110.129:3000/${type}`, {
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
        } catch (err) {
            console.log(err);
            setSTT(err+"");
        }
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
            <RNCamera onTouchEnd={() => {Run_AI("caption")}} ref={CameraRef} style={{width: Dimensions.get("screen").width, height: Dimensions.get("screen").height, alignItems: 'center', position: 'absolute', zIndex: -1}} type={RNCamera.Constants.Type.back} captureAudio={false}></RNCamera>
            <SafeAreaView>
                <View style={{width: '100%', alignItems: 'center'}}>
                    <Text style={{margin: 'auto', paddingVertical: 5, paddingHorizontal: 8, color: 'white', borderRadius: 13, borderStyle: 'solid', borderWidth: 2, borderColor: 'white'}}>{ActionType}</Text>

                    {/* <img src={caption_activated} /> */}
                </View>
            </SafeAreaView>
            <View style={{position: 'absolute', bottom: 0, width: Dimensions.get("screen").width * 0.8, padding: "5%", margin: "10%", borderRadius: 100, ...DarkModeStyle}}>
                <Text style={{color: isDarkMode ? Colors.lighter : Colors.darker}}>{STT}</Text>
            </View>
        </>
    )
}

export default CameraView;