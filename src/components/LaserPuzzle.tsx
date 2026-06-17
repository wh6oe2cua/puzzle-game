import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audio } from './AudioEngine';
import { Sparkles, HelpCircle, RotateCcw } from 'lucide-react';

interface LaserPuzzleProps {
  onSolve: () => void;
  isSolved: boolean;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type CellType = 'EMPTY' | 'MIRROR_FORWARD' | 'MIRROR_BACKWARD' | 'OBSTACLE';

interface LaserCell {
  row: number;
  col: number;
  type: CellType;
  isSource: boolean;
  isTarget: boolean;
}

interface LevelPattern {
  obstacles: { r: number; c: number }[];
  solution: { row: number; col: number; type: CellType }[];
  hints: string[];
}

// 完全に異なる3つの5枚高難度まばら配置パターン
const PATTERNS: LevelPattern[] = [
  {
    // パターン 1 (従来の5枚・かすめ通るルート)
    obstacles: [
      { r: 2, c: 4 }, // 直進ブロック
      { r: 2, c: 2 }, // 直進ブロック
      { r: 4, c: 1 }, // 直進ブロック
      { r: 1, c: 0 }, // 抜け道ブロック
      { r: 0, c: 3 }, // ショートカットブロック
      { r: 4, c: 0 }, // 装飾ブロック
      { r: 4, c: 2 }  
    ],
    solution: [
      { row: 0, col: 2, type: 'MIRROR_BACKWARD' }, // \
      { row: 1, col: 2, type: 'MIRROR_FORWARD' },  // /
      { row: 1, col: 1, type: 'MIRROR_BACKWARD' }, // \
      { row: 3, col: 1, type: 'MIRROR_FORWARD' },  // /
      { row: 3, col: 4, type: 'MIRROR_BACKWARD' }, // \
    ],
    hints: [
      "【幾何学の囁き A】\n左上の発光器(⚙️)からは、右「→」の水平方向にレーザーが放たれている。今回は、障害物の隙間を縫う【ちょうど5枚の反射鏡】を連動させることで調律が完了するぞ。",
      "【最初の足がかり A】\n(0, 2) の位置に「\\」を置き、レーザーを真下に向けよう。\nさらに、(1, 2) に「/」を置いて左へ流し、(1, 1) に「\\」を置いて、下方向に反射させていくのだ。",
      "【完全なる光 of 道導 A】\n(0,2)「\\」 ➔ (1,2)「/」 ➔ (1,1)「\\」 ➔ (3,1)「/」 ➔ (3,4)「\\」\nこの5つの鏡を正しい向きと角度に合わせて配置すれば、お邪魔ブロックの隙間をくぐり、右下のターゲットクリスタル(💎)へ到達する！"
    ]
  },
  {
    // パターン 2 (別の5枚ルート)
    obstacles: [
      { r: 0, c: 4 }, // 直接ゴール側への直進を遮断
      { r: 1, c: 3 }, 
      { r: 2, c: 2 }, 
      { r: 4, c: 1 }, 
      { r: 3, c: 0 }, 
      { r: 4, c: 2 }
    ],
    solution: [
      { row: 0, col: 3, type: 'MIRROR_BACKWARD' }, // \
      { row: 2, col: 3, type: 'MIRROR_FORWARD' },  // /
      { row: 2, col: 1, type: 'MIRROR_BACKWARD' }, // \
      { row: 3, col: 1, type: 'MIRROR_FORWARD' },  // /
      { row: 3, col: 4, type: 'MIRROR_BACKWARD' }, // \
    ],
    hints: [
      "【幾何学の囁き B】\n左上の発光器(⚙️)から放たれたレーザーは、そのままでは(0,4)の障害物に当たってしまう。障害物をよけるために【ちょうど5枚の鏡】を美しく連動させよ。",
      "【最初の足がかり B】\n(0, 3) の位置に「\\」を置き、レーザーを真下に変向しよう。\nそこから、(2, 3) に「/」を置いて左へ流し、(2, 1) に「\\」を置いて、下方向に反射させていくのだ。",
      "【完全なる光 of 道導 B】\n(0,3)「\\」 ➔ (2,3)「/」 ➔ (2,1)「\\」 ➔ (3,1)「/」 ➔ (3,4)「\\」\nこの5つの鏡を順番通りに組み合わせ、お邪魔ブロックの防壁の隙間をくぐり抜けよ！"
    ]
  },
  {
    // パターン 3 (さらに別の5枚ルート)
    obstacles: [
      { r: 0, c: 4 }, 
      { r: 2, c: 2 }, 
      { r: 3, c: 1 }, 
      { r: 1, c: 1 }, 
      { r: 4, c: 3 }, 
      { r: 4, c: 2 }
    ],
    solution: [
      { row: 0, col: 2, type: 'MIRROR_BACKWARD' }, // \
      { row: 3, col: 2, type: 'MIRROR_FORWARD' },  // /
      { row: 3, col: 3, type: 'MIRROR_BACKWARD' }, // \
      { row: 1, col: 3, type: 'MIRROR_FORWARD' },  // /
      { row: 1, col: 4, type: 'MIRROR_BACKWARD' }, // \
    ],
    hints: [
      "【幾何学の囁き C】\n今回の波形は、深く下まで沈んでから天井に跳ね返るジグザグのエネルギー。同じく【ちょうど5枚の反射鏡】を絶妙な位置に配置せよ。",
      "【最初の足がかり C】\n(0, 2) の位置に「\\」を置き、レーザーを大きく下へ向けよう。\nさらに、(3, 2) に「/」を置いて右へ流し、(3, 3) に「\\」を置いて、上方向に鋭く跳ね返すのだ。",
      "【完全なる光 of 道導 C】\n(0,2)「\\」 ➔ (3,2)「/」 ➔ (3,3)「\\」 ➔ (1,3)「/」 ➔ (1,4)「\\」\nこの5つの鏡をセットし、最後に右下のクリスタル(💎)に垂直に降り注がせれば調律は即座に完了する！"
    ]
  }
];

export default function LaserPuzzle({ onSolve, isSolved }: LaserPuzzleProps) {
  const ROWS = 5;
  const COLS = 5;

  const [patternIdx, setPatternIdx] = useState<number>(0);

  // 初回ロード時にランダムパターンを設定
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * PATTERNS.length);
    setPatternIdx(randomIdx);
  }, []);

  const currentPattern = PATTERNS[patternIdx];

  const createInitialGridForPattern = (idx: number): LaserCell[] => {
    const grid: LaserCell[] = [];
    const pat = PATTERNS[idx];
    const obstacles = pat ? pat.obstacles : [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isSource = r === 0 && c === 0;
        const isTarget = r === 4 && c === 4;
        const isObstacle = obstacles.some(o => o.r === r && o.c === c);

        grid.push({
          row: r,
          col: c,
          type: isSource || isTarget ? 'EMPTY' : isObstacle ? 'OBSTACLE' : 'EMPTY',
          isSource,
          isTarget
        });
      }
    }
    return grid;
  };

  const [grid, setGrid] = useState<LaserCell[]>([]);
  const [laserPath, setLaserPath] = useState<{ r: number; c: number }[]>([]);
  const [targetHit, setTargetHit] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // パターン変更時にグリッドとヒントカウンターを初期化
  useEffect(() => {
    setGrid(createInitialGridForPattern(patternIdx));
    setHintCount(0);
    setTargetHit(false);
    setLaserPath([]);
  }, [patternIdx]);

  // Trace the laser beam path
  useEffect(() => {
    if (grid.length === 0) return;

    const path: { r: number; c: number }[] = [];
    let curR = 0;
    let curC = 0;
    let dir: Direction = 'RIGHT';

    path.push({ r: curR, c: curC });

    let steps = 0;
    const maxSteps = 100; // Prevent infinite loop
    let hitTarget = false;

    while (steps < maxSteps) {
      steps++;
      
      // Move in current direction
      if (dir === 'UP') curR--;
      else if (dir === 'DOWN') curR++;
      else if (dir === 'LEFT') curC--;
      else if (dir === 'RIGHT') curC++;

      // Check boundary limits
      if (curR < 0 || curR >= ROWS || curC < 0 || curC >= COLS) {
        break; // Out of bounds
      }

      const cell = grid.find(c => c.row === curR && c.col === curC);
      if (!cell) break;

      path.push({ r: curR, c: curC });

      // Hit obstacle
      if (cell.type === 'OBSTACLE') {
        break; // Laser stops
      }

      // Hit target
      if (cell.isTarget) {
        hitTarget = true;
        break;
      }

      // Reflect in mirror
      if (cell.type === 'MIRROR_FORWARD') {
        // '/'
        if (dir === 'RIGHT') dir = 'UP';
        else if (dir === 'LEFT') dir = 'DOWN';
        else if (dir === 'UP') dir = 'RIGHT';
        else if (dir === 'DOWN') dir = 'LEFT';
      } else if (cell.type === 'MIRROR_BACKWARD') {
        // '\'
        if (dir === 'RIGHT') dir = 'DOWN';
        else if (dir === 'LEFT') dir = 'UP';
        else if (dir === 'UP') dir = 'LEFT';
        else if (dir === 'DOWN') dir = 'RIGHT';
      }
    }

    setLaserPath(path);
    setTargetHit(hitTarget);

    if (hitTarget && !isSolved) {
      audio.playSuccessFanfare();
      onSolve();
    }
  }, [grid, isSolved]);

  const handleCellClick = (r: number, c: number) => {
    if (isSolved) return;

    const cell = grid.find(ce => ce.row === r && ce.col === c);
    if (!cell || cell.isSource || cell.isTarget || cell.type === 'OBSTACLE') return;

    audio.playTick();

    setGrid((prev) => {
      const next = [...prev];
      const cellIdx = next.findIndex(ce => ce.row === r && ce.col === c);
      const currentType = next[cellIdx].type;

      let nextType: CellType = 'EMPTY';
      if (currentType === 'EMPTY') {
        nextType = 'MIRROR_BACKWARD'; // \
      } else if (currentType === 'MIRROR_BACKWARD') {
        nextType = 'MIRROR_FORWARD';  // /
      } else {
        nextType = 'EMPTY';
      }

      next[cellIdx] = {
        ...next[cellIdx],
        type: nextType
      };
      return next;
    });
  };

  const resetGridAndShuffle = () => {
    if (isSolved) return;
    audio.playTick();
    
    // 再スタート（リセット）時に現在のインデックスとは異なるものをランダムに再選択する
    setPatternIdx((prevIdx) => {
      let nextIdx = prevIdx;
      // パターンが複数ある場合は違うパターンにスイッチ
      if (PATTERNS.length > 1) {
        while (nextIdx === prevIdx) {
          nextIdx = Math.floor(Math.random() * PATTERNS.length);
        }
      } else {
        nextIdx = 0;
      }
      return nextIdx;
    });
  };

  const autoSolve = () => {
    if (!currentPattern) return;
    audio.playUnlock();
    setGrid((prev) => {
      return prev.map(c => {
        const solutionCell = currentPattern.solution.find(s => s.row === c.row && s.col === c.col);
        if (solutionCell) {
          return { ...c, type: solutionCell.type };
        }
        return c;
      });
    });
  };

  // Convert row-col path coordinates to SVG coordinate points
  const getSvgPathString = () => {
    if (laserPath.length === 0) return '';
    const scale = 54; // cell width + gap
    const offset = 27; // center offset
    return laserPath.map((p, idx) => {
      const x = p.c * scale + offset;
      const y = p.r * scale + offset;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getCellLabel = (cell: LaserCell) => {
    if (cell.isSource) return "⚙️";
    if (cell.isTarget) return targetHit ? "💎✨" : "💎";
    if (cell.type === 'OBSTACLE') return "⬛";
    if (cell.type === 'MIRROR_FORWARD') return " / ";
    if (cell.type === 'MIRROR_BACKWARD') return " \\ ";
    return "";
  };

  const currentHints = currentPattern ? currentPattern.hints : [];

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-xs w-full" id="laser-puzzle">
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-lg">
          STAGE 3 (再スタートで問題が変化！)
        </span>
        <h4 className="text-sm font-bold text-slate-800 mt-2 font-sans">参の試練：光学の結晶 (Sealed Prism Gate)</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          マスをクリックして反射鏡（ / または \ ）を設置し、左上の魔光線を右下の受信クリスタルへ導け。<b>リセットですべての配置と答えが変化！</b>
        </p>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center my-3" style={{ width: '290px', height: '290px' }}>
        
        {/* SVG Laser Draw Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ padding: '12px' }}>
          <defs>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Svg Laser beam line */}
          {laserPath.length > 0 && (
            <motion.path
              d={getSvgPathString()}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              filter="url(#laser-glow)"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}

          {/* Animated pulsing particles along the beam */}
          {laserPath.map((pt, i) => {
            if (i === 0) return null;
            const prev = laserPath[i - 1];
            const scale = 54;
            const offset = 27;
            const x1 = prev.c * scale + offset;
            const y1 = prev.r * scale + offset;
            const x2 = pt.c * scale + offset;
            const y2 = pt.r * scale + offset;

            return (
              <motion.circle
                key={`particle-${i}`}
                r="3"
                fill="#fecdd3"
                initial={{ cx: x1, cy: y1 }}
                animate={{ cx: x2, cy: y2 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "linear",
                  delay: i * 0.1
                }}
              />
            );
          })}
        </svg>

        {/* 5x5 Interaction Grid Layout */}
        <div className="grid grid-cols-5 gap-[6px] relative z-20" style={{ padding: '1.5px' }}>
          {grid.map((cell) => {
            const isPathPart = laserPath.some(p => p.r === cell.row && p.c === cell.col);
            
            return (
              <button
                key={`${cell.row}-${cell.col}`}
                onClick={() => handleCellClick(cell.row, cell.col)}
                disabled={isSolved || cell.isSource || cell.isTarget || cell.type === 'OBSTACLE'}
                className={`w-[48px] h-[48px] rounded-lg text-xs font-bold transition-all flex items-center justify-center select-none relative cursor-pointer ${
                  cell.isSource 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm'
                    : cell.isTarget
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                    : cell.type === 'OBSTACLE'
                    ? 'bg-slate-300 text-slate-600 border border-slate-400/50 cursor-not-allowed shadow-inner'
                    : 'bg-white border hover:bg-slate-50 text-slate-800 ' + (isPathPart ? 'border-rose-200 shadow-xs' : 'border-slate-200')
                }`}
              >
                <span className="font-mono text-[13px]">
                  {getCellLabel(cell)}
                </span>

                {/* Corner grid indexes for fine tune feeling */}
                <span className="absolute bottom-0.5 right-1 h-2 text-[6px] text-slate-400 lowercase font-mono">
                  {cell.row},{cell.col}
                </span>

                {/* Glow ring if path active */}
                {isPathPart && !cell.isSource && !cell.isTarget && (
                  <span className="absolute inset-0 rounded-lg border border-red-400/40 animate-pulse pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controller Buttons panel */}
      <div className="w-full max-w-sm flex items-center justify-between gap-3 pt-3">
        <button
          onClick={resetGridAndShuffle}
          disabled={isSolved}
          className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer bg-white ${
            isSolved 
              ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
          title="問題を別のランダムなものに切り替えます"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>他パターンへ</span>
        </button>

        {isSolved ? (
          <div className="flex-1 py-1 px-4 bg-emerald-50 border border-emerald-150 rounded-xl text-center text-[10px] text-emerald-800 font-bold leading-normal">
            ⚙️ 光学の共鳴が安定しました。受光プリズムが起動し、三の封印刻印が緑に解放されました。
          </div>
        ) : (
          <div className="flex-1 py-1.5 px-3 bg-red-50/50 border border-red-100 rounded-xl text-center text-[10.5px] text-red-650 font-medium">
            🎯 光線到達ステータス: <span className="font-bold">{targetHit ? "受信完了 (調律成功)" : "光が遮断されています"}</span>
          </div>
        )}
      </div>

      {/* Hint logic */}
      <div className="w-full max-w-sm mt-3 pt-3 border-t border-slate-100 flex flex-col items-center">
        {!isSolved ? (
          <div className="w-full text-center">
            {hintCount === 0 ? (
              <button
                onClick={() => setHintCount(1)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>光学迷宮の伝承を読む (ヒント 1/3)</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 relative">
                <p className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <span>💡 伝承の導き ({hintCount}/3):</span>
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">{currentHints[hintCount - 1]}</p>
                {hintCount < 3 && (
                  <button
                    onClick={() => setHintCount(hintCount + 1)}
                    className="mt-2 text-[10px] text-white bg-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    もっと詳しい奥義を聞く
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-150">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>三の試練、封印を調和させました。</span>
          </p>
        )}
      </div>

      {/* Hidden cheat skip check */}
      <div onClick={autoSolve} className="opacity-0 hover:opacity-10 w-4 h-4 self-end -mt-4 cursor-pointer text-[8px] text-slate-350">.</div>
    </div>
  );
}
