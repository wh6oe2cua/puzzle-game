import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audio } from './AudioEngine';
import { RotateCw, RotateCcw, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

interface RingPuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

const RUNES_LIST = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

export default function RingPuzzle({ onSolve, isSolved }: RingPuzzleProps) {
  // Target rune indices (0-11) for Outer, Middle, Inner rings
  const [targetIndices, setTargetIndices] = useState({
    outer: 0,
    middle: 0,
    inner: 0
  });

  // Current ring rotation angles
  const [angles, setAngles] = useState({
    outer: 120,
    middle: 240,
    inner: 90
  });

  const [hintCount, setHintCount] = useState(0);

  // Initialize random targets and random initial angles
  const initializePuzzle = () => {
    // Generate distinct random targets
    const randOuter = Math.floor(Math.random() * 12);
    const randMiddle = Math.floor(Math.random() * 12);
    const randInner = Math.floor(Math.random() * 12);

    setTargetIndices({
      outer: randOuter,
      middle: randMiddle,
      inner: randInner
    });

    // Generate random starting angles (multiples of 30, ensuring not already solved)
    const steps = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    let startOuter = steps[Math.floor(Math.random() * steps.length)];
    let startMiddle = steps[Math.floor(Math.random() * steps.length)];
    let startInner = steps[Math.floor(Math.random() * steps.length)];

    // Ensure it doesn't instantly solve
    const outerMatch = ((12 - (startOuter / 30)) % 12 + 12) % 12 === randOuter;
    const middleMatch = ((12 - (startMiddle / 30)) % 12 + 12) % 12 === randMiddle;
    const innerMatch = ((12 - (startInner / 30)) % 12 + 12) % 12 === randInner;

    if (outerMatch && middleMatch && innerMatch) {
      startOuter = (startOuter + 60) % 360;
    }

    setAngles({
      outer: startOuter,
      middle: startMiddle,
      inner: startInner
    });
    setHintCount(0);
  };

  useEffect(() => {
    initializePuzzle();
  }, []);

  // Helper to resolve rune symbol on specific index per ring
  const getRuneAtIdx = (ring: 'outer' | 'middle' | 'inner', idx: number) => {
    const adjustedIdx = idx % 12;
    if (adjustedIdx === 0) {
      if (ring === 'outer') return "🔮";
      if (ring === 'middle') return "☀";
      return "★";
    }
    const offsetMap = { outer: 8, middle: 4, inner: 0 };
    return RUNES_LIST[(adjustedIdx + offsetMap[ring]) % RUNES_LIST.length];
  };

  // Check solve state
  useEffect(() => {
    // Determine which rune is currently at the very top (angle index)
    // Formula: top index for angle = ((12 - (angle / 30)) % 12 + 12) % 12
    const currentOuterIdx = ((12 - Math.round(angles.outer / 30)) % 12 + 12) % 12;
    const currentMiddleIdx = ((12 - Math.round(angles.middle / 30)) % 12 + 12) % 12;
    const currentInnerIdx = ((12 - Math.round(angles.inner / 30)) % 12 + 12) % 12;

    const isOuterAligned = currentOuterIdx === targetIndices.outer;
    const isMiddleAligned = currentMiddleIdx === targetIndices.middle;
    const isInnerAligned = currentInnerIdx === targetIndices.inner;

    if (isOuterAligned && isMiddleAligned && isInnerAligned && !isSolved) {
      audio.playUnlock();
      onSolve();
    }
  }, [angles, targetIndices, isSolved, onSolve]);

  const rotateRing = (ring: 'outer' | 'middle' | 'inner', direction: 'cw' | 'ccw') => {
    if (isSolved) return;
    audio.playTick();

    const delta = direction === 'cw' ? 30 : -30;

    setAngles((prev) => {
      let nextOuter = prev.outer;
      let nextMiddle = prev.middle;
      let nextInner = prev.inner;

      if (ring === 'outer') {
        // Outer rotates outer (+30) and middle (+30)
        nextOuter = (prev.outer + delta + 360) % 360;
        nextMiddle = (prev.middle + delta + 360) % 360;
      } else if (ring === 'middle') {
        // Middle rotates middle (+30) and inner (-30 / opposite)
        nextMiddle = (prev.middle + delta + 360) % 360;
        nextInner = (prev.inner - delta + 360) % 360;
      } else if (ring === 'inner') {
        // Inner rotates only inner (+30)
        nextInner = (prev.inner + delta + 360) % 360;
      }

      return {
        outer: nextOuter,
        middle: nextMiddle,
        inner: nextInner
      };
    });
  };

  // Safe normalize for display
  const getDisplayVal = (ring: 'outer' | 'middle' | 'inner', angle: number, targetIdx: number) => {
    const currentIdx = ((12 - Math.round(angle / 30)) % 12 + 12) % 12;
    const currentRune = getRuneAtIdx(ring, currentIdx);
    const targetRune = getRuneAtIdx(ring, targetIdx);
    
    return currentIdx === targetIdx 
      ? `一致 (${currentRune})` 
      : `${currentRune} (目標:${targetRune})`;
  };

  const getRuneForWheel = (ring: 'outer' | 'middle' | 'inner', idx: number) => {
    return getRuneAtIdx(ring, idx);
  };

  const autoSolve = () => {
    // Hidden debug helper: Set angles perfectly to point to the target indices
    audio.playUnlock();
    setAngles({
      outer: ((12 - targetIndices.outer) % 12) * 30,
      middle: ((12 - targetIndices.middle) % 12) * 30,
      inner: ((12 - targetIndices.inner) % 12) * 30
    });
  };

  const outerTargetSymbol = getRuneAtIdx('outer', targetIndices.outer);
  const middleTargetSymbol = getRuneAtIdx('middle', targetIndices.middle);
  const innerTargetSymbol = getRuneAtIdx('inner', targetIndices.inner);

  const hints = [
    `今回は
    「外輪：${outerTargetSymbol}」
    「中輪：${middleTargetSymbol}」
    「内輪：${innerTargetSymbol}」
    の全てのルーンを真上（▲印）に同期させなければならない。`,
    "外輪の回転は中輪を同調させ、中輪の回転は内輪を逆方向に押し戻す。そして、内輪は他に一切干渉しない性質を持つ。",
    "【正解の手順】\n1. 外輪を回して、外輪の目標『" + outerTargetSymbol + "』を真上▲に合わせる。\n2. 次に中輪を回して中輪の目標『" + middleTargetSymbol + "』を真上に合わせる。（内輪はズレるが無視）\n3. 最後に他に干渉しない内輪を回して、目標『" + innerTargetSymbol + "』を合わせると完成だ。"
  ];

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-xs w-full" id="ring-puzzle">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-lg">
          STAGE 1 (再起動でアライメント目標が変化！)
        </span>
        <h4 className="text-sm font-bold text-slate-800 mt-2 font-sans">壱の試練：魔導リングの整合</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          3つのリングを回転させ、中央上部の指針（▲印）に、提示された目標のルーンをそれぞれ整列させよ。
        </p>
      </div>

      {/* Target Symbols HUD display */}
      <div className="bg-slate-50 px-4 py-2 border rounded-xl flex items-center justify-center space-x-4 text-xs font-bold text-slate-800 mb-2 font-mono">
        <span className="text-slate-500">🎯 今回の調和目標：</span>
        <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-900">外輪: {outerTargetSymbol}</span>
        <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-900">中輪: {middleTargetSymbol}</span>
        <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-900">内輪: {innerTargetSymbol}</span>
      </div>

      {/* Main Interactive Circle */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center my-4 bg-slate-50 rounded-full border border-slate-200 shadow-inner">
        {/* Alignment Indicator Laser */}
        <div className="absolute top-0 w-0.5 h-32 bg-gradient-to-b from-slate-900 to-transparent z-10 opacity-40 pointer-events-none" />
        <div className="absolute -top-3 text-lg text-slate-800 font-bold z-10">▲</div>

        {/* Central Core */}
        <div className={`absolute w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-700 ${
          isSolved 
            ? 'bg-emerald-50 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <Sparkles className={`w-4 h-4 ${isSolved ? 'text-emerald-500 animate-spin' : 'text-slate-650'}`} />
        </div>

        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: angles.inner }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          className={`absolute w-28 h-28 rounded-full border border-dashed flex items-center justify-center ${
            ((12 - Math.round(angles.inner / 30)) % 12 + 12) % 12 === targetIndices.inner ? 'border-emerald-500/40 bg-emerald-50/5' : 'border-slate-200'
          }`}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-[10px] font-mono font-bold text-slate-500"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-46px)`,
              }}
            >
              {getRuneForWheel('inner', i)}
            </div>
          ))}
        </motion.div>

        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: angles.middle }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          className={`absolute w-44 h-44 rounded-full border border-slate-200 flex items-center justify-center ${
            ((12 - Math.round(angles.middle / 30)) % 12 + 12) % 12 === targetIndices.middle ? 'border-emerald-500/40 bg-emerald-50/5' : 'border-slate-200'
          }`}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs font-mono text-slate-600 font-semibold"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-76px)`,
              }}
            >
              {getRuneForWheel('middle', i)}
            </div>
          ))}
        </motion.div>

        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: angles.outer }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          className={`absolute w-60 h-60 rounded-full border border-slate-300 flex items-center justify-center ${
            ((12 - Math.round(angles.outer / 30)) % 12 + 12) % 12 === targetIndices.outer ? 'border-emerald-500/40 bg-emerald-50/5' : 'border-slate-300'
          }`}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs font-semibold font-mono text-slate-850"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-106px)`,
              }}
            >
              {getRuneForWheel('outer', i)}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Control Console */}
      <div className="w-full max-w-sm mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-650 mb-1 border-b border-slate-200/60 pb-1.5">
          <div>外輪: <span className={((12 - Math.round(angles.outer / 30)) % 12 + 12) % 12 === targetIndices.outer ? "text-emerald-600 font-extrabold" : "text-slate-800 font-bold"}>{getDisplayVal('outer', angles.outer, targetIndices.outer)}</span></div>
          <div>中輪: <span className={((12 - Math.round(angles.middle / 30)) % 12 + 12) % 12 === targetIndices.middle ? "text-emerald-600 font-extrabold" : "text-slate-800 font-bold"}>{getDisplayVal('middle', angles.middle, targetIndices.middle)}</span></div>
          <div>内輪: <span className={((12 - Math.round(angles.inner / 30)) % 12 + 12) % 12 === targetIndices.inner ? "text-emerald-600 font-extrabold" : "text-slate-800 font-bold"}>{getDisplayVal('inner', angles.inner, targetIndices.inner)}</span></div>
        </div>

        {/* Ring Rotation Buttons */}
        <div className="space-y-2">
          {/* Outer Ring Controls */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-700 font-semibold text-[11px]">外輪 (連動:中輪も同調)</span>
            <div className="flex space-x-1">
              <button
                onClick={() => rotateRing('outer', 'ccw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <RotateCcw className="w-3" />
                  <span>-30°</span>
                </div>
              </button>
              <button
                onClick={() => rotateRing('outer', 'cw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <span>+30°</span>
                  <RotateCw className="w-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Middle Ring Controls */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-700 font-semibold text-[11px]">中輪 (連動:内輪が逆同調)</span>
            <div className="flex space-x-1">
              <button
                onClick={() => rotateRing('middle', 'ccw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <RotateCcw className="w-3" />
                  <span>-30°</span>
                </div>
              </button>
              <button
                onClick={() => rotateRing('middle', 'cw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <span>+30°</span>
                  <RotateCw className="w-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Inner Ring Controls */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200 font-mono">
            <span className="text-xs text-slate-700 font-semibold text-[11px]">内輪 (独立稼働)</span>
            <div className="flex space-x-1">
              <button
                onClick={() => rotateRing('inner', 'ccw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <RotateCcw className="w-3" />
                  <span>-30°</span>
                </div>
              </button>
              <button
                onClick={() => rotateRing('inner', 'cw')}
                disabled={isSolved}
                className="p-1 text-xs bg-slate-50 hover:bg-slate-100 disabled:opacity-35 rounded-md border border-slate-200 text-slate-700 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center space-x-1 px-1 text-[11px]">
                  <span>+30°</span>
                  <RotateCw className="w-3" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-1.5 border-t border-slate-200/60">
          <button
            onClick={initializePuzzle}
            disabled={isSolved}
            className="flex items-center space-x-1 px-2.5 py-1 text-[10px] bg-white border border-slate-150 hover:bg-slate-50 rounded-lg text-slate-650 transition-all font-bold cursor-pointer"
            title="魔導リングの波長を変化させ、別の調和目標パターンに変更します"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>他パターンへ</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tiered Hint System */}
      <div className="w-full max-w-sm mt-3 pt-3 border-t border-slate-200 flex flex-col items-center">
        {!isSolved ? (
          <div className="w-full text-center">
            {hintCount === 0 ? (
              <button
                onClick={() => setHintCount(1)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>手がかりを得る (ヒント 1/3)</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 relative">
                <p className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <span>💡 手がかり ({hintCount}/3):</span>
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">{hints[hintCount - 1]}</p>
                {hintCount < 3 && (
                  <button
                    onClick={() => setHintCount(hintCount + 1)}
                    className="mt-2 text-[10px] text-white bg-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    次のヒントを解放
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-750 font-bold flex items-center space-x-1 animate-pulse bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>魔導リング調律完了。エネルギーが次の機構へ充填されました。</span>
          </p>
        )}
      </div>

      {/* Hidden skip/resolve button for debugging */}
      <div 
        onClick={autoSolve} 
        className="opacity-0 hover:opacity-10 w-4 h-4 self-end -mt-4 cursor-pointer text-[8px] text-slate-300"
        title="管理者スキップ"
      >
        .
      </div>
    </div>
  );
}
