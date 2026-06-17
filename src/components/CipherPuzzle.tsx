import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audio } from './AudioEngine';
import { HelpCircle, Key, Sparkles, Check, RefreshCw } from 'lucide-react';

interface CipherPuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

interface CipherPattern {
  offset: number;
  word: string;
  runeIndices: number[]; // runes array indices to display/ask
  hintOffsetDesc: string;
}

const CIPHER_PATTERNS: CipherPattern[] = [
  {
    offset: 3,
    word: "ミライ",
    runeIndices: [4, 5, 6], // runes[4](ᚼ) runes[5](ᚾ) runes[6](ᛁ)
    hintOffsetDesc: "『3つの星の傾きを以て逆転する（時計回りに3等分、つまりオフセット3）』"
  },
  {
    offset: 4,
    word: "ヒカリ",
    runeIndices: [8, 9, 10], // runes[8](ᛚ) runes[9](ᛜ) runes[10](ᛥ)
    hintOffsetDesc: "『四柱の輝きに同調し、右へ4コマ時計回りに回せ（オフセット4）』"
  },
  {
    offset: 2,
    word: "タビト",
    runeIndices: [2, 3, 4], // runes[2](ᚦ) runes[3](ᚱ) runes[4](ᚼ)
    hintOffsetDesc: "『二対の歯車を噛み合わせ、時計回りに2コマ進めよ（オフセット2）』"
  },
  {
    offset: 5,
    word: "キセキ",
    runeIndices: [6, 5, 6], // runes[6](ᛁ) runes[5](ᚾ) runes[6](ᛁ)
    hintOffsetDesc: "『五大元素の循環を以て、時計回りに合計5コマ回すべし（オフセット5）』"
  }
];

