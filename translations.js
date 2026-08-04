// All user-facing text lives here so new languages can be added without touching script.js.
const TRANSLATIONS = {
    en: {
        pageTitle: 'Time Master',
        ampmAM: 'AM',
        ampmPM: 'PM',
        clockHours: 'Hours',
        clockMinutes: 'Minutes',
        clockSeconds: 'Seconds',
        dateFormatYMD: '{y}-{m}-{d}',
        languageLabel: 'Language',
        logGroupTitle: 'Log',
        displayGroupTitle: 'Display',
        btnLogStartTime: 'Set start time',
        btnLogCurrentTime: 'Current time',
        btnDeleteLastLog: 'Delete last entry',
        btnClearLog: 'Clear all',
        btnShowClockOnly: 'Show Clock Only',
        btnShowClock: 'Show Clock',
        btnExitFullScreen: 'Exit Full Screen',
        btnSwitchTo24h: 'Switch to 24h',
        btnSwitchTo12h: 'Switch to 12h',
        tableHeaderIndex: '#',
        tableHeaderDate: 'Date',
        tableHeaderStartTime: 'Start Time',
        tableHeaderLoggedTime: 'Logged Time',
        tableHeaderDuration: 'Duration',
        alarmStopSound: 'Stop Sound',
        clockPanelTitle: 'Clock',
        alarmSetTimeLabel: 'Set Time',
        alarmNextLabel: 'Next',
        alarmTimeInputLabel: 'Alarm time',
        alarmSetBtn: 'Set',
        alarmResetBtn: 'Reset',
        timerTitle: 'Timer',
        timerMinLabel: 'Min',
        timerSecLabel: 'Sec',
        timerStartBtn: 'Start',
        timerPauseBtn: 'Pause',
        timerResetBtn: 'Reset',
        cycleTimerTitle: 'Interval timer',
        cycleTimerPhase1Label: 'Interval A',
        cycleTimerPhase2Label: 'Interval B',
        cycleTimerCyclesLabel: 'Cycles',
        cycleTimerStopBtn: 'Stop',
        cycleTimerPhaseFocus: 'Interval A',
        cycleTimerPhaseBreak: 'Interval B',
        cycleTimerPhaseComplete: 'Complete',
        cycleTimerPhaseCycle: '{phase} · Cycle {current} of {total}',
        statusNoTimerSet: 'No timer set.',
        statusCycleTimerSetFirst: 'Set both interval durations and a cycle count first.',
        statusCycleTimerReady: 'Ready: {phase}, cycle {current} of {total}.',
        statusCycleTimerRunning: '{phase}: cycle {current} of {total}.',
        statusCycleTimerPaused: 'Paused: {phase}, cycle {current} of {total}.',
        statusCycleTimerStopped: 'Cycle timer stopped.',
        statusCycleTimerComplete: 'Completed {count} cycles.',
        statusNoAlarmSet: 'No alarm set.',
        statusPleaseSelectTime: 'Please select a time.',
        statusAlarmSetFor: 'Alarm set for {time}.',
        statusAlarmTriggeredAt: 'Alarm triggered at {time}.',
        statusSoundStopped: 'Sound stopped.',
        statusSetMinSecFirst: 'Set minutes/seconds first.',
        statusTimerRunning: 'Timer running.',
        statusTimerFinished: 'Timer finished.',
        statusTimerPaused: 'Timer paused.',
        notificationTitle: 'Alarm',
        notificationBody: 'It is {time} now.',
    },
    zh: {
        pageTitle: '时间管理大师',
        ampmAM: '上午',
        ampmPM: '下午',
        clockHours: '小时',
        clockMinutes: '分钟',
        clockSeconds: '秒',
        dateFormatYMD: '{y} 年 {m} 月 {d} 日',
        languageLabel: '语言',
        logGroupTitle: '记录',
        displayGroupTitle: '显示',
        btnLogStartTime: '设置开始时间',
        btnLogCurrentTime: '当前时间',
        btnDeleteLastLog: '删除最后一条',
        btnClearLog: '全部清除',
        btnShowClockOnly: '只显示时钟',
        btnShowClock: '显示时钟',
        btnExitFullScreen: '退出全屏',
        btnSwitchTo24h: '切换至24小时制',
        btnSwitchTo12h: '切换至12小时制',
        tableHeaderIndex: '#',
        tableHeaderDate: '日期',
        tableHeaderStartTime: '开始时间',
        tableHeaderLoggedTime: '记录时间',
        tableHeaderDuration: '持续时间',
        alarmStopSound: '停止声音',
        clockPanelTitle: '时钟',
        alarmSetTimeLabel: '设置时间',
        alarmNextLabel: '下一个',
        alarmTimeInputLabel: '闹钟时间',
        alarmSetBtn: '设置',
        alarmResetBtn: '重置',
        timerTitle: '计时器',
        timerMinLabel: '分',
        timerSecLabel: '秒',
        timerStartBtn: '开始',
        timerPauseBtn: '暂停',
        timerResetBtn: '重置',
        cycleTimerTitle: '间隔计时器',
        cycleTimerPhase1Label: '间隔 A',
        cycleTimerPhase2Label: '间隔 B',
        cycleTimerCyclesLabel: '循环次数',
        cycleTimerStopBtn: '停止',
        cycleTimerPhaseFocus: '间隔 A',
        cycleTimerPhaseBreak: '间隔 B',
        cycleTimerPhaseComplete: '完成',
        cycleTimerPhaseCycle: '{phase} · 第 {current} / {total} 个循环',
        statusNoTimerSet: '尚未设置计时器。',
        statusCycleTimerSetFirst: '请先设置两个间隔的时间和循环次数。',
        statusCycleTimerReady: '已就绪：{phase}，第 {current} / {total} 个循环。',
        statusCycleTimerRunning: '{phase}：第 {current} / {total} 个循环。',
        statusCycleTimerPaused: '已暂停：{phase}，第 {current} / {total} 个循环。',
        statusCycleTimerStopped: '循环计时器已停止。',
        statusCycleTimerComplete: '已完成 {count} 个循环。',
        statusNoAlarmSet: '尚未设置闹钟。',
        statusPleaseSelectTime: '请选择时间。',
        statusAlarmSetFor: '闹钟已设置为 {time}。',
        statusAlarmTriggeredAt: '闹钟已于 {time} 响起。',
        statusSoundStopped: '声音已停止。',
        statusSetMinSecFirst: '请先设置分钟/秒数。',
        statusTimerRunning: '计时器运行中。',
        statusTimerFinished: '计时器已结束。',
        statusTimerPaused: '计时器已暂停。',
        notificationTitle: '闹钟',
        notificationBody: '现在时间为 {time}。',
    },
};

const LANGUAGE_STORAGE_KEY = 'timeMaster.language';
const DEFAULT_LANGUAGE = 'en';

function getStoredLanguage() {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return TRANSLATIONS[stored] ? stored : DEFAULT_LANGUAGE;
}

function setStoredLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

let currentLanguage = getStoredLanguage();

function setCurrentLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLanguage = lang;
    setStoredLanguage(lang);
}

// Looks up `key` in the active language, falling back to the default language.
// `params` values replace `{name}` placeholders in the translated string.
function t(key, params) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE];
    let text = dict[key] !== undefined ? dict[key] : TRANSLATIONS[DEFAULT_LANGUAGE][key];
    if (text === undefined) return key;

    if (params) {
        Object.keys(params).forEach((paramKey) => {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
        });
    }

    return text;
}
