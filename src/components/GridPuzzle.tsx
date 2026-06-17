import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audio } from './AudioEngine';
import { RefreshCw, Check, Sparkles, HelpCircle } from 'lucide-react';

interface GridCell {
	value: number;
	isLocked: boolean; // Pre-filled locked cells
	element: string;   // Element name
	color: string;     // Color class
}

interface GridPuzzleProps {
	onSolve: () => void;
	isSolved: boolean;
}

// 8 valid 3x3 magic square variations where the rows, columns, and diagonals sum to 15.
const MAGIC_SQUARE_PATTERNS = [
	[8, 1, 6, 3, 5, 7, 4, 9, 2],
	[6, 1, 8, 7, 5, 3, 2, 9, 4],
	[4, 3, 8, 9, 5, 1, 2, 7, 6],
	[2, 7, 6, 9, 5, 1, 4, 3, 8],
	[2, 9, 4, 7, 5, 3, 6, 1, 8],
	[4, 9, 2, 3, 5, 7, 8, 1, 6],
	[6, 7, 2, 1, 5, 9, 8, 3, 4],
	[8, 3, 4, 1, 5, 9, 6, 7, 2]
];

const ELEMENTS = [
	"火 (Fire)", "水 (Water)", "風 (Wind)",
	"地 (Earth)", "空 (Aether)", "光 (Light)",
	"闇 (Shadow)", "雷 (Storm)", "鋼 (Metal)"
];

