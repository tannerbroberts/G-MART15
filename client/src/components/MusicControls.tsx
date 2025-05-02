import React from 'react';
import {useGameSounds} from '../context/SoundContext';

const MusicControls = () => {
    const {backgroundMusic, soundEnabled, toggleSoundEffects} = useGameSounds();
    return(
        <div className="audio-controls">
            <button
            onClick= {backgroundMusic.toggleMusic}
            aria-label = {backgroundMusic.isPlaying? 'Pause Music' : 'Play Music'}
            className="music-toggle-btn">
                 {backgroundMusic.isPlaying ? '🔊 Music On' : '🔇 Music Off'}
            </button>
            <button
            onClick= {toggleSoundEffects}
            aria-label= {soundEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
            className="sfx-toggle-btn">
                {soundEnabled ? '🔊 SFX On' : '🔇 SFX Off'}
            </button>
            {backgroundMusic.isPlaying&&(
                <div className="volume-control">
                    <label htmlFor="volume-slider">Volume:</label>
                    <input
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={backgroundMusic.volume}
                    onChange={(e)=> backgroundMusic.adjustVolume(parseFloat(e.target.value))}/>
                </div>
            )}

        </div>
    );
};

export default MusicControls;