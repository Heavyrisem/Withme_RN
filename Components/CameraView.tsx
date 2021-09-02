import React, { useEffect, useRef } from "react"
import { Dimensions } from "react-native";

import { RNCamera } from "react-native-camera";
import DeviceInfo from 'react-native-device-info';
import io from 'socket.io-client';

const CameraView = () => {
    const CameraRef = useRef<RNCamera>(null);

    useEffect(() => {
        const UniqueID = DeviceInfo.getUniqueId()
        const socket = io("https://withme.heavyrisem.xyz", {query: {mobileID: UniqueID}, transports: ['websocket']});
        socket.on('connect', () => (console.log('socket connected')));
        socket.on('ImageCapture', async () => {
            console.log("Capture");
            socket.emit('ImageCapture', {imageData: await Capture()});
        });
        socket.on('disconnect', reason => {console.log(reason)});
    }, []);

    async function Capture(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (CameraRef.current) {
                const data = await CameraRef.current.takePictureAsync({
                    quality: 0.8,
                    exif: true,
                    base64: true
                });
                return resolve(data.base64 as string);
            }
        })
    }
    
    return (
        <>
			<RNCamera ref={CameraRef} style={{width: Dimensions.get("screen").width, height: Dimensions.get("screen").height}} type={RNCamera.Constants.Type.back} captureAudio={false}></RNCamera>
        </>
    )
}

export default CameraView;