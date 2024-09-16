const canvas = document.getElementById('pianoRoll');
const ctx = canvas.getContext('2d');

// 鍵盤の設定
const keyWidth = 40;
const keyHeight = 20;
const rows = 12;  // 音階
const cols = 16;  // 時間の長さ（例: 16単位）
let notes = [];  // ユーザーが入力したノートを保持

// ピアノロールを描画
function drawPianoRoll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.strokeRect(j * keyWidth, i * keyHeight, keyWidth, keyHeight);
        }
    }

    // ノートを描画
    notes.forEach(note => {
        ctx.fillStyle = "blue";
        ctx.fillRect(note.x * keyWidth, note.y * keyHeight, keyWidth, keyHeight);
    });
}

// キャンバスにノートを追加する
canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / keyWidth);
    const y = Math.floor(event.offsetY / keyHeight);

    // 同じ位置にノートがなければ追加
    if (!notes.some(note => note.x === x && note.y === y)) {
        notes.push({ x, y });
    } else {
        // すでにある場合は削除
        notes = notes.filter(note => !(note.x === x && note.y === y));
    }

    drawPianoRoll();
});

// 初期描画
drawPianoRoll();

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const lyricsInput = document.getElementById('lyricsInput');
const playButton = document.getElementById('playButton');
const audioPlayer = document.getElementById('audioPlayer');

// WAVファイルを再生する関数
async function playNote(lyric, pitch) {
    const response = await fetch(`./utau_sounds/${lyric}.wav`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = pitch / 440;  // 440Hzを基準に再生速度を調整
    source.connect(audioContext.destination);
    source.start();
}

// 合成して再生する関数
async function synthesizeAndPlay() {
    const lyrics = lyricsInput.value.split('');  // 歌詞を1文字ずつ分解
    const pitchMap = [440, 494, 523, 587, 659, 698, 784];  // 簡単なピッチの例

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const lyric = lyrics[i % lyrics.length];
        const pitch = pitchMap[note.y % pitchMap.length];

        await playNote(lyric, pitch);
        await new Promise(resolve => setTimeout(resolve, 500));  // 0.5秒間隔で再生
    }
}

// 合成ボタンがクリックされたときに音声合成を開始
playButton.addEventListener('click', () => {
    synthesizeAndPlay();
});
