import React from 'react';
import {useGameSounds} from '../context/SoundContext'

const BlackjackTable = () => {
    const {playDealCard, playChip, playWin, playLose} = useGameSounds ();

    return(
        <>
        <button onClick= {playDealCard}>PlayDealCardSound</button>
        </>
    )
}