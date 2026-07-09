import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Compass, 
  Award, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Clock, 
  Calendar,
  Sparkles, 
  RefreshCw, 
  Play, 
  Info, 
  Layers, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// ==========================================
// 1. TYPES & DATA STRUCTURES
// ==========================================

interface JapaneseSegment {
  text: string;
  ruby?: string;
}

interface Dinosaur {
  id: string;
  nameJa: string;
  nameEn: string;
  scientificName: string;
  phonetic: string;
  phoneticKatakana: string;
  era: 'Triassic' | 'Jurassic' | 'Cretaceous';
  diet: 'Herbivore' | 'Carnivore' | 'Piscivore';
  length: string;
  meaning: string;
  triviaEn: string;
  triviaJa: string;
  speciesName: string;
  speciesMeaning: string;
  speciesNote: string;
}

interface QuizQuestion {
  japaneseSegments: JapaneseSegment[];
  keyword: string;
  keywordHintJa: string;
  options: {
    text: string;
    translation: string;
  }[];
  correctIndex: number;
  explanationJa: string;
  explanationEn: string;
}

interface DinosaurChallenge {
  id: string;
  nameJa: string;
  nameEn: string;
  scientificName: string;
  phonetic: string;
  phoneticKatakana: string;
  era: 'Triassic' | 'Jurassic' | 'Cretaceous';
  diet: 'Herbivore' | 'Carnivore' | 'Piscivore';
  length: string;
  meaning: string;
  triviaJa: string;
  triviaEn: string;
  vocabQuestion: QuizQuestion;
  basicQuestion: QuizQuestion;
}

// ==========================================
// 1.5 PRONUNCIATION DICTIONARY FOR QUIZ OPTIONS
// ==========================================

import { DINO_CHALLENGES, PRONUNCIATION_MAP, VOCABULARY_MAP } from '../dinoData';

// ==========================================
// 2. SYNTHETIC SOUND ENGINE (Web Audio API)
// ==========================================

class AudioSynth {
  private static ctx: AudioContext | null = null;
  public static isMuted: boolean = false;

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public static playBeep(freq = 600, duration = 0.08, type: OscillatorType = 'sine', volume = 0.08) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio contextual sweep blocked:', e);
    }
  }

  public static playSelect() {
    this.playBeep(880, 0.05, 'sine', 0.06);
  }

  public static playCorrect() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Positive chord)
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.18, 'triangle', 0.1);
      }, idx * 75);
    });
  }

  public static playIncorrect() {
    try {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.35);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      console.log(e);
    }
  }

  public static playLevelUp() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Ascending scale
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.22, 'sine', 0.08);
      }, idx * 60);
    });
  }

  public static speakScientificName(text: string) {
    if (this.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // 少しゆっくり発音して聞き取りやすく
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis failed:', e);
    }
  }

  public static speakWord(text: string) {
    if (this.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Word speech synthesis failed:', e);
    }
  }

  public static playDinoRoar(dinoId?: string) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 恐竜ごとの個性的な咆哮パラメータ設定（デフォルト値は汎用咆哮）
      let duration = 1.5;
      let baseFreq = 150;
      let endFreq = 70;
      let subFreq = 60;
      let noiseFreq = 140;
      let noiseQ = 2.2;
      let lfoFreq = 20;
      let lfoGainVal = 60;
      let subType: OscillatorType = 'sawtooth';
      let midType: OscillatorType = 'triangle';
      let noiseVol = 0.45;
      let subVol = 0.55;
      let midVol = 0.4;

      if (dinoId) {
        switch (dinoId) {
          case 'tyrannosaurus':
            duration = 2.0;
            baseFreq = 110;
            endFreq = 45;
            subFreq = 45;
            noiseFreq = 100;
            noiseQ = 1.2;
            lfoFreq = 12;
            lfoGainVal = 45;
            subType = 'sawtooth';
            midType = 'sawtooth';
            noiseVol = 0.6;
            subVol = 0.7;
            midVol = 0.4;
            break;
          case 'allosaurus':
            duration = 1.5;
            baseFreq = 140;
            endFreq = 60;
            subFreq = 70;
            noiseFreq = 180;
            noiseQ = 2.5;
            lfoFreq = 22;
            lfoGainVal = 65;
            subType = 'sawtooth';
            midType = 'triangle';
            noiseVol = 0.5;
            subVol = 0.5;
            midVol = 0.5;
            break;
          case 'spinosaurus':
            duration = 1.8;
            baseFreq = 100;
            endFreq = 40;
            subFreq = 60;
            noiseFreq = 150;
            noiseQ = 3.0;
            lfoFreq = 8;
            lfoGainVal = 30;
            subType = 'sine';
            midType = 'sawtooth';
            noiseVol = 0.4;
            subVol = 0.6;
            midVol = 0.3;
            break;
          case 'coelophysis':
            duration = 0.8;
            baseFreq = 550;
            endFreq = 300;
            subFreq = 200;
            noiseFreq = 750;
            noiseQ = 1.0;
            lfoFreq = 35;
            lfoGainVal = 150;
            subType = 'triangle';
            midType = 'sine';
            noiseVol = 0.25;
            subVol = 0.2;
            midVol = 0.6;
            break;
          case 'herrerasaurus':
            duration = 1.2;
            baseFreq = 220;
            endFreq = 110;
            subFreq = 120;
            noiseFreq = 350;
            noiseQ = 2.0;
            lfoFreq = 25;
            lfoGainVal = 80;
            subType = 'sawtooth';
            midType = 'triangle';
            noiseVol = 0.4;
            subVol = 0.4;
            midVol = 0.4;
            break;
          case 'brachiosaurus':
            duration = 2.5;
            baseFreq = 130;
            endFreq = 110;
            subFreq = 80;
            noiseFreq = 220;
            noiseQ = 0.8;
            lfoFreq = 6;
            lfoGainVal = 20;
            subType = 'sine';
            midType = 'sine';
            noiseVol = 0.2;
            subVol = 0.6;
            midVol = 0.6;
            break;
          case 'triceratops':
            duration = 1.4;
            baseFreq = 180;
            endFreq = 100;
            subFreq = 110;
            noiseFreq = 280;
            noiseQ = 1.8;
            lfoFreq = 16;
            lfoGainVal = 55;
            subType = 'triangle';
            midType = 'sawtooth';
            noiseVol = 0.45;
            subVol = 0.4;
            midVol = 0.5;
            break;
          case 'stegosaurus':
            duration = 1.5;
            baseFreq = 140;
            endFreq = 75;
            subFreq = 85;
            noiseFreq = 190;
            noiseQ = 1.5;
            lfoFreq = 10;
            lfoGainVal = 40;
            subType = 'triangle';
            midType = 'triangle';
            noiseVol = 0.35;
            subVol = 0.5;
            midVol = 0.4;
            break;
          case 'plateosaurus':
            duration = 1.3;
            baseFreq = 200;
            endFreq = 120;
            subFreq = 130;
            noiseFreq = 320;
            noiseQ = 1.6;
            lfoFreq = 14;
            lfoGainVal = 45;
            subType = 'triangle';
            midType = 'triangle';
            noiseVol = 0.3;
            subVol = 0.4;
            midVol = 0.4;
            break;
          case 'ankylosaurus':
            duration = 1.4;
            baseFreq = 120;
            endFreq = 60;
            subFreq = 70;
            noiseFreq = 160;
            noiseQ = 2.2;
            lfoFreq = 12;
            lfoGainVal = 40;
            subType = 'sawtooth';
            midType = 'sawtooth';
            noiseVol = 0.4;
            subVol = 0.6;
            midVol = 0.3;
            break;
        }
      }

      // 1. ノイズソースを作成（地響きのような「ゴォォォ」ノイズ成分）
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // ホワイトノイズ
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // ノイズ用フィルター（高音を大幅に削って、重厚な「ゴォォ」という音にする）
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(noiseFreq, now); // 恐竜ごとのノイズ周波数
      noiseFilter.Q.setValueAtTime(noiseQ, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(noiseVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // 2. 超低音オシレーター（地響き：ゴゴゴ）
      const subOsc = this.ctx.createOscillator();
      subOsc.type = subType; // 恐竜ごとの波形
      subOsc.frequency.setValueAtTime(subFreq, now);
      subOsc.frequency.linearRampToValueAtTime(subFreq / 2, now + duration); // 周波数を徐々に下げる

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(subFreq * 1.5, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(subVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // 3. 中低音オシレーター（咆哮のうなり、ガオー）
      const midOsc = this.ctx.createOscillator();
      midOsc.type = midType;
      midOsc.frequency.setValueAtTime(baseFreq, now);
      midOsc.frequency.linearRampToValueAtTime(endFreq, now + duration);

      // ビブラート（激しいうなり声効果）
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = lfoFreq; // 激しく揺らす
      lfoGain.gain.value = lfoGainVal; // 揺れの深さ
      lfo.connect(lfoGain);
      lfoGain.connect(midOsc.frequency); // 周波数を変調

      const midFilter = this.ctx.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.setValueAtTime(baseFreq * 1.5, now);
      midFilter.Q.setValueAtTime(2.2, now);

      const midGain = this.ctx.createGain();
      midGain.gain.setValueAtTime(midVol, now);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // 接続
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.ctx.destination);

      midOsc.connect(midFilter);
      midFilter.connect(midGain);
      midGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration);

      subOsc.start(now);
      subOsc.stop(now + duration);

      midOsc.start(now);
      midOsc.stop(now + duration);

      lfo.start(now);
      lfo.stop(now + duration);
    } catch (e) {
      console.log('Dinosaur roar generation failed:', e);
    }
  }
}

