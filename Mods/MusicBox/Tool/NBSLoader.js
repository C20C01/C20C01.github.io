/**
 * Load new version nbs file.
 * @author CC2001
 * @see https://github.com/C20C01
 */
function loadNBS(file) {
    const reader = new FileReader();
    reader.onload = function () {
        convert(reader.result);
        songTitle = file.name.slice(0, -4);
        loadDone();
    }
    reader.readAsArrayBuffer(file);
}

function readByte(data) {
    return data.shift();
}

function readShort(data) {
    const a = data.shift();
    const b = data.shift();
    return b << 8 | a;
}

function readInt(data) {
    const a = data.shift();
    const b = data.shift();
    const c = data.shift();
    const d = data.shift();
    return d << 24 | c << 16 | b << 8 | a;
}

function readString(data) {
    let length = readInt(data);
    let result = "";
    for (let i = 0; i < length; i++) {
        result += String.fromCharCode(readByte(data));
    }
    return result;
}

/**
 * Convert nbsArrayBuffer to noteBlocks.
 * @see https://opennbs.org/nbs
 */
function convert(nbsArrayBuffer) {
    const data = Array.from(new Int8Array(nbsArrayBuffer));
    reset();
    if (handleHeader(data)) handleNoteBlocks(data);
}


function handleHeader(data) {
    const isNewFormat = readShort(data) === 0;
    if (!isNewFormat) {
        alert("Too old to convert!\n文件版本过旧，无法转换！");
        return false;
    }

    const version = readByte(data);
    const vanillaInstrumentCount = readByte(data);
    const length = readShort(data);
    // Note Block Studio doesn't really care about this value,
    // the song size is calculated in the second part.

    const layerCount = readShort(data);
    const title = readString(data);
    const author = readString(data);
    const originalAuthor = readString(data);
    const description = readString(data);
    const tempo = readShort(data);
    const autoSave = readByte(data);
    const autoSaveDuration = readByte(data);
    const timeSignature = readByte(data);
    const minutesSpent = readInt(data);
    const leftClicks = readInt(data);
    const rightClicks = readInt(data);
    const blocksAdded = readInt(data);
    const blocksRemoved = readInt(data);
    const midiOrSchematicName = readString(data);
    const loop = readByte(data) === 1;
    const maxLoopCount = readByte(data);
    const loopStartTick = readShort(data);
    console.log("Version: " + version, "Vanilla instrument count: " + vanillaInstrumentCount, "Length: " + length, "Layer count: " + layerCount, "Title: " + title, "Author: " + author, "Original author: " + originalAuthor, "Description: " + description, "Tempo: " + tempo, "Auto save: " + autoSave, "Auto save duration: " + autoSaveDuration, "Time signature: " + timeSignature, "Minutes spent: " + minutesSpent, "Left clicks: " + leftClicks, "Right clicks: " + rightClicks, "Blocks added: " + blocksAdded, "Blocks removed: " + blocksRemoved, "MIDI or schematic name: " + midiOrSchematicName, "Loop: " + loop, "Max loop count: " + maxLoopCount, "Loop start tick: " + loopStartTick);
    return true;
}

function handleNoteBlocks(data) {
    let tick = -1;
    let layer = -1;

    while (true) {
        const jumpTicks = readShort(data);
        if (jumpTicks === 0) {
            break;
        }
        tick += jumpTicks;

        while (true) {
            const jumpLayers = readShort(data);
            if (jumpLayers === 0) {
                layer = -1;
                break;
            }
            layer += jumpLayers;
            handleOneNoteBlock(data, tick, layer);
        }
    }
}

function handleOneNoteBlock(data, tick, layer) {
    const instrument = readByte(data);
    const key = readByte(data);
    const velocity = readByte(data);
    const panning = readByte(data);
    const pitch = readShort(data);

    const oneNoteBlock = new NoteBlock(tick, layer, instrument, key, velocity, panning, pitch);
    addOneNoteBlock(oneNoteBlock);
}

class NoteBlock {
    constructor(tick, layer, instrument, key, velocity, panning, pitch) {
        this.tick = tick;
        this.layer = layer;
        this.instrument = instrument;
        this.key = key;
        this.velocity = velocity;
        this.panning = panning;
        this.pitch = pitch;
    }

    toString() {
        return `NoteBlock(tick=${this.tick}, layer=${this.layer}, instrument=${this.instrument}, key=${this.key}, velocity=${this.velocity}, panning=${this.panning}, pitch=${this.pitch})`;
    }
}

// ==================== Website-use Start====================
const noteBlockMap = new Map();
const instrumentSet = new Set();
// const resultBox = document.getElementById("result-text");
const instrumentChooses = document.getElementsByName("instrument");
for (let i = 0; i <= 15; i++) {
    const choose = instrumentChooses[i];
    choose.onchange = function () {
        if (choose.checked) {
            setInstrumentChoose(i);
        }
    };
}
const modeChooses = document.getElementsByName("mode");
for (let i = 0; i < modeChooses.length; i++) {
    const choose = modeChooses[i];
    choose.onchange = function () {
        if (choose.checked) {
            setModeChoose(i);
        }
    }
}
let modeChoose = -1;
let instrumentChoose = -1;
let songTitle = "";

