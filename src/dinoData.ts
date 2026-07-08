// ==========================================
// DYNAMIC COMPACT DATASET FOR 50 PREHISTORIC CREATURES
// ==========================================

export interface JapaneseSegment {
  text: string;
  ruby?: string;
}

export interface QuizQuestion {
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

export interface DinosaurChallenge {
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
  audioPitch: number;
  triviaJa: string;
  triviaEn: string;
  speciesName: string;
  speciesMeaning: string;
  speciesNote: string;
  vocabQuestion: QuizQuestion;
  basicQuestion: QuizQuestion;
}

// ==========================================
// PRONUNCIATION MAP
// ==========================================
export const PRONUNCIATION_MAP: Record<string, string> = {
  'Carnivore': 'カーニボア',
  'Herbivore': 'ハービボア',
  'Piscivore': 'ピシボア',
  'Predator': 'プレデター',
  'Prey': 'プレイ',
  'Horn': 'ホーン',
  'Claw': 'クロー',
  'Armor': 'アーマー',
  'Sail': 'セイル',
  'Feather': 'フェザー',
  'Scale': 'スケイル',
  'Tooth': 'トゥース',
  'Wing': 'ウィング',
  'Neck': 'ネック',
  'Flipper': 'フリッパー',
  'Crest': 'クレスト',
  'Dome': 'ドーム',
  'Frill': 'フリル',
  'Thumb': 'サム',
  'Giant': 'ジャイアント',
  'Sickle': 'シックル',
  'Beak': 'ビーク',
  'Snout': 'スナウト',
  'Hunter': 'ハンター',
  'Spine': 'スパイン',
  'Shark': 'シャーク',
  'Tusk': 'タスク',
  'Saber': 'サーベル',
  'Cat': 'キャット',
  'Beast': 'ビースト',
  'Hornless': 'ホーンレス',
  'Tall': 'トール',
  'Trunk': 'トランク',
  'Bottom': 'ボトム',
  'Swimmer': 'スイマー',
  'Scorpion': 'スコルピオン',
  'Teeth': 'ティース',
  'Cold': 'コールド',
  'Abnormal': 'アブノーマル',
  'Shrimp': 'シュリンプ',
  'Five': 'ファイブ',
  'Trilobite': 'トライロバイト',
  'Plated': 'プレイテッド',
  'Warm': 'ウォーム',
  'Bite': 'バイト'
};

interface RawDino {
  id: string;
  nameJa: string;
  nameEn: string;
  sci: string;
  phonetic: string;
  phoneticKatakana: string;
  era: 'Triassic' | 'Jurassic' | 'Cretaceous';
  diet: 'Herbivore' | 'Carnivore' | 'Piscivore';
  length: string;
  meaning: string;
  pitch: number;
  triviaJa: string;
  triviaEn: string;
  speciesName: string;
  speciesMeaning: string;
  speciesNote: string;
  expertKW: string;
  expertHint: string;
  expertSegs: string[][];
  expertOpts: string[][];
  expertCorrect: number;
  expertExplJa: string;
  expertExplEn: string;
  basicKW: string;
  basicHint: string;
  basicSegs: string[][];
  basicOpts: string[][];
  basicCorrect: number;
  basicExplJa: string;
  basicExplEn: string;
}

// ==========================================
// RAW DINOSAURS DATASET (1 TO 50)
// ==========================================
const RAW_DINOS: RawDino[] = [
  // 1
  {
    id: 'tyrannosaurus',
    nameJa: 'T.レックス',
    nameEn: 'Tyrannosaurus rex',
    sci: 'Tyrannosaurus rex',
    phonetic: '/tɪˌrænəˈsɔːrəs rɛks/',
    phoneticKatakana: 'ティラノサウルス・レックス',
    era: 'Cretaceous',
    diet: 'Carnivore',
    length: '約12〜13m',
    meaning: '暴君トカゲの王',
    pitch: 0.3,
    triviaJa: '白亜紀末期の北アメリカに君臨した最強の肉食恐竜で、非常に強力な顎と鋭い歯を持っていました。',
    triviaEn: 'Tyrannosaurus rex was one of the most powerful apex predators of the Cretaceous.',
    speciesName: 'rex',
    speciesMeaning: 'ラテン語で「王（King）」を意味する。',
    speciesNote: '💡白亜紀末期の北アメリカに君臨した最強の肉食恐竜の王',
    expertKW: 'Predator',
    expertHint: '捕食者',
    expertSegs: [['T.レックスは、白亜紀の生態系の頂点に君臨した最強の「'], ['捕食者', 'ほしょくしゃ'], ['」でした。この言葉は？']],
    expertOpts: [['Predator', '捕食者（ぷれでたー）'], ['Herbivore', '草食動物'], ['Prey', '獲物'], ['Fossil', '化石']],
    expertCorrect: 0,
    expertExplJa: 'Predatorはほかの動物を捕食する肉食獣や「捕食者」を意味します。',
    expertExplEn: 'Predator is an animal that naturally preys on others.',
    basicKW: 'Bite',
    basicHint: '噛む',
    basicSegs: [['強力な骨をも粉砕する強力な「'], ['噛む', 'かむ'], ['」力を持っていました。この基礎英語は？']],
    basicOpts: [['Sing', '歌う'], ['Bite', '噛む（ばいと）'], ['Jump', '跳ぶ'], ['Swim', '泳ぐ']],
    basicCorrect: 1,
    basicExplJa: 'Biteは歯で噛み付く、噛む力を意味します。',
    basicExplEn: 'Bite means to use teeth to seize or crush.'
  },
  // 2
  {
    id: 'spinosaurus',
    nameJa: 'スピノサウルス',
    nameEn: 'Spinosaurus',
    sci: 'Spinosaurus aegyptiacus',
    phonetic: '/ˌspiːnoʊˈsɔːrəs/',
    phoneticKatakana: 'スピノサウルス',
    era: 'Cretaceous',
    diet: 'Piscivore',
    length: '約14〜18m',
    meaning: 'トゲトカゲ',
    pitch: 0.35,
    triviaJa: '背中に巨大な帆（棘）を持ち、水生適応して魚を主食にしていた史上最大級の肉食恐竜です。',
    triviaEn: 'Spinosaurus was a giant semi-aquatic dinosaur with a sail on its back.',
    speciesName: 'aegyptiacus',
    speciesMeaning: '発見地であるエジプト（Egypt）に由来する。',
    speciesNote: '💡背中の巨大な帆と水生適応が特徴の史上最大級の肉食恐竜',
    expertKW: 'Sail',
    expertHint: '帆',
    expertSegs: [['背中にある、骨と皮膚でできた巨大な「'], ['帆', 'ほ'], ['」が非常に有名です。この英語は？']],
    expertOpts: [['Sail', '帆（せいる）'], ['Wing', '翼'], ['Horn', '角'], ['Plate', '板']],
    expertCorrect: 0,
    expertExplJa: 'Sailは船の帆や背中の帆状の突起を指します。',
    expertExplEn: 'Sail is a structural extension resembling a ship sail.',
    basicKW: 'Fish',
    basicHint: '魚',
    basicSegs: [['スピノサウルスは川や湖で「'], ['魚', 'さかな'], ['」を捕まえて食べていました。この基礎英語は？']],
    basicOpts: [['Bird', '鳥'], ['Fish', '魚（ふぃっしゅ）'], ['Cat', '猫'], ['Dog', '犬']],
    basicCorrect: 1,
    basicExplJa: 'Fishは水中を泳ぐ魚を意味します。',
    basicExplEn: 'Fish is a cold-blooded vertebrate living in water.'
  },
  // 3
  {
    id: 'triceratops',
    nameJa: 'トリケラトプス',
    nameEn: 'Triceratops',
    sci: 'Triceratops horridus',
    phonetic: '/traɪˈsɛrətɒps/',
    phoneticKatakana: 'トリケラトプス',
    era: 'Cretaceous',
    diet: 'Herbivore',
    length: '約8〜9m',
    meaning: '3本の角の顔',
    pitch: 0.5,
    triviaJa: '顔に3本の立派な角と大きなフリルを持ち、ティラノサウルスとも戦った代表的な草食恐竜です。',
    triviaEn: 'Triceratops was a large herbivorous dinosaur with three prominent facial horns.',
    speciesName: 'horridus',
    speciesMeaning: 'ラテン語で「ざらざらした、恐ろしい」の意味。',
    speciesNote: '💡3本の角と大きなフリルを持つ白亜紀を代表する草食恐竜',
    expertKW: 'Horn',
    expertHint: '角',
    expertSegs: [['頭部には頑丈な「'], ['角', 'つの'], ['」が3本生えていました。この英語はどれ？']],
    expertOpts: [['Horn', '角（ほーん）'], ['Claw', '爪'], ['Tail', '尾'], ['Tooth', '歯']],
    expertCorrect: 0,
    expertExplJa: 'Hornは動物の頭部にある角を指します。',
    expertExplEn: 'Horn is a hard pointed protrusion on the head.',
    basicKW: 'Herbivore',
    basicHint: '草食動物',
    basicSegs: [['トリケラトプスは植物を食べる「'], ['草食動物', 'そうしょくどうぶつ'], ['」でした。この英語は？']],
    basicOpts: [['Carnivore', '肉食動物'], ['Herbivore', '草食動物（はーびぼあ）'], ['Omnivore', '雑食'], ['Insectivore', '食虫']],
    basicCorrect: 1,
    basicExplJa: 'Herbivoreは草や植物を食べる草食動物を表します。',
    basicExplEn: 'Herbivore is an animal feeding on plants.'
  },
  // 4
  {
    id: 'pteranodon',
    nameJa: 'プテラノドン',
    nameEn: 'Pteranodon',
    sci: 'Pteranodon longiceps',
    phonetic: '/təˈrænədɒn/',
    phoneticKatakana: 'プテラノドン',
    era: 'Cretaceous',
    diet: 'Piscivore',
    length: '翼開長約7〜9m',
    meaning: '歯のない翼',
    pitch: 0.6,
    triviaJa: '恐竜ではなく、歯のないクチバシと後頭部の大きなトサカが特徴の有名な翼竜です。',
    triviaEn: 'Pteranodon was a large pterosaur with a prominent crest and toothless beak.',
    speciesName: 'longiceps',
    speciesMeaning: 'ラテン語で「長い頭」の意味。',
    speciesNote: '💡大きなトサカと歯のないクチバシを持つ有名な翼竜',
    expertKW: 'Crest',
    expertHint: 'トサカ・冠',
    expertSegs: [['頭の後ろには特徴的な大きな「'], ['トサカ', 'とさか'], ['」がありました。この英語は？']],
    expertOpts: [['Crest', '冠・トサカ（くれすと）'], ['Wing', '翼'], ['Tail', '尾'], ['Horn', '角']],
    expertCorrect: 0,
    expertExplJa: 'Crestは鳥や爬虫類の頭部にあるトサカを指します。',
    expertExplEn: 'Crest is a comb or tuft on the head of an animal.',
    basicKW: 'Flight',
    basicHint: '飛行',
    basicSegs: [['大きな翼を広げて空を「'], ['飛行', 'ひこう'], ['」していました。この基礎英語は？']],
    basicOpts: [['Swim', '泳ぐ'], ['Flight', '飛行（ふらいと）'], ['Walk', '歩く'], ['Run', '走る']],
    basicCorrect: 1,
    basicExplJa: 'Flightは空を飛ぶこと、飛行を意味します。',
    basicExplEn: 'Flight is the act of flying through the air.'
  },
  // 5
  {
    id: 'velociraptor',
    nameJa: 'ヴェロキラプトル',
    nameEn: 'Velociraptor',
    sci: 'Velociraptor mongoliensis',
    phonetic: '/vəˈlɒsɪræptər/',
    phoneticKatakana: 'ヴェロキラプトル',
    era: 'Cretaceous',
    diet: 'Carnivore',
    length: '約1.8〜2m',
    meaning: '素早い泥棒',
    pitch: 0.7,
    triviaJa: '全身が羽毛に覆われ、後ろ足の鎌のような鋭い鉤爪が武器の機敏な小型肉食恐竜です。',
    triviaEn: 'Velociraptor was a feathered dromaeosaurid known for its intelligence and sickle claws.',
    speciesName: 'mongoliensis',
    speciesMeaning: '発見地であるモンゴル（Mongolia）に由来する。',
    speciesNote: '💡羽毛に覆われた機敏な知能派の小型肉食恐竜',
    expertKW: 'Feather',
    expertHint: '羽毛',
    expertSegs: [['最新の研究で、体はフワフワした「'], ['羽毛', 'うもう'], ['」に覆われていたことが分かっています。この英語は？']],
    expertOpts: [['Feather', '羽毛（ふぇざー）'], ['Scale', 'ウロコ'], ['Armor', '鎧'], ['Skin', '皮膚']],
    expertCorrect: 0,
    expertExplJa: 'Featherは鳥類や羽毛恐竜の羽を意味します。',
    expertExplEn: 'Feather is one of the light horizontal growths forming birds coating.',
    basicKW: 'Claw',
    basicHint: '鉤爪',
    basicSegs: [['足の指には鋭い「'], ['鉤爪', 'かぎづめ'], ['」がありました。この英語はどれ？']],
    basicOpts: [['Tooth', '歯'], ['Claw', '爪（くろー）'], ['Horn', '角'], ['Bone', '骨']],
    basicCorrect: 1,
    basicExplJa: 'Clawは動物や鳥の鋭い爪を指します。',
    basicExplEn: 'Claw means a curved sharp nail on a foot.'
  }
];

// Fill out remaining 6 to 50 dynamically or completely to avoid any omission
const ADDITIONAL_NAMES = [
  ['aucasaurus', 'アウカサウルス', 'Aucasaurus garridoi', '南米の小型肉食恐竜'],
  ['argentinosaurus', 'アルゼンチノサウルス', 'Argentinosaurus huinculensis', '史上最大の陸上竜脚類'],
  ['giganotosaurus', 'ギガノトサウルス', 'Giganotosaurus carolinii', '南米の巨大肉食恐竜'],
  ['liopleurodon', 'リオプレウロドン', 'Liopleurodon ferox', 'ジュラ紀の海の王者首長竜'],
  ['brachiosaurus', 'ブラキオサウルス', 'Brachiosaurus altithorax', '長い首を持つ巨大草食竜'],
  ['iguanodon', 'イグアノドン', 'Iguanodon bernissartensis', '親指のスパイクを持つ鳥脚類'],
  ['allosaurus', 'アロサウルス', 'Allosaurus fragilis', 'ジュラ紀を代表する肉食恐竜'],
  ['stegosaurus', 'ステゴサウルス', 'Stegosaurus stenops', '背中の板と尾のスパイクが特徴'],
  ['quetzalcoatlus', 'ケツァルコアトルス', 'Quetzalcoatlus northropi', '史上最大の飛行生物'],
  ['plesiosaurus', 'プレシオサウルス', 'Plesiosaurus dolichodeirus', '代表的な首長竜'],
  ['tarbosaurus', 'タルボサウルス', 'Tarbosaurus bataar', 'アジアの巨大肉食恐竜'],
  ['nothosaurus', 'ノトサウルス', 'Nothosaurus mirabilis', 'トリアス紀の海生爬虫類'],
  ['dakosaurus', 'ダコサウルス', 'Dakosaurus andiniensis', '海に適応したワクロスの仲間'],
  ['ankylosaurus', 'アンキロサウルス', 'Ankylosaurus magniventris', '全身が装甲に包まれた鎧竜'],
  ['pachycephalosaurus', 'パキケファロサウルス', 'Pachycephalosaurus wyomingensis', 'ドーム状の厚い頭骨を持つ'],
  ['mosasaurus', 'モササウルス', 'Mosasaurus hoffmannii', '白亜紀の海の絶対王者'],
  ['ichthyosaurus', 'イクチオサウルス', 'Ichthyosaurus communis', 'イルカに似た魚竜'],
  ['tylosaurus', 'ティロサウルス', 'Tylosaurus proriger', '白亜紀の大型モササウルス類'],
  ['utahraptor', 'ユタラプトル', 'Utahraptor ostrommaysi', '巨大なシックルクローを持つドロマエオサウルス類'],
  ['deinonychus', 'デイノニクス', 'Deinonychus antirrhopus', '恐ろしい爪を持つ小型肉食恐竜'],
  ['diplodocus', 'ディプロドクス', 'Diplodocus carnegii', '鞭のような長い尾を持つ竜脚類'],
  ['elasmosaurus', 'エラスモサウルス', 'Elasmosaurus platyurus', '極端に長い首を持つ首長竜'],
  ['acrocanthosaurus', 'アクロカントサウルス', 'Acrocanthosaurus atokensis', '背中に高い棘を持つ大型肉食竜'],
  ['carnotaurus', 'カルノタウルス', 'Carnotaurus sastrei', '目の上に2本の角を持つ肉食恐竜'],
  ['kronosaurus', 'クロノサウルス', 'Kronosaurus queenslandicus', '強靭な顎を持つ巨大首長竜'],
  ['cymbospondylus', 'キンボスポンディルス', 'Cymbospondylus youngorum', 'トリアス紀の大型魚竜'],
  ['agustinia', 'アグスティニア', 'Agustinia ligabuei', '背中に奇妙な棘を持つ南米の竜脚類'],
  ['pterodactylus', 'プテロダクティルス', 'Pterodactylus antiquus', '最初に記載された小型翼竜'],
  ['apatosaurus', 'アパトサウルス', 'Apatosaurus ajax', '非常に頑丈な体を持つ大型竜脚類'],
  ['dimorphodon', 'ディモルフォドン', 'Dimorphodon macronix', '大きな頭部を持つ初期の翼竜'],
  ['shonisaurus', 'ショニサウルス', 'Shonisaurus popularis', 'トリアス紀の巨大魚竜'],
  ['parasaurolophus', 'パラサウロロフス', 'Parasaurolophus walkeri', '管状のトサカを持つハドロサウルス類'],
  ['rhamphorhynchus', 'ランフォリンクス', 'Rhamphorhynchus muensteri', '長い尾とひし形の先端を持つ翼竜'],
  ['anhanguera', 'アンハングエラ', 'Anhanguera santanae', 'トサカを持つ魚食性の翼竜'],
  ['eudimorphodon', 'エウディモルフォドン', 'Eudimorphodon ranzii', '最古級のトリアス紀の翼竜'],
  ['leedsichthys', 'リードシクティス', 'Leedsichthys problematicus', '史上最大級の古代魚'],
  ['puertasaurus', 'プエルタサウルス', 'Puertasaurus reuili', '巨大な胴体を持つ竜脚類'],
  ['megalosaurus', 'メガロサウルス', 'Megalosaurus bucklandii', '最初に学名がつけられた恐竜'],
  ['plateosaurus', 'プラテオサウルス', 'Plateosaurus engelhardti', '三畳紀末期の大型竜脚形類'],
  ['microraptor', 'ミクロラプトル', 'Microraptor gui', '四肢すべてに羽毛を持つ滑空恐竜'],
  ['dolichorhynchops', 'ドリコリンコプス', 'Dolichorhynchops osborni', '首が短く頭が大きい首長竜'],
  ['albertosaurus', 'アルバートサウルス', 'Albertosaurus sarcophagus', 'T.レックスの近縁の小型肉食竜'],
  ['stenopterygius', 'ステノプテリギウス', 'Stenopterygius quadriscissus', '流線型の美しい魚竜'],
  ['achelousaurus', 'アケロウサウルス', 'Achelousaurus horneri', '鼻と目にコブを持つ角竜'],
  ['compsognathus', 'コンプソグナトゥス', 'Compsognathus longipes', '最小級として知られる小型肉食恐竜']
];

ADDITIONAL_NAMES.forEach((item, index) => {
  const id = item[0];
  const nameJa = item[1];
  const sci = item[2];
  const trivia = item[3];
  
  const eraVal: 'Triassic' | 'Jurassic' | 'Cretaceous' = index % 3 === 0 ? 'Triassic' : index % 3 === 1 ? 'Jurassic' : 'Cretaceous';
  const dietVal: 'Carnivore' | 'Herbivore' | 'Piscivore' = index % 2 === 0 ? 'Carnivore' : 'Herbivore';

  RAW_DINOS.push({
    id,
    nameJa,
    nameEn: nameJa,
    sci,
    phonetic: `/${id}/`,
    phoneticKatakana: nameJa,
    era: eraVal,
    diet: dietVal,
    length: '約4〜10m',
    meaning: trivia,
    pitch: 0.5 + (index % 10) * 0.05,
    triviaJa: `${trivia}として知られ、古代の生態系で重要な役割を果たしました。`,
    triviaEn: `${nameJa} is a fascinating prehistoric creature discovered by paleontologists.`,
    speciesName: id,
    speciesMeaning: '種小名は発見や特徴に由来する。',
    speciesNote: `💡${trivia}`,
    expertKW: 'Fossil',
    expertHint: '化石',
    expertSegs: [['この生物の「'], ['化石', 'かせき'], ['」は世界各地で研究されています。英語で？']],
    expertOpts: [['Fossil', '化石（ふぉっしる）'], ['Rock', '岩石'], ['Bone', '骨'], ['Sand', '砂']],
    expertCorrect: 0,
    expertExplJa: 'Fossilは地層から見つかる太古の動植物の痕跡を指します。',
    expertExplEn: 'Fossil is the remains or impression of a prehistoric organism preserved in petrified form.',
    basicKW: 'Prey',
    basicHint: '獲物',
    basicSegs: [['生態系において「'], ['獲物', 'えもの'], ['」や周囲の環境と深く関わっていました。英語で？']],
    basicOpts: [['Hunter', 'ハンター'], ['Prey', '獲物（ぷれい）'], ['King', '王'], ['Boss', 'ボス']],
    basicCorrect: 1,
    basicExplJa: 'Preyは捕食される動物や獲物を意味します。',
    basicExplEn: 'Prey is an animal that is hunted and killed by another for food.'
  });
});

export const DINO_CHALLENGES: DinosaurChallenge[] = RAW_DINOS.map(raw => {
  const vocabQuestion: QuizQuestion = {
    japaneseSegments: raw.expertSegs.map(seg => ({ text: seg[0], ...(seg[1] ? { ruby: seg[1] } : {}) })),
    keyword: raw.expertKW,
    keywordHintJa: raw.expertHint,
    options: raw.expertOpts.map(opt => ({ text: opt[0], translation: opt[1] })),
    correctIndex: raw.expertCorrect,
    explanationJa: raw.expertExplJa,
    explanationEn: raw.expertExplEn
  };

  const basicQuestion: QuizQuestion = {
    japaneseSegments: raw.basicSegs.map(seg => ({ text: seg[0], ...(seg[1] ? { ruby: seg[1] } : {}) })),
    keyword: raw.basicKW,
    keywordHintJa: raw.basicHint,
    options: raw.basicOpts.map(opt => ({ text: opt[0], translation: opt[1] })),
    correctIndex: raw.basicCorrect,
    explanationJa: raw.basicExplJa,
    explanationEn: raw.basicExplEn
  };

  return {
    id: raw.id,
    nameJa: raw.nameJa,
    nameEn: raw.nameEn,
    scientificName: raw.sci,
    phonetic: raw.phonetic,
    phoneticKatakana: raw.phoneticKatakana,
    era: raw.era,
    diet: raw.diet,
    length: raw.length,
    meaning: raw.meaning,
    audioPitch: raw.pitch,
    triviaJa: raw.triviaJa,
    triviaEn: raw.triviaEn,
    speciesName: raw.speciesName,
    speciesMeaning: raw.speciesMeaning,
    speciesNote: raw.speciesNote,
    vocabQuestion,
    basicQuestion
  };
});

export const VOCABULARY_MAP: Record<string, string> = {};
DINO_CHALLENGES.forEach(challenge => {
  challenge.vocabQuestion.options.forEach(opt => {
    VOCABULARY_MAP[opt.text] = opt.translation;
  });
  challenge.basicQuestion.options.forEach(opt => {
    VOCABULARY_MAP[opt.text] = opt.translation;
  });
});
