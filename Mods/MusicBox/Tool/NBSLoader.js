/**
 * Load new version NBS file.
 * @author CC2001
 * @see https://github.com/C20C01
 */

// const noteBlocks = [];

function loadNBS(file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        convert(reader.result);
        callback();
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
        alert("文件加载失败，请确认文件格式是否正确。");
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

    // console.log("Note blocks: " + noteBlocks.length);
}

function handleOneNoteBlock(data, tick, layer) {
    const instrument = readByte(data);
    const key = readByte(data);
    const velocity = readByte(data);
    const panning = readByte(data);
    const pitch = readShort(data);

    const oneNoteBlock = new NoteBlock(tick, layer, instrument, key, velocity, panning, pitch);
    // noteBlocks.push(oneNoteBlock);

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
const range_start = document.getElementById("range_start");
const range_end = document.getElementById("range_end");
const instrumentChooses = document.getElementsByName("instrument");
for (let i = 0; i <= 15; i++) {
    const choose = instrumentChooses[i];
    choose.addEventListener("change", function () {
        if (choose.checked) {
            setInstrumentChoose(i);
        }
    });
}
const modeChooses = document.getElementsByName("mode");
for (let i = 0; i < 2; i++) {
    const choose = modeChooses[i];
    choose.addEventListener("change", function () {
        if (choose.checked) {
            setModeChoose(i);
        }
    });
}

let modeChoose = -1;
let instrumentChoose = -1;

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
        alert("nbs文件包含自定义音色，无法转换");
        throw new Error("nbs文件包含自定义音色，无法转换");
    }
    noteBlockMap.get(noteBlock.instrument).push(new CCNoteBlock(noteBlock.tick, noteBlock.key));
    instrumentSet.add(noteBlock.instrument);
}

function loadDone() {
    initInstrumentChoose();
    initRangeChoose();
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

function initRangeChoose() {
    range_start.value = 1;
    range_end.value = 64;
}

function initModeChoose() {
    for (let i = 0; i < 2; i++) {
        modeChooses[i].removeAttribute("disabled");
    }
    modeChooses[0].checked = true;
    modeChoose = 0;
}

function setModeChoose(mode) {
    modeChoose = mode;
    switch (mode) {
        case 0:
            initRangeChoose();
            break;
        case 1:
            range_end.value = range_start.value;
            break;
    }
}

function setInstrumentChoose(instrument) {
    instrumentChoose = instrument;
}

function loadOneInstrument(instrument) {
    const musicBoxCodes = [];
    let musicBoxCode = "";
    let tick = 0;

    for (const noteBlock of noteBlockMap.get(instrument)) {
        while (tick < noteBlock.tick) {
            tick++;
            if (tick % 64 === 0) {
                musicBoxCodes.push(musicBoxCode);
                musicBoxCode = "";
            } else {
                musicBoxCode += ".";
            }
        }
        musicBoxCode += noteBlock.key;
    }
    musicBoxCodes.push(musicBoxCode);

    return musicBoxCodes
}

function summonBookCode(musicBoxCodes, instrument) {
    const instrumentName = ["竖琴(Harp)", "贝斯(Bass)", "底鼓(Bass drum)", "小军鼓(Snare)", "击鼓沿(Hat)", "吉他(Guitar)", "长笛(Flute)", "铃铛(Bell)", "管钟(Chime)", "木琴(Xylophone)", "铁木琴(Iron xylophone)", "牛铃(Cow bell)", "迪吉里杜管(Didgeridoo)", "比特(Bit)", "班卓琴(Banjo)", "扣弦(Pling)"][instrument];
    let bookCode = "/give @p minecraft:writable_book{\"pages\":[";
    for (const musicBoxCode of musicBoxCodes) {
        bookCode += "\"" + musicBoxCode + "\",";
    }
    bookCode += "],\"display\":{\"Name\":'{\"text\":\"" + instrumentName + "\"}'}}";
    return bookCode;
}

function start() {
    if (instrumentChoose === -1 || range_start.value === "" || range_end.value === "" || modeChoose === -1) {
        return;
    }

    let res = loadOneInstrument(instrumentChoose).slice(range_start.value - 1, range_end.value);

    switch (modeChoose) {
        case 0:
            res = [summonBookCode(res, instrumentChoose)];
            break;
    }

    document.getElementById("result-text").value = res.join("\n");

    if (range_start.value === range_end.value) {
        range_start.value = Number(range_start.value) + 1;
        range_end.value = Number(range_end.value) + 1;
    }
}

function copy() {
    if (instrumentChoose === -1 || range_start.value === "" || range_end.value === "" || modeChoose === -1) {
        return;
    }

    const copyText = document.getElementById("result-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value).then();
}