// ==========================================
// 3. DINOSAUR & DOUBLE-DECODE QUIZ DATASET
// ==========================================

// QUESTIONS 辞書の自動生成 (2段階クイズ対応)
const QUESTIONS: (QuizQuestion & { id: string; dinoId: string; era: 'Triassic' | 'Jurassic' | 'Cretaceous' })[] = [];
DINO_CHALLENGES.forEach(challenge => {
  // 第1問：【恐竜専門語彙（Dino Vocab）】
  QUESTIONS.push({
    ...challenge.vocabQuestion,
    id: `${challenge.id}_vocab`,
    dinoId: challenge.id,
    era: challenge.era
  });
  // 第2問：【基礎英語（Basic Vocab）】
  QUESTIONS.push({
    ...challenge.basicQuestion,
    id: `${challenge.id}_basic`,
    dinoId: challenge.id,
    era: challenge.era
  });
});

// 既存のコード（図鑑や描画処理）との100%互換性を維持するために、DINOSAURS 辞書を自動生成
const DINOSAURS: Record<string, Dinosaur> = {};
DINO_CHALLENGES.forEach(challenge => {
  DINOSAURS[challenge.id] = {
    id: challenge.id,
    nameJa: challenge.nameJa,
    nameEn: challenge.nameEn,
    scientificName: challenge.scientificName,
    phonetic: challenge.phonetic,
    phoneticKatakana: challenge.phoneticKatakana,
    era: challenge.era,
    diet: challenge.diet,
    length: challenge.length,
    meaning: challenge.meaning,
    triviaJa: challenge.triviaJa,
    triviaEn: challenge.triviaEn,
    speciesName: challenge.speciesName,
    speciesMeaning: challenge.speciesMeaning,
    speciesNote: challenge.speciesNote
  };
});

// ==========================================
// 4. ERA ENVIRONMENTAL DATA (Unlocked dynamically)
// ==========================================

const ERA_DATA = {
  Triassic: {
    titleJa: '三畳紀',
    titleEn: 'Triassic Period',
    span: '約2億5190万年前 〜 2億130万年前',
    descJa: '全ての超大陸が１つに固まった「パンゲア」が存在し、内陸は非常に乾燥していました。恐竜の祖先が小さく生まれ、大地の王者へと進化を始めた時代の始まりです。',
    descEn: 'The supercontinent Pangea was formed, leading to a hot and dry climate. The very first small dinosaurs emerged and began their spectacular journey of evolution.'
  },
  Jurassic: {
    titleJa: 'ジュラ紀',
    titleEn: 'Jurassic Period',
    span: '約2億130万年前 〜 1億4500万年前',
    descJa: '温暖で雨の多い湿潤な気候になり、巨大なジャングルが世界中に広がりました。これに合わせて、首長竜をはじめとする恐竜たちが巨大化・大繁栄しました。',
    descEn: 'The climate became warm and humid, nourishing lush giant forests. This environmental boom allowed sauropods and giant carnivores to grow to colossal sizes.'
  },
  Cretaceous: {
    titleJa: '白亜紀',
    titleEn: 'Cretaceous Period',
    span: '約1億4500万年前 〜 6600万年前',
    descJa: '大陸がばらばらに分裂し、海の水位が高くなりました。世界各地で独自の進化が遂げられ、ティラノサウルスやトリケラトプスなど個性的で最強の恐竜たちがしのぎを削った、恐竜たちの黄金時代です。',
    descEn: 'Continents drifted apart and sea levels rose, creating diverse isolation habitats. Iconic species like T-rex and Triceratops competed in the ultimate golden age of paleontology.'
  }
};

// ==========================================
// 5. DINOSAUR BLUEPRINT SVG RENDERER
// ==========================================

