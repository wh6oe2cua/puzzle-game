import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Lock, Unlock, RefreshCw, Volume2, VolumeX, HelpCircle, Shield, Award, Landmark, Play } from 'lucide-react';
import { audio } from './components/AudioEngine';

// Components
import Journal from './components/Journal';
import RingPuzzle from './components/RingPuzzle';
import GridPuzzle from './components/GridPuzzle';
import LaserPuzzle from './components/LaserPuzzle';
import ResonancePuzzle from './components/ResonancePuzzle';
import CipherPuzzle from './components/CipherPuzzle';

export default function App() {
  // Game states
  const [currentStage, setCurrentStage] = useState(0); // 0 = prologue/journal intro, 1-5 = puzzles
  const [solvedStages, setSolvedStages] = useState<boolean[]>([false, false, false, false, false]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isWarpingToEnding, setIsWarpingToEnding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Stats
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    const savedSolved = localStorage.getItem('karakuri_solved');
    const savedHints = localStorage.getItem('karakuri_hints');
    const savedStage = localStorage.getItem('karakuri_stage');
    
    if (savedSolved) {
      try {
        setSolvedStages(JSON.parse(savedSolved));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedHints) setHintsUsed(parseInt(savedHints, 10));
    if (savedStage) setCurrentStage(parseInt(savedStage, 10));
  }, []);

  // Timer useEffect
  useEffect(() => {
    // If all stages are solved, stop timer
    const allSolved = solvedStages.every(s => s);
    if (allSolved) return;

    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, solvedStages]);

  // Handle Level Solving
  const handleStageSolved = (stageIndex: number) => {
    if (solvedStages[stageIndex]) return;

    const nextSolved = [...solvedStages];
    nextSolved[stageIndex] = true;
    setSolvedStages(nextSolved);
    localStorage.setItem('karakuri_solved', JSON.stringify(nextSolved));

    // Auto navigate to next stage or prologue, if not all solved
    const allSolved = nextSolved.every(s => s);
    if (allSolved) {
      setIsWarpingToEnding(true);
      setTimeout(() => {
        setIsWarpingToEnding(false);
        setShowWinModal(true);
        audio.playSuccessFanfare();
      }, 1500);
    } else {
      // Prompt user with positive visual jingle, keep current or go to next
      audio.playUnlock();
    }
  };

  const handleSelectStage = (stageId: number) => {
    audio.playTick();
    setCurrentStage(stageId);
    localStorage.setItem('karakuri_stage', stageId.toString());
  };

  const triggerResetGame = () => {
    audio.playTick();
    setShowResetConfirm(true);
  };

  const executeResetGame = () => {
    audio.playUnlock();
    setSolvedStages([false, false, false, false, false]);
    setCurrentStage(0);
    setStartTime(Date.now());
    setTimeElapsed(0);
    setHintsUsed(0);
    setShowWinModal(false);
    setShowResetConfirm(false);

    localStorage.removeItem('karakuri_solved');
    localStorage.removeItem('karakuri_hints');
    localStorage.removeItem('karakuri_stage');
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Rank / Title assignment based on solved time & hints
  const getAlchemistRank = () => {
    const allSolved = solvedStages.every(s => s);
    if (!allSolved) return "学徒";
    if (timeElapsed < 240) return "古代神聖魔導師 (Divine Archmage)";
    if (timeElapsed < 600) return "宮廷高位錬金術師 (Palace Alchemist)";
    return "真理の研究者 (Truth seeker)";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden antialiased select-none" id="main-panel">
      
      {/* Clean Minimalism background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Minimalist structural badge */}
      <div className="absolute top-4 right-8 pointer-events-none z-10 flex items-center space-x-2 text-xs text-slate-400 font-mono tracking-wider">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span>SYSTEM CALIBRATED</span>
      </div>

      {/* MAIN TOP HEADER */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-xs relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              古書とからくり箱の謎 <span className="text-xs text-slate-400 font-mono font-medium">v1.2</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-sans tracking-wide">
              The Alchemist's Minimal Mechanical Chest
            </p>
          </div>
        </div>

        {/* Global Stats indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/50 flex items-center space-x-2">
            <span className="text-slate-500">総時間:</span>
            <span className="text-slate-800 font-bold">{formatTime(timeElapsed)}</span>
          </div>

          <div className="bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/50 flex items-center space-x-2">
            <span className="text-slate-500">解除状況:</span>
            <span className="text-slate-800 font-bold flex items-center space-x-1">
              <span>{solvedStages.filter(Boolean).length} / 5</span>
              {solvedStages.every(Boolean) ? (
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
          </div>

          <button
            onClick={triggerResetGame}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100/80 border border-red-200 rounded-lg transition-all text-red-600 font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>最初から</span>
          </button>
        </div>
      </header>

      {/* CORE HERO SECTION: The Giant Karukari Chest visual status */}
      <section className="px-6 py-4 max-w-7xl mx-auto w-full z-10 flex flex-col items-center">
        <div className="w-full bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-6 shadow-xs">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
              <Shield className="w-4 h-4 text-slate-800" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">調律状態 (Mechanical Sealing Core)</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              魔導書には5段の強力神聖印が施されている。各試練（第1〜5章）に取り掛かり、5つの刻印を緑（調和）に適合すると、からくり箱が自動開扉する。
            </p>
          </div>

          {/* Interactive lock dots */}
          <div className="flex gap-3 relative pb-2 justify-center">
            {solvedStages.map((isSolved, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectStage(idx + 1)}
                className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  currentStage === idx + 1
                    ? 'border-slate-900 bg-slate-900 text-white scale-105 shadow-sm'
                    : 'hover:border-slate-400 bg-slate-50 text-slate-400 border-slate-200'
                } ${
                  isSolved
                    ? currentStage === idx + 1
                      ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                    : currentStage === idx + 1
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200/80 text-slate-400'
                }`}
              >
                <span className="text-[9px] font-mono select-none">試練 {idx + 1}</span>
                {isSolved ? (
                  <Unlock className={`w-4 h-4 ${currentStage === idx + 1 ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <Lock className={`w-4 h-4 ${currentStage === idx + 1 ? 'text-slate-300' : 'text-slate-400'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warp effect animation */}
        <AnimatePresence>
          {isWarpingToEnding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col justify-center items-center"
            >
              <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md mx-4">
                <Sparkles className="w-10 h-10 text-slate-800 animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-slate-800">仕掛け盤が、静かに共鳴を始めた...</h2>
                <p className="text-xs text-slate-500">からくり箱が完全に調律されました。扉が静かに開きます。</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SPLIT SCREEN / MAIN WORKBENCH LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          
          {/* LEFT: Alchemist Clues Diary / Journal */}
          <div className="lg:col-span-5 h-full">
            <Journal
              currentStage={currentStage}
              onSelectStage={handleSelectStage}
              solvedStages={solvedStages}
            />
          </div>

          {/* RIGHT: Active mechanical puzzle board */}
          <div className="lg:col-span-7 bg-white border border-slate-250 p-6 rounded-2xl shadow-xs flex flex-col justify-center items-center relative min-h-[420px]">
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
              <span>WORKBENCH REGION</span>
            </div>

            <AnimatePresence mode="wait">
              {currentStage === 0 && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-center max-w-md p-6 space-y-5 w-full"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
                    <Landmark className="w-7 h-7 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">からくり箱にようこそ</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      左の「解読手帳」を開き、全5つの試練を読み解こう。
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    「旅人よ、謎を解く覚悟ができたなら、いずれかの試練アイコン、または手帳のタブをクリックして、からくり盤面のダイヤルを始動させてほしい。」
                  </p>
                  <button
                    onClick={() => handleSelectStage(1)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-white" />
                    <span>第壱の試練を開始する</span>
                  </button>
                </motion.div>
              )}

              {currentStage === 1 && (
                <motion.div
                  key="stage1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <RingPuzzle
                    isSolved={solvedStages[0]}
                    onSolve={() => handleStageSolved(0)}
                  />
                </motion.div>
              )}

              {currentStage === 2 && (
                <motion.div
                  key="stage2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <GridPuzzle
                    isSolved={solvedStages[1]}
                    onSolve={() => handleStageSolved(1)}
                  />
                </motion.div>
              )}

              {currentStage === 3 && (
                <motion.div
                  key="stage3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <LaserPuzzle
                    isSolved={solvedStages[2]}
                    onSolve={() => handleStageSolved(2)}
                  />
                </motion.div>
              )}

              {currentStage === 4 && (
                <motion.div
                  key="stage4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <ResonancePuzzle
                    isSolved={solvedStages[3]}
                    onSolve={() => handleStageSolved(3)}
                  />
                </motion.div>
              )}

              {currentStage === 5 && (
                <motion.div
                  key="stage5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <CipherPuzzle
                    isSolved={solvedStages[4]}
                    onSolve={() => handleStageSolved(4)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 py-4 text-center text-xs text-slate-400 bg-white relative">
        <p className="font-mono">
          © 2026 ALCHEMIST STUDIO ・ HEPTA-SEALS CODE ENCRYPTED
        </p>
      </footer>

      {/* COMPLETED/SUCCESS MASTER MODAL */}
      <AnimatePresence>
        {showWinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-slate-250 p-6 rounded-2xl max-w-lg w-full text-center relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-slate-800" />
              </div>

              <h2 className="text-xl font-bold text-slate-950 leading-tight">
                「からくり箱」開放成功
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-1 font-semibold">
                Seventh Seals Broken Successfully
              </p>

              {/* Victory description / letter */}
              <div className="my-5 p-4 bg-slate-50 border border-slate-100 rounded-xl text-left space-y-3 relative text-slate-600 text-xs md:text-sm">
                <p className="indent-4 leading-relaxed font-sans">
                  重厚な機械式歯車が連動を終え、最後の一撃と共に古代のチェストから光の柱が昇ります。
                  中に眠っていたのは、時間を跳躍する賢者の輝石――。
                </p>
                <p className="indent-4 leading-relaxed font-sans">
                  汝の卓越した論理的推察と調律の才は、歴代の最高錬金術師たちを驚愕させるレベルのものです。
                </p>

                {/* Final stats card */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">解読完了総時間:</span>
                    <strong className="text-slate-800 text-sm font-bold">{formatTime(timeElapsed)}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">錬金術師ランク:</span>
                    <strong className="text-slate-800 text-sm font-bold block truncate">{getAlchemistRank()}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerResetGame}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>もう一度最初から解く</span>
                </button>
                <button
                  onClick={() => setShowWinModal(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>盤面を観賞する</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-5 h-5 text-red-600 animate-spin" />
              </div>

              <h2 className="text-base font-bold text-slate-950">
                最初からやり直しますか？
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                現在の全試練の調律（解答）状況、ヒント状況、および経過時間がすべて消去され、初期状態に戻ります。この操作は取り消せません。
              </p>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer border border-slate-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={executeResetGame}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  はい、リセットする
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