export default function CipherPuzzle({ onSolve, isSolved }: CipherPuzzleProps) {
  // 12 elements around the concentric wheels
  // Runes (Outer): 
  const runes = ["ᛡ", "ᛟ", "ᚦ", "ᚱ", "ᚼ", "ᚾ", "ᛁ", "ᛒ", "ᛚ", "ᛜ", "ᛥ", "ᛘ"];
  // Katakana (Inner):
  const katakana = ["ヒ", "カ", "リ", "ノ", "タ", "ビ", "ト", "ミ", "ラ", "イ", "セ", "キ"];

  const [patternIdx, setPatternIdx] = useState(0);
  const [offset, setOffset] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hintCount, setHintCount] = useState(0);

  const shufflePattern = () => {
    const rand = Math.floor(Math.random() * CIPHER_PATTERNS.length);
    setPatternIdx(rand);
    setOffset(0);
    setInputValue("");
    setErrorMessage("");
    setHintCount(0);
  };

  useEffect(() => {
    shufflePattern();
  }, []);

  const currentPattern = CIPHER_PATTERNS[patternIdx];
  const CORRECT_DECODED_WORD = currentPattern ? currentPattern.word : "ミライ";
  const targetRunesStr = currentPattern 
    ? currentPattern.runeIndices.map(idx => runes[idx]).join(" ") 
    : "ᚼ ᚾ ᛁ";

  const handleRotate = (dir: 'cw' | 'ccw') => {
    if (isSolved) return;
    audio.playTick();
    setOffset((prev) => {
      const delta = dir === 'cw' ? 1 : -1;
      return (prev + delta + 12) % 12;
    });
  };

  const handleKeyPress = (char: string) => {
    if (isSolved) return;
    if (inputValue.length >= 6) return;
    audio.playTick();
    setInputValue(prev => prev + char);
    setErrorMessage("");
  };

  const handleBackspace = () => {
    if (isSolved) return;
    audio.playTick();
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isSolved) return;
    audio.playTick();
    setInputValue("");
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (isSolved) return;
    
    if (inputValue === CORRECT_DECODED_WORD) {
      audio.playUnlock();
      onSolve();
    } else {
      audio.playError();
      setErrorMessage("魔力の共振がありません。言葉が違います。");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const autoSolve = () => {
    if (!currentPattern) return;
    setOffset(currentPattern.offset);
    setInputValue(CORRECT_DECODED_WORD);
    audio.playUnlock();
    onSolve();
  };

  const hints = [
    `外側のシンボル「${targetRunesStr.split(" ").join("」「")}」を指し示すカタカナを解読しなければならない。初期状態（ズレ0）では別の言葉を意味している。`,
    `魔導書（第五章）には、ダイヤルの移動幅について ${currentPattern ? currentPattern.hintOffsetDesc : "特定のコマ"} と書かれている。ダイヤルをその数だけ右（時計回り）に回転させてみよう。`,
    `ダイヤルを ${currentPattern ? currentPattern.offset : 3} に合わせると、それぞれのルーンに対応するカタカナが順番に変換され、求める古代語は「${CORRECT_DECODED_WORD}」を指し示す。キーボードで「${CORRECT_DECODED_WORD}」と詠唱せよ。`
  ];

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-xs w-full" id="cipher-puzzle">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-lg">
          STAGE 5 (再起動で解読する言葉が変わる！)
        </span>
        <h4 className="text-sm font-bold text-slate-800 mt-2 font-sans">五の試練：暗号ダイアルの解除</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          デコーダーダイヤルを回し、指定された古代のルーン『 <span className="text-slate-850 font-extrabold">{targetRunesStr}</span> 』を解読・呪文入力せよ。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-center justify-center w-full max-w-sm md:max-w-xl my-2">
        {/* SVG Rotating Cipher Wheel */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 bg-slate-50 rounded-full border border-slate-200 p-2 flex items-center justify-center shadow-inner">
          <div className="absolute top-1.5 text-[9px] font-mono text-slate-400 font-semibold">ALIGNER ▲</div>
          
          {/* Outer Static Wheel (Runes) */}
          <div className="absolute w-full h-full rounded-full border border-slate-100 flex items-center justify-center">
            {runes.map((rune, idx) => (
              <div
                key={idx}
                className="absolute text-xs md:text-sm font-bold font-mono text-slate-705"
                style={{
                  transform: `rotate(${idx * 30}deg) translateY(-84px)`,
                }}
              >
                {rune}
              </div>
            ))}
          </div>

          {/* Inner Rotating Wheel (Katakana) */}
          <motion.div
            animate={{ rotate: offset * 30 }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs"
          >
            {katakana.map((char, idx) => (
              <div
                key={idx}
                className="absolute text-xs md:text-sm font-bold text-slate-700"
                style={{
                  transform: `rotate(${idx * 30}deg) translateY(-54px) rotate(${-idx * 30 - offset * 30}deg)`,
                }}
              >
                {char}
              </div>
            ))}
            
            {/* Center core */}
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-600 font-bold">+{offset}</span>
            </div>
          </motion.div>
        </div>

        {/* Translation Keyboard & Input Panel */}
        <div className="flex-1 w-full space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          
          {/* Wheel offset controls */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2">
            <span className="text-xs text-slate-700 font-bold">からくりダイヤル調整</span>
            <div className="flex space-x-1.5 animate-pulse">
              <button
                onClick={() => handleRotate('ccw')}
                disabled={isSolved}
                className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 rounded-lg text-slate-700 font-bold cursor-pointer"
              >
                ◀ CCW
              </button>
              <button
                onClick={() => handleRotate('cw')}
                disabled={isSolved}
                className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 rounded-lg text-slate-700 font-bold cursor-pointer"
              >
                CW ▶
              </button>
            </div>
          </div>

          {/* Spell input display */}
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">詠唱:</span>
            <input
              type="text"
              readOnly
              value={inputValue}
              placeholder="古文書の言葉を入力..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-2.5 py-1.5 text-center text-sm font-bold tracking-widest text-slate-800 placeholder-slate-350 focus:outline-none"
            />
          </div>

          {/* Keyboard Grid */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {katakana.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                disabled={isSolved}
                className="py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-355 rounded-lg text-slate-700 transition-all cursor-pointer"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-1.5 pt-2 border-t border-slate-200/60">
            <button
              onClick={handleClear}
              disabled={isSolved || inputValue === ""}
              className="flex-1 py-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 text-[10px] font-bold text-slate-750 rounded-lg cursor-pointer transition-all"
            >
              全消去
            </button>
            <button
              onClick={shufflePattern}
              disabled={isSolved}
              className="flex-1 py-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 text-[10px] font-bold text-slate-750 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-0.5"
              title="別の古代語パターンに変更します"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>他言葉</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSolved || inputValue === ""}
              className="flex-1 py-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 disabled:opacity-35 text-[10px] font-semibold text-white rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1"
            >
              <Key className="w-3 h-3 text-white" />
              <span>呪文送信</span>
            </button>
          </div>

          {errorMessage && (
            <p className="text-[10px] text-red-500 text-center font-bold pt-1 animate-pulse">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Hints engine */}
      <div className="w-full max-w-sm mt-1 pt-3 border-t border-slate-200 flex flex-col items-center">
        {!isSolved ? (
          <div className="w-full text-center">
            {hintCount === 0 ? (
              <button
                onClick={() => setHintCount(1)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>魔導ダイアルを占う (ヒント 1/3)</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 relative">
                <p className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <span>💡 翻訳の極意 ({hintCount}/3):</span>
                </p>
                <p className="leading-relaxed">{hints[hintCount - 1]}</p>
                {hintCount < 3 && (
                  <button
                    onClick={() => setHintCount(hintCount + 1)}
                    className="mt-2 text-[10px] text-white bg-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    ダイレクトな答え
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-750 font-bold flex items-center space-x-1 animate-pulse bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>「{CORRECT_DECODED_WORD}」の封印呪文を受理。古代の暗号仕掛けが解除されました！</span>
          </p>
        )}
      </div>

      {/* Secret skip trigger */}
      <div onClick={autoSolve} className="opacity-0 hover:opacity-10 w-4 h-4 self-end -mt-4 cursor-pointer text-[8px] text-slate-350">.</div>
    </div>
  );
}
