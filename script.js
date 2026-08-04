function pad2(value) {
    return String(value).padStart(2, '0');
}

const TIME_FORMAT_STORAGE_KEY = 'timeMaster.timeFormat';
let use24Hour = localStorage.getItem(TIME_FORMAT_STORAGE_KEY) === '24';

const START_TIME_STORAGE_KEY = 'timeMaster.startTimeMs';
const ALARM_TIME_STORAGE_KEY = 'timeMaster.alarmTime';
const ALARM_TARGET_STORAGE_KEY = 'timeMaster.alarmTargetMs';
const ALARM_SET_AT_STORAGE_KEY = 'timeMaster.alarmSetAtMs';
let alarmTimeoutId = null;
let alarmAlertTimeoutId = null;
let alarmSoundIntervalId = null;
let alarmSoundStopTimeoutId = null;
let alarmSoundActive = false;
let customAlarmAudio = null;
let customAlarmAudioUrl = null;
let customAlarmFileName = '';
let customAlarmSoundStatusKey = 'alarmSoundDefault';
let timerIntervalId = null;
let timerRemainingMs = 0;
let timerEndTime = null;
let cycleTimerIntervalId = null;
let cycleTimerRemainingMs = 0;
let cycleTimerEndTime = null;
let cycleTimerPhase = 'focus';
let cycleTimerCompletedCycles = 0;
let cycleTimerTotalCycles = 0;
let cycleTimerFocusDurationMs = 0;
let cycleTimerBreakDurationMs = 0;
let alarmAudioContext = null;
let alarmTargetMs = null;
let alarmSetAtMs = null;

function syncFormatToggleUI() {
    const toggleBtn = document.getElementById('toggleFormatBtn');
    if (!toggleBtn) return;
    toggleBtn.textContent = use24Hour ? t('btnSwitchTo12h') : t('btnSwitchTo24h');
}

function setUse24Hour(enabled) {
    use24Hour = enabled;
    localStorage.setItem(TIME_FORMAT_STORAGE_KEY, enabled ? '24' : '12');
    syncFormatToggleUI();
    updateClock();
    refreshAlarmPanelTimes();
}

function formatTime12(date) {
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours24 >= 12 ? t('ampmPM') : t('ampmAM');

    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;

    return {
        hours: pad2(hours12),
        minutes: pad2(minutes),
        seconds: pad2(seconds),
        ampm,
    };
}

function formatTime24(date) {
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return {
        hours: pad2(hours24),
        minutes: pad2(minutes),
        seconds: pad2(seconds),
        ampm: '',
    };
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    return `${year}-${month}-${day}`;
}

function formatDateYMD(date) {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    return t('dateFormatYMD', { y: year, m: month, d: day });
}

function formatTimeForDisplay(date) {
    const parts = use24Hour ? formatTime24(date) : formatTime12(date);
    return use24Hour
        ? `${parts.hours}:${parts.minutes}:${parts.seconds}`
        : `${parts.hours}:${parts.minutes}:${parts.seconds} ${parts.ampm}`;
}