function reset() {
    for (let i = 0; i <= 15; i++) {
        noteBlockMap.set(i, []);
    }
    instrumentSet.clear();
}

class CCNoteBlock {
    constructor(tick, key) {
        this.tick = tick;
        this.key = ["1", "q", "2", "w", "3", "e", "r", "5", "t", "6", "y", "u", "8", "i", "9", "o", "0", "p", "z", "s", "x", "d", "c", "v", "g"][(key + 17) % 25];
    }
}

function addOneNoteBlock(noteBlock) {
    if (noteBlockMap.get(noteBlock.instrument) === undefined) {
        alert("Custom timbre detected, cannot convert.\n检测到自定义音色，无法转换。");
        throw new Error("Custom timbre detected!");
    }
    noteBlockMap.get(noteBlock.instrument).push(new CCNoteBlock(noteBlock.tick, noteBlock.key));
    instrumentSet.add(noteBlock.instrument);
}

function loadDone() {
    initInstrumentChoose();
    initModeChoose();
}

function initInstrumentChoose() {
    instrumentChoose = -1;
    for (let i = 0; i <= 15; i++) {
        const choose = instrumentChooses[i];
        choose.checked = false;
        if (instrumentSet.has(i)) {
            choose.removeAttribute("disabled");
        } else {
            choose.setAttribute("disabled", "disabled");
        }
    }
}

function initModeChoose() {
    let checked = 0;
    for (let i = 0; i < modeChooses.length; i++) {
        modeChooses[i].removeAttribute("disabled");
        if (modeChooses[i].checked) {
            checked = i;
        }
    }
    modeChooses[checked].checked = true;
    modeChoose = checked;
}

function setModeChoose(mode) {
    modeChoose = mode;
}

function setInstrumentChoose(instrument) {
    instrumentChoose = instrument;
}

function loadOneInstrument(instrument) {
    const musicBoxCodes = [];
    let musicBoxCode = "";
    let tick = 0;

    for (const noteBlock of noteBlockMap.get(instrument)) {
        while (tick < noteBlock["tick"]) {
            tick++;
            if (tick % 64 === 0) {
                musicBoxCodes.push(musicBoxCode);
                musicBoxCode = "";
            } else {
                musicBoxCode += ".";
            }
        }
        musicBoxCode += noteBlock["key"];
    }
    musicBoxCodes.push(musicBoxCode);

    return musicBoxCodes
}

function getBookName(index) {
    const instrumentName = ["竖琴(Harp)", "贝斯(Bass)", "底鼓(Bass drum)", "小军鼓(Snare)", "击鼓沿(Hat)", "吉他(Guitar)", "长笛(Flute)", "铃铛(Bell)", "管钟(Chime)", "木琴(Xylophone)", "铁木琴(Iron xylophone)", "牛铃(Cow bell)", "迪吉里杜管(Didgeridoo)", "比特(Bit)", "班卓琴(Banjo)", "扣弦(Pling)"][instrumentChoose];
    let res = songTitle;
    if (index !== 0) {
        res += `(${index})`;
    }
    res += ` - ${instrumentName}`;
    return res.replace(/(['"])/g, '\\$1');
}

function summonOldCommand(musicBoxCodes, index) {
    return `/give @p minecraft:writable_book{"display":{"Name":'{"text":"${getBookName(index)}"}'},"pages":["${musicBoxCodes.join('","')}"]}`;
}

function summonNewCommand(musicBoxCodes, index) {
    return `/give @p minecraft:writable_book[minecraft:custom_name="'${getBookName(index)}'",minecraft:writable_book_content={pages:[{raw:"${musicBoxCodes.join('"},{raw:"')}"}]}]`;
}

function start() {
    if (instrumentChoose !== -1 && modeChoose !== -1) {
        let res = loadOneInstrument(instrumentChoose);
        if (modeChoose === 0 || modeChoose === 1) {
            // command mode
            let codes = [];
            let index = 0;
            let converter = modeChoose === 0 ? summonOldCommand : summonNewCommand;
            while (index * 64 < res.length) {
                codes.push(converter(res.slice(index * 64, (index + 1) * 64), index));
                index++;
            }
            res = codes;
        }
        displayResult(res);
    }
}

function displayResult(lines) {
    const resultContainer = document.getElementById("result-area");
    resultContainer.innerHTML = "";

    lines.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.className = "result";
        lineElement.textContent = line;
        lineElement.onclick = copy;
        lineElement.title = index + 1;
        if (index % 2 !== 0) {
            lineElement.style.backgroundColor = "#d7c8a9";
        }
        resultContainer.appendChild(lineElement);
    });

    resultContainer.scrollTop = 0;
}

function copy() {
    if (instrumentChoose !== -1 && modeChoose !== -1) {
        navigator.clipboard.writeText(this.innerText).then(() => {
            this.style.backgroundColor = "var(--color_5)";
            this.style.boxShadow = "none";
        });
    }
}
