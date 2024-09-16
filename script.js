// AudioContextを作成。ブラウザによってはwebkitAudioContextもサポートされているため、条件分岐で対応。
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/**
 * 指定された音源ファイルを再生する関数
 * @param {string} lyric - 音源ファイルの名前（拡張子なし、例: 'ka'）
 * @param {number} pitch - 再生ピッチ（Hz、440Hzが基準）
 */
async function playNote(lyric, pitch) {
    try {
        // 音源ファイルを指定されたパスからフェッチ
        const response = await fetch(`./utau_sounds/${lyric}.wav`);
        
        // レスポンスが成功であるかチェック
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // 音源データをArrayBufferとして取得
        const arrayBuffer = await response.arrayBuffer();
        
        // ArrayBufferをAudioBufferにデコード
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // AudioBufferSourceNodeを作成し、デコードした音源データを設定
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // 再生速度（ピッチ）を設定（440Hzを基準にピッチを調整）
        source.playbackRate.value = pitch / 440;
        
        // AudioContextの出力に接続
        source.connect(audioContext.destination);
        
        // 音源を再生
        source.start();
    } catch (error) {
        // エラーが発生した場合はコンソールにエラーメッセージを表示
        console.error(`Error loading or playing ${lyric}.wav:`, error);
    }
}