function formatDuration(ms) {
    const safeMs = Math.max(0, Math.floor(ms));
    const totalSeconds = Math.floor(safeMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function updateClock() {
    const dateEl = document.getElementById('date');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const ampmEl = document.getElementById('ampm');

    const hh = document.getElementById('hh');
    const mm = document.getElementById('mm');
    const ss = document.getElementById('ss');

    const hrDot = document.querySelector('.hr_dot');
    const minDot = document.querySelector('.min_dot');
    const secDot = document.querySelector('.sec_dot');

    const now = new Date();
    const clockTime = use24Hour ? formatTime24(now) : formatTime12(now);

    if (dateEl) dateEl.textContent = formatDateYMD(now);

    if (hoursEl) hoursEl.innerHTML = `${clockTime.hours}<br><span>${t('clockHours')}</span>`;
    if (minutesEl) minutesEl.innerHTML = `${clockTime.minutes}<br><span>${t('clockMinutes')}</span>`;
    if (secondsEl) secondsEl.innerHTML = `${clockTime.seconds}<br><span>${t('clockSeconds')}</span>`;

    if (ampmEl) {
        const ampmWrap = ampmEl.closest('.ap');
        if (use24Hour) {
            if (ampmWrap) ampmWrap.classList.add('d-none');
            ampmEl.textContent = '';
        } else {
            if (ampmWrap) ampmWrap.classList.remove('d-none');
            ampmEl.textContent = clockTime.ampm;
        }
    }

    const hours24 = now.getHours();
    let hoursForRing = hours24 % 12;
    if (hoursForRing === 0) hoursForRing = 12;
    const minutesForRing = now.getMinutes();
    const secondsForRing = now.getSeconds();

    if (hh) hh.style.strokeDashoffset = 440 - (440 * hoursForRing) / 12;
    if (mm) mm.style.strokeDashoffset = 440 - (440 * minutesForRing) / 60;
    if (ss) ss.style.strokeDashoffset = 440 - (440 * secondsForRing) / 60;

    if (hrDot) hrDot.style.transform = `rotate(${hoursForRing * 30}deg)`;
    if (minDot) minDot.style.transform = `rotate(${minutesForRing * 6}deg)`;
    if (secDot) secDot.style.transform = `rotate(${secondsForRing * 6}deg)`;

    if (timerEndTime && Date.now() >= timerEndTime) {
        finishTimer();
    }

    checkAlarmDue();
}

// logging
function getStoredStartTime() {
    const raw = localStorage.getItem(START_TIME_STORAGE_KEY);
    if (!raw) return null;
    const ms = Number(raw);
    if (!Number.isFinite(ms)) return null;
    return new Date(ms);
}

function setStoredStartTime(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return;
    localStorage.setItem(START_TIME_STORAGE_KEY, String(date.getTime()));
}

function clearStoredStartTime() {
    localStorage.removeItem(START_TIME_STORAGE_KEY);
}

function addLogEntry({ startTime, loggedTime, isStartTimeUpdated = false, isHighlighted = false }) {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    const start = startTime instanceof Date ? startTime : null;
    const logged = loggedTime instanceof Date ? loggedTime : new Date();
    const dateStr = formatDate(logged);
    const startTimeStr = start ? formatTimeForDisplay(start) : '--';
    const loggedTimeStr = formatTimeForDisplay(logged);
    const durationStr = start ? formatDuration(logged.getTime() - start.getTime()) : '--';
    const previousRow = tbody.lastElementChild;
    const previousLoggedTimeMs = previousRow ? Number(previousRow.dataset.loggedTimeMs) : NaN;
    const logIntervalStr = Number.isFinite(previousLoggedTimeMs)
        ? formatDuration(logged.getTime() - previousLoggedTimeMs)
        : '--';

    const rowIndex = tbody.children.length + 1;
    const tr = document.createElement('tr');
    tr.dataset.loggedTimeMs = String(logged.getTime());
    if (isStartTimeUpdated) tr.classList.add('start-time-updated-row');
    if (isHighlighted) tr.classList.add('highlighted-log-row');
    tr.innerHTML = `
        <th scope="row">${rowIndex}</th>
        <td>${dateStr}</td>
        <td>${startTimeStr}</td>
        <td>${loggedTimeStr}</td>
        <td>${durationStr}</td>
        <td>${logIntervalStr}</td>
    `.trim();
    tbody.appendChild(tr);

    syncTableScrollState();
}

function logStartTime() {
    const now = new Date();
    setStoredStartTime(now);

    addLogEntry({ startTime: now, loggedTime: now, isStartTimeUpdated: true });
}

function logCurrentTime({ isHighlighted = false } = {}) {
    const now = new Date();

    let start = getStoredStartTime();
    if (!start) {
        // alert('No Start Time set. Click "Log Start time" first.');
        // return;
        start = now;
        setStoredStartTime(now);
        addLogEntry({ startTime: start, loggedTime: now, isStartTimeUpdated: true, isHighlighted });
        return;
    }

    addLogEntry({ startTime: start, loggedTime: now, isHighlighted });
}

function logHighlightedTime() {
    logCurrentTime({ isHighlighted: true });
}

function clearLogTable() {
    const tbody = document.getElementById('logTableBody');
    if (tbody) tbody.innerHTML = '';
    clearStoredStartTime();

    syncTableScrollState();
}

function deleteLastLogEntry() {
    const tbody = document.getElementById('logTableBody');
    if (!tbody || !tbody.lastElementChild) return;

    tbody.lastElementChild.remove();
    syncTableScrollState();
}

function syncTableScrollState() {
    const wrapper = document.querySelector('.table-responsive');
    const table = wrapper ? wrapper.querySelector('table') : null;
    if (!wrapper || !table) return;

    // Make the wrapper scroll only when the table would exceed the viewport height.
    requestAnimationFrame(() => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();

        // Leave a little breathing room from the bottom edge.
        const paddingFromBottom = 24;
        const availableHeight = Math.max(120, Math.floor(window.innerHeight - wrapperRect.top - paddingFromBottom));

        const shouldScroll = tableRect.height > availableHeight;
        wrapper.classList.toggle('table-scroll', shouldScroll);
        wrapper.style.maxHeight = shouldScroll ? `${availableHeight}px` : '';

        syncAlarmPanelPosition();
    });
}

function syncAlarmPanelPosition() {
    const layout = document.querySelector('.log-alarm-layout');
    const wrapper = layout ? layout.querySelector('.table-responsive') : null;
    const panel = document.getElementById('alarmPanel');
    const controlPanel = document.getElementById('alarmControlPanel');
    if (!layout || !wrapper || !panel) return;

    const isStacked = window.matchMedia('(max-width: 980px)').matches;
    if (isStacked) {
        panel.style.left = '';
        panel.style.top = '';
        if (controlPanel) {
            controlPanel.style.left = '';
            controlPanel.style.top = '';
        }
        return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const left = wrapperRect.right - layoutRect.left + 10;
    const top = wrapperRect.top - layoutRect.top;

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;

    if (controlPanel) {
        const controlRect = controlPanel.getBoundingClientRect();
        const controlLeft = wrapperRect.left - layoutRect.left - controlRect.width - 10;
        controlPanel.style.left = `${controlLeft}px`;
        controlPanel.style.top = `${top}px`;
    }
}

// set up fullscreen
function syncFullscreenClockUI() {
    const btn = document.getElementById('fullscreenClockBtn');
    if (!btn) return;
    btn.textContent = document.fullscreenElement ? t('btnExitFullScreen') : t('btnShowClock');
}

async function toggleClockFullscreen() {
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }

        document.body.classList.add('clock-fullscreen-mode');
        await document.documentElement.requestFullscreen();
    } catch {
        // Ignore if fullscreen is blocked (e.g., iframe / permission / browser policy)
        document.body.classList.remove('clock-fullscreen-mode');
    } finally {
        syncFullscreenClockUI();
    }
}


