import Voice, { SpeechRecognizedEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import React, { useEffect, useState } from 'react';
import { Similar } from './Similar';

class VoiceDetection {
    STT = Voice;
    WakeUpKeyWord: string = "None";
    Listening: boolean = false;
    Actions: VoiceDetection_Action[] = [];
    SpeechTimer: NodeJS.Timeout = setInterval(()=>{}, 0);
    Timer = 4500;
    Result: string = "";
    setResult: (str: string) => any | undefined;

    constructor(WakeUpKeyWord: string, Actions: VoiceDetection_Action[], setResult: (str: string) => any) {
        console.log("init");
        this.setResult = setResult;
        this.EventAdder();
        this.STT.onSpeechError = (e) => {
            console.log("err", e);
            if (e.error && e.error.message)
             this.setResult(e.error.message);
            this.STT.stop().then(()=>this.STT.start("ko-KR"));
        }

        this.WakeUpKeyWord = WakeUpKeyWord;
        this.Actions = Actions;
        this.STT.start("ko-KR");
    }

    EventAdder() {
        this.STT.onSpeechStart = this.onSpeechStartHandler.bind(this);
        this.STT.onSpeechEnd = this.onSpeechEndHandler.bind(this);
        this.STT.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    }

    stop = async () => {
        console.log("음성이 감지되지 않아 초기화합니다.", await this.STT.isRecognizing());
        let isRec = await this.STT.isRecognizing();
        if (isRec) {
            this.STT.stop().then(v=>{console.log("stop",v);this.STT.start("ko-KR");}).catch(v=>console.log('e',v));
        } else this.STT.start("ko-KR");
    }

    onSpeechStartHandler = () => {
        console.log("Listning");
        this.Listening = true;
    }

    onSpeechEndHandler = () => {
        console.log("end");
    }

    onSpeechResultsHandler = (e: SpeechResultsEvent) => {
        let needUpdateTimer = true;
        clearTimeout(this.SpeechTimer);
        console.log(e.value, e.value && e.value[0].indexOf(this.WakeUpKeyWord) != -1);

        
        if (e.value && e.value[0].indexOf(this.WakeUpKeyWord.toLowerCase()) != -1) {
            let idx = e.value[0].lastIndexOf(this.WakeUpKeyWord);
            let text = e.value[0].substring(idx+this.WakeUpKeyWord.length);
            this.setResult(e.value[0].substring(idx));

            for (const Action of this.Actions) {
                for (const Keywd of Action.keyWords){
                    if (Similar(text, Keywd) >= 90) {
                        console.log(Similar(text, Keywd), Keywd);
                        Action.action();
                        needUpdateTimer = false;
                    }
                }
            }
        }
        
        needUpdateTimer&& (this.SpeechTimer = setTimeout(this.stop, this.Timer))
    }
}


export interface VoiceDetection_Action {
    keyWords: string[]
    action: () => any
}

export default VoiceDetection;