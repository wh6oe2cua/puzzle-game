import React, { useState } from 'react';
import { BookOpen, Sparkles, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JournalProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
  solvedStages: boolean[];
}

export default function Journal({ currentStage, onSelectStage, solvedStages }: JournalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const pages = [
    {
      id: 0,
      title: "からくり魔導書の起源",
      subtitle: "第一章：継承されし謎",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4 leading-relaxed">
            旅人よ、この書の封印を解きし者よ。この箱は古代のアカデミーにより鍛造された『元素の機密箱』。
            中には未知の生命の核、あるいは世界の心理を写し取った星片が眠ると言われている。
          </p>
          <p className="indent-4 leading-relaxed">
            箱を開くには、記述された<span className="text-slate-900 font-semibold underline decoration-slate-350 decoration-2 underline-offset-2">5つの仕掛け</span>をすべて調律し、エネルギーの巡りを正常に戻さねばならない。
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-500 text-xs italic">
            「鍵は外にあるのではない。汝の洞察と、内に隠された調和そのものが鍵となるのだ。」
          </div>
          <div className="pt-2 text-right">
            <span className="text-xs text-slate-400 font-mono">―― 賢者アルベルトの記録より</span>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "壱の試練：魔導リングの整合",
      subtitle: "第二章：天空の共軸軌道",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4">
            「天体は互いに干渉し、一つの歩みが他方の軌道をも揺るがす。」
          </p>
          <p>
            外・中・内の3本のリングには古代ルーンが刻まれている。これらを中央上部の<span className="text-slate-900 font-bold underline decoration-slate-350 decoration-2 underline-offset-2">「黄金の指針（▲マーク）」</span>に正しく整列させよ。
          </p>
          <p className="text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            【観測メモ】<br />
            ・<strong className="text-slate-800">外輪</strong>を回転させると、干渉により<strong className="text-slate-800 font-medium">中輪</strong>も同じ方向に少し連動する。<br />
            ・<strong className="text-slate-800">中輪</strong>を回すと、<strong className="text-slate-800 font-medium">内輪</strong>が逆方向に少し連動する。<br />
            ・<strong className="text-slate-800">内輪</strong>は干渉を受けず、単体で正確に調整できる。
          </p>
          <div className="border-t border-slate-150 pt-2 text-xs text-slate-500">
            <strong>★ 推奨される手順:</strong><br />
            まず「外」を合わせ、次に連動を考慮しながら「中」を合わせ、最後に干渉を受けない「内」で調律を完了させよ。
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "弐の試練：元素の魔方陣",
      subtitle: "第三章：四大元素の均衡",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4">
            「万物は火・水・風・地の四元素より成り、それらが等しく調和したとき、完全なる円環が顕現する。」
          </p>
          <p>
            3×3の魔石盤に、それぞれの力を宿すクリスタルが埋め込まれている。
            縦の列、横の行、そして斜めのラインの魔力の合計値が、すべて<span className="text-slate-900 font-bold underline decoration-slate-350 decoration-2 underline-offset-2">『15』</span>という聖数に等しくなるよう、各クリスタルをクリックして魔力を調整せよ。
          </p>
          <p className="text-xs text-slate-600 border border-slate-200/80 bg-slate-50 p-2.5 rounded-lg">
            <strong>賢者の公式：</strong><br />
            どのマスも「1から9」の異なる魔力量(数字)が割り当てられる。<br />
            現在、いくつかの魔石は古びて動かなくなっている。青い文字の固定値（初期配置）を基に、すべてのライン（連なる3マス）を『15』に再構成せよ。
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: "参の試練：光学の結晶 (ギリギリの光路)",
      subtitle: "第四章：反射する真理の幾何学",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4">
            「複雑にまばら配置された障害物の隙間をかすめるように、光を正確に直角に配置せよ。一切の甘えや一直線な抜け道は、古代の封印を解くことはない。」
          </p>
          <p>
            左上の<span className="text-indigo-600 font-semibold">発光コア(レーザー源)</span>から放たれた魔光を、右下の<span className="text-emerald-600 font-semibold">受信クリスタル(プリズム)</span>まで正確に導け。
          </p>
          <p className="text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            ・マスをクリックすると、配置された<strong className="text-slate-800 font-medium">両面反射プリズム ( 傾き: / または \ )</strong> を回転・変更できる。<br />
            ・光は鏡で直角に曲がる。格子外に出たり、障害物に当たると光は遮断される。<br />
            ・一発で直進させないための絶妙なお邪魔ブロックを避けるため、<strong className="text-slate-900 font-bold">合計5枚の鏡すべて</strong>を正しい向きと角度で設置し、細い隙間を縫うように光子共鳴ルートを築き上げよ。
          </p>
        </div>
      )
    },
    {
      id: 4,
      title: "四の試練：魔力波形の調和",
      subtitle: "第五章：共鳴のエーテル波形",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4">
            「混ざり合うエーテルの波は、強さ、細かさ、そして左右の位置、これら三柱の合一によって真の調和を迎える。」
          </p>
          <p>
            赤い波動（古代魔導純正波）に対して、3つの魔導ノブを用いて、自らの青い調和波動を<span className="text-slate-900 font-bold underline decoration-slate-350 decoration-2 underline-offset-2">完全に重ね合わせよ。</span>
          </p>
          <p className="text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            【調律パラメーター】<br />
            ・<strong className="text-slate-800">1. 魔力強度 (振幅)</strong>: 波の高さを伸縮させます。<br />
            ・<strong className="text-slate-800">2. 魔力密度 (周波数)</strong>: 波の細かさ・波長を変更します。<br />
            ・<strong className="text-slate-800">3. 魔力位相 (位相)</strong>: 波の左右のズレ位置を調整します。<br />
            ※ 調整により<strong className="text-slate-800">同調率が 95% 以上</strong>に達したとき、右下のエネルギー転写システムから「共鳴を励起する」ことが可能になり、封印刻印が解放されます。
          </p>
        </div>
      )
    },
    {
      id: 5,
      title: "五の試練：暗号ダイアルの解除",
      subtitle: "第六章：失われた始原の言葉",
      content: (
        <div className="space-y-3 text-slate-600 leading-relaxed font-sans text-xs md:text-sm">
          <p className="indent-4">
            「古代の扉を開く言葉は、常に光と共にあり。語り継がれし文字盤は、3つの星の傾きを以て逆転する。」
          </p>
          <p>
            羊皮紙に、見たこともない奇妙な記号（古代ルーン）で刻まれた謎の言葉がある。
            中央の<strong className="text-slate-800 font-bold">デコーダーダイアル</strong>を回して、このシンボルの意味を現代語（カタカナ）に写し返せ。
          </p>
          <p className="text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
            【解読の手法】<br />
            ・羊皮紙のルーン記号を、デコーダーの「外側シンボル」に見出す。<br />
            ・ダイアル自体の目盛りは<strong className="text-slate-800">「3コマ時計回りに回した（オフセット 3）」</strong>状態が正しい古代の対応関係だ。<br />
            ・その時の「内側」に対応するカタカナを順に読み並べることで、5文字のキーワードが浮かび上がる。<br />
            ・導き出した答えを、入力機に打ち込んで決定せよ。
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden h-full flex flex-col" id="journal-root">
      {/* Design elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-100 rounded-full blur-2xl pointer-events-none" />
      
      {/* Journal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-slate-800 animate-pulse" />
          <h2 className="text-base font-bold font-sans text-slate-900 tracking-tight">
            古の魔導書：解読手帳
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-all font-mono"
        >
          {isOpen ? "閉じる" : "開く"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col space-y-3"
          >
            {/* Nav Index tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onSelectStage(page.id)}
                  className={`relative text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1 border ${
                    currentStage === page.id
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${currentStage === page.id ? 'text-slate-300 fill-slate-300/20' : 'text-slate-400'}`} />
                  <span>{page.id === 0 ? "叙説" : `試練${page.id}`}</span>
                  
                  {page.id > 0 && solvedStages[page.id - 1] && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                  )}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl relative min-h-[220px] max-h-[380px] md:max-h-none shadow-inner">
              <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1 font-semibold">
                {pages[currentStage].subtitle}
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight mb-3 flex items-center justify-between border-b border-slate-150 pb-2">
                <span>{pages[currentStage].title}</span>
                {currentStage > 0 && solvedStages[currentStage - 1] && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse font-medium">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>調律完了</span>
                  </span>
                )}
              </h3>
              
              {pages[currentStage].content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 cursor-pointer" onClick={() => setIsOpen(true)}>
          <BookOpen className="w-12 h-12 mb-2 text-slate-300 animate-bounce" />
          <p className="text-xs">クリックして魔導書を開き、ヒントや試練の手がかりを読む</p>
        </div>
      )}
    </div>
  );
}