// Alarm
function getStoredAlarmTime() {
    const raw = localStorage.getItem(ALARM_TIME_STORAGE_KEY);
    if (!raw) return null;
    return raw;
}

function getStoredAlarmTarget() {
    const raw = localStorage.getItem(ALARM_TARGET_STORAGE_KEY);
    if (!raw) return null;
    const ms = Number(raw);
    if (!Number.isFinite(ms)) return null;
    return ms;
}

function getStoredAlarmSetAt() {
    const raw = localStorage.getItem(ALARM_SET_AT_STORAGE_KEY);
    if (!raw) return null;
    const ms = Number(raw);
    if (!Number.isFinite(ms)) return null;
    return ms;
}

function setStoredAlarmTime(value) {
    if (!value) {
        localStorage.removeItem(ALARM_TIME_STORAGE_KEY);
        return;
    }
    localStorage.setItem(ALARM_TIME_STORAGE_KEY, value);
}

function setStoredAlarmTarget(ms) {
    if (!Number.isFinite(ms)) {
        localStorage.removeItem(ALARM_TARGET_STORAGE_KEY);
        alarmTargetMs = null;
        return;
    }
    alarmTargetMs = ms;
    localStorage.setItem(ALARM_TARGET_STORAGE_KEY, String(ms));
}

function setStoredAlarmSetAt(ms) {
    if (!Number.isFinite(ms)) {
        localStorage.removeItem(ALARM_SET_AT_STORAGE_KEY);
        alarmSetAtMs = null;
        return;
    }
    alarmSetAtMs = ms;
    localStorage.setItem(ALARM_SET_AT_STORAGE_KEY, String(ms));
}

function parseAlarmTime(value) {
    if (!value || typeof value !== 'string') return null;
    const [hoursStr, minutesStr] = value.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return { hours, minutes };
}

