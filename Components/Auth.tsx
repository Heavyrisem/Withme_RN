import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import io from 'socket.io-client';

interface Auth_P {
    setAuthed: React.Dispatch<React.SetStateAction<boolean>>
}
const Auth = (props: Auth_P) => {
    const [AuthCode, setAuthCode] = useState(-1);

    useEffect(() => {
        const UniqueID = DeviceInfo.getUniqueId()
        const socket = io("https://withme.heavyrisem.xyz/socket", {query: {mobileID: UniqueID}, path: '/auth', transports: ['websocket']});
        socket.on('connect', () => (console.log('socket connected')));
        socket.on('Authed', (Data: {Authed: boolean, code?: number}) => {
            if (Data.Authed) {
                props.setAuthed(true);
                socket.disconnect();
                socket.close();
            } else setAuthCode(Data.code as number);
        })
    }, []);

    return (
        <SafeAreaView>
            <Text style={{fontSize: 30, textAlign: 'center'}}>{(AuthCode > 0)? AuthCode : "서버에 연결 중입니다..."}</Text>
        </SafeAreaView>
    )
}

export default Auth;