export default function GridPuzzle({ onSolve, isSolved }: GridPuzzleProps) {
	const [patternIndex, setPatternIndex] = useState(0);
	const [grid, setGrid] = useState<GridCell[]>([]);
	const [hintCount, setHintCount] = useState(0);

	// Constants
	const TARGET_SUM = 15;

	// Generate initial grid for a specific pattern with indexes 0, 4, 8 locked
	const generateInitialGrid = (patIdx: number): GridCell[] => {
		const pat = MAGIC_SQUARE_PATTERNS[patIdx];
		return ELEMENTS.map((elem, i) => {
			const isLocked = i === 0 || i === 4 || i === 8;
			let value = pat[i];
			if (!isLocked) {
				// Initialize with dummy conflicting values to prompt player problem solving
				const dummyVals: { [key: number]: number } = {
					1: 4,
					2: 4,
					3: 9,
					5: 1,
					6: 1,
					7: 1
				};
				value = dummyVals[i] || 1;
			}
			return {
				value,
				isLocked,
				element: elem,
				color: ""
			};
		});
	};

	// Select a randomized pattern on initial boot
	const shufflePattern = () => {
		const randIdx = Math.floor(Math.random() * MAGIC_SQUARE_PATTERNS.length);
		setPatternIndex(randIdx);
		setGrid(generateInitialGrid(randIdx));
		setHintCount(0);
	};

	useEffect(() => {
		shufflePattern();
	}, []);

	// Calculates sums of the active grid
	const getRowSum = (r: number) => {
		if (grid.length === 0) return 0;
		return grid[r * 3].value + grid[r * 3 + 1].value + grid[r * 3 + 2].value;
	};

	const getColSum = (c: number) => {
		if (grid.length === 0) return 0;
		return grid[c].value + grid[c + 3].value + grid[c + 6].value;
	};

	const getDiag1Sum = () => {
		if (grid.length === 0) return 0;
		return grid[0].value + grid[4].value + grid[8].value;
	};

	const getDiag2Sum = () => {
		if (grid.length === 0) return 0;
		return grid[2].value + grid[4].value + grid[6].value;
	};

	// Detects if there are duplicates from 1 to 9
	const getDuplicates = () => {
		if (grid.length === 0) return Array(9).fill(false);
		const counts: { [key: number]: number } = {};
		grid.forEach(cell => {
			counts[cell.value] = (counts[cell.value] || 0) + 1;
		});

		return grid.map(cell => counts[cell.value] > 1);
	};

	const duplicates = getDuplicates();

	useEffect(() => {
		if (grid.length === 0) return;

		// Check if everything matches the requirements
		const r0 = getRowSum(0) === TARGET_SUM;
		const r1 = getRowSum(1) === TARGET_SUM;
		const r2 = getRowSum(2) === TARGET_SUM;

		const c0 = getColSum(0) === TARGET_SUM;
		const c1 = getColSum(1) === TARGET_SUM;
		const c2 = getColSum(2) === TARGET_SUM;

		const d1 = getDiag1Sum() === TARGET_SUM;
		const d2 = getDiag2Sum() === TARGET_SUM;

		// Must be unique numbers 1 to 9
		const values = grid.map(c => c.value);
		const uniqueCount = new Set(values).size;
		const allValidNumbers = values.every(v => v >= 1 && v <= 9);

		if (r0 && r1 && r2 && c0 && c1 && c2 && d1 && d2 && uniqueCount === 9 && allValidNumbers && !isSolved) {
			audio.playUnlock();
			onSolve();
		}
	}, [grid, isSolved, onSolve]);

	const cycleCellValue = (index: number) => {
		if (isSolved || grid[index].isLocked) return;
		audio.playTick();

		setGrid((prev) => {
			const next = [...prev];
			// Cycle from 1 to 9
			let newVal = next[index].value + 1;
			if (newVal > 9) newVal = 1;

			next[index] = {
				...next[index],
				value: newVal
			};
			return next;
		});
	};

	const resetGrid = () => {
		if (isSolved) return;
		audio.playTick();
		setGrid(generateInitialGrid(patternIndex));
	};

	const autoSolve = () => {
		audio.playUnlock();
		const pat = MAGIC_SQUARE_PATTERNS[patternIndex];
		setGrid(ELEMENTS.map((elem, i) => ({
			value: pat[i],
			isLocked: i === 0 || i === 4 || i === 8,
			element: elem,
			color: ""
		})));
	};

	const currentPat = MAGIC_SQUARE_PATTERNS[patternIndex];

	const hints = [
		`すでにアンカーとして、左上(${currentPat ? currentPat[0] : 8})、中央(${currentPat ? currentPat[4] : 5})、右下(${currentPat ? currentPat[8] : 2})が固定されている。この斜めのラインはすでに合計15で満たされている。`,
		"魔方陣のルールとして、1から9までの数字が重複なく一度ずつ登場しなければならない。青文字や赤・黒文字の数字をクリックして重複を消そう。",
		`完成形のヒント: 最上段（一列目）は ${currentPat ? currentPat[0] : 8}, ${currentPat ? currentPat[1] : 1}, ${currentPat ? currentPat[2] : 6} となり、中段は ${currentPat ? currentPat[3] : 3}, ${currentPat ? currentPat[4] : 5}, ${currentPat ? currentPat[5] : 7}、下段は ${currentPat ? currentPat[6] : 4}, ${currentPat ? currentPat[7] : 9}, ${currentPat ? currentPat[8] : 2} となるように調整してみよう。`
	];

	if (grid.length === 0) {
		return <div className="text-center py-6 text-slate-550 font-mono text-xs">元素の調律盤を召喚中...</div>;
	}

	return (
		<div className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-xs w-full" id="grid-puzzle">
			<div className="text-center mb-3">
				<span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-lg">
					STAGE 2 (再起動で固定配置が変化！)
				</span>
				<h4 className="text-sm font-bold text-slate-800 mt-2 font-sans">弐 of 試練：元素の魔方陣</h4>
				<p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					3×3の魔石の数値を調整し、<strong className="text-slate-800 font-bold">縦・横・斜めの各列の合計がすべて15</strong>、かつ<strong className="text-slate-800 font-bold">1〜9の重複のない構成</strong>に調和させよ。
				</p>
			</div>

			{/* Grid Display Area */}
			<div className="flex flex-col items-center justify-center gap-6 my-3 w-full max-w-md">
				{/* Magic Square Board with sums around it */}
				<div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner flex flex-col justify-center items-center">

					<div className="grid grid-cols-4 gap-2 justify-center items-center">
						{/* Row 0, 1, 2 Cells & sum indicators */}
						{[...Array(3)].map((_, r) => (
							<React.Fragment key={r}>
								{[...Array(3)].map((_, c) => {
									const idx = r * 3 + c;
									const cell = grid[idx];
									const isDupe = duplicates[idx] && !cell.isLocked;
									return (
										<div
											key={c}
											onClick={() => cycleCellValue(idx)}
											className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer select-none relative ${
												cell.isLocked
													? 'border-slate-350 bg-slate-200 cursor-not-allowed text-slate-700 font-bold'
													: isDupe
													? 'border-red-400 bg-red-50 text-red-700 animate-pulse'
													: 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
											}`}
										>
											<span className="text-[9px] text-slate-450 absolute top-1 font-mono">{cell.element.split(" ")[0]}</span>
											<span className="text-base font-bold font-mono pt-2">{cell.value}</span>

											{cell.isLocked && (
												<div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-500 shadow" />
											)}
										</div>
									);
								})}
								{/* Row Sum display */}
								<div className={`w-10 text-center font-mono text-xs font-bold px-1 py-1.5 rounded-lg border ${
									getRowSum(r) === TARGET_SUM ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-400 bg-slate-100 border-slate-200/60'
								}`}>
									{getRowSum(r)}
								</div>
							</React.Fragment>
						))}

						{/* Column Sums Row */}
						{[0, 1, 2].map((c) => (
							<div
								key={c}
								className={`text-center font-mono text-xs font-bold py-1 rounded-lg border ${
									getColSum(c) === TARGET_SUM ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-400 bg-slate-100 border-slate-200/60'
								}`}
							>
								{getColSum(c)}
							</div>
						))}

						{/* Diag Indicator cells */}
						<div className="text-center font-mono text-[9px] text-slate-400 font-semibold border border-transparent">
							{getDiag1Sum() === TARGET_SUM ? "✓15" : `斜:${getDiag1Sum()}`}
						</div>
					</div>

					{/* Diag 2 sum display */}
					<div className="absolute -bottom-1 -left-1 text-[9px] font-mono p-1 bg-white border border-slate-200 rounded-lg text-slate-500 font-medium">
						斜角2: {getDiag2Sum() === TARGET_SUM ? "✓(15)" : getDiag2Sum()}
					</div>
				</div>
			</div>

			{/* Constraints Tracker */}
			<div className="w-full max-w-sm flex items-center justify-between text-xs font-mono bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 mb-3 text-slate-650">
				<span className="flex items-center space-x-1.5">
					<span className={`w-2 h-2 rounded-full ${new Set(grid.map(c => c.value)).size === 9 ? 'bg-emerald-500' : 'bg-red-500'}`} />
					<span className="font-semibold text-slate-700 text-[11px]">固有魔力 (1〜9)</span>
				</span>

				<span className="flex items-center space-x-1.5">
					<span className={`w-2 h-2 rounded-full ${[getRowSum(0), getRowSum(1), getRowSum(2), getColSum(0), getColSum(1), getColSum(2)].every(v => v === 15) ? 'bg-emerald-500' : 'bg-red-500'}`} />
					<span className="font-semibold text-slate-700 text-[11px]">十字均衡 (15)</span>
				</span>

				<div className="flex space-x-1">
					<button
						onClick={resetGrid}
						disabled={isSolved}
						className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 rounded-lg text-slate-700 font-bold transition-all cursor-pointer flex items-center space-x-1"
					>
						<RefreshCw className="w-2.5 h-2.5" />
						<span>リセット</span>
					</button>
					<button
						onClick={shufflePattern}
						disabled={isSolved}
						className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-35 rounded-lg text-slate-700 font-bold transition-all cursor-pointer flex items-center space-x-1"
						title="魔方陣を別のアンカーパターンに変更します"
					>
						<RefreshCw className="w-2.5 h-2.5" />
						<span>他パターン</span>
					</button>
				</div>
			</div>

			{/* Dynamic Hint System */}
			<div className="w-full max-w-sm mt-1 pt-3 border-t border-slate-200 flex flex-col items-center">
				{!isSolved ? (
					<div className="w-full text-center">
						{hintCount === 0 ? (
							<button
								onClick={() => setHintCount(1)}
								className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium cursor-pointer"
							>
								<HelpCircle className="w-3.5 h-3.5" />
								<span>魔石の配置を占う (ヒント 1/3)</span>
							</button>
						) : (
							<div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 relative">
								<p className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
									<span>💡 占術の手がかり ({hintCount}/3):</span>
								</p>
								<p className="leading-relaxed">{hints[hintCount - 1]}</p>
								{hintCount < 3 && (
									<button
										onClick={() => setHintCount(hintCount + 1)}
										className="mt-2 text-[10px] text-white bg-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-700 transition-all cursor-pointer"
									>
										さらなる手がかりを見る
									</button>
								)}
							</div>
						)}
					</div>
				) : (
					<p className="text-xs text-emerald-750 font-bold flex items-center space-x-1 animate-pulse bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
						<Check className="w-4 h-4" />
						<span>完璧なる元素の調和。魔力の均衡が成立しました。</span>
					</p>
				)}
			</div>

			{/* Secret trigger */}
			<div onClick={autoSolve} className="opacity-0 hover:opacity-10 w-4 h-4 self-end -mt-4 cursor-pointer text-[8px] text-slate-350">.</div>
		</div>
	);
}
