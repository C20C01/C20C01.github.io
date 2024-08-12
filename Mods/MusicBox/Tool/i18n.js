const contents = {
    "title": ["🎶 nbs文件导出工具", "🎶 nbs File Export Tool"],
    "nbsFile": ["📄 nbs文件", "📄 nbs File"],
    "instrument": ["🥁 乐器(音色)", "🥁 Instrument (Timbre)"],
    "exportMethod": ["📤 导出方式", "📤 Export Method"],
    "command": ["命令", "Command"],
    "pageByPage": ["逐页导出", "Page-by-page"],
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
    "start": ["开 导 !", "Export !"],
    "welcome": ["🤗 欢迎使用nbs文件导出工具", "🤗 Welcome to nbs file export tool"],
    "learnMore": ["[了解更多]", "[Learn More]"],
    "description": ["本工具为模组“纸带八音盒”的配套工具，用于将nbs文件导出至书与笔供模组使用。", "This tool is a supporting tool for the mod \"Music Box\", used to export nbs file to Book and Quill for the mod to use."],
    "notes": ["🔔 温馨提示：", "🔔 Notes:"],
    "tip1": ["不支持旧版nbs格式，请使用新版Note Block Studio保存文件以更新格式。", "Old version of nbs file is not supported, please use the new version of Note Block Studio to save the file to update the format."],
    "tip2": ["不支持自定义音色，请将自定义音色替换为默认音色后再导出。", "Custom timbre is not supported, please replace custom timbre with default timbre before exporting."],
    "tip3": ["使用命令模式时，将生成会给予你（@p）已经输入好内容的书与笔的命令，将其复制到命令方块中以使用。", "In \"Command\" mode, it will generate a command to give you(@p) a specific Book and Quill, copy it to command block to use."],
    "tip4": ["使用逐页导出模式时，将会把需要输入至书与笔中的内容在此处列出，你需要手动逐页复制到书与笔中。", "In \"Page-by-page\" mode, it will list the content that needs to be input into the Book and Quill here, you need to manually copy it page by page."],
    "tip5": ["点击生成的文本即可将其复制至剪切板。", "Click the generated text to copy it to the clipboard."],
    "defaultResult": ["将 NBS 文件导出至书与笔以方便后续使用。访问 https://github.com/C20C01/MusicBox 了解更多关于模组\"纸带八音盒\"的信息。", "Export NBS file to Book and Quill for further use. Visit https://github.com/C20C01/MusicBox to find more about the mod \"Music Box\"."],
}

const welcomeHtml = '<div style="color:white"><b><span accesskey="welcome"></span></b><p><span accesskey="description"></span><a href="https://github.com/C20C01/MusicBox"><span accesskey="learnMore"></span></a></p><br><br><br><b><span accesskey="notes"></span></b><ul><li><span accesskey="tip1"></span><a href="https://opennbs.org/">[OPEN NOTE BLOCK STUDIO]</a></li><li><span accesskey="tip2"></span></li><li><span accesskey="tip3"></span></li><li><span accesskey="tip4"></span></li><li><span accesskey="tip5"></span></li></ul></div>';
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
    document.getElementById("result-area").innerHTML = welcomeHtml;
    for (let span of document.getElementsByTagName("span")) {
        if (span.accessKey in contents) {
            span.innerText = contents[span.accessKey][index];
        }
    }
}