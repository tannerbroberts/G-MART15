import {useState, useEffect, useCallback} from 'react';
import useSound from 'use-sound';



function useBgm (
    musicUrl='', initialVolume = 0.3
){
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(initialVolume);
    const [play, {stop, sound}] = useSound(musicUrl,{
        volume: volume,
        loop: true,
        interrupt: false,
    });
    const toggleMusic = useCallback(()=> {
        if(isPlaying){
            stop();
            setIsPlaying(false);
        }
        else {
            play();
            setIsPlaying(true);
        }
    }, [isPlaying, play, stop]);
    const adjustVolume = useCallback((newVolume:number)=>{
        setVolume(newVolume);
        if (sound){
            sound.volume(newVolume)
        }
    }, [sound]);
    useEffect(()=>{
        if(localStorage.getItem('musicEnabled') !=='false'){
            play();
            setIsPlaying(true);
        }
        return ()=> {
            stop();
        };
    }, [play,stop]);
    return{
        isPlaying,
        toggleMusic,
        volume,
        adjustVolume
    };
}

export default useBgm