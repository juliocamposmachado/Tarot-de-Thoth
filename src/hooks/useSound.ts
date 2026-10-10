import { useCallback } from 'react';

const SOUNDS = {
  shuffle: '/sounds/shuffle.mp3',
  reveal: '/sounds/reveal.mp3',
};

export const useSound = () => {
  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[soundName]);
    audio.volume = 0.5; // Adjust volume as needed
    audio.play().catch(e => console.log('Audio playback failed:', e));
  }, []);

  return { playSound };
};
