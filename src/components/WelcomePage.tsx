import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, Volume2, ShieldAlert, ChevronRight, Compass } from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

interface SubtitleLine {
  start: number;
  end: number;
  en: string;
  ja: string;
}

const SUBTITLES: SubtitleLine[] = [
 { start: 0.0, end: 3.5, en: "Welcome... to the Dino World.", ja: "ディノ・ワールドへ、ようこそ。" },
  { start: 3.5, end: 5.5, en: "From 230 to 66 million years ago,", ja: "2億3000万年前から6600万年前まで、" },
  { start: 5.5, end: 7.5, en: "they ruled the Earth.", ja: "彼らは地球の支配者だった。" },
  { start: 7.5, end: 10.0, en: "Now, the gates are open.", ja: "今、その扉が開く。" },
  { start: 10.0, end: 13.0, en: "Are you ready to face the giants?", ja: "巨獣（きょじゅう）たちに立ち向かう準備はいいか？" },
  { start: 13.0, end: 16.5, en: "Your ultimate adventure begins now!", ja: "究極（きゅうきょく）の冒険が、ここから始まる" }
];

const POPULAR_DINOS = [
  { 
    id: 't-rex', 
    nameEn: 'Tyrannosaurus', 
    nameJa: 'ティラノサウルス', 
    role: 'APEX PREDATOR', 
    icon: '🦖', 
    fallbackImg: 'https://github.com/mrgreen7491/dinosaur-expert-protocol/blob/main/public/images/tyrannosaurus.png?raw=true',
    description: "白亜紀後期の北米に生息した、史上最大級の肉食恐竜。強力な顎と鋭い歯で獲物を圧倒した。"
  },
  { 
    id: 'triceratops', 
    nameEn: 'Triceratops', 
    nameJa: 'トリケラトプス', 
    role: 'HORNED TITAN', 
    icon: '🛡️', 
    fallbackImg: 'https://github.com/mrgreen7491/dinosaur-expert-protocol/blob/main/public/images/triceratops.png?raw=true',
    description: "3本の角と大きなフリルが特徴の草食恐竜。群れで生活し、植物を食べていたとされる温厚な恐竜。"
  },
  { 
    id: 'brachiosaurus', 
    nameEn: 'Brachiosaurus', 
    nameJa: 'ブラキオサウルス', 
    role: 'LONG-NECK GIANTS', 
    icon: '🦕', 
    fallbackImg: 'https://github.com/mrgreen7491/dinosaur-expert-protocol/blob/main/public/images/brachiosaurus.png?raw=true',
    description: "長い首と巨大な体を持つ草食恐竜。高い木々の葉を食べるのに適した体構造をしていた。"
  },
  { 
    id: 'stegosaurus', 
    nameEn: 'Stegosaurus', 
    nameJa: 'ステゴサウルス', 
    role: 'SPIKED ARMOR', 
    icon: '🛡️', 
    fallbackImg: 'https://github.com/mrgreen7491/dinosaur-expert-protocol/blob/main/public/images/stegosaurus.png?raw=true',
    description: "背中に並んだ板状の骨と、尾のスパイクが特徴。身を守るためにそれらを進化させたとされる。"
  },
  { 
    id: 'velociraptor', 
    nameEn: 'Velociraptor', 
    nameJa: 'ヴェロキラプトル', 
    role: 'SWIFT HUNTER', 
    icon: '⚡', 
    fallbackImg: 'https://github.com/mrgreen7491/dinosaur-expert-protocol/blob/main/public/images/velociraptor.png?raw=true',
    description: "小型だが非常に知能が高く、群れで狩りをしたとされる肉食恐竜。敏捷性に優れていた。"
  },
];

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const [isPlayingCinematic, setIsPlayingCinematic] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedDino, setSelectedDino] = useState<typeof POPULAR_DINOS[0] | null>(null);

  const roarAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const spokenIndexRef = useRef<number>(-1);

  // Speech synthesis when modal opens
  useEffect(() => {
    if (selectedDino) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(selectedDino.nameEn);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.log('Modal speech synthesis error:', e);
      }
    }
  }, [selectedDino]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (timerRef.current) clearInterval(timerRef.current);
      } catch (e) {}
    };
  }, []);

  const handleStartCinematic = () => {
    setIsPlayingCinematic(true);
    startTimeRef.current = Date.now();
    spokenIndexRef.current = -1;

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    try {
      if (roarAudioRef.current) {
        roarAudioRef.current.currentTime = 0;
        roarAudioRef.current.volume = 0.25;
        roarAudioRef.current.play().catch((err) => {
          console.log('Audio play error / autoplay restriction:', err);
        });
      }
    } catch (e) {
      console.log('Audio playback caught:', e);
    }

    const interval = 50;
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      const subIdx = SUBTITLES.findIndex(sub => elapsed >= sub.start && elapsed < sub.end);
      if (subIdx !== -1 && subIdx !== spokenIndexRef.current) {
        spokenIndexRef.current = subIdx;
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(SUBTITLES[subIdx].en);
            utterance.lang = 'en-US';
            utterance.rate = 0.95;
            utterance.pitch = 0.95;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        } catch (e) {
          console.log('Speech synthesis note:', e);
        }
      }

      if (elapsed >= 16.5) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTriggerExit();
      }
    }, interval);
  };

  const handleTriggerExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFadingOut(true);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (roarAudioRef.current) roarAudioRef.current.pause();
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
    } catch (e) {}

    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const activeSub = SUBTITLES.find(sub => currentTime >= sub.start && currentTime < sub.end);

  if (hasError) {
    return (
      <div className="fixed inset-0 bg-[#021008] text-white flex flex-col items-center justify-center p-6 gap-4">
        <h2 className="text-xl font-bold font-mono text-emerald-400">Dino World System Ready</h2>
        <button 
          onClick={onEnter}
          className="px-6 py-3 bg-emerald-600 rounded-lg font-mono font-bold hover:bg-emerald-500 cursor-pointer text-slate-950"
        >
          START APP DIRECTLY
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-[#021008] text-slate-100 flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden select-none transition-opacity duration-600 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Hidden Audio Elements */}
      <audio 
        ref={roarAudioRef} 
        src={`${(import.meta as any).env.BASE_URL}sounds/roar.mp3?v=2`} 
        preload="auto" 
        onError={(e) => console.log('roar.mp3 load error:', e)}
      />
      <audio 
        ref={voiceAudioRef} 
        src="/audio/welcome-voice.mp3" 
        preload="auto" 
        onError={() => console.log('welcome-voice.mp3 missing')}
      />

      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#011409] via-[#042413] to-[#010804] opacity-95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none animate-pulse" />

      {/* Top Bar with SKIP Button */}
      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase font-bold">
            PALEONTOLOGY DECRYPT SYSTEM v4.5 // SECURE PRE-BOOT
          </span>
        </div>

        {isPlayingCinematic && (
          <button
            onClick={handleTriggerExit}
            className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs tracking-wider hover:bg-emerald-950 hover:text-white transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
            id="cinematic-skip-btn"
          >
            <span>SKIP INTRO</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center my-auto text-center py-8">
        
        {!isPlayingCinematic ? (
          // Pre-Start Hero View
          <div className="flex flex-col items-center gap-6 animate-fadeIn max-w-3xl my-auto">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs tracking-widest shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>50 PREHISTORIC CREATURES ARCHIVE LOADED</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                DINO <span className="text-emerald-400">WORLD</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-sans max-w-xl mx-auto leading-relaxed">
                2億3000万年前から6600万年前まで、地球を支配した恐竜たち。その知られざる秘密が今、解き明かされる。究極の英語＆恐竜・爬虫類アドベンチャーへようこそ。
              </p>
            </div>

            {/* Staggered Dinosaur Preview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full my-2">
              {POPULAR_DINOS.map((dino, idx) => (
                <div 
                  key={dino.id}
                  onClick={() => setSelectedDino(dino)}
                  className="group relative bg-slate-900/90 border border-emerald-500/30 rounded-xl overflow-hidden shadow-xl p-3 flex flex-col items-center gap-2 transition-all duration-300 hover:border-emerald-400 hover:scale-105 cursor-pointer"
                  style={{ animation: `fadeInUp 0.8s ease-out ${idx * 0.15}s both` }}
                  id={`popular-dino-card-${dino.id}`}
                >
                  <div className="w-full h-24 rounded bg-slate-950 overflow-hidden relative border border-emerald-500/20 flex items-center justify-center">
                    <img 
                      src={dino.fallbackImg} 
                      alt={dino.nameJa} 
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-slate-200">{dino.nameJa}</span>
                    <span className="text-[10px] font-mono text-slate-400">{dino.nameEn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pulsing Cinematic Start Button */}
            <div className="mt-2">
              <button
                onClick={handleStartCinematic}
                className="group relative px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 font-mono font-black text-sm sm:text-base tracking-widest shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] hover:scale-105 transition-all flex items-center gap-3 cursor-pointer overflow-hidden"
                id="enter-dino-world-btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                <Play className="w-5 h-5 fill-slate-950 text-slate-950 animate-pulse" />
                <span>ENTER THE DINO WORLD</span>
                <span className="text-xs px-2 py-0.5 rounded bg-black/20 text-emerald-950 font-bold ml-1">シネマ演出</span>
              </button>
            </div>

          </div>
        ) : (
          // Active Cinematic Trailer & Subtitles View
          <div className="relative w-full max-w-4xl h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-950/90 border border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
            
           {/* Cinematic Background Creature Montage */}
           <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none flex items-center justify-center">
             <img 
               src={POPULAR_DINOS[Math.floor(currentTime / 3.3) % POPULAR_DINOS.length].fallbackImg}
               alt="Cinematic Dino"
               className="w-[512px] h-[512px] object-contain animate-pulse"
               referrerPolicy="no-referrer"
             />
           </div>

            {/* Glowing Center Badge */}
            <div className="relative z-10 flex flex-col items-center gap-6 my-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-950/90 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse">
                <Volume2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
                  CINEMATIC PRE-RENDER IN PROGRESS [{currentTime.toFixed(1)}s / 16.5s]
                </span>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{ width: `${Math.min(100, (currentTime / 16.5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtitles Overlay at Bottom */}
            <div className="absolute bottom-8 left-0 right-0 px-6 z-20 flex flex-col items-center gap-2">
              {activeSub ? (
                <div className="bg-black/90 border border-emerald-500/60 rounded-xl px-6 py-4 shadow-2xl backdrop-blur-md max-w-2xl w-full flex flex-col gap-1.5 animate-fadeIn">
                  <p className="text-base sm:text-lg font-mono font-bold text-emerald-300 tracking-wide">
                    {activeSub.en}
                  </p>
                  <p className="text-xs sm:text-sm font-sans font-medium text-slate-200">
                    {activeSub.ja}
                  </p>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-500 tracking-widest">
                  ... (LOADING SEQUENCE) ...
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Dinosaur Detail Modal Popup */}
      {selectedDino && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedDino(null)}
          id="dino-detail-modal-overlay"
        >
          <div 
            className="bg-[#09141f] border border-emerald-500/60 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col gap-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
            id="dino-detail-modal-content"
          >
            <div className="flex items-center justify-between border-b border-emerald-950/85 pb-3">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                SPECIMEN ARCHIVE // {selectedDino.id.toUpperCase()}
              </span>
              <button 
                onClick={() => setSelectedDino(null)}
                className="text-slate-400 hover:text-white font-mono text-xs px-2.5 py-1 rounded border border-slate-800 bg-slate-900 cursor-pointer"
                id="modal-close-btn"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20">
              <div className="w-24 h-24 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center border border-emerald-500/30 shrink-0">
                <img 
                  src={selectedDino.fallbackImg} 
                  alt={selectedDino.nameJa} 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 w-max">
                  {selectedDino.role}
                </span>
                <h3 className="text-xl font-bold text-white font-sans mt-1">{selectedDino.nameJa}</h3>
                <p className="text-xs font-mono text-cyan-300 italic">{selectedDino.nameEn}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-950/80 text-xs font-sans text-slate-200 leading-relaxed flex flex-col gap-2">
              <div className="flex justify-between items-center font-mono border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">SPECIMEN ID:</span>
                <span className="text-emerald-400 font-bold">{selectedDino.id}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedDino.description}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedDino(null)}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs tracking-wider cursor-pointer shadow-lg transition-transform hover:scale-105"
                id="modal-acknowledge-btn"
              >
                ACKNOWLEDGE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full py-4 text-center border-t border-emerald-950/80 bg-slate-950/80 text-[10px] font-mono text-slate-500 z-20 shrink-0">
        DINO WORLD 50 ARCHIVE SYSTEM // ALL PREHISTORIC DATA VERIFIED
      </div>
    </div>
  );
};

export default WelcomePage;
