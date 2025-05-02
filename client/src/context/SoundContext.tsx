import React, {createContext, useState, useContext, useEffect} from 'react';
import useSound from 'use-sound';
import useBgm from '../components/useBgm.tsx';

//THE SOURCES HERE ARE ALL TEMPORARY

import backgroundMusicFile from '../assets/sound_assets/TESTMUSIC1.flac';
import dealCardSound from '../assets/sound_assets/PlaceholderButtonNoise.mp3';
import chipSound from '../assets/sound_assets/BetWhole.wav';
import winSound from '../assets/sound_assets/GameWonTEMP.mp3';
import loseSound from '../assets/sound_assets/GameOverTEMP.mp3';



interface soundContextType {
    backgroundMusic: {
      isPlaying: boolean;
      toggleMusic: () => void;
      volume: number;
      adjustVolume: (volume: number) => void;
    };
    playDealCard: () => void;
    playChip: () => void;
    playWin: () => void;
    playLose: () => void;
    soundEnabled: boolean;
    toggleSoundEffects: () => void;
  };
  

export const soundContext = createContext<soundContextType | null>(null);

export const SoundProvider = ({children}: {children: React.ReactNode})=>{
    const [soundEnabled, setSoundEnabled] = useState(true);
    const backgroundMusic = useBgm(backgroundMusicFile);
    const [playDealCard] = useSound(dealCardSound, {volume: 0.5, soundEnabled});
    const [playChip] = useSound(chipSound, { volume: 0.5, soundEnabled });
    const [playWin] = useSound(winSound, { volume: 0.6, soundEnabled });
    const [playLose] = useSound(loseSound, { volume: 0.6, soundEnabled });
    const toggleSoundEffects = ()=> {
        setSoundEnabled(prev => !prev);
        localStorage.setItem('soundEffectsEnabled', !soundEnabled);
    };
    useEffect(()=>{
    const savedSoundEffects = localStorage.getItem('soundEffectsEnabled')
    if(savedSoundEffects !== null) {
        setSoundEnabled(savedSoundEffects === 'true')
    }}, [])
const contextValue: soundContextType = {
    backgroundMusic,
    playDealCard,
    playChip,
    playWin,
    playLose,
    soundEnabled,
    toggleSoundEffects
};

return(
        <soundContext.Provider value={contextValue}> {children} </soundContext.Provider>
    );
};

export const useGameSounds = (): soundContextType => {
    const context = useContext(soundContext);
    
    if (!context) {
      throw new Error("useGameSounds must be used within a SoundProvider");
    }
    
    return context;
};