function getNextAlarmDate(timeValue) {
    const parsed = parseAlarmTime(timeValue);
    if (!parsed) return null;
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setHours(parsed.hours, parsed.minutes, 0, 0);
    if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

let lastAlarmStatusKey = null;
let lastAlarmStatusParams = null;

function showAlarmStatus(key, params) {
    lastAlarmStatusKey = key;
    lastAlarmStatusParams = params || null;
    const panelStatus = document.getElementById('alarmPanelStatus');
    if (panelStatus) panelStatus.textContent = key ? t(key, params) : '';
}

function updateAlarmPanel({ setTimeText = null, nextTimeText = null, statusKey = null, statusParams = null, isAlert = false } = {}) {
    const panel = document.getElementById('alarmPanel');
    const timeEl = document.getElementById('alarmPanelTime');
    const nextEl = document.getElementById('alarmPanelNext');
    const statusEl = document.getElementById('alarmPanelStatus');
    if (!panel || !timeEl || !nextEl) return;

    if (setTimeText !== null) {
        timeEl.textContent = setTimeText || '--';
    }
    if (nextTimeText !== null) {
        nextEl.textContent = nextTimeText || '--';
    }
    if (statusEl) {
        statusEl.textContent = statusKey ? t(statusKey, statusParams) : t('statusNoAlarmSet');
    }

    panel.classList.toggle('is-alert', isAlert);
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (!display) return;
    const totalSeconds = Math.max(0, Math.ceil(timerRemainingMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    display.textContent = `${pad2(minutes)}:${pad2(seconds)}`;
}

let lastTimerStatusKey = null;
let lastTimerStatusParams = null;

function setTimerStatus(key, params) {
    lastTimerStatusKey = key;
    lastTimerStatusParams = params || null;
    const status = document.getElementById('timerStatus');
    if (!status) return;
    status.textContent = key ? t(key, params) : '';
}

function stopTimerInterval() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function resetTimerState() {
    stopTimerInterval();
    timerRemainingMs = 0;
    timerEndTime = null;

    const minInput = document.getElementById('timerMinutesInput');
    const secInput = document.getElementById('timerSecondsInput');
    if (minInput) minInput.value = '0';
    if (secInput) secInput.value = '0';

    updateTimerDisplay();
    setTimerStatus('statusNoTimerSet');
}

function readTimerInputMs() {
    const minInput = document.getElementById('timerMinutesInput');
    const secInput = document.getElementById('timerSecondsInput');
    if (!minInput || !secInput) return 0;

    const minutes = Math.max(0, Number(minInput.value || 0));
    const seconds = Math.max(0, Number(secInput.value || 0));
    const normalizedSeconds = Math.min(59, seconds);
    const totalSeconds = minutes * 60 + normalizedSeconds;
    return Math.max(0, Math.floor(totalSeconds * 1000));
}

function startTimer() {
    ensureAlarmAudioContext();
    const durationMs = timerRemainingMs > 0 ? timerRemainingMs : readTimerInputMs();
    if (!durationMs) {
        setTimerStatus('statusSetMinSecFirst');
        return;
    }

    timerRemainingMs = durationMs;
    timerEndTime = Date.now() + timerRemainingMs;
    setTimerStatus('statusTimerRunning');
    updateTimerDisplay();

    stopTimerInterval();
    timerIntervalId = setInterval(() => {
        if (!timerEndTime) return;
        timerRemainingMs = Math.max(0, timerEndTime - Date.now());
        updateTimerDisplay();
        if (timerRemainingMs <= 0) {
            finishTimer();
        }
    }, 250);
}

function finishTimer() {
    if (!timerEndTime && timerRemainingMs <= 0) return;
    stopTimerInterval();
    timerEndTime = null;
    timerRemainingMs = 0;
    updateTimerDisplay();
    setTimerStatus('statusTimerFinished');
    startAlarmSound(10000);
}

function pauseTimer() {
    if (!timerIntervalId) return;
    stopTimerInterval();
    if (timerEndTime) {
        timerRemainingMs = Math.max(0, timerEndTime - Date.now());
    }
    timerEndTime = null;
    updateTimerDisplay();
    setTimerStatus('statusTimerPaused');
}

function getCycleTimerPhaseLabel() {
    if (cycleTimerPhase === 'break') return t('cycleTimerPhaseBreak');
    if (cycleTimerPhase === 'complete') return t('cycleTimerPhaseComplete');
    return t('cycleTimerPhaseFocus');
}

function getCycleTimerStatusParams() {
    return {
        phase: getCycleTimerPhaseLabel(),
        current: Math.min(cycleTimerCompletedCycles + 1, Math.max(1, cycleTimerTotalCycles)),
        total: Math.max(1, cycleTimerTotalCycles),
        count: cycleTimerTotalCycles,
    };
}

function updateCycleTimerDisplay() {
    const display = document.getElementById('cycleTimerDisplay');
    const phase = document.getElementById('cycleTimerPhase');
    const totalSeconds = Math.max(0, Math.ceil(cycleTimerRemainingMs / 1000));

    if (display) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        display.textContent = `${pad2(minutes)}:${pad2(seconds)}`;
    }
    if (phase) {
        phase.textContent = cycleTimerPhase === 'complete'
            ? getCycleTimerPhaseLabel()
            : t('cycleTimerPhaseCycle', getCycleTimerStatusParams());
    }
}

let lastCycleTimerStatusKey = null;

function setCycleTimerStatus(key) {
    lastCycleTimerStatusKey = key;
    const status = document.getElementById('cycleTimerStatus');
    if (status) status.textContent = key ? t(key, getCycleTimerStatusParams()) : '';
}

function stopCycleTimerInterval() {
    if (cycleTimerIntervalId) {
        clearInterval(cycleTimerIntervalId);
        cycleTimerIntervalId = null;
    }
}

function readCycleTimerSettings() {
    const focusMinutesInput = document.getElementById('cycleTimerFocusMinutesInput');
    const focusSecondsInput = document.getElementById('cycleTimerFocusSecondsInput');
    const breakMinutesInput = document.getElementById('cycleTimerBreakMinutesInput');
    const breakSecondsInput = document.getElementById('cycleTimerBreakSecondsInput');
    const cyclesInput = document.getElementById('cycleTimerCyclesInput');
    if (!focusMinutesInput || !focusSecondsInput || !breakMinutesInput || !breakSecondsInput || !cyclesInput) return null;

    const focusMinutes = Number(focusMinutesInput.value);
    const focusSeconds = Number(focusSecondsInput.value);
    const breakMinutes = Number(breakMinutesInput.value);
    const breakSeconds = Number(breakSecondsInput.value);
    const cycles = Math.floor(Number(cyclesInput.value));
    if (!Number.isFinite(focusMinutes) || !Number.isFinite(focusSeconds)
        || !Number.isFinite(breakMinutes) || !Number.isFinite(breakSeconds)
        || !Number.isFinite(cycles) || focusMinutes < 0 || focusSeconds < 0
        || breakMinutes < 0 || breakSeconds < 0 || cycles < 1) {
        return null;
    }

    const focusDurationSeconds = focusMinutes * 60 + Math.min(59, focusSeconds);
    const breakDurationSeconds = breakMinutes * 60 + Math.min(59, breakSeconds);
    if (!focusDurationSeconds || !breakDurationSeconds) return null;

    return {
        focusDurationMs: Math.floor(focusDurationSeconds * 1000),
        breakDurationMs: Math.floor(breakDurationSeconds * 1000),
        totalCycles: cycles,
    };
}

function setCycleTimerSettings(settings) {
    cycleTimerFocusDurationMs = settings.focusDurationMs;
    cycleTimerBreakDurationMs = settings.breakDurationMs;
    cycleTimerTotalCycles = settings.totalCycles;
    cycleTimerCompletedCycles = 0;
    cycleTimerPhase = 'focus';
    cycleTimerRemainingMs = cycleTimerFocusDurationMs;
    cycleTimerEndTime = null;
    updateCycleTimerDisplay();
}

function tickCycleTimer() {
    if (!cycleTimerEndTime) return;

    cycleTimerRemainingMs = Math.max(0, cycleTimerEndTime - Date.now());
    updateCycleTimerDisplay();
    if (cycleTimerRemainingMs > 0) return;

    playAlarmSound();
    if (cycleTimerPhase === 'focus') {
        cycleTimerPhase = 'break';
        cycleTimerRemainingMs = cycleTimerBreakDurationMs;
    } else {
        cycleTimerCompletedCycles += 1;
        if (cycleTimerCompletedCycles >= cycleTimerTotalCycles) {
            stopCycleTimerInterval();
            cycleTimerEndTime = null;
            cycleTimerPhase = 'complete';
            updateCycleTimerDisplay();
            setCycleTimerStatus('statusCycleTimerComplete');
            return;
        }
        cycleTimerPhase = 'focus';
        cycleTimerRemainingMs = cycleTimerFocusDurationMs;
    }

    cycleTimerEndTime = Date.now() + cycleTimerRemainingMs;
    updateCycleTimerDisplay();
    setCycleTimerStatus('statusCycleTimerRunning');
}

function startCycleTimer() {
    ensureAlarmAudioContext();
    if (!cycleTimerRemainingMs) {
        const settings = readCycleTimerSettings();
        if (!settings) {
            setCycleTimerStatus('statusCycleTimerSetFirst');
            return;
        }
        setCycleTimerSettings(settings);
    }

    cycleTimerEndTime = Date.now() + cycleTimerRemainingMs;
    stopCycleTimerInterval();
    cycleTimerIntervalId = setInterval(tickCycleTimer, 250);
    updateCycleTimerDisplay();
    setCycleTimerStatus('statusCycleTimerRunning');
}

function pauseCycleTimer() {
    if (!cycleTimerIntervalId) return;
    cycleTimerRemainingMs = Math.max(0, cycleTimerEndTime - Date.now());
    cycleTimerEndTime = null;
    stopCycleTimerInterval();
    updateCycleTimerDisplay();
    setCycleTimerStatus('statusCycleTimerPaused');
}

function stopCycleTimer() {
    stopCycleTimerInterval();
    cycleTimerRemainingMs = 0;
    cycleTimerEndTime = null;
    cycleTimerPhase = 'focus';
    cycleTimerCompletedCycles = 0;
    updateCycleTimerDisplay();
    setCycleTimerStatus('statusCycleTimerStopped');
}

function resetCycleTimerState() {
    stopCycleTimerInterval();
    cycleTimerRemainingMs = 0;
    cycleTimerEndTime = null;
    cycleTimerPhase = 'focus';
    cycleTimerCompletedCycles = 0;
    cycleTimerTotalCycles = 0;
    cycleTimerFocusDurationMs = 0;
    cycleTimerBreakDurationMs = 0;

    const focusMinutesInput = document.getElementById('cycleTimerFocusMinutesInput');
    const focusSecondsInput = document.getElementById('cycleTimerFocusSecondsInput');
    const breakMinutesInput = document.getElementById('cycleTimerBreakMinutesInput');
    const breakSecondsInput = document.getElementById('cycleTimerBreakSecondsInput');
    const cyclesInput = document.getElementById('cycleTimerCyclesInput');
    if (focusMinutesInput) focusMinutesInput.value = '0';
    if (focusSecondsInput) focusSecondsInput.value = '0';
    if (breakMinutesInput) breakMinutesInput.value = '0';
    if (breakSecondsInput) breakSecondsInput.value = '0';
    if (cyclesInput) cyclesInput.value = '1';

    updateCycleTimerDisplay();
    setCycleTimerStatus('statusCycleTimerSetFirst');
}

function syncAlarmInlineInput() {
    const input = document.getElementById('alarmTimeInlineInput');
    if (!input) return;
    const stored = getStoredAlarmTime();
    if (stored) {
        input.value = stored;
    }
}

function stopAlarmTimer() {
    if (alarmTimeoutId) {
        clearTimeout(alarmTimeoutId);
        alarmTimeoutId = null;
    }
}

function clearAlarmAlert() {
    if (alarmAlertTimeoutId) {
        clearTimeout(alarmAlertTimeoutId);
        alarmAlertTimeoutId = null;
    }
    const panel = document.getElementById('alarmPanel');
    if (panel) panel.classList.remove('is-alert');
}

function stopAlarmSound() {
    alarmSoundActive = false;
    if (alarmSoundIntervalId) {
        clearInterval(alarmSoundIntervalId);
        alarmSoundIntervalId = null;
    }
    if (alarmSoundStopTimeoutId) {
        clearTimeout(alarmSoundStopTimeoutId);
        alarmSoundStopTimeoutId = null;
    }
    if (customAlarmAudio) {
        customAlarmAudio.pause();
        customAlarmAudio.loop = false;
        customAlarmAudio.currentTime = 0;
    }
}

function updateCustomAlarmSoundStatus() {
    const status = document.getElementById('alarmSoundFileStatus');
    if (!status) return;
    const params = customAlarmFileName ? { name: customAlarmFileName } : null;
    status.textContent = t(customAlarmSoundStatusKey, params);
}

function handleCustomAlarmSoundFile(event) {
    const input = event.currentTarget;
    const file = input && input.files ? input.files[0] : null;
    if (!file) return;

    const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
    if (!isMp3) {
        input.value = '';
        customAlarmSoundStatusKey = 'alarmSoundInvalid';
        updateCustomAlarmSoundStatus();
        return;
    }

    stopAlarmSound();
    if (customAlarmAudioUrl) URL.revokeObjectURL(customAlarmAudioUrl);
    customAlarmAudioUrl = URL.createObjectURL(file);
    customAlarmAudio = new Audio(customAlarmAudioUrl);
    customAlarmAudio.preload = 'auto';
    customAlarmFileName = file.name;
    customAlarmSoundStatusKey = 'alarmSoundSelected';
    updateCustomAlarmSoundStatus();
}

function clearAlarmState() {
    stopAlarmTimer();
    clearAlarmAlert();
    stopAlarmSound();
    setStoredAlarmTime(null);
    setStoredAlarmTarget(null);
    setStoredAlarmSetAt(null);
    const alarmInput = document.getElementById('alarmTimeInlineInput');
    if (alarmInput) alarmInput.value = '';
    showAlarmStatus('statusNoAlarmSet');
    updateAlarmPanel({
        setTimeText: '--',
        nextTimeText: '--',
        statusKey: 'statusNoAlarmSet',
        isAlert: false,
    });
}

function checkAlarmDue() {
    if (!alarmTargetMs) return;
    if (Date.now() < alarmTargetMs) return;

    const timeValue = getStoredAlarmTime() || '--:--';
    setStoredAlarmTarget(null);
    triggerAlarm(timeValue);
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
        return await Notification.requestPermission();
    } catch {
        return 'denied';
    }
}

function ensureAlarmAudioContext() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!alarmAudioContext || alarmAudioContext.state === 'closed') {
        alarmAudioContext = new AudioContextCtor();
    }
    if (alarmAudioContext.state === 'suspended') {
        alarmAudioContext.resume().catch(() => {});
    }
    return alarmAudioContext;
}

