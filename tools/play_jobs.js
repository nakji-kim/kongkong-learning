// 사용: node tools/play_jobs.js  → 놀이 학습 음성 문장 목록(JSON)을 출력합니다. (make_audio.py 가 이 목록으로 mp3 를 만듭니다)
const fs = require('fs'), vm = require('vm');
const rd = f => fs.readFileSync(__dirname + '/../js/data/' + f, 'utf8');
console.log(JSON.stringify(vm.runInNewContext(rd('alphabet.js') + rd('play.js') + ';Object.assign({}, PLAY_LINES, AL_LINES)', {})));
