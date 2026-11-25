import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hidden test account (from original seed)
  const testHash = await bcrypt.hash('sSaBAha89#', 10);
  await prisma.user.upsert({
    where: { email: 'abacus-845b1b8e@example.com' },
    update: {},
    create: {
      email: 'abacus-845b1b8e@example.com',
      name: 'Test Admin',
      password: testHash,
      role: 'admin',
    },
  });

  // Main admin account
  const adminHash = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gadgetpress.com' },
    update: {},
    create: {
      email: 'admin@gadgetpress.com',
      name: 'GadgetPress 管理者',
      password: adminHash,
      role: 'admin',
    },
  });

  const articles = [
    {
      id: 1,
      title: 'MacBook Pro 14インチ M3 Pro レビュー',
      category: 'PC',
      thumbnail: '/images/articles/macbook-pro-14.jpg',
      score: 4.8,
      author: '高橋 健太（チーフエディター）',
      priceRange: '¥328,800〜',
      summary:
        'Apple最新のM3 Proチップを搭載したMacBook Pro 14インチ。圧倒的なパフォーマンスと美しいLiquid Retina XDRディスプレイで、クリエイティブワークに最適な一台です。',
      content: `## MacBook Pro 14インチ M3 Pro 実機徹底レビュー

Appleのフラッグシップラップトップ、MacBook Pro 14インチ（M3 Proモデル）を3週間にわたりメインマシンとして使い込みました。動画編集、コードビルド、モバイルワークまで実測データとともに検証します。

### デザインと質感：新色スペースブラックの完成度

ユニボディアルミニウム筐体は相変わらず美しく、剛性も抜群です。新色のスペースブラックは陽極酸化皮膜により指紋が目立ちにくく、プロ向け機材としての所有感を一段と高めています。重量は約1.61kgで、14インチの高性能クラスとしては十分に持ち運べるバランスです。

### Liquid Retina XDR ディスプレイ

3024×1964ピクセルの解像度とミニLEDバックライトにより、HDRコンテンツ表示時は最大1600ニトの輝度を実現。黒の引き締まりと色再現性は外部モニター顔負けの品質です。ProMotionによる最大120Hzリフレッシュレートで、長時間のコーディングやWebブラウジングでも目の疲れが少なく快適です。

### M3 Pro の実測パフォーマンス

12コアCPU（6パフォーマンス＋6効率）と18コアGPUを搭載。4K ProRes素材の書き出しやNext.jsの大規模ビルド、Dockerコンテナ複数起動時でもファンはほとんど無音のまま高速に処理を終えます。

- 4K 10分動画のH.265書き出し：約3分40秒
- TypeScript大規模モノレポのフルビルド：従来機比 約22%短縮
- バッテリー駆動時でも性能低下がほぼゼロ

### バッテリーとポート構成

動画再生で最大17時間を公称。実使用でもブラウザ・エディタ・Slack常駐のワークフローで11〜12時間は余裕で持続し、ACアダプタを持たずに出かけられる安心感があります。MagSafe 3、Thunderbolt 4×3、HDMI、SDXCカードスロットを標準搭載しており、ハブ不要で現場対応できます。

### 総評：どんな人におすすめか

価格は30万円台からと安くはありませんが、性能・ディスプレイ・静音性・バッテリーのすべてが妥協なく統合された「完成形」のモバイルワークステーションです。今後4〜5年戦えるメインPCを探しているクリエイターやエンジニアに強くおすすめできます。`,
      pros: [
        'M3 Proの圧倒的なパフォーマンスと高い静音性',
        'Liquid Retina XDRディスプレイの圧倒的な美しさ',
        '実使用10時間超の驚異的なバッテリー持続時間',
        'HDMI・SDカードスロット内蔵で変換ハブいらず',
      ],
      cons: [
        '本体価格が高い（約32.8万円〜）',
        'メモリやストレージは購入後の増設ができない',
        'USB-Aポート非搭載のためレガシー機器は変換が必要',
      ],
      specs: {
        プロセッサ: 'Apple M3 Pro（12コアCPU / 18コアGPU）',
        メモリ: '18GB ユニファイドメモリ',
        ストレージ: '512GB SSD',
        ディスプレイ: '14.2インチ Liquid Retina XDR（3024×1964 / 120Hz）',
        バッテリー: '最大17時間（動画再生）',
        重量: '1.61 kg',
        ポート: 'Thunderbolt 4 × 3、HDMI、SDXC、MagSafe 3',
      },
      ratings: {
        'デザイン・質感': 4.9,
        パフォーマンス: 4.9,
        使い勝手: 4.8,
        コストパフォーマンス: 4.4,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.apple.com/jp/macbook-pro/',
      isHero: true,
      publishedAt: new Date('2026-11-20T09:00:00Z'),
    },
    {
      id: 2,
      title: 'iPhone 15 Pro Max 徹底レビュー',
      category: 'スマホ',
      thumbnail: '/images/articles/iphone-15-pro-max.jpg',
      score: 4.5,
      author: '佐藤 美咲（モバイル担当）',
      priceRange: '¥189,800〜',
      summary:
        'チタニウムボディとA17 Proチップを搭載した最強のiPhone。5倍光学ズームとUSB-C対応で、日常の撮影からプロの映像制作まで幅広く活躍します。',
      content: `## iPhone 15 Pro Max 徹底レビュー

チタニウム素材の採用、A17 Proチップ、5倍光学ズーム、そして待望のUSB-C端子を搭載した最上位モデル「iPhone 15 Pro Max」を長期使用の視点からレビューします。

### チタニウム採用による軽さと握りやすさ

グレード5チタニウムフレームの採用により、前世代から約19gの軽量化を達成。単なる数値以上に、フレームのエッジに施された繊細な丸みのおかげで6.7インチの大画面ながら手にしっくり収まります。従来のミュートスイッチに代わる「アクションボタン」も、カメラ起動やボイスメモを割り当てると手放せなくなる便利さです。

### テトラプリズム5倍望遠カメラの実力

48MPメインカメラの精細さに加え、光学5倍（120mm相当）の望遠カメラが大きな進化点。ライブやスポーツ観戦、建築物のディテール撮影でデジタルズームとは一線を画す解像感を発揮します。Apple Log撮影や外部SSDへの直接ProRes収録もUSB-C（最大10Gbps）のおかげで実用レベルに達しました。

### A17 Pro のグラフィック性能と発熱

3nmプロセス製造のA17 Proは、ハードウェアアクセラレーションによるレイトレーシングに対応。コンソール級の3Dゲームも高フレームレートで動作します。アップデート後は高負荷時の発熱も安定し、長時間撮影でも安心感が高まりました。

### 総評

約19万円〜という価格帯はプレミアムですが、静止画・動画のトータル品質とUSB-Cによる汎用性の向上は歴代最大のアップデートと言えます。大画面と望遠撮影を重視するユーザーにとって間違いのない選択肢です。`,
      pros: [
        'チタニウムボディで軽量化と高い質感を両立',
        '光学5倍望遠カメラの解像感と表現力',
        'A17 Proの卓越した処理・ゲーム性能',
        'USB-C（最大10Gbps）対応で外部SSD収録も可能',
      ],
      cons: [
        '最小構成でも約19万円と価格が非常に高い',
        '充電速度は競合Androidハイエンドに比べ控えめ',
        '片手操作には依然としてサイズが大きい',
      ],
      specs: {
        プロセッサ: 'Apple A17 Pro（3nm）',
        メモリ: '8GB',
        ストレージ: '256GB / 512GB / 1TB',
        ディスプレイ: '6.7インチ Super Retina XDR（2796×1290 / 120Hz）',
        カメラ: '48MP広角 + 12MP超広角 + 12MP 5x望遠',
        バッテリー: '最大29時間（ビデオ再生）',
        重量: '221g',
        防水防塵: 'IP68',
      },
      ratings: {
        'デザイン・質感': 4.8,
        パフォーマンス: 4.9,
        使い勝手: 4.4,
        コストパフォーマンス: 3.9,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.apple.com/jp/iphone-15-pro/',
      isHero: false,
      publishedAt: new Date('2026-11-18T09:00:00Z'),
    },
    {
      id: 3,
      title: 'Sony WH-1000XM5 ノイキャンヘッドホン レビュー',
      category: 'レビュー',
      thumbnail: '/images/articles/sony-wh1000xm5.jpg',
      score: 4.7,
      author: '中村 悠斗（オーディオ編集）',
      priceRange: '¥49,500前後',
      summary:
        '業界最高クラスのノイズキャンセリング性能を持つSonyのフラッグシップヘッドホン。軽量設計とクリアな高音質を両立した傑作です。',
      content: `## Sony WH-1000XM5 徹底レビュー

ノイズキャンセリングヘッドホンの基準を塗り替え続けてきたSony「1000X」シリーズ。デザインを一新したWH-1000XM5を、通勤電車・カフェ・長距離フライトで徹底テストしました。

### 洗練されたミニマルデザインと装着感

従来の折りたたみヒンジを廃したシームレスな造形は、ファッションアイテムとしても完成度が高い仕上がりです。ソフトフィットレザーのイヤーパッドと約250gの軽量設計により、側圧が分散されて3〜4時間の連続作業でも耳や頭頂部が痛くなりにくいのが魅力です。

### 8マイクによる異次元のノイズキャンセリング

左右合計8個のマイクと統合プロセッサーV1・高音質ノイズキャンセリングプロセッサーQN1の組み合わせが強力。低周波の電車の走行音はもちろん、従来苦手とされたカフェの話し声など中高音域の低減性能が目に見えて向上しています。

### 新設計30mmドライバーのクリアな音質

カーボンファイバーコンポジット素材を採用した30mmドライバーにより、低域の量感を保ちつつボーカルの抜けと高域の伸びが大幅に洗練されました。LDACコーデック対応でハイレゾ音源の細部まで立体的に描写します。

### 通話品質とマルチポイント

4つのビームフォーミングマイクとAIノイズリダクションにより、屋外の風切り音の中でも相手にクリアな音声が届きます。PCとスマホの2台同時接続（マルチポイント）もシームレスで、リモートワーク用の主力ヘッドセットとしても優秀です。`,
      pros: [
        '中高音域までしっかり消す業界最高クラスのNC性能',
        '約250gの軽量設計で長時間装着しても疲れにくい',
        'LDAC対応のクリアで解像度の高いサウンド',
        'マルチポイント接続と優れた通話マイク品質',
      ],
      cons: [
        '本体が折りたたみに非対応で専用ケースがやや大きい',
        '実売約5万円と導入ハードルは高め',
      ],
      specs: {
        ドライバー: '30mm ドーム型（カーボンファイバーコンポジット）',
        ノイズキャンセリング: 'マルチノイズセンサーテクノロジー（計8マイク）',
        対応コーデック: 'SBC / AAC / LDAC',
        バッテリー: '最大30時間（NC ON）/ 最大40時間（NC OFF）',
        重量: '約250g',
        接続方式: 'Bluetooth 5.2 / 3.5mm有線',
        急速充電: '3分充電で約3時間再生（USB PD）',
      },
      ratings: {
        'デザイン・質感': 4.7,
        パフォーマンス: 4.9,
        使い勝手: 4.6,
        コストパフォーマンス: 4.5,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.sony.jp/headphone/products/WH-1000XM5/',
      isHero: false,
      publishedAt: new Date('2026-11-15T09:00:00Z'),
    },
    {
      id: 4,
      title: 'HHKB Professional HYBRID Type-S レビュー',
      category: 'デスク環境',
      thumbnail: '/images/articles/hhkb-type-s.jpg',
      score: 4.6,
      author: '高橋 健太（チーフエディター）',
      priceRange: '¥36,850',
      summary:
        'プログラマーとライターに愛される至高のキーボード。静電容量無接点方式の極上の打鍵感と無駄を削ぎ落とした60%レイアウトが魅力です。',
      content: `## HHKB Professional HYBRID Type-S 長期使用レビュー

「一度使うと戻れない」と評されるHappy Hacking Keyboard。その最上位モデルであるProfessional HYBRID Type-Sを、日々の執筆とプログラミングに2年間使い続けた実感をお伝えします。

### 唯一無二の「スコスコ」打鍵感と静音性

東プレ製スイッチによる静電容量無接点方式（押下圧45g）は、物理接点を持たないためチャタリングが起きず、指に吸い付くような滑らかなストロークを実現します。静音仕様のType-Sは底打ち音が上品に抑えられており、Web会議中やオフィス環境でも周囲を気にせず高速タイピングが可能です。

### 合理的すぎる60%キー配列

Aの左に配置されたControlキー、Enterすぐ上のDelete（Backspace）キーなど、ホームポジションから手を動かさずにすべての操作が完結するよう設計されています。最初の1週間こそ戸惑いますが、慣れてしまえば手首の移動距離が激減し、長文入力時の疲労が明らかに軽くなります。

### マルチペアリングとキーマップ変更

Bluetoothで最大4台のデバイス（Mac / Windows / iPadなど）を瞬時に切り替えられ、USB-C有線接続にも対応。専用ツールでハードウェア側にキーマップを保存できるため、どのPCに繋いでも自分の理想の配列で作業できます。`,
      pros: [
        '静電容量無接点方式による極上の打鍵感と耐久性',
        'Type-Sならではの静かで心地よいタイピング音',
        'A4ハーフサイズ相当の超コンパクト設計でデスクが広くなる',
        'Bluetooth 4台マルチペアリング＋USB-C両対応',
      ],
      cons: [
        '価格が36,850円とキーボードとしては高価',
        '独立矢印キーがないためFn組み合わせに慣れが必要',
        '単3乾電池駆動（充電式バッテリー内蔵ではない）',
      ],
      specs: {
        スイッチ: '静電容量無接点方式（押下圧45g・静音Type-S）',
        キー数: '60キー（US配列）/ 69キー（JIS配列）',
        レイアウト: '60% コンパクト配列',
        接続方式: 'Bluetooth 4.2（最大4台） / USB Type-C',
        電源: '単3形乾電池 × 2本（約3ヶ月駆動）',
        重量: '約540g（電池含まず）',
        外形寸法: '294 × 120 × 40 mm',
      },
      ratings: {
        'デザイン・質感': 4.8,
        パフォーマンス: 4.9,
        使い勝手: 4.5,
        コストパフォーマンス: 4.2,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://happyhackingkb.com/jp/',
      isHero: false,
      publishedAt: new Date('2026-11-12T09:00:00Z'),
    },
    {
      id: 5,
      title: 'iPad Pro vs Surface Pro 徹底比較',
      category: '比較',
      thumbnail: '/images/articles/ipad-vs-surface.jpg',
      score: 4.3,
      author: '編集部 比較検証チーム',
      priceRange: '¥168,800〜',
      summary:
        'タブレットPCの二大巨頭を徹底比較。クリエイティブ用途かビジネス用途か、OS・ペン入力・拡張性の違いから最適な一台を導き出します。',
      content: `## iPad Pro vs Surface Pro 徹底比較

Apple「iPad Pro」とMicrosoft「Surface Pro」は、タブレット形状ながらノートPC級の処理性能を誇る二大巨頭です。同じカテゴリのようで実は思想が大きく異なる両機を、実務目線で比較しました。

### OSとワークフローの決定的な違い

iPad Proはタッチ操作に最適化されたiPadOSを搭載。アプリ単体の完成度と直感的な操作性、スリープからの瞬時復帰は圧倒的です。一方のSurface Proはフル機能のWindows 11が動作するため、Excelマクロ、デスクトップ版IDE、社内専用ツールなどPCと同じ環境がそのまま手に入ります。

### パフォーマンスと静音性

Appleシリコンを搭載するiPad Proは、ファンレス設計ながら動画書き出しや3Dスカルプトでも極めて高速かつ静か。Surface Proはマルチタスクや外部ディスプレイ複数接続の自由度が高く、ドックに繋げばそのままデスクトップPCの代替として機能します。

### ペン入力とクリエイティブ体験

イラスト制作や手書きノートでは、遅延の少なさとアプリ資産（Procreate、Goodnotes等）でiPad Pro＋Apple Pencilに軍配が上がります。一方、PowerPointへの書き込みやPDF校正が中心のビジネス用途では、キーボードカバーに収納・充電できるSurfaceスリムペンが非常に実用的です。

### 結論：どちらを選ぶべきか

- **iPad Proがおすすめな人**：イラスト・写真編集・動画制作がメイン、すでにMac/iPhoneユーザー、タブレット単体としての軽快さを重視
- **Surface Proがおすすめな人**：PCを1台に集約したい、OfficeやWindows専用アプリが必須、柔軟なファイル管理と外部モニター拡張を重視`,
      pros: [
        'iPad Pro：圧倒的なチップ性能と完全ファンレスの静音性',
        'iPad Pro：Apple Pencilとクリエイティブアプリの完成度',
        'Surface Pro：フル機能Windows 11とキックスタンド内蔵',
        'Surface Pro：高いマルチウィンドウ自由度と業務互換性',
      ],
      cons: [
        'iPad Pro：高度なファイル管理やPC専用ソフトには制約がある',
        'Surface Pro：タブレット単体時のタッチUI最適化は発展途上',
        'どちらも純正キーボード＋ペンを揃えると総額が高額になる',
      ],
      specs: {
        'iPad Pro ディスプレイ': '12.9インチ Liquid Retina XDR（120Hz）',
        'Surface Pro ディスプレイ': '13インチ PixelSense Flow（120Hz）',
        'iPad Pro チップ': 'Apple M2 / M4',
        'Surface Pro チップ': 'Intel Core Ultra / Snapdragon X Elite',
        'iPad Pro ストレージ': '256GB〜2TB',
        'Surface Pro ストレージ': '256GB〜1TB（換装対応）',
        'iPad Pro 重量': '約682g（本体のみ）',
        'Surface Pro 重量': '約879g（本体のみ）',
      },
      ratings: {
        'デザイン・質感': 4.7,
        パフォーマンス: 4.5,
        使い勝手: 4.2,
        コストパフォーマンス: 3.9,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.apple.com/jp/ipad-pro/',
      isHero: false,
      publishedAt: new Date('2026-11-10T09:00:00Z'),
    },
    {
      id: 6,
      title: '2026年 ワイヤレスイヤホン頂上決戦：AirPods Pro vs WF-1000XM5 徹底比較',
      category: '比較',
      thumbnail: '/images/articles/earbuds-compare.jpg',
      score: 4.8,
      author: '中村 悠斗（オーディオ編集）',
      priceRange: '¥39,800〜¥41,800',
      summary:
        '完全ワイヤレスイヤホンの二大王者、AirPods Pro（第2世代 USB-C）とSony WF-1000XM5を音質・ノイキャン・装着感で徹底比較検証します。',
      content: `## AirPods Pro vs WF-1000XM5 徹底比較

完全ワイヤレスイヤホン選びで誰もが迷う2機種、Apple「AirPods Pro（第2世代 USB-C）」とSony「WF-1000XM5」。通勤・オフィス・自宅のあらゆるシーンで聴き比べ、後悔しない選び方を整理しました。

### ノイズキャンセリングと外音取り込み

遮音性の絶対値では、ポリウレタンフォームイヤーピースによる物理遮音＋統合プロセッサーV2を備えた**WF-1000XM5**がわずかにリード。特に電車内の低音ノイズ除去は圧巻です。一方、**外音取り込みの自然さ**ではAirPods Proが依然として業界トップ。イヤホンを着けていることを忘れるほど自然な会話が可能です。

### 音質キャラクターの違い

WF-1000XM5はLDAC対応と8.4mmダイナミックドライバーXにより、解像度・音の厚み・低音の沈み込みすべてがハイレベル。音楽鑑賞を最優先するならSonyに軍配が上がります。AirPods Proはクセのないフラット寄りのチューニングで、映画の空間オーディオやPodcastの聴きやすさに優れます。

### 装着感と携帯性

AirPods Proは軽やかな装着感で耳への圧迫感が少なく、長時間のオンライン会議でも快適。WF-1000XM5は前作XM4から約25%小型軽量化され、耳の小さい方でも収まりやすくなりました。

### 結論

- **iPhone/Macユーザーで日常の快適さ・外音取り込み・シームレス切替重視** → AirPods Pro
- **音楽の解像度・LDACハイレゾ・Android/PC含むマルチポイント重視** → WF-1000XM5`,
      pros: [
        'AirPods Pro：圧倒的に自然な外音取り込みとApple機器間の自動切替',
        'AirPods Pro：圧迫感の少ない軽快な装着感と空間オーディオ',
        'WF-1000XM5：クラス最高峰の解像度とLDACハイレゾ対応',
        'WF-1000XM5：物理遮音＋デジタル処理による最強クラスの静寂',
      ],
      cons: [
        'AirPods Pro：Android環境では機能が制限されマルチポイント非対応',
        'WF-1000XM5：フォームイヤーピースは定期的な交換が必要',
      ],
      specs: {
        'AirPods Pro 重量': '片耳 5.3g / ケース 50.8g',
        'WF-1000XM5 重量': '片耳 5.9g / ケース 39g',
        'AirPods Pro コーデック': 'SBC / AAC',
        'WF-1000XM5 コーデック': 'SBC / AAC / LDAC / LC3',
        連続再生時間: 'AirPods Pro 最大6時間 / XM5 最大8時間（NC ON）',
        防水性能: 'AirPods Pro IP54 / XM5 IPX4',
      },
      ratings: {
        'デザイン・質感': 4.8,
        パフォーマンス: 4.9,
        使い勝手: 4.8,
        コストパフォーマンス: 4.6,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.sony.jp/headphone/products/WF-1000XM5/',
      isHero: false,
      publishedAt: new Date('2026-11-19T09:00:00Z'),
    },
    {
      id: 7,
      title: 'Dell UltraSharp 27 4K Thunderbolt ハブモニター レビュー',
      category: 'デスク環境',
      thumbnail: '/images/articles/dell-4k-monitor.jpg',
      score: 4.7,
      author: '山田 翔太（デスク環境マニア）',
      priceRange: '¥89,800前後',
      summary:
        'IPS Blackパネルによる深い黒とケーブル1本90W給電＆有線LAN接続。リモートワーカーのデスクを劇的に美しくする4Kモニターの決定版。',
      content: `## Dell UltraSharp U2723QE 4Kハブモニター レビュー

デスク環境の満足度を最も大きく左右するのがメインモニターです。IPS BlackテクノロジーとThunderbolt/USB-Cハブ機能を備えたDell UltraSharp 27インチ 4Kモデルを検証しました。

### IPS Black パネルのコントラスト革命

従来のIPSモニターの弱点だった「黒浮き」を大幅に改善し、コントラスト比2000:1を実現。ダークモードのエディタ画面や写真レタッチ時のシャドウ階調が驚くほど引き締まります。DCI-P3 98%の色域カバーと工場出荷時キャリブレーション済みのため、箱から出してすぐ正確な色で作業できます。

### ケーブル1本で完結する究極のハブ機能

最大90WのUSB-C給電に加え、モニター背面にRJ45有線LANポート、USB-A×5、USB-Cダウンストリームを搭載。MacBookやThinkPadにケーブルを1本挿すだけで、4K出力・充電・有線ネットワーク・キーボード/Webカメラ接続がすべて完了します。

### 組み込みKVMスイッチで2台のPCを自在に操る

仕事用Windows PCとプライベート用Macを同時接続しても、1セットのキーボード・マウスを自動で切り替え可能。PBP（Picture by Picture）にも対応しており、複数マシン派のデスクが一気にミニマルになります。`,
      pros: [
        'IPS Blackパネルによる2000:1の引き締まった黒と広色域',
        'USB-Cケーブル1本で90W給電＋有線LAN＋周辺機器を一括接続',
        '内蔵KVMスイッチでMac/Windowsの2台運用が快適',
        '4辺極細ベゼルと高さ・ピボット調整対応の高品質スタンド',
      ],
      cons: [
        'リフレッシュレートは60Hz（ゲーミング用途には不向き）',
        '内蔵スピーカー非搭載のため外部オーディオが必要',
      ],
      specs: {
        パネルサイズ: '27インチ 4K UHD（3840×2160）',
        パネル方式: 'IPS Black（非光沢 / コントラスト比 2000:1）',
        色域: 'sRGB 100% / DCI-P3 98% / DisplayHDR 400',
        給電能力: 'USB Type-C 最大90W PD',
        ハブ機能: 'USB-A × 5、USB-C × 2、RJ45 有線LAN、KVM内蔵',
        スタンド調整: '高さ（150mm）/ チルト / スイベル / ピボット',
      },
      ratings: {
        'デザイン・質感': 4.8,
        パフォーマンス: 4.6,
        使い勝手: 4.9,
        コストパフォーマンス: 4.5,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.dell.com/ja-jp/',
      isHero: false,
      publishedAt: new Date('2026-11-17T09:00:00Z'),
    },
    {
      id: 8,
      title: 'ThinkPad X1 Carbon Gen 12 長期レビュー：1kg台の完成されたビジネスPC',
      category: 'PC',
      thumbnail: '/images/articles/thinkpad-x1-carbon.jpg',
      score: 4.6,
      author: '高橋 健太（チーフエディター）',
      priceRange: '¥268,000〜',
      summary:
        '約1.09kgの超軽量カーボン筐体にIntel Core Ultraと2.8K OLEDを搭載。打鍵感・携帯性・堅牢性を極めたWindowsモバイルの王道です。',
      content: `## ThinkPad X1 Carbon Gen 12 実機長期レビュー

ビジネスモバイルノートPCの代名詞「ThinkPad X1 Carbon」。第12世代では筐体設計がブラッシュアップされ、よりスリムなベゼルと大型ハプティックタッチパッドの選択肢、そしてIntel Core Ultraプロセッサを手に入れました。

### 1.09kgの軽さとMIL規格の安心感

カーボンファイバーとマグネシウム合金を組み合わせた筐体は、手に取った瞬間に驚くほどの軽さ。それでいて米軍調達基準（MIL-STD-810H）をクリアする剛性を備え、満員電車のバックパックの中でも不安を感じません。

### 圧倒的に打ちやすいキーボードとTrackPoint

1.5mmのしっかりしたキーストロークと指先にフィットするシリンドリカルキーキャップは、長文レポートやメール作成で他の薄型PCと明確な差をつけます。CtrlキーとFnキーの位置が標準配置に改められたのも嬉しい進化です。

### 2.8K 120Hz OLEDディスプレイと実用ポート

オプションの2.8K OLED（120Hz）は文字の輪郭がシャープで発色も鮮やか。さらに1kg台の薄型ボディながらUSB-A×2、Thunderbolt 4×2、HDMI 2.1をフル装備しており、プレゼン会場でも変換アダプタを探す必要がありません。`,
      pros: [
        '約1.09kgの圧倒的な軽さとMIL規格準拠の頑丈なカーボン筐体',
        'ノートPC最高峰の打鍵感と進化したキーボード配列',
        'USB-A・HDMI・Thunderbolt 4を標準搭載する実用性',
        '2.8K 120Hz OLEDの美しい表示品質',
      ],
      cons: [
        'カスタマイズ構成によっては30万円超と高価',
        'OLED構成は省電力液晶モデルよりバッテリー持ちがやや短い',
      ],
      specs: {
        プロセッサ: 'Intel Core Ultra 7 155U / 155H',
        メモリ: '16GB / 32GB LPDDR5x',
        ストレージ: '512GB / 1TB PCIe Gen4 SSD',
        ディスプレイ: '14インチ 2.8K OLED（2880×1800 / 120Hz）',
        重量: '約1.09 kg〜',
        ポート: 'Thunderbolt 4 × 2、USB-A × 2、HDMI 2.1、イヤホンジャック',
      },
      ratings: {
        'デザイン・質感': 4.7,
        パフォーマンス: 4.5,
        使い勝手: 4.9,
        コストパフォーマンス: 4.2,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.lenovo.com/jp/ja/c/laptops/thinkpad/thinkpadx1/',
      isHero: false,
      publishedAt: new Date('2026-11-16T09:00:00Z'),
    },
    {
      id: 9,
      title: 'Google Pixel 9 Pro レビュー：進化した望遠カメラと生成AI機能の実力',
      category: 'スマホ',
      thumbnail: '/images/articles/pixel-9-pro.jpg',
      score: 4.5,
      author: '佐藤 美咲（モバイル担当）',
      priceRange: '¥159,900〜',
      summary:
        'コンパクトな6.3インチにProカメラを凝縮。洗練されたカメラバーデザインとGemini統合のAI体験が日常のスマホ操作をアップデートします。',
      content: `## Google Pixel 9 Pro 徹底レビュー

これまで「Proのカメラを使うなら大画面モデル一択」だったPixelシリーズに、待望の6.3インチProモデルが登場しました。片手で扱えるサイズ感とフラッグシップカメラの両立を徹底検証します。

### 劇的に洗練されたプレミアムデザイン

フラットなポリッシュ仕上げのアルミフレームと、背面ガラスに浮かび上がる楕円形のカメラバーは高級感抜群。マット質感の背面ガラスは手触りが滑らかで、これまでのPixelの中でも最も完成度の高いプロダクトデザインに仕上がっています。

### 6.3インチでも妥協ゼロのトリプルProカメラ

50MP広角＋48MP超広角＋48MP 5倍光学望遠の構成は上位のXLモデルと完全同一。夜景撮影のノイズ耐性、ポートレートの自然なボケ、マクロフォーカスまで隙がありません。42MPに強化されたインカメラも集合写真で頼もしい進化です。

### 実生活で本当に使えるAI機能

「一緒に写る（Add Me）」や「編集マジック」、高精度な文字起こし付きレコーダー、そしてGemini Liveの自然な音声対話など、GoogleならではのAI機能が単なるデモではなく日々の時短ツールとして機能します。7年間のOS・セキュリティアップデート保証も長く使う上で大きな安心材料です。`,
      pros: [
        '扱いやすい6.3インチサイズに最上位トリプルカメラを凝縮',
        '高級感とビルドクオリティが大幅に向上した新デザイン',
        '文字起こし・編集マジック・Geminiなど実用的なAI機能',
        '最大7年間のOS・セキュリティアップデート保証',
      ],
      cons: [
        '重い3DゲームのフレームレートはSnapdragon最上位機より控えめ',
        '側面フレームが光沢仕上げのため指紋が付きやすい',
      ],
      specs: {
        プロセッサ: 'Google Tensor G4',
        メモリ: '16GB RAM',
        ストレージ: '128GB / 256GB / 512GB',
        ディスプレイ: '6.3インチ Super Actua OLED（最大3000ニト / 120Hz）',
        カメラ: '50MP広角 + 48MP超広角 + 48MP 5x望遠',
        バッテリー: '4700mAh（急速充電・ワイヤレス充電対応）',
        重量: '199g',
      },
      ratings: {
        'デザイン・質感': 4.7,
        パフォーマンス: 4.3,
        使い勝手: 4.7,
        コストパフォーマンス: 4.4,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://store.google.com/jp/',
      isHero: false,
      publishedAt: new Date('2026-11-14T09:00:00Z'),
    },
    {
      id: 10,
      title: 'Logicool MX Master 3S 徹底レビュー：生産性を変える静音フラッグシップマウス',
      category: 'レビュー',
      thumbnail: '/images/articles/mx-master-3s.jpg',
      score: 4.6,
      author: '山田 翔太（デスク環境マニア）',
      priceRange: '¥16,940',
      summary:
        '1秒間に1,000行スクロールするMagSpeed電磁気ホイールと90%静音化されたクリック音。作業効率を底上げする定番ワークマウスの完成形。',
      content: `## Logicool MX Master 3S 実機レビュー

エンジニア、デザイナー、編集者のデスクで圧倒的な採用率を誇るLogicool「MX Master」シリーズ。クリック音を大幅に静音化し、8000DPIセンサーへ進化した「MX Master 3S」の魅力を掘り下げます。

### 一度触れると手放せないMagSpeedホイール

ステンレス削り出しのMagSpeed電磁気スクロールホイールは、1ノッチずつの精密操作と勢いよく回した瞬間の超高速フリースピンを自動で切り替え。長いコードやExcelシート、タイムラインの移動が劇的にスピードアップします。親指側のサムホイールも横スクロールやタブ切替に最適です。

### 90%静音化された心地よいクリック感

前モデルMX Master 3からの最大の改良点が静音クリック。静かでありながら「コトッ」という確かなタクタイル感が残されており、深夜の作業や静かなオフィス、Web会議中でもクリック音が気になりません。

### Logi Options+ でアプリ別カスタムが自在

ブラウザ、VS Code、Figma、Photoshopなどアプリごとに全ボタンとジェスチャーの動作を個別設定可能。最大3台のデバイスを底面ボタンやFlow機能でシームレスに往復でき、1回のUSB-C充電で最大70日間動作するスタミナも優秀です。`,
      pros: [
        '超高速と精密を自動切替するMagSpeed電磁気ホイール',
        '静かなのに押し心地が明確な静音クリックボタン',
        '親指サムホイール＋ジェスチャーボタンによる高い生産性',
        'ガラス面上でもトラッキングできる8000DPIセンサー',
      ],
      cons: [
        '重量141gと重めのため持ち運びにはやや不向き',
        '右利き専用エルゴノミクス形状（左利き非対応）',
      ],
      specs: {
        センサー: 'Darkfield 高精度センサー（最大8,000 DPI）',
        ボタン数: '7ボタン（カスタマイズ対応）',
        スクロール: 'MagSpeed電磁気ホイール ＋ 親指サムホイール',
        接続方式: 'Bluetooth Low Energy / Logi Bolt USBレシーバー（最大3台）',
        バッテリー: 'USB-C充電式（フル充電で最大70日）',
        重量: '141g',
      },
      ratings: {
        'デザイン・質感': 4.7,
        パフォーマンス: 4.6,
        使い勝手: 4.9,
        コストパフォーマンス: 4.4,
      },
      amazonUrl: 'https://www.amazon.co.jp/',
      officialUrl: 'https://www.logicool.co.jp/',
      isHero: false,
      publishedAt: new Date('2026-11-11T09:00:00Z'),
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        category: a.category,
        thumbnail: a.thumbnail,
        score: a.score,
        author: a.author,
        priceRange: a.priceRange,
        summary: a.summary,
        content: a.content,
        pros: JSON.stringify(a.pros),
        cons: JSON.stringify(a.cons),
        specs: JSON.stringify(a.specs),
        ratings: JSON.stringify(a.ratings),
        amazonUrl: a.amazonUrl,
        officialUrl: a.officialUrl,
        isHero: a.isHero,
        publishedAt: a.publishedAt,
      },
      create: {
        id: a.id,
        title: a.title,
        category: a.category,
        thumbnail: a.thumbnail,
        score: a.score,
        author: a.author,
        priceRange: a.priceRange,
        summary: a.summary,
        content: a.content,
        pros: JSON.stringify(a.pros),
        cons: JSON.stringify(a.cons),
        specs: JSON.stringify(a.specs),
        ratings: JSON.stringify(a.ratings),
        amazonUrl: a.amazonUrl,
        officialUrl: a.officialUrl,
        isHero: a.isHero,
        publishedAt: a.publishedAt,
      },
    });
  }

  // Sync PostgreSQL serial sequence after explicit-ID upserts so subsequent creates never collide
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('articles', 'id'), COALESCE((SELECT MAX(id) FROM articles), 1), true);`
  );

  console.log(`Seed completed successfully (${articles.length} articles + admin accounts).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