function DinoHoloBlueprint({ dinoId, era }: { dinoId: string; era: 'Triassic' | 'Jurassic' | 'Cretaceous' }) {
  // Renders high-tech vector holographic line art or loaded specimen illustration from images/ folder with fallback
  const [imageError, setImageError] = useState(false);
  const [imageFormatIndex, setImageFormatIndex] = useState(0); // 0: png, 1: jpg
  const formats = ['.png', '.jpg'];
  const themeColor = era === 'Triassic' ? '#06b6d4' : era === 'Jurassic' ? '#10b981' : '#f59e0b';

  useEffect(() => {
    setImageError(false);
    setImageFormatIndex(0);
  }, [dinoId]);

  // Custom paths for stylized cybernetic dinosaur outlines (Fallback SVG)
  const renderSpecimenPath = () => {
    switch (dinoId) {
      case 'herrerasaurus':
        return (
          <>
            {/* Skeletal wireframe details & nodes */}
            <path d="M 50,150 C 70,120 120,110 160,120 C 180,115 200,90 230,100 C 250,105 270,120 280,140 C 270,145 250,150 230,140 C 210,135 190,145 180,165" stroke={themeColor} strokeWidth="3" fill="none" className="transition-all duration-500" />
            <path d="M 180,165 C 170,190 180,220 160,240 M 160,240 L 150,270 L 170,275 M 195,155 L 210,190 L 220,210" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <path d="M 90,135 C 70,160 50,190 30,210" stroke={themeColor} strokeWidth="2" strokeDasharray="3,3" fill="none" />
            <circle cx="250" cy="115" r="4" fill={themeColor} className="animate-ping" />
            <line x1="250" y1="115" x2="280" y2="85" stroke={themeColor} strokeWidth="1" strokeDasharray="2,2" />
            <text x="285" y="80" fill={themeColor} className="text-[10px] font-mono tracking-widest">Target: Olfactory</text>
          </>
        );
      case 'coelophysis':
        return (
          <>
            {/* Extremely slender, light bones representation */}
            <path d="M 30,170 C 60,160 110,145 150,140 C 170,135 190,95 220,100 C 235,102 250,115 260,125 C 250,130 230,135 215,130 C 190,125 180,140 170,160" stroke={themeColor} strokeWidth="2" fill="none" />
            {/* Leg structure - bird-like */}
            <path d="M 160,150 C 150,180 165,220 155,250 L 140,280 L 165,280" stroke={themeColor} strokeWidth="2" fill="none" />
            <path d="M 175,148 C 170,175 180,205 178,230 L 182,255" stroke={themeColor} strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
            {/* Long thin tail */}
            <path d="M 130,142 C 90,150 50,180 20,210" stroke={themeColor} strokeWidth="2" fill="none" />
            <circle cx="235" cy="108" r="3" fill={themeColor} />
            <text x="220" y="85" fill={themeColor} className="text-[9px] font-mono">HOLLOW_BONE_SCAN: TRUE</text>
          </>
        );
      case 'plateosaurus':
        return (
          <>
            {/* Larger bipedal ancestor with long neck */}
            <path d="M 40,190 C 70,180 120,160 150,140 C 175,120 190,60 215,55 C 225,52 240,65 245,75 C 235,80 220,82 210,85 C 195,95 190,130 185,160" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Bulky back legs */}
            <path d="M 165,155 C 155,190 170,230 155,270 L 175,275" stroke={themeColor} strokeWidth="3.5" fill="none" />
            <path d="M 130,170 C 100,190 60,220 30,240" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <rect x="210" y="40" width="45" height="15" rx="3" fill="none" stroke={themeColor} strokeWidth="1" strokeDasharray="2,2" />
            <text x="214" y="51" fill={themeColor} className="text-[8px] font-mono">LOBE_INDEX: 4</text>
          </>
        );
      case 'stegosaurus':
        return (
          <>
            {/* Plates on back & spikes on tail */}
            {/* Main bulky body */}
            <path d="M 40,210 C 60,170 120,150 160,160 C 190,165 210,185 220,210 C 205,215 180,215 160,210" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Plates */}
            <polygon points="75,165 85,135 100,160" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <polygon points="105,150 118,120 135,148" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <polygon points="140,152 155,125 170,155" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <polygon points="175,158 185,138 198,162" stroke={themeColor} strokeWidth="2.5" fill="none" />
            {/* Heavy legs */}
            <path d="M 90,190 L 90,265 L 105,265" stroke={themeColor} strokeWidth="3.5" fill="none" />
            <path d="M 175,195 L 175,270 L 190,270" stroke={themeColor} strokeWidth="3.5" fill="none" />
            {/* Tail and 4 Spikes */}
            <path d="M 70,195 C 45,210 25,230 15,245" stroke={themeColor} strokeWidth="3" fill="none" />
            <line x1="20" y1="240" x2="5" y2="250" stroke={themeColor} strokeWidth="2.5" />
            <line x1="15" y1="245" x2="2" y2="260" stroke={themeColor} strokeWidth="2.5" />
            <line x1="10" y1="230" x2="-2" y2="225" stroke={themeColor} strokeWidth="2.5" />
            <text x="10" y="115" fill={themeColor} className="text-[10px] font-mono">THAGOMIZER_ACTIVE</text>
          </>
        );
      case 'allosaurus':
        return (
          <>
            {/* Fearsome theropod */}
            <path d="M 45,160 C 70,130 120,110 160,120 C 180,110 210,85 240,95 C 265,100 270,120 275,135 C 260,145 240,140 220,135 C 200,130 190,145 180,170" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Jaw bones open */}
            <path d="M 240,115 L 268,125 M 240,122 L 260,135" stroke={themeColor} strokeWidth="2" fill="none" />
            {/* Powerful arms */}
            <path d="M 200,140 L 210,165 L 205,175" stroke={themeColor} strokeWidth="2" fill="none" />
            {/* Strong legs */}
            <path d="M 165,155 C 150,190 165,235 150,270 L 170,275" stroke={themeColor} strokeWidth="4" fill="none" />
            {/* Tail */}
            <path d="M 85,145 C 55,170 30,205 10,225" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <circle cx="260" cy="108" r="4" fill="none" stroke={themeColor} strokeWidth="1" className="animate-ping" />
            <text x="210" y="75" fill={themeColor} className="text-[9px] font-mono">SAW_TEETH_SCAN: 100%</text>
          </>
        );
      case 'brachiosaurus':
        return (
          <>
            {/* Giant long vertical neck */}
            <path d="M 40,250 C 70,240 120,230 150,210 C 165,190 170,90 185,45 C 192,30 205,35 210,40 C 205,50 198,62 192,85 C 185,115 185,160 180,210" stroke={themeColor} strokeWidth="4" fill="none" />
            {/* Giant legs (Front longer than rear) */}
            <path d="M 165,210 L 165,280 L 180,280" stroke={themeColor} strokeWidth="4" fill="none" />
            <path d="M 100,230 L 100,280 L 112,280" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Sweeping tail */}
            <path d="M 75,242 C 45,250 20,265 5,275" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <line x1="185" y1="45" x2="235" y2="45" stroke={themeColor} strokeWidth="1" strokeDasharray="3,3" />
            <text x="240" y="48" fill={themeColor} className="text-[10px] font-mono">ALTITUDE: +13m</text>
          </>
        );
      case 'tyrannosaurus':
        return (
          <>
            {/* T-rex massive head, tiny arms, strong jaw */}
            <path d="M 40,160 C 75,135 125,120 165,130 C 185,115 220,90 255,95 C 278,98 285,120 280,145 C 255,152 245,145 225,142 C 205,138 195,155 185,185" stroke={themeColor} strokeWidth="4" fill="none" />
            {/* Heavy jaw bones */}
            <path d="M 252,118 L 278,124 M 250,130 L 270,135" stroke={themeColor} strokeWidth="2.5" fill="none" />
            {/* Small arm hook */}
            <path d="M 215,152 L 222,165" stroke={themeColor} strokeWidth="2" fill="none" />
            {/* Colossal muscular legs */}
            <path d="M 165,160 C 150,200 170,240 155,275 L 178,278" stroke={themeColor} strokeWidth="5" fill="none" />
            <path d="M 115,145 C 80,170 45,200 15,220" stroke={themeColor} strokeWidth="3" fill="none" />
            <circle cx="270" cy="110" r="5" fill="none" stroke={themeColor} strokeWidth="1.5" className="animate-pulse" />
            <text x="210" y="70" fill={themeColor} className="text-[10px] font-mono tracking-wider">MAX_BITE_FORCE: 60,000N</text>
          </>
        );
      case 'triceratops':
        return (
          <>
            {/* Triceratops 3 horns and giant frill */}
            {/* Stocky body */}
            <path d="M 50,220 C 70,175 130,170 170,180 C 190,170 210,140 220,110 C 228,140 235,160 240,195 C 220,200 195,205 170,200" stroke={themeColor} strokeWidth="3.5" fill="none" />
            {/* Frill spikes */}
            <path d="M 205,140 C 215,120 230,130 235,155" stroke={themeColor} strokeWidth="2.5" fill="none" />
            {/* Brow Horns */}
            <line x1="228" y1="180" x2="265" y2="155" stroke={themeColor} strokeWidth="3.5" />
            <line x1="230" y1="188" x2="268" y2="168" stroke={themeColor} strokeWidth="3" />
            {/* Nose Horn */}
            <line x1="244" y1="205" x2="262" y2="198" stroke={themeColor} strokeWidth="2.5" />
            {/* Heavy Pillar legs */}
            <path d="M 100,205 L 100,270 L 115,270" stroke={themeColor} strokeWidth="4" fill="none" />
            <path d="M 180,205 L 180,272 L 195,272" stroke={themeColor} strokeWidth="4" fill="none" />
            <path d="M 75,210 C 50,225 30,240 15,255" stroke={themeColor} strokeWidth="3" fill="none" />
            <text x="130" y="105" fill={themeColor} className="text-[9px] font-mono">FRILL_THICKNESS: 120mm</text>
          </>
        );
      case 'spinosaurus':
        return (
          <>
            {/* Spinosaurus giant neural sail */}
            <path d="M 40,180 C 70,155 120,140 160,150 C 180,140 210,115 245,125 C 268,130 275,145 272,158 C 255,165 240,160 220,155 C 200,150 190,165 180,190" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Long crocodilian snout */}
            <path d="M 245,135 L 272,142 M 245,145 L 265,150" stroke={themeColor} strokeWidth="2" fill="none" />
            {/* Big sail on back */}
            <path d="M 90,160 Q 125,80 155,152" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Internal bones in the sail */}
            <line x1="105" y1="145" x2="108" y2="105" stroke={themeColor} strokeWidth="1.5" strokeDasharray="2,2" />
            <line x1="120" y1="148" x2="124" y2="92" stroke={themeColor} strokeWidth="1.5" strokeDasharray="2,2" />
            <line x1="135" y1="150" x2="140" y2="102" stroke={themeColor} strokeWidth="1.5" strokeDasharray="2,2" />
            {/* Legs & webbed feet indicators */}
            <path d="M 160,180 L 155,255 L 170,258" stroke={themeColor} strokeWidth="3" fill="none" />
            {/* Tail */}
            <path d="M 80,172 C 50,190 25,215 5,230" stroke={themeColor} strokeWidth="2.5" fill="none" />
            <text x="110" y="70" fill={themeColor} className="text-[10px] font-mono">SAIL_HEIGHT: 1.8m</text>
          </>
        );
      case 'ankylosaurus':
        return (
          <>
            {/* Low heavy tank with tail club */}
            {/* Wide back with spikes */}
            <path d="M 40,225 C 65,185 135,180 170,195 C 190,198 210,210 220,225 C 195,235 155,235 120,230" stroke={themeColor} strokeWidth="3.5" fill="none" />
            {/* Spikes on side */}
            <polygon points="80,190 70,175 90,192" fill="none" stroke={themeColor} strokeWidth="2" />
            <polygon points="110,192 105,172 120,194" fill="none" stroke={themeColor} strokeWidth="2" />
            <polygon points="140,195 142,175 152,198" fill="none" stroke={themeColor} strokeWidth="2" />
            {/* Short thick legs */}
            <path d="M 90,220 L 85,270 L 100,270" stroke={themeColor} strokeWidth="4" fill="none" />
            <path d="M 155,225 L 150,272 L 165,272" stroke={themeColor} strokeWidth="4" fill="none" />
            {/* Tail with Club */}
            <path d="M 55,225 C 35,235 18,242 10,245" stroke={themeColor} strokeWidth="3" fill="none" />
            <circle cx="8" cy="246" r="10" fill="none" stroke={themeColor} strokeWidth="2.5" />
            <line x1="8" y1="246" x2="-2" y2="246" stroke={themeColor} strokeWidth="1" />
            <text x="15" y="145" fill={themeColor} className="text-[10px] font-mono">CLUB_MASS: 35kg</text>
          </>
        );
      default:
        return (
          <>
            {/* Universal Cybernetic Specimen Wireframe Silhouette Fallback */}
            <path d="M 45,170 C 70,140 120,130 160,140 C 180,130 205,100 235,110 C 255,115 270,130 275,145 C 260,155 240,150 220,145 C 195,140 185,155 175,185" stroke={themeColor} strokeWidth="3.5" fill="none" className="transition-all duration-500" />
            <path d="M 235,120 L 272,130 M 235,130 L 260,138" stroke={themeColor} strokeWidth="2" fill="none" />
            <path d="M 160,175 C 150,210 165,245 155,275 L 175,278" stroke={themeColor} strokeWidth="3.5" fill="none" />
            <path d="M 105,185 C 95,215 110,245 100,272 L 118,274" stroke={themeColor} strokeWidth="3" fill="none" strokeDasharray="3,2" />
            <path d="M 90,165 C 65,190 35,215 15,235" stroke={themeColor} strokeWidth="3" fill="none" />
            <circle cx="250" cy="120" r="4" fill={themeColor} className="animate-ping" />
            <line x1="250" y1="120" x2="280" y2="90" stroke={themeColor} strokeWidth="1" strokeDasharray="2,2" />
            <text x="180" y="70" fill={themeColor} className="text-[9px] font-mono tracking-wider">HOLO_SYNTH_SPECIMEN: ACTIVE</text>
          </>
        );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[180px] sm:min-h-[220px] bg-slate-950/80 rounded border border-emerald-500/20 crt-scanlines overflow-hidden flex items-center justify-center p-3">
      {/* Absolute overlay scanning lasers */}
      <div className="absolute left-0 w-full h-[2px] bg-emerald-500/60 scanner-line shadow-[0_0_10px_#10b981]" style={{ boxShadow: `0 0 10px ${themeColor}` }} />
      
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 terminal-grid opacity-40 pointer-events-none" />

      {/* Cyber Reticles */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-500/60 flex flex-col gap-0.5 z-20">
        <span>SYS.SCAN_ACTIVE: TRUE</span>
        <span>RESOLUTION: 1024_PX</span>
        <span>SPECIMEN_ID: {dinoId.toUpperCase()}</span>
      </div>

      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-500/60 flex items-center gap-1.5 z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ backgroundColor: themeColor }} />
        <span>DIAGNOSTIC_FEED: ONLINE</span>
      </div>

      {!imageError ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
          <img
            src={`images/${dinoId.toLowerCase()}${formats[imageFormatIndex]}`}
            alt={dinoId}
            className="max-h-[160px] sm:max-h-[190px] object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] filter contrast-125 brightness-110 transition-all duration-300"
            onError={() => {
              if (imageFormatIndex < formats.length - 1) {
                setImageFormatIndex(imageFormatIndex + 1);
              } else {
                setImageError(true);
              }
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Actual SVG Graphic fallback */
        <svg viewBox="0 0 300 300" className="w-full h-full max-h-[160px] sm:max-h-[200px] z-10 drop-shadow-lg">
          {/* Hologram Circle Pedestal */}
          <ellipse cx="150" cy="265" rx="90" ry="15" fill="none" stroke={`${themeColor}33`} strokeWidth="1" strokeDasharray="3,3" />
          <ellipse cx="150" cy="265" rx="70" ry="10" fill="none" stroke={`${themeColor}55`} strokeWidth="1" />
          
          {/* Vertical light rays */}
          <line x1="80" y1="265" x2="80" y2="150" stroke={`${themeColor}11`} strokeWidth="1" />
          <line x1="150" y1="255" x2="150" y2="80" stroke={`${themeColor}11`} strokeWidth="1" />
          <line x1="220" y1="265" x2="220" y2="150" stroke={`${themeColor}11`} strokeWidth="1" />
          
          {/* Dinosaur Outline */}
          {renderSpecimenPath()}
        </svg>
      )}
    </div>
  );
}

