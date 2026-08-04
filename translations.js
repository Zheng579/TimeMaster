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
        btnLogStartTime: 'Log start time',
        btnLogCurrentTime: 'Log current time',
        btnDeleteLastLog: 'Delete last logged time',
        btnClearLog: 'Clear log',
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
        pageTitle: '時間大師',
        ampmAM: '上 午',
        ampmPM: '下 午',
        clockHours: '小時',
        clockMinutes: '分鐘',
        clockSeconds: '秒',
        dateFormatYMD: '{y} 年 {m} 月 {d} 日',
        languageLabel: '語言',
        btnLogStartTime: '記錄開始時間',
        btnLogCurrentTime: '記錄目前時間',
        btnDeleteLastLog: '刪除最後一筆記錄',
        btnClearLog: '清除紀錄',
        btnShowClockOnly: '只顯示時鐘',
        btnShowClock: '顯示時鐘',
        btnExitFullScreen: '退出全螢幕',
        btnSwitchTo24h: '切換至24小時制',
        btnSwitchTo12h: '切換至12小時制',
        tableHeaderIndex: '#',
        tableHeaderDate: '日期',
        tableHeaderStartTime: '開始時間',
        tableHeaderLoggedTime: '記錄時間',
        tableHeaderDuration: '持續時間',
        alarmStopSound: '停止聲音',
        clockPanelTitle: '時鐘',
        alarmSetTimeLabel: '設定時間',
        alarmNextLabel: '下一個',
        alarmTimeInputLabel: '鬧鐘時間',
        alarmSetBtn: '設定',
        alarmResetBtn: '重設',
        timerTitle: '計時器',
        timerMinLabel: '分',
        timerSecLabel: '秒',
        timerStartBtn: '開始',
        timerPauseBtn: '暫停',
        timerResetBtn: '重設',
        cycleTimerTitle: '間隔計時器',
        cycleTimerPhase1Label: '間隔 A',
        cycleTimerPhase2Label: '間隔 B',
        cycleTimerCyclesLabel: '循環次數',
        cycleTimerStopBtn: '停止',
        cycleTimerPhaseFocus: '間隔 A',
        cycleTimerPhaseBreak: '間隔 B',
        cycleTimerPhaseComplete: '完成',
        cycleTimerPhaseCycle: '{phase} · 第 {current} / {total} 次循環',
        statusNoTimerSet: '尚未設定計時器。',
        statusCycleTimerSetFirst: '請先設定兩個間隔的時間和循環次數。',
        statusCycleTimerReady: '準備完成：{phase}，第 {current} / {total} 次循環。',
        statusCycleTimerRunning: '{phase}：第 {current} / {total} 次循環。',
        statusCycleTimerPaused: '已暫停：{phase}，第 {current} / {total} 次循環。',
        statusCycleTimerStopped: '循環計時器已停止。',
        statusCycleTimerComplete: '已完成 {count} 次循環。',
        statusNoAlarmSet: '尚未設定鬧鐘。',
        statusPleaseSelectTime: '請選擇時間。',
        statusAlarmSetFor: '鬧鐘已設定為 {time}。',
        statusAlarmTriggeredAt: '鬧鐘於 {time} 響起。',
        statusSoundStopped: '聲音已停止。',
        statusSetMinSecFirst: '請先設定分鐘/秒數。',
        statusTimerRunning: '計時器運行中。',
        statusTimerFinished: '計時器已結束。',
        statusTimerPaused: '計時器已暫停。',
        notificationTitle: '鬧鐘',
        notificationBody: '現在時間為 {time}。',
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