function playGeneratedAlarmSound() {
    const context = ensureAlarmAudioContext();
    if (!context) return;
    const duration = 0.25;
    const gap = 0.12;
    const beeps = 4;

    for (let i = 0; i < beeps; i += 1) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.value = 0.0;

        const startAt = context.currentTime + i * (duration + gap);
        const endAt = startAt + duration;
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.5, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(endAt + 0.02);
    }

    // Keep the context alive for repeated alarm beeps.
}

function playAlarmSound() {
    if (!customAlarmAudio) {
        playGeneratedAlarmSound();
        return;
    }

    customAlarmAudio.pause();
    customAlarmAudio.loop = false;
    customAlarmAudio.currentTime = 0;
    const playback = customAlarmAudio.play();
    if (playback) playback.catch(() => playGeneratedAlarmSound());
}

function startAlarmSound(durationMs = 60000, clearAlarmWhenDone = false) {
    stopAlarmSound();
    alarmSoundActive = true;

    if (customAlarmAudio) {
        customAlarmAudio.loop = true;
        customAlarmAudio.currentTime = 0;
        const playback = customAlarmAudio.play();
        if (playback) {
            playback.catch(() => {
                if (!alarmSoundActive) return;
                playGeneratedAlarmSound();
                alarmSoundIntervalId = setInterval(playGeneratedAlarmSound, 1500);
            });
        }
    } else {
        playGeneratedAlarmSound();
        alarmSoundIntervalId = setInterval(playGeneratedAlarmSound, 1500);
    }

    alarmSoundStopTimeoutId = setTimeout(() => {
        stopAlarmSound();
        if (clearAlarmWhenDone) clearAlarmState();
    }, durationMs);
}

