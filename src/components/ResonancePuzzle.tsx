import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from './AudioEngine';
import { Sparkles, RefreshCw, Zap, Sliders, Check, HelpCircle } from 'lucide-react';

interface ResonancePuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

export default function ResonancePuzzle({ onSolve, isSolved }: ResonancePuzzleProps) {
  // Target states (The ancient sealed frequency properties - now fully dynamic!)
  const [targetAmp, setTargetAmp] = useState(2.8);
  const [targetFreq, setTargetFreq] = useState(0.025);
  const [targetPhase, setTargetPhase] = useState(2.4);

  // Min and Max parameters for controls
  const MIN_AMP = 0.5;
  const MAX_AMP = 4.0;
  const MIN_FREQ = 0.005;
  const MAX_FREQ = 0.05;
  const MIN_PHASE = 0;
  const MAX_PHASE = Math.PI * 2; // ~6.28

  // Player state ranges (Init with slightly off values)
  const [amp, setAmp] = useState(1.2);
  const [freq, setFreq] = useState(0.010);
  const [phase, setPhase] = useState(0.5);

  const [harmony, setHarmony] = useState(0);
  const [isTuning, setIsTuning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0); // Offset to animate wave scrolling

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Shuffles/Randomizes target waveform constraints dynamically
  const randomizeTargetWaveform = () => {
    // Amplitude target: 1.5 to 3.8
    const amps = [1.5, 1.8, 2.0, 2.3, 2.5, 2.8, 3.0, 3.3, 3.5, 3.8];
    // Frequency target: 0.015 to 0.045
    const freqs = [0.015, 0.020, 0.025, 0.030, 0.034, 0.038, 0.042, 0.045];
    // Phase target: 0.8 to 5.4
    const phases = [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.8, 4.2, 4.6, 5.0];

    const randAmp = amps[Math.floor(Math.random() * amps.length)];
    const randFreq = freqs[Math.floor(Math.random() * freqs.length)];
    const randPhase = phases[Math.floor(Math.random() * phases.length)];

    setTargetAmp(randAmp);
    setTargetFreq(randFreq);
    setTargetPhase(randPhase);

    // Give player a default offset start point
    setAmp(1.2);
    setFreq(0.012);
    setPhase(0.5);
    setHintCount(0);
  };

  // Run on initial mount
  useEffect(() => {
    randomizeTargetWaveform();
  }, []);

  // Calculate harmony accuracy (0 to 100) dynamically using the active target state
  useEffect(() => {
    // Amplitude diff
    const ampDiff = Math.abs(targetAmp - amp) / (MAX_AMP - MIN_AMP);
    
    // Frequency diff
    const freqDiff = Math.abs(targetFreq - freq) / (MAX_FREQ - MIN_FREQ);
    
    // Phase diff (circular distance)
    const diff = Math.min(
      Math.abs(targetPhase - phase),
      Math.PI * 2 - Math.abs(targetPhase - phase)
    );
    const phaseDiff = diff / Math.PI; // normalize to 0..1 circular diff

    // Weight parameters: Amplitude 35%, Frequency 40%, Phase 25%
    const totalDiff = (ampDiff * 0.35) + (freqDiff * 0.40) + (phaseDiff * 0.25);
    const score = Math.max(0, Math.min(100, Math.round((1 - totalDiff) * 100)));
    
    setHarmony(score);
  }, [amp, freq, phase, targetAmp, targetFreq, targetPhase]);

  // Audio heartbeat when tuning
  useEffect(() => {
    if (isSolved) return;
    
    let interval: NodeJS.Timeout;
    if (isTuning) {
      interval = setInterval(() => {
        // High frequency pitch depending on closeness to perfect harmony
        const volume = Math.max(0.1, harmony / 120);
        const pitch = 200 + (harmony * 3.5); // 200Hz to 550Hz based on accuracy
        audio.playBell(pitch, volume);
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isTuning, harmony, isSolved]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Dynamic scaling for high DPI
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      setWaveOffset((prev) => (prev + 0.05) % (Math.PI * 2));

      const centerY = height / 2;
      const pixelsPerUnit = height / 10; // Scaling factor for amplitude

      // 1. Draw Grid Lines for measurement feeling
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      // Horizontal centerline
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Horizontal dashed grids
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, centerY - pixelsPerUnit * 3);
      ctx.lineTo(width, centerY - pixelsPerUnit * 3);
      ctx.moveTo(0, centerY + pixelsPerUnit * 3);
      ctx.lineTo(width, centerY + pixelsPerUnit * 3);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. DRAW TARGET WAVE (Mystic Golden Glow Wave)
      ctx.beginPath();
      ctx.lineWidth = isSolved ? 3 : 2;
      ctx.strokeStyle = isSolved ? '#059669' : '#e11d48'; // Gold/Crimson shifting to Jade Emerald on solve
      if (!isSolved) {
        ctx.shadowColor = '#fda4af';
        ctx.shadowBlur = 6;
      }
      
      for (let x = 0; x < width; x++) {
        // y = A * sin(F * x + P)
        // With dynamic scrolling and referencing dynamic target states
        const targetY = centerY + (targetAmp * pixelsPerUnit) * Math.sin((x * targetFreq) + targetPhase + waveOffset);
        if (x === 0) ctx.moveTo(x, targetY);
        else ctx.lineTo(x, targetY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset blur

      // 3. DRAW PLAYER ADJUSTABLE WAVE (Glowing Tech Cyan Wave)
      if (!isSolved) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        // Make color more bright/vibrant as harmony increases
        const closeness = harmony / 100;
        ctx.strokeStyle = `rgba(14, 116, 144, 0.95)`; // Cyan-700 Base
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 4 + (closeness * 8);

        for (let x = 0; x < width; x++) {
          const playerY = centerY + (amp * pixelsPerUnit) * Math.sin((x * freq) + phase + waveOffset);
          if (x === 0) ctx.moveTo(x, playerY);
          else ctx.lineTo(x, playerY);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset blur
      }

      // Draw particle highlights at wave intersection if accuracy is very high
      if (harmony >= 90 && !isSolved) {
        ctx.fillStyle = '#22d3ee';
        for (let i = 0; i < 4; i++) {
          const xPos = (width / 5) * (i + 1);
          const pY = centerY + (amp * pixelsPerUnit) * Math.sin((xPos * freq) + phase + waveOffset);
          ctx.beginPath();
          ctx.arc(xPos, pY, 3 + Math.sin(waveOffset * 3) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [amp, freq, phase, isSolved, harmony, waveOffset, targetAmp, targetFreq, targetPhase]);

  const handleTuneAction = () => {
    if (harmony >= 95) {
      audio.playSuccessFanfare();
      onSolve();
    } else {
      audio.playError();
    }
  };

  const resetSlidingValues = () => {
    audio.playTick();
    setAmp(1.2);
    setFreq(0.012);
    setPhase(0.5);
  };

  const autoSolve = () => {
    setAmp(targetAmp);
    setFreq(targetFreq);
    setPhase(targetPhase);
    setTimeout(() => {
      audio.playSuccessFanfare();
      onSolve();
    }, 400);
  };

  const hints = [
    "左の解読手帳によると、重ね合わせる魔導ノブは、3つの波長パラメーター（強さ、細かさ、左右の位置）を調整する仕組みになっています。波の一致率が 95% 以上になると、ロック開放装置が金色に輝きます。",
    `【各パラメーターのヒント】\n・魔力強度（振幅）: ${targetAmp.toFixed(2)} 付近に変更し、高さを目標に合わせます。\n・魔力密度（周波数）: ${(targetFreq * 1000).toFixed(1)} mHz 付近で、波のうねり（細かさ）を揃えましょう。\n・魔力位相（左右）: ${targetPhase.toFixed(2)} rad 付近で、波全体の山と谷の左右配置がぴったりフィットします。`,
    `【正解調和大系】\n魔力強度(振幅): ${targetAmp.toFixed(2)} ｜ 魔力密度(周波数): ${(targetFreq * 1000).toFixed(1)} mHz ｜ 魔力位置(位相): ${targetPhase.toFixed(2)} rad。\nこの状態に合わせると同調率が 98%〜100% に到達します。到達したら「共鳴を励起する」ボタンを押してロックを解除してください。`
  ];

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-xs w-full" id="resonance-puzzle">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-lg">
          STAGE 4 (再起動・他パターン選択で波動がダイナミックに変化！)
        </span>
        <h4 className="text-sm font-bold text-slate-800 mt-2 font-sans">四の試練：魔力波形の調和 (Resonance Wave Sync)</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          封印された古代の純正波に、あなたの魔力波動を完璧に重ね合わせて、共鳴調律を完了させよ。
        </p>
      </div>

      {/* Modern Waveform Canvas Panel */}
      <div className="w-full h-36 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex flex-col p-2 mb-4 shadow-inner">
        <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between border-b border-slate-200/60 pb-1 select-none z-10">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>赤：古代魔導純正波</span>
            {!isSolved && (
              <>
                <span className="text-slate-350">|</span>
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-600" />
                <span>青：調整魔力波</span>
              </>
            )}
          </div>
          <span className="text-slate-500">波形シミュレーター</span>
        </div>

        {/* Dynamic Interactive Drawing Window */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full cursor-crosshair z-0"
        />

        {/* Floating Harmony HUD Counter */}
        <div className="absolute bottom-2 right-2 bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50 flex flex-col items-end z-10">
          <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">同調率 (Harmony Resonance)</span>
          <span className={`text-base font-mono font-extrabold pb-0.5 tracking-tight ${
            harmony >= 95 ? 'text-emerald-400 animate-pulse' : harmony >= 75 ? 'text-cyan-300' : 'text-slate-200'
          }`}>
            {isSolved ? "100" : harmony}%
          </span>
        </div>
      </div>

      {/* Live Knob / Sliders Panel */}
      {!isSolved ? (
        <div className="w-full max-w-sm space-y-4 pt-1 pb-2">
          {/* Slider 1: Amplitude */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500 flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>1. 魔力強度 (波の高さ) [振幅]</span>
              </span>
              <span className="text-slate-800 font-bold">{amp.toFixed(2)} / {MAX_AMP.toFixed(2)}</span>
            </div>
            <input 
              type="range"
              min={MIN_AMP}
              max={MAX_AMP}
              step={0.05}
              value={amp}
              onChange={(e) => {
                setAmp(parseFloat(e.target.value));
                setIsTuning(true);
              }}
              onMouseUp={() => setIsTuning(false)}
              onTouchEnd={() => setIsTuning(false)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
          </div>

          {/* Slider 2: Frequency */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500 flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>2. 魔力密度 (波の細かさ) [周波数]</span>
              </span>
              <span className="text-slate-800 font-bold">{(freq * 1000).toFixed(1)} mHz</span>
            </div>
            <input 
              type="range"
              min={MIN_FREQ}
              max={MAX_FREQ}
              step={0.0005}
              value={freq}
              onChange={(e) => {
                setFreq(parseFloat(e.target.value));
                setIsTuning(true);
              }}
              onMouseUp={() => setIsTuning(false)}
              onTouchEnd={() => setIsTuning(false)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
          </div>

          {/* Slider 3: Phase */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500 flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>3. 魔力位相 (左右の位置) [位相]</span>
              </span>
              <span className="text-slate-800 font-bold">{(phase).toFixed(2)} rad</span>
            </div>
            <input 
              type="range"
              min={MIN_PHASE}
              max={MAX_PHASE}
              step={0.05}
              value={phase}
              onChange={(e) => {
                setPhase(parseFloat(e.target.value));
                setIsTuning(true);
              }}
              onMouseUp={() => setIsTuning(false)}
              onTouchEnd={() => setIsTuning(false)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-[154px] max-w-sm flex flex-col justify-center items-center bg-emerald-50 border border-emerald-150 rounded-xl mb-2 text-center text-emerald-800 font-sans p-4 space-y-2">
          <Check className="w-8 h-8 text-emerald-600 animate-bounce" />
          <p className="text-xs font-bold leading-relaxed">
            魔力波形が驚異の調和を達成しました！<br />
            古代からくりギミックの封印刻印が緑に解放されました。
          </p>
        </div>
      )}

      {/* Action / Activate Grid Buttons */}
      {!isSolved && (
        <div className="w-full max-w-sm flex items-center justify-between gap-2 pt-2">
          <button
            onClick={resetSlidingValues}
            className="px-2.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10.5px] text-slate-700 font-bold transition-all flex items-center space-x-1 cursor-pointer bg-white"
          >
            <RefreshCw className="w-3 h-3" />
            <span>ツマミ初期化</span>
          </button>

          <button
            onClick={randomizeTargetWaveform}
            className="px-2.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10.5px] text-slate-700 font-bold transition-all flex items-center space-x-1 cursor-pointer bg-white"
            title="純正波形そのものをランダムに変更します"
          >
            <RefreshCw className="w-3 h-3" />
            <span>他波動へ</span>
          </button>

          <button
            onClick={handleTuneAction}
            disabled={harmony < 95}
            className={`flex-1 py-2 rounded-xl transition-all font-semibold font-mono text-[10.5px] flex items-center justify-center space-x-1 cursor-pointer border ${
              harmony >= 95
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-3 h-3 ${harmony >= 95 ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
            <span>{harmony >= 95 ? "共鳴を励起する" : `同調精度不足 (${harmony}%)`}</span>
          </button>
        </div>
      )}

      {/* Hint panel container */}
      <div className="w-full max-w-sm mt-3 pt-3 border-t border-slate-100 flex flex-col items-center">
        {!isSolved ? (
          <div className="w-full text-center">
            {hintCount === 0 ? (
              <button
                onClick={() => setHintCount(1)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>魔導調律を解読する (ヒント 1/3)</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 relative">
                <p className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <span>💡 共鳴の導き ({hintCount}/3):</span>
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">{hints[hintCount - 1]}</p>
                {hintCount < 3 && (
                  <button
                    onClick={() => setHintCount(hintCount + 1)}
                    className="mt-2 text-[10px] text-white bg-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    もう少し詳しい助言をもらう
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-150">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>四の試練、封印を調和させました。</span>
          </p>
        )}
      </div>

      {/* Hidden cheat skip check */}
      <div onClick={autoSolve} className="opacity-0 hover:opacity-10 w-4 h-4 self-end -mt-4 cursor-pointer text-[8px] text-slate-350">.</div>
    </div>
  );
}
