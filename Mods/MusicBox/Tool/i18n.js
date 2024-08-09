const contents = {
    "title": ["NBS 文件导出工具", "NBS File Export Tool"],
    "instrument": ["乐器(音色)", "Instrument (Timbre)"],
    "harp": ["竖琴(Harp)", "Harp"],
    "bass": ["贝斯(Bass)", "Bass"],
    "bassDrum": ["底鼓(Bass Drum)", "Bass Drum"],
    "snare": ["小军鼓(Snare)", "Snare"],
    "hat": ["击鼓沿(Hat)", "Hat"],
    "guitar": ["吉他(Guitar)", "Guitar"],
    "flute": ["长笛(Flute)", "Flute"],
    "bell": ["铃铛(Bell)", "Bell"],
    "chime": ["管钟(Chime)", "Chime"],
    "xylophone": ["木琴(Xylophone)", "Xylophone"],
    "ironXylophone": ["铁木琴(Iron Xylophone)", "Iron Xylophone"],
    "cowBell": ["牛铃(Cow Bell)", "Cow Bell"],
    "didgeridoo": ["迪吉里杜管(Didgeridoo)", "Didgeridoo"],
    "bit": ["比特(Bit)", "Bit"],
    "banjo": ["班卓琴(Banjo)", "Banjo"],
    "pling": ["扣弦(Pling)", "Pling"],
    "exportMethod": ["导出方式", "Export Method"],
    "command": ["命令", "Command"],
    "pageByPage": ["逐页导出", "Page-by-page"],
    "exportRange": ["导出区间 (闭区间)", "Range (both inclusive)"],
    "from": ["起点", "From"],
    "to": ["终点", "To"],
    "start": ["开 导 !", "Export !"],
    "tips": ["使用说明", "Tips"],
    "tip1": [
        "· 无法加载时，请尝试将文件更新至最新版本 ",
        "· Can't load? Try upgrading your file with "
    ],
    "tip2": [
        "· 使用\"命令\"直接获取写入乐曲的书与笔(需要OP权限)",
        "· Use \"Command\" to get the Book and Quill directly. (OP required)"
    ],
    "tip3": [
        "· 在\"逐页导出\"时，推荐利用导出区间一次导出一页，一页一复制",
        "· In \"Page-by-page\" it's better to export one page at a time"
    ],
    "tip4": [
        "· 若区间为一页(起点==终点)，\"开导\" 后会自动翻到下一页",
        "· If \"From\" equals \"To\",it will turn to the next page, after \"Export\"",
    ],
    "tip5": [
        "· 点击结果文本框即可复制导出的文本",
        "· Click the result text box to copy the exported text"
    ],
    "result": ["导出结果", "Export Result"],
    "defaultResult": [
        "将 NBS 文件导出至书与笔以方便后续使用。访问 https://github.com/C20C01/MusicBox 了解更多关于模组\"纸带八音盒\"的信息。",
        "Export NBS file to Book and Quill for further use. Visit https://github.com/C20C01/MusicBox to find more about the mod \"Music Box\"."
    ],
}

const langList = ["zh-CN", "en-US"];

document.addEventListener("DOMContentLoaded", initLang);

function initLang() {
    addOption();
    switchLang(navigator.language);
}

function addOption() {
    const switcher = document.getElementById("lanSwitcher");
    for (let lang of langList) {
        switcher.add(new Option(lang, lang));
    }
}

function switchLang(lang) {
    if (!langList.includes(lang)) {
        lang = "en-US";
    }
    document.getElementById("lanSwitcher").value = lang;

    const index = langList.indexOf(lang);
    document.title = contents["title"][index];
    document.getElementById("button").value = contents["start"][index];
    document.getElementById("result-text").value = contents["defaultResult"][index];
    for (let span of document.getElementsByTagName("span")) {
        if (span.accessKey in contents) {
            span.innerText = contents[span.accessKey][index];
        }
    }
}