function triggerAlarm(timeValue) {
    setStoredAlarmTarget(null);
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t('notificationTitle'), {
            body: t('notificationBody', { time: timeValue }),
            silent: true,
        });
    }

    startAlarmSound(60000, true);
    showAlarmStatus('statusAlarmTriggeredAt', { time: timeValue });
    updateAlarmPanel({
        nextTimeText: timeValue,
        statusKey: 'statusAlarmTriggeredAt',
        statusParams: { time: timeValue },
        isAlert: true,
    });

    clearAlarmAlert();
    alarmAlertTimeoutId = setTimeout(() => {
        const panel = document.getElementById('alarmPanel');
        if (panel) panel.classList.remove('is-alert');
    }, 60000);
}

function scheduleAlarm(timeValue) {
    stopAlarmTimer();
    clearAlarmAlert();
    const nextAlarm = getNextAlarmDate(timeValue);
    if (!nextAlarm) return;

    setStoredAlarmTarget(nextAlarm.getTime());

    const delay = Math.max(0, nextAlarm.getTime() - Date.now());
    alarmTimeoutId = setTimeout(() => {
        triggerAlarm(timeValue);
    }, delay);

    showAlarmStatus('statusAlarmSetFor', { time: timeValue });
    updateAlarmPanel({
        nextTimeText: timeValue,
        statusKey: 'statusAlarmSetFor',
        statusParams: { time: timeValue },
        isAlert: false,
    });
}

function handleAlarmSet() {
    const input = document.getElementById('alarmTimeInlineInput');
    if (!input) return;
    const value = input.value;
    if (!value) {
        showAlarmStatus('statusPleaseSelectTime');
        return;
    }

    ensureAlarmAudioContext();
    setStoredAlarmSetAt(Date.now());
    updateAlarmPanel({
        setTimeText: formatTimeForDisplay(new Date(alarmSetAtMs)),
        nextTimeText: value,
        statusKey: 'statusAlarmSetFor',
        statusParams: { time: value },
        isAlert: false,
    });
    setStoredAlarmTime(value);
    scheduleAlarm(value);
    requestNotificationPermission();
}

// Language / static text
function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    document.title = t('pageTitle');

    const setText = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(key);
    };

    setText('languageSelectLabel', 'languageLabel');
    setText('logGroupTitle', 'logGroupTitle');
    setText('displayGroupTitle', 'displayGroupTitle');
    setText('logTimeStartBtn', 'btnLogStartTime');
    setText('logTimeBtn', 'btnLogCurrentTime');
    setText('logHighlightedTimeBtn', 'btnLogHighlightedTime');
    setText('deleteLastLogBtn', 'btnDeleteLastLog');
    setText('clearLogBtn', 'btnClearLog');
    setText('tableHeaderIndex', 'tableHeaderIndex');
    setText('tableHeaderDate', 'tableHeaderDate');
    setText('tableHeaderStartTime', 'tableHeaderStartTime');
    setText('tableHeaderLoggedTime', 'tableHeaderLoggedTime');
    setText('tableHeaderDuration', 'tableHeaderDuration');
    setText('tableHeaderLogInterval', 'tableHeaderLogInterval');
    setText('alarmSoundStopLabel', 'alarmStopSound');
    setText('alarmSoundFileLabel', 'alarmSoundFileLabel');
    setText('clockPanelTitle', 'clockPanelTitle');
    setText('alarmSetTimeLabel', 'alarmSetTimeLabel');
    setText('alarmNextLabel', 'alarmNextLabel');
    setText('alarmTimeInputLabel', 'alarmTimeInputLabel');
    setText('alarmSetBtn', 'alarmSetBtn');
    setText('alarmResetBtn', 'alarmResetBtn');
    setText('timerTitle', 'timerTitle');
    setText('timerMinLabel', 'timerMinLabel');
    setText('timerSecLabel', 'timerSecLabel');
    setText('timerStartBtn', 'timerStartBtn');
    setText('timerPauseBtn', 'timerPauseBtn');
    setText('timerResetBtn', 'timerResetBtn');
    setText('cycleTimerTitle', 'cycleTimerTitle');
    setText('cycleTimerPhase1Label', 'cycleTimerPhase1Label');
    setText('cycleTimerPhase2Label', 'cycleTimerPhase2Label');
    setText('cycleTimerPhase1MinutesLabel', 'timerMinLabel');
    setText('cycleTimerPhase1SecondsLabel', 'timerSecLabel');
    setText('cycleTimerPhase2MinutesLabel', 'timerMinLabel');
    setText('cycleTimerPhase2SecondsLabel', 'timerSecLabel');
    setText('cycleTimerCyclesLabel', 'cycleTimerCyclesLabel');
    setText('cycleTimerStartBtn', 'timerStartBtn');
    setText('cycleTimerPauseBtn', 'timerPauseBtn');
    setText('cycleTimerStopBtn', 'cycleTimerStopBtn');
    setText('cycleTimerResetBtn', 'timerResetBtn');

    // Text that depends on current app state rather than a fixed key.
    syncFormatToggleUI();
    syncFullscreenClockUI();
    setTimerStatus(lastTimerStatusKey, lastTimerStatusParams);
    updateCycleTimerDisplay();
    setCycleTimerStatus(lastCycleTimerStatusKey);
    updateCustomAlarmSoundStatus();
    showAlarmStatus(lastAlarmStatusKey, lastAlarmStatusParams);
    updateClock();
    refreshAlarmPanelTimes();
}

function initLanguageSelect() {
    const select = document.getElementById('languageSelect');
    if (!select) return;
    select.value = currentLanguage;
    select.addEventListener('change', () => {
        setCurrentLanguage(select.value);
        applyStaticTranslations();
    });
}

function initTimerAccordions() {
    const panels = Array.from(document.querySelectorAll('.timer-accordion'));
    panels.forEach((panel) => {
        const toggle = panel.querySelector('[data-timer-accordion-toggle]');
        const content = panel.querySelector('.timer-accordion__content');
        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            const shouldExpand = content.hidden;
            panels.forEach((otherPanel) => {
                const otherToggle = otherPanel.querySelector('[data-timer-accordion-toggle]');
                const otherContent = otherPanel.querySelector('.timer-accordion__content');
                const otherArrow = otherPanel.querySelector('.timer-accordion__arrow');
                if (!otherToggle || !otherContent) return;

                const isExpanded = otherPanel === panel && shouldExpand;
                otherContent.hidden = !isExpanded;
                otherToggle.setAttribute('aria-expanded', String(isExpanded));
                otherPanel.classList.toggle('is-expanded', isExpanded);
                if (otherArrow) otherArrow.textContent = isExpanded ? '▲' : '▼';
            });
        });
    });
}

function initControlGroupAccordions() {
    const groups = document.querySelectorAll('.control-panel-group');
    groups.forEach((group) => {
        const toggle = group.querySelector('[data-control-group-toggle]');
        const content = group.querySelector('.control-panel-group__content');
        const arrow = group.querySelector('.control-panel-group__arrow');
        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const nextExpanded = !isExpanded;
            content.hidden = !nextExpanded;
            toggle.setAttribute('aria-expanded', String(nextExpanded));
            group.classList.toggle('is-expanded', nextExpanded);
            if (arrow) arrow.textContent = nextExpanded ? '▲' : '▼';
        });
    });
}

// Clock
initTimerAccordions();
initControlGroupAccordions();
initLanguageSelect();
applyStaticTranslations();
syncFormatToggleUI();
updateClock();
setInterval(updateClock, 1000);

// Button
const logTimeBtn = document.getElementById('logTimeBtn');
if (logTimeBtn) {
    logTimeBtn.addEventListener('click', () => logCurrentTime());
}

const logHighlightedTimeBtn = document.getElementById('logHighlightedTimeBtn');
if (logHighlightedTimeBtn) {
    logHighlightedTimeBtn.addEventListener('click', logHighlightedTime);
}

const logTimeStartBtn = document.getElementById('logTimeStartBtn');
if (logTimeStartBtn) {
    logTimeStartBtn.addEventListener('click', logStartTime);
}