// ==========================================
// 6. MAIN APP COMPONENT
// ==========================================

export default function WelcomePage() {
  // State variables
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [unlockedDinoIds, setUnlockedDinoIds] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [activeDinoDetails, setActiveDinoDetails] = useState<Dinosaur | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showEraLevelUp, setShowEraLevelUp] = useState<boolean>(false);
  const [unlockedEras, setUnlockedEras] = useState<('Triassic' | 'Jurassic' | 'Cretaceous')[]>(['Triassic']);
  const [showAllComplete, setShowAllComplete] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [showVocabModal, setShowVocabModal] = useState<boolean>(false);
  const [hasReviewedVocab, setHasReviewedVocab] = useState<boolean>(false);

  // Sync Audio Mute state
  useEffect(() => {
    AudioSynth.isMuted = isMuted;
  }, [isMuted]);

  // Handle auto-unlock of first dinosaur or diagnostic trigger
  const currentQuestion = useMemo(() => QUESTIONS[currentQuestionIndex], [currentQuestionIndex]);
  const currentDino = useMemo(() => DINOSAURS[currentQuestion.dinoId], [currentQuestion]);

  // Audio trigger for keyboard-typing effects on load
  useEffect(() => {
    if (!showWelcome) {
      AudioSynth.playSelect();
    }
  }, [currentQuestionIndex, showWelcome]);

  // Handle checking answers
  const handleOptionClick = (optionIndex: number) => {
    if (selectedOptionIndex !== null) return; // Prevent double answer selection
    
    setSelectedOptionIndex(optionIndex);
    const correct = optionIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      AudioSynth.playCorrect();
      // Unlock dinosaur only when both questions in the sequence are cleared (basic question is index % 2 === 1)
      if (currentQuestionIndex % 2 === 1) {
        if (!unlockedDinoIds.includes(currentQuestion.dinoId)) {
          setUnlockedDinoIds(prev => [...prev, currentQuestion.dinoId]);
        }
      }
      setAttempts(0);
    } else {
      AudioSynth.playIncorrect();
      setAttempts(prev => prev + 1);
    }
  };

  // Next Question handling with Era advancement checks
  const handleNextQuestion = () => {
    // Reset status for next question
    setIsCorrect(null);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setHasReviewedVocab(false);

    const nextIndex = currentQuestionIndex + 1;

    // Check if we reached end of all questions
    if (nextIndex >= QUESTIONS.length) {
      AudioSynth.playLevelUp();
      setShowAllComplete(true);
      return;
    }

    // Check if we are transitioning Eras
    const nextQuestion = QUESTIONS[nextIndex];
    if (nextQuestion.era !== currentQuestion.era) {
      // Unlocked next era
      if (!unlockedEras.includes(nextQuestion.era)) {
        setUnlockedEras(prev => [...prev, nextQuestion.era]);
        setShowEraLevelUp(true);
        AudioSynth.playLevelUp();
      }
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const closeLevelUpModal = () => {
    setShowEraLevelUp(false);
    AudioSynth.playSelect();
  };

  const handleResetGame = () => {
    setCurrentQuestionIndex(0);
    setUnlockedDinoIds([]);
    setIsCorrect(null);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    setActiveDinoDetails(null);
    setUnlockedEras(['Triassic']);
    setShowAllComplete(false);
    setAttempts(0);
    setHasReviewedVocab(false);
    setShowVocabModal(false);
    AudioSynth.playLevelUp();
  };

  // Diagnostic Stats helpers
  const progressPercent = Math.round((unlockedDinoIds.length / 50) * 100);

 if (showWelcome) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020924] text-slate-100 font-mono">
        <div className="border border-emerald-500/30 p-8 rounded bg-[#0a0f1d] text-center max-w-md mx-4 shadow-2xl">
          <h1 className="text-2xl font-bold text-emerald-400 mb-2 tracking-wider">DINOSAUR EXPERT</h1>
          <p className="text-xs text-slate-400 mb-6">RESEARCH PROTOCOL v3.9</p>
          <button 
            onClick={() => setShowWelcome(false)} 
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-[#020924] font-bold rounded transition-colors text-sm tracking-widest"
          >
            ENTER SYSTEM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 font-sans relative crt-scanlines flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* CRT Overlay flicker */}
      <div className="absolute inset-0 bg-[#06090e]/10 pointer-events-none z-50 crt-flicker" />

      {/* MAIN SCREEN GRID CONTAINER */}
      <header className="border-b border-emerald-950 bg-[#0a0f18] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/60 rounded border border-emerald-500/30 animate-pulse">
            <Compass className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold tracking-widest text-emerald-400 flex items-center gap-1">
              DINOSAUR EXPERT RESEARCH PROTOCOL <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20">v3.9</span>
            </h1>
            <p className="text-xs text-slate-400">
              <ruby>古生物探査英語システム<rt>こせいぶつたんさえいごしすてむ</rt></ruby> — EXPERT METHODOLOGY
            </p>
          </div>
        </div>

        {/* Dinosaur Jump Select Dropdown (Index) */}
        <div className="flex items-center gap-2 bg-[#06090e] border border-emerald-500/30 rounded-lg px-3 py-1.5 shadow-inner w-full sm:w-auto">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col flex-1 sm:flex-initial">
            <span className="text-[9px] font-mono text-emerald-500/80 uppercase">SPECIES INDEX / <ruby>図鑑目次<rt>ずかんもくじ</rt></ruby></span>
            <select
              value={Math.floor(currentQuestionIndex / 2)}
              onChange={(e) => {
                const targetDinoIdx = parseInt(e.target.value, 10);
                if (!isNaN(targetDinoIdx)) {
                  setCurrentQuestionIndex(targetDinoIdx * 2);
                  setIsCorrect(null);
                  setSelectedOptionIndex(null);
                  setShowExplanation(false);
                  setAttempts(0);
                  AudioSynth.playSelect();
                }
              }}
              className="bg-[#0a0f18] text-emerald-300 font-mono text-xs sm:text-sm font-bold border border-emerald-500/40 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer w-full sm:w-80 md:w-96 min-w-[280px] sm:min-w-[340px]"
              id="dino-index-select"
            >
              {DINO_CHALLENGES.map((dino, idx) => (
                <option key={dino.id} value={idx}>
                  No.{idx + 1} {dino.nameEn} ({dino.nameJa})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-emerald-500/80">SYSTEM_STATUS: <span className="text-emerald-400">ONLINE</span></span>
            <span className="text-slate-500 text-[10px]">COORDINATE: 2026-07-01_UTC</span>
          </div>

          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-2 rounded border transition-all flex items-center gap-1.5 ${
              isMuted 
                ? 'border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40' 
                : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
            }`}
            title={isMuted ? "ミュート解除" : "ミュート"}
            id="audio-toggle-btn"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">{isMuted ? "MUTED" : "SOUND ON"}</span>
          </button>
        </div>
      </header>

      {/* CORE TIMELINE BAR */}
      <section className="bg-[#0b121e] border-b border-emerald-950/60 py-3.5 px-4 sm:px-6 z-20 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              GEOLOGICAL ERA TIMELINE:
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 max-w-2xl">
            {(['Triassic', 'Jurassic', 'Cretaceous'] as const).map((era, index) => {
              const isUnlocked = unlockedEras.includes(era);
              const isActive = currentQuestion.era === era;
              
              // Color parameters based on era
              const borderColor = isActive 
                ? (era === 'Triassic' ? 'border-cyan-500' : era === 'Jurassic' ? 'border-emerald-500' : 'border-amber-500')
                : 'border-slate-800';
              
              const bgStyle = isActive 
                ? (era === 'Triassic' ? 'bg-cyan-950/30' : era === 'Jurassic' ? 'bg-emerald-950/30' : 'bg-amber-950/30')
                : (isUnlocked ? 'bg-slate-900/40' : 'bg-slate-950/90 opacity-60');

              const textGlow = isActive
                ? (era === 'Triassic' ? 'text-cyan-400 text-glow-cyan' : era === 'Jurassic' ? 'text-emerald-400 text-glow-green' : 'text-amber-400 text-glow-amber')
                : (isUnlocked ? 'text-slate-300' : 'text-slate-600');

              const eraKanji = era === 'Triassic' ? '三畳紀' : era === 'Jurassic' ? 'ジュラ紀' : '白亜紀';

              return (
                <div 
                  key={era}
                  className={`relative p-2 rounded border transition-all duration-300 flex flex-col items-center text-center ${borderColor} ${bgStyle} select-none`}
                >
                  {/* Glowing active node marker */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        era === 'Triassic' ? 'bg-cyan-400' : era === 'Jurassic' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        era === 'Triassic' ? 'bg-cyan-500' : era === 'Jurassic' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] sm:text-xs font-mono font-bold tracking-wider ${textGlow}`}>
                      {era.toUpperCase()}
                    </span>
                    {!isUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                    ) : (
                      <Unlock className="w-2.5 h-2.5 text-emerald-500/60" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {eraKanji}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ==========================================
            LEFT COLUMN (HERO AREA: SCREEN & QUIZ TERMINAL)
            ========================================== */}
        <section className="lg:col-span-2 flex flex-col gap-6" id="main-terminal-area">
          
          {/* Holographic Diagnostic Viewport */}
          <div className="bg-[#090f18] rounded-xl border border-emerald-950 overflow-hidden shadow-2xl">
            <div className="border-b border-emerald-950/60 px-4 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                DINO SCANNER: SPECIMEN_{currentDino.nameEn.toUpperCase()}
              </span>
              <span className="text-slate-500">
                ERA: {currentDino.era.toUpperCase()}
              </span>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              {/* Wireframe display */}
              <div className="sm:col-span-2">
                <DinoHoloBlueprint dinoId={currentQuestion.dinoId} era={currentQuestion.era} />
              </div>
              
              {/* Telemetry data tags */}
              <div className="sm:col-span-3 flex flex-col gap-3 font-mono text-xs">
                <div className="bg-slate-950/60 rounded border border-emerald-950/50 p-3 flex flex-col gap-1.5">
                  <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                    <span className="text-slate-500">GENUS / <ruby>学名<rt>がくめい</rt></ruby></span>
                    <span className="text-emerald-400 font-bold italic">{currentDino.scientificName}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                    <span className="text-slate-500">DIET / <ruby>食性<rt>しょくせい</rt></ruby></span>
                    <span className={`font-bold ${
                      currentDino.diet === 'Carnivore' ? 'text-red-400' : currentDino.diet === 'Herbivore' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {currentDino.diet === 'Carnivore' ? 'Carnivore (肉食)' : currentDino.diet === 'Herbivore' ? 'Herbivore (草食)' : 'Piscivore (魚食/魚主食)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LENGTH / <ruby>全長<rt>ぜんちょう</rt></ruby></span>
                    <span className="text-cyan-400 font-bold">{currentDino.length}</span>
                  </div>
                </div>

                <div className="bg-emerald-950/10 rounded border border-emerald-500/10 p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    <strong>システムログ:</strong> この恐竜のデータを解読中。英語クイズに正解して、暗号化されたスペルと鳴き声コードを解除し、図鑑（コレクション）をアップグレードしてください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Interactive Quiz Terminal */}
          <div className="bg-[#090f18] rounded-xl border border-emerald-950 overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col gap-4">
            
            {/* Header / ID Info */}
            <div className="flex justify-between items-center text-xs font-mono border-b border-emerald-950/50 pb-3">
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                DECRYPTION PROTOCOL: {currentDino.nameEn.toUpperCase()} — {currentQuestionIndex % 2 === 0 ? 'PART 1: EXPERT VOCAB' : 'PART 2: BASIC VOCAB'}
              </span>
              <span className="text-slate-500">
                PROGRESS: {Math.floor(currentQuestionIndex / 2) + 1} / {Object.keys(DINOSAURS).length} (Q{currentQuestionIndex + 1}/{QUESTIONS.length})
              </span>
            </div>

            {/* Question Text with customized Ruby formatting */}
            <div className="bg-slate-950/80 rounded-lg p-4 border border-emerald-950/70 shadow-inner">
              <h3 className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed font-sans">
                {currentQuestion.japaneseSegments.map((segment, idx) => (
                  segment.ruby ? (
                    <ruby key={idx} className={
                      currentQuestion.era === 'Triassic' ? 'rt-cyan' : currentQuestion.era === 'Jurassic' ? 'rt-green' : 'rt-amber'
                    }>
                      {segment.text}
                      <rt>{segment.ruby}</rt>
                    </ruby>
                  ) : (
                    <span key={idx}>{segment.text}</span>
                  )
                ))}
              </h3>
            </div>

            {/* Hint Box (if they fail) */}
            {attempts > 0 && !isCorrect && (
              <div className="bg-amber-950/10 border border-amber-500/20 rounded p-3 text-xs flex items-start gap-2 animate-pulse text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">探索ヒント発動（たんさひんとはつどう）:</p>
                  <p className="font-sans">解き明かす言葉は 「{currentQuestion.keywordHintJa}」 だよ。もう一度よく選択肢（せんたくし）を見てみよう！</p>
                </div>
              </div>
            )}

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrectOption = index === currentQuestion.correctIndex;
                
                let btnStyle = 'border-emerald-950 bg-slate-900/60 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]';
                
                if (selectedOptionIndex !== null) {
                  if (isSelected) {
                    btnStyle = isCorrectOption 
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 glow-green' 
                      : 'border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
                  } else if (isCorrectOption && isCorrect === false) {
                    // Highlight correct answer if they failed
                    btnStyle = 'border-emerald-500/60 bg-emerald-950/20 text-emerald-400';
                  } else {
                    btnStyle = 'border-slate-950 bg-slate-950/60 text-slate-600 opacity-50 cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={selectedOptionIndex !== null}
                    className={`p-3.5 rounded-lg border text-left transition-all duration-200 font-sans flex flex-col gap-1 ${btnStyle}`}
                    id={`quiz-option-${index}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                        OPTION 0{index + 1}
                      </span>
                      {selectedOptionIndex !== null && isCorrectOption && (
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded">CORRECT</span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-bold tracking-wide font-mono text-emerald-300">
                      {option.text}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      {PRONUNCIATION_MAP[option.text] || ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quiz Result Banner & Next Actions */}
            {showExplanation && (
              <div className={`mt-4 p-4 rounded-lg border animate-fadeIn transition-all duration-500 ${
                isCorrect 
                  ? 'border-emerald-500/30 bg-emerald-950/20' 
                  : 'border-amber-500/30 bg-amber-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400 animate-bounce" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`text-sm sm:text-base font-bold font-mono uppercase tracking-wider mb-1.5 ${
                      isCorrect ? 'text-emerald-400 text-glow-green' : 'text-amber-400 text-glow-amber'
                    }`}>
                      {isCorrect ? 'DECRYPTION COMPLETE' : 'ANALYSIS IN PROGRESS...'}
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-3">
                      {isCorrect ? (
                        currentQuestionIndex % 2 === 1 ? (
                          <>
                            <strong className="text-emerald-400">{currentQuestion.keyword}</strong> の解読に成功！
                            2問連続正解したため、「<ruby>マイ図鑑<rt>まいずかん</rt></ruby>」に <strong className="text-emerald-400 italic">{currentDino.nameJa} ({currentDino.scientificName})</strong> の高画質データカードがアンロックされました！
                          </>
                        ) : (
                          <>
                            第1問クリア！ <strong className="text-emerald-400">{currentQuestion.keyword}</strong> の暗号化に成功しました。
                            続いて、第2問の【基礎英語】に挑戦して図鑑カードをアンロックしよう！
                          </>
                        )
                      ) : (
                        currentQuestionIndex % 2 === 1 ? (
                          <>
                            残念！2問連続正解ならず。研究プロトコルにより、この恐竜の<strong>第1問（専門語彙）からやり直し</strong>になります。
                          </>
                        ) : (
                          <>
                            「新たな謎が深まった（あらたななぞがふかまった）！」 もう一度よく考えてみよう。
                          </>
                        )
                      )}
                    </p>

                    <div className="bg-slate-950/60 rounded p-3 border border-emerald-950/40 text-xs sm:text-sm flex flex-col gap-2 font-sans mb-3.5">
                      <p className="text-slate-300 leading-relaxed">
                        💡 <strong>解説（かいせつ）:</strong> {currentQuestion.explanationJa}
                      </p>
                      <p className="text-slate-400 italic font-mono text-[11px] border-t border-emerald-950/30 pt-1.5">
                        {currentQuestion.explanationEn}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      {isCorrect ? (
                        currentQuestionIndex % 2 === 1 && !hasReviewedVocab ? (
                          <button
                            onClick={() => {
                              AudioSynth.playSelect();
                              setShowVocabModal(true);
                            }}
                            className="px-5 py-2.5 rounded border border-cyan-500 bg-cyan-950/60 hover:bg-cyan-500 hover:text-black font-bold text-xs font-mono tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-pulse"
                            id="review-vocab-btn"
                          >
                            <BookOpen className="w-4 h-4" />
                            Review Vocabulary / 単語の意味を確認
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleNextQuestion();
                              setHasReviewedVocab(false);
                            }}
                            className="px-5 py-2 rounded border border-emerald-500 bg-emerald-950/60 hover:bg-emerald-500 hover:text-black font-bold text-xs font-mono tracking-widest flex items-center gap-1.5 transition-all"
                            id="next-btn"
                          >
                            {currentQuestionIndex + 1 === QUESTIONS.length 
                              ? 'FINALIZE DECRYPTION' 
                              : (currentQuestionIndex % 2 === 0 ? 'CONTINUE TO PART 2' : 'Next Protocol (Dinosaur Specimen Vaultへ)')}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            if (currentQuestionIndex % 2 === 1) {
                              setCurrentQuestionIndex(currentQuestionIndex - 1);
                            }
                            setIsCorrect(null);
                            setSelectedOptionIndex(null);
                            setShowExplanation(false);
                            AudioSynth.playSelect();
                          }}
                          className="px-5 py-2 rounded border border-amber-500 bg-amber-950/60 hover:bg-amber-500 hover:text-black font-bold text-xs font-mono tracking-widest flex items-center gap-1.5 transition-all"
                          id="retry-btn"
                        >
                          {currentQuestionIndex % 2 === 1 ? 'RESTART FROM PART 1' : 'RE-ATTEMPT RESEARCH'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </section>

        {/* ==========================================
            RIGHT COLUMN (SIDEBAR: ERA INFO & STATISTICS)
            ========================================== */}
        <aside className="flex flex-col gap-6 lg:col-span-1" id="sidebar-panel">
          
          {/* Unlocked Geological Database */}
          <div className="bg-[#090f18] rounded-xl border border-emerald-950 overflow-hidden shadow-2xl">
            <div className="border-b border-emerald-950/60 px-4 py-2 bg-slate-900/40 flex items-center gap-1.5 text-xs font-mono text-amber-500">
              <Calendar className="w-4 h-4" />
              <span>GEOLOGICAL ERA MANUAL</span>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <p className="text-[11px] text-slate-400 font-sans">
                クイズに正解して時代を進むと、その時代の地球環境のデータがアンロックされます。
              </p>

              <div className="flex flex-col gap-3">
                {(['Triassic', 'Jurassic', 'Cretaceous'] as const).map((eraName) => {
                  const isUnlocked = unlockedEras.includes(eraName);
                  const data = ERA_DATA[eraName];
                  
                  return (
                    <div 
                      key={eraName}
                      className={`p-3 rounded border transition-all duration-300 ${
                        isUnlocked 
                          ? 'border-slate-800 bg-slate-900/30' 
                          : 'border-slate-950 bg-slate-950/80 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-mono font-bold text-slate-200">
                          {data.titleEn} ( {data.titleJa} )
                        </h4>
                        {!isUnlocked ? (
                          <span className="text-[9px] font-mono text-red-400 bg-red-950/30 border border-red-500/20 px-1 py-0.5 rounded">LOCKED</span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-1 py-0.5 rounded">DECRYPTED</span>
                        )}
                      </div>
                      
                      {isUnlocked ? (
                        <div className="flex flex-col gap-1.5 font-sans">
                          <span className="text-[10px] text-emerald-500/80 font-mono">{data.span}</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-0.5">
                            {data.descJa}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-800/40 pt-1 mt-1 font-mono">
                            {data.descEn}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 py-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-xs font-mono">ENCRYPTED_ARCHIVE_DATA</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Research Telemetry Dashboard */}
          <div className="bg-[#090f18] rounded-xl border border-emerald-950 overflow-hidden shadow-2xl p-4 flex flex-col gap-3.5">
            <div className="border-b border-emerald-950/60 pb-2 flex items-center gap-1.5 text-xs font-mono text-cyan-400">
              <Award className="w-4 h-4" />
              <span>RESEARCH DIAGNOSTICS</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-950/60 border border-emerald-950/40 p-2.5 rounded flex flex-col gap-0.5 text-center">
                <span className="text-[10px] text-slate-500">DECRYPTED_CARDS</span>
                <span className="text-lg font-bold text-emerald-400">{unlockedDinoIds.length} / 50</span>
              </div>
              <div className="bg-slate-950/60 border border-emerald-950/40 p-2.5 rounded flex flex-col gap-0.5 text-center">
                <span className="text-[10px] text-slate-500">DECRYPT_RATE</span>
                <span className="text-lg font-bold text-cyan-400">{progressPercent}%</span>
              </div>
            </div>

            {/* Unlocked Vocabulary Words List */}
            <div className="border-t border-emerald-950/50 pt-3">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider block mb-2 uppercase">
                DECRYPTED DICTIONARY / <ruby>解除された単語<rt>かいじょされたたんご</rt></ruby>
              </span>
              
              {unlockedDinoIds.length === 0 ? (
                <div className="bg-slate-950/40 rounded p-4 text-center border border-dashed border-emerald-950/50 text-xs text-slate-500 font-mono">
                  NO_KEYWORDS_DECRYPTED
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {unlockedDinoIds.map((id) => {
                    const q = QUESTIONS.find(qi => qi.dinoId === id);
                    if (!q) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          AudioSynth.playSelect();
                          // Find dinosaur matching id and show details
                          setActiveDinoDetails(DINOSAURS[id]);
                        }}
                        className="px-2 py-1 text-[11px] font-mono font-bold rounded border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1 transition-all"
                        id={`vocab-${id}`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {q.keyword}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </aside>
      </main>

      {/* ==========================================
          BOTTOM ROW (MY SPECIMEN ENCYCLOPEDIA SHELF)
          ========================================== */}
      <section className="bg-[#080d15] border-t border-emerald-950 py-5 px-4 sm:px-6 z-20 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/40 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-mono font-bold tracking-widest text-emerald-400 flex items-center gap-1.5 uppercase">
                Dinosaur Specimen Vault <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">マイ図鑑</span>
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-sans">
              クイズに正解して、全50種の古生物データカードをコレクションしよう！
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {Object.keys(DINOSAURS).map((key, index) => {
              const dino = DINOSAURS[key];
              const isUnlocked = unlockedDinoIds.includes(key);
              
              // Color settings depending on geological era
              const eraColor = dino.era === 'Triassic' ? 'cyan' : dino.era === 'Jurassic' ? 'emerald' : 'amber';
              
              const borderClass = isUnlocked
                ? (eraColor === 'cyan' ? 'border-cyan-500 bg-cyan-950/10 hover:bg-cyan-950/20' : eraColor === 'emerald' ? 'border-emerald-500 bg-emerald-950/10 hover:bg-emerald-950/20' : 'border-amber-500 bg-amber-950/10 hover:bg-amber-950/20')
                : 'border-slate-900 bg-slate-950/40 opacity-70';

              const badgeColor = eraColor === 'cyan' ? 'text-cyan-400 bg-cyan-950/50' : eraColor === 'emerald' ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50';

              return (
                <div
                  key={key}
                  onClick={() => {
                    if (isUnlocked) {
                      AudioSynth.playSelect();
                      setActiveDinoDetails(dino);
                    } else {
                      AudioSynth.playBeep(200, 0.1, 'sawtooth'); // Lock error feedback
                    }
                  }}
                  className={`border rounded-lg p-3 transition-all duration-300 flex flex-col items-center justify-between text-center select-none ${borderClass} ${
                    isUnlocked ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'
                  }`}
                  style={{ boxShadow: isUnlocked ? `0 0 10px rgba(${eraColor === 'cyan' ? '6,182,212' : eraColor === 'emerald' ? '16,185,129' : '245,158,11'},0.1)` : 'none' }}
                  id={`shelf-card-${key}`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[9px] font-mono text-slate-500">SPECIMEN_0{index + 1}</span>
                    {isUnlocked ? (
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded font-bold uppercase tracking-wider ${badgeColor}`}>
                        {dino.era}
                      </span>
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-slate-700" />
                    )}
                  </div>

                  {/* Wireframe Silhouette thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1 bg-slate-950/50 rounded border border-slate-900/30 overflow-hidden relative">
                    {isUnlocked ? (
                      <div className="scale-125">
                        <DinoHoloBlueprint dinoId={key} era={dino.era} />
                      </div>
                    ) : (
                      <div className="text-slate-800 font-mono text-lg font-bold">???</div>
                    )}
                  </div>

                  <div className="mt-2 w-full">
                    {isUnlocked ? (
                      <>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate tracking-wide font-sans">
                          {dino.nameJa}
                        </h4>
                        <p className="text-[9px] font-mono text-slate-400 truncate tracking-tight uppercase">
                          {dino.nameEn}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-700 font-sans">???</h4>
                        <p className="text-[9px] font-mono text-slate-800">ENCRYPTED</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-950/60 bg-[#060a10] py-4 text-center text-xs font-mono text-slate-500 mt-auto select-none">
        <p className="tracking-widest uppercase text-[10px]">
          PALEONTOLOGY ENGLISH LAB SYSTEM — DEV_CONTRAL_PANNELS_EST_2026
        </p>
      </footer>

      {/* ==========================================
          7. MODAL: DETAILED HOLOGRAPHIC DINO CARD
          ========================================== */}
      {activeDinoDetails && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fadeIn" id="specimen-card-modal">
          <div 
            className={`bg-[#0a111c] border rounded-xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col ${
              activeDinoDetails.era === 'Triassic' ? 'border-cyan-500/40 glow-cyan' : activeDinoDetails.era === 'Jurassic' ? 'border-emerald-500/40 glow-green' : 'border-amber-500/40 glow-amber'
            }`}
          >
            {/* Header */}
            <div className="border-b border-slate-800/80 px-4 py-3 bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                HOLOGRAPHIC DATA CARD UNLOCKED
              </span>
              <button 
                onClick={() => {
                  AudioSynth.playSelect();
                  setActiveDinoDetails(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-sm border border-slate-800 bg-slate-900/60 px-2 py-0.5 rounded hover:bg-slate-800"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
              
              {/* Giant holographic model visualization */}
              <div className="h-44 sm:h-52 rounded-lg bg-slate-950 relative overflow-hidden">
                <DinoHoloBlueprint dinoId={activeDinoDetails.id} era={activeDinoDetails.era} />
              </div>

              {/* Names and pronunciation guides */}
              <div className="border-b border-slate-800/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-slate-100 flex items-center gap-2">
                    {activeDinoDetails.nameJa}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                    ERA: {activeDinoDetails.era}
                  </span>
                </div>
                
                <p className="text-sm font-mono text-slate-400 italic font-medium mt-1">
                  {activeDinoDetails.scientificName}
                </p>

                {/* Pronunciation guide box */}
                <div className="mt-3.5 bg-slate-950 border border-slate-800 p-3 rounded flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider">PRONUNCIATION / <ruby>発音のヒント<rt>はつおんのひんと</rt></ruby></span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-cyan-400">{activeDinoDetails.phonetic}</span>
                      <span className="text-xs font-sans text-emerald-400">({activeDinoDetails.phoneticKatakana})</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        AudioSynth.speakScientificName(activeDinoDetails.scientificName);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-950/20 rounded hover:bg-cyan-500 hover:text-black transition-all"
                      id="pronounce-btn"
                    >
                      🔊 Pronounce
                    </button>
                    <button 
                      onClick={() => {
                        AudioSynth.playDinoRoar(activeDinoDetails.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-amber-400 border border-amber-500/30 bg-amber-950/20 rounded hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      id="roar-btn"
                    >
                      🦖 Roar
                    </button>
                  </div>
                </div>
              </div>

              {/* Specifications checklist */}
              <div className="grid grid-cols-2 gap-3.5 font-mono text-xs">
                <div className="bg-slate-950/60 rounded border border-slate-800 p-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Meaning / <ruby>名前の意味<rt>なまえのいみ</rt></ruby></span>
                  <span className="text-slate-100 font-bold">{activeDinoDetails.meaning}</span>
                </div>
                <div className="bg-slate-950/60 rounded border border-slate-800 p-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Length / <ruby>全長<rt>ぜんちょう</rt></ruby></span>
                  <span className="text-slate-100 font-bold">{activeDinoDetails.length}</span>
                </div>
              </div>

              {/* Trivia description sections */}
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-emerald-950/10 border border-emerald-500/15 rounded-lg flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase block">
                    RESEARCH NOTES / <ruby>調査報告（日本語）<rt>ちょうさほうこく</rt></ruby>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mt-0.5">
                    {activeDinoDetails.triviaJa}
                  </p>
                </div>

                {/* Species Name & Details (SF Holographic Style) */}
                <div className="p-3 bg-cyan-950/15 border border-cyan-500/25 rounded-lg flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 font-mono text-[9px] border-b border-l border-cyan-500/30 rounded-bl">
                    SPECIES TAXONOMY
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                      種小名 (Species):
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-cyan-200 italic">
                      {activeDinoDetails.speciesName}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 font-sans">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      名前の由来・意味:
                    </span>
                    <p className="text-xs text-slate-200">
                      {activeDinoDetails.speciesMeaning}
                    </p>
                  </div>
                  <div className="mt-1 pt-1.5 border-t border-cyan-950/50 flex items-center gap-1.5 text-xs text-amber-300 font-sans">
                    <span>{activeDinoDetails.speciesNote}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal actions footer */}
            <div className="border-t border-slate-800/80 p-4 bg-slate-900/40 flex justify-end">
              <button 
                onClick={() => {
                  AudioSynth.playSelect();
                  setActiveDinoDetails(null);
                }}
                className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 hover:text-white font-mono font-bold text-xs tracking-widest transition-all"
              >
                TERMINAL_DISCONNECT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: VOCABULARY REVIEW (PLAN B)
          ========================================== */}
      {showVocabModal && (() => {
        const currentChallenge = DINO_CHALLENGES.find(c => c.id === currentQuestion.dinoId);
        if (!currentChallenge) return null;
        
        const allWords = [
          ...currentChallenge.vocabQuestion.options,
          ...currentChallenge.basicQuestion.options
        ];

        return (
          <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fadeIn" id="vocab-review-modal">
            <div className={`bg-[#0a111c] border rounded-xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col ${
              currentChallenge.era === 'Triassic' ? 'border-cyan-500/40 glow-cyan' : currentChallenge.era === 'Jurassic' ? 'border-emerald-500/40 glow-green' : 'border-amber-500/40 glow-amber'
            }`}>
              <div className="border-b border-slate-800/80 px-4 py-3 bg-slate-900/50 flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  VOCABULARY REVIEW / 語彙復習 — {currentChallenge.nameJa} ({currentChallenge.nameEn})
                </span>
                <button 
                  onClick={() => {
                    AudioSynth.playSelect();
                    setShowVocabModal(false);
                    setHasReviewedVocab(true);
                  }}
                  className="text-slate-400 hover:text-white font-mono text-sm border border-slate-800 bg-slate-900/60 px-2 py-0.5 rounded hover:bg-slate-800"
                >
                  CLOSE [X]
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-3 text-xs text-slate-300 font-sans">
                  💡 <strong>T君の自学自習サポート:</strong> この恐竜の第1問・第2問に登場した全8個の英単語です。英単語をクリック（またはタップ）すると、ブラウザのネイティブ音声（en-US）で発音が流れます！
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allWords.map((wordObj, idx) => {
                    const isKeywordVocab = wordObj.text === currentChallenge.vocabQuestion.keyword;
                    const isKeywordBasic = wordObj.text === currentChallenge.basicQuestion.keyword;
                    const isKeyword = isKeywordVocab || isKeywordBasic;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          AudioSynth.playSelect();
                          AudioSynth.speakWord(wordObj.text);
                        }}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1 group hover:scale-[1.02] active:scale-[0.98] ${
                          isKeyword 
                            ? 'border-emerald-500/60 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                            : 'border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 hover:bg-slate-900/80'
                        }`}
                        id={`vocab-item-${idx}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {idx < 4 ? 'PART 1: EXPERT' : 'PART 2: BASIC'} {isKeyword && '★ KEYWORD'}
                          </span>
                          <span className="text-cyan-400 group-hover:scale-110 transition-transform">🔊</span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base font-mono font-bold text-emerald-300 tracking-wide">
                            {wordObj.text}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {PRONUNCIATION_MAP[wordObj.text] || ''}
                          </span>
                        </div>

                        <span className="text-xs text-slate-200 font-sans font-medium border-t border-slate-900 pt-1">
                          {wordObj.translation}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-800/80 p-4 bg-slate-900/40 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  タップしてネイティブ発音を確認しよう
                </span>
                <button
                  onClick={() => {
                    AudioSynth.playSelect();
                    setShowVocabModal(false);
                    setHasReviewedVocab(true);
                  }}
                  className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs tracking-widest transition-all shadow-md flex items-center gap-1.5"
                  id="vocab-done-btn"
                >
                  確認完了（次へ進む）
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==========================================
          8. MODAL: ERA LEVEL UP / TRAVEL ANNOUNCEMENT
          ========================================== */}
      {showEraLevelUp && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-50 animate-fadeIn" id="era-levelup-modal">
          <div className="bg-[#0b1424] border-2 border-emerald-500/60 glow-green rounded-xl max-w-md w-full p-6 text-center flex flex-col items-center gap-4 relative crt-scanlines">
            <div className="absolute inset-0 terminal-grid opacity-30 pointer-events-none" />
            
            <div className="p-3 bg-emerald-950/60 rounded-full border border-emerald-500 animate-pulse">
              <Compass className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                GEOLOGICAL TIME STREAM SHIFTED
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 text-glow-green font-mono uppercase tracking-widest">
                NEW ERA UNLOCKED!
              </h3>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/20 rounded p-4 w-full font-sans flex flex-col gap-2">
              <p className="text-sm text-slate-200 font-bold">
                おめでとう！<ruby>三畳紀<rt>さんじょうき</rt></ruby> の暗号をすべて解き明かしました。
              </p>
              <p className="text-xs text-slate-300 leading-relaxed text-left">
                探査端末はさらに先の【 ジュラ紀（Jurassic Period）】および【 白亜紀（Cretaceous Period）】へとタイムスリップします！
                さらなる超巨大な捕食者（Predator）や化石（Fossil）の謎が待ち受けています。
              </p>
            </div>

            <button 
              onClick={closeLevelUpModal}
              className="mt-2 w-full py-2.5 rounded bg-emerald-500 text-black font-mono font-bold text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-md"
              id="era-modal-btn"
            >
              INITIALIZE_NEXT_DEC_RUN
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          9. MODAL: FULL COMPLETION / MASTER STATUS
          ========================================== */}
      {showAllComplete && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-50 animate-fadeIn" id="all-complete-modal">
          <div className="bg-[#0f1910] border-2 border-emerald-400 glow-green rounded-xl max-w-lg w-full p-6 sm:p-8 text-center flex flex-col items-center gap-5 relative crt-scanlines">
            <div className="absolute inset-0 terminal-grid opacity-30 pointer-events-none" />
            
            {/* Triumphant Golden Trophy */}
            <div className="p-4 bg-emerald-950/80 rounded-full border border-emerald-400 animate-bounce">
              <Award className="w-12 h-12 text-yellow-400" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase font-bold">
                ELITE DECRYPTOR PROTOCOL COMPLETE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 text-glow-amber font-sans tracking-wide">
                古生物探査マスター
              </h3>
              <p className="text-xs font-mono text-slate-400">
                PALEONTOLOGY ENGLISH SCHOLAR STATUS: ELITE
              </p>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-lg p-5 w-full text-left font-sans flex flex-col gap-3">
              <p className="text-sm text-slate-200 font-bold text-center">
                🎉 すばらしい探査力です、T君！🎉
              </p>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                三畳紀・ジュラ紀・白亜紀という３つの地球古代史を巡り、恐竜たちの生きるための道具
                （Fossil / Horn / Claw / Predator / Armor などの重要英単語）の謎をすべて完全に解読（デクリプト）しました！
              </p>
              
              <div className="border-t border-emerald-950/80 pt-3 flex flex-col gap-1.5 text-xs text-emerald-400 font-mono">
                <div className="flex justify-between">
                  <span>UNLOCKED SPECIMENS:</span>
                  <span>10 / 10 CARDS</span>
                </div>
                <div className="flex justify-between">
                  <span>VOCABULARY DECRYPTED:</span>
                  <span>10 WORDS</span>
                </div>
                <div className="flex justify-between">
                  <span>MASTER LICENSE:</span>
                  <span className="text-yellow-400 font-bold">ISSUED (ACTIVE)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button 
                onClick={handleResetGame}
                className="flex-1 py-3 rounded bg-emerald-500 text-black font-mono font-bold text-xs tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                id="reset-game-btn"
              >
                <RefreshCw className="w-4 h-4" />
                RESTART SYSTEM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
