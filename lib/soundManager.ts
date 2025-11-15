import { Howl } from 'howler';

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private isInitialized = false;
  private isMuted = false;

  initialize() {
    if (this.isInitialized) return;

    // Card dealing sound
    this.sounds.set('cardDeal', new Howl({
      src: ['/sounds/card-deal.mp3'],
      volume: 0.5,
    }));

    // Chip clink sound
    this.sounds.set('chipClink', new Howl({
      src: ['/sounds/chip-clink.mp3'],
      volume: 0.6,
    }));

    // Win sound
    this.sounds.set('win', new Howl({
      src: ['/sounds/win.mp3'],
      volume: 0.7,
    }));

    // Loss sound
    this.sounds.set('loss', new Howl({
      src: ['/sounds/loss.mp3'],
      volume: 0.5,
    }));

    // Background ambience
    this.sounds.set('ambience', new Howl({
      src: ['/sounds/casino-ambience.mp3'],
      volume: 0.2,
      loop: true,
    }));

    this.isInitialized = true;
  }

  play(soundName: string) {
    if (!this.isInitialized || this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    }
  }

  playAmbience() {
    if (!this.isInitialized || this.isMuted) return;
    
    const ambience = this.sounds.get('ambience');
    if (ambience && !ambience.playing()) {
      ambience.play();
    }
  }

  stopAmbience() {
    const ambience = this.sounds.get('ambience');
    if (ambience) {
      ambience.stop();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopAmbience();
    } else {
      this.playAmbience();
    }
    
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    
    if (this.isMuted) {
      this.stopAmbience();
    } else if (this.isInitialized) {
      this.playAmbience();
    }
  }

  getMuted() {
    return this.isMuted;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