const deleteLastLogBtn = document.getElementById('deleteLastLogBtn');
if (deleteLastLogBtn) {
    deleteLastLogBtn.addEventListener('click', deleteLastLogEntry);
}

const clearLogBtn = document.getElementById('clearLogBtn');
if (clearLogBtn) {
    clearLogBtn.addEventListener('click', clearLogTable);
}

const toggleFormatBtn = document.getElementById('toggleFormatBtn');
if (toggleFormatBtn) {
    toggleFormatBtn.addEventListener('click', () => setUse24Hour(!use24Hour));
}

const fullscreenClockBtn = document.getElementById('fullscreenClockBtn');
if (fullscreenClockBtn) {
    fullscreenClockBtn.addEventListener('click', toggleClockFullscreen);
}

const alarmSetBtn = document.getElementById('alarmSetBtn');
if (alarmSetBtn) {
    alarmSetBtn.addEventListener('click', handleAlarmSet);
}

const alarmResetBtn = document.getElementById('alarmResetBtn');
if (alarmResetBtn) {
    alarmResetBtn.addEventListener('click', clearAlarmState);
}

const alarmSoundStopBtn = document.getElementById('alarmSoundStopBtn');
if (alarmSoundStopBtn) {
    alarmSoundStopBtn.addEventListener('click', () => {
        stopAlarmSound();
        clearAlarmAlert();
        showAlarmStatus('statusSoundStopped');
        setTimerStatus('statusSoundStopped');
    });
}

const alarmSoundFileInput = document.getElementById('alarmSoundFileInput');
if (alarmSoundFileInput) {
    alarmSoundFileInput.addEventListener('change', handleCustomAlarmSoundFile);
}

const timerStartBtn = document.getElementById('timerStartBtn');
if (timerStartBtn) {
    timerStartBtn.addEventListener('click', startTimer);
}

const timerPauseBtn = document.getElementById('timerPauseBtn');
if (timerPauseBtn) {
    timerPauseBtn.addEventListener('click', pauseTimer);
}

const timerResetBtn = document.getElementById('timerResetBtn');
if (timerResetBtn) {
    timerResetBtn.addEventListener('click', resetTimerState);
}

const cycleTimerStartBtn = document.getElementById('cycleTimerStartBtn');
if (cycleTimerStartBtn) {
    cycleTimerStartBtn.addEventListener('click', startCycleTimer);
}

const cycleTimerPauseBtn = document.getElementById('cycleTimerPauseBtn');
if (cycleTimerPauseBtn) {
    cycleTimerPauseBtn.addEventListener('click', pauseCycleTimer);
}

const cycleTimerStopBtn = document.getElementById('cycleTimerStopBtn');
if (cycleTimerStopBtn) {
    cycleTimerStopBtn.addEventListener('click', stopCycleTimer);
}

const cycleTimerResetBtn = document.getElementById('cycleTimerResetBtn');
if (cycleTimerResetBtn) {
    cycleTimerResetBtn.addEventListener('click', resetCycleTimerState);
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('clock-fullscreen-mode');
    }
    syncFullscreenClockUI();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkAlarmDue();
        if (timerEndTime && Date.now() >= timerEndTime) {
            finishTimer();
        }
        if (cycleTimerEndTime && Date.now() >= cycleTimerEndTime) {
            tickCycleTimer();
        }
    }
});

syncFullscreenClockUI();


// Keyboard shortcut support
function isTypingTarget(element) {
    if (!element) return false;
    const tag = element.tagName ? element.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    return element.isContentEditable === true;
}

document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (isTypingTarget(document.activeElement)) return;

    const hasModifier = event.ctrlKey || event.altKey || event.metaKey;
    if (hasModifier) return;

    const isSpace = event.code === 'Space' || event.key === ' ';
    const isTab = event.code === 'Enter' || event.key === 'Enter';
    const isEscape = event.code === 'Escape' || event.key === 'Escape';
    const isBackspace = event.code === 'Backspace' || event.key === 'Backspace';
    const isShift = event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.key === 'Shift';

    if (isSpace) {
        event.preventDefault();
        logCurrentTime();
        return;
    }

    if (isShift) {
        event.preventDefault();
        logHighlightedTime();
        return;
    }

    if (isTab && !event.shiftKey) {
        event.preventDefault();
        logStartTime();
        return;
    }

    if (isEscape) {
        // Don't prevent default: lets Esc still exit fullscreen, etc.
        clearLogTable();
        return;
    }

    if (isBackspace) {
        event.preventDefault();
        deleteLastLogEntry();
    }
});

syncTableScrollState();
resetTimerState();
resetCycleTimerState();
syncAlarmInlineInput();

window.addEventListener('resize', syncTableScrollState);

const storedAlarm = getStoredAlarmTime();
alarmTargetMs = getStoredAlarmTarget();
alarmSetAtMs = getStoredAlarmSetAt();
if (storedAlarm) {
    scheduleAlarm(storedAlarm);
} else {
    updateAlarmPanel({
        setTimeText: '--',
        nextTimeText: '--',
        statusKey: 'statusNoAlarmSet',
        isAlert: false,
    });
}
refreshAlarmPanelTimes();

function refreshAlarmPanelTimes() {
    const setText = alarmSetAtMs ? formatTimeForDisplay(new Date(alarmSetAtMs)) : '--';
    const nextText = getStoredAlarmTime() || '--';
    updateAlarmPanel({
        setTimeText: setText,
        nextTimeText: nextText,
    });
}
