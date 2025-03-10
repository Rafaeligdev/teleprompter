
// DOM Elements
const scriptInput = document.getElementById('scriptInput');
const updateBtn = document.getElementById('updateBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const speedSlider = document.getElementById('speedSlider');
const mirrorToggle = document.getElementById('mirrorToggle');
const teleprompterText = document.getElementById('teleprompterText');
const fontSizeValue = document.getElementById('fontSizeValue');
const speedValue = document.getElementById('speedValue');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const teleprompterContainer = document.getElementById('teleprompterContainer');

// Fullscreen controls
const fsStopBtn = document.getElementById('fsStopBtn');
const fsStartBtn = document.getElementById('fsStartBtn');
const fsExitBtn = document.getElementById('fsExitBtn');
const fsSpeedSlider = document.getElementById('fsSpeedSlider');
const fsFontSizeSlider = document.getElementById('fsFontSizeSlider');

// Teleprompter variables
let scrollInterval;
let scrollSpeed = 2;
let fontSize = 40;
let isScrolling = false;
let isFullscreen = false;

// Initialize
updateText();
updateFontSize();

// Update teleprompter text from textarea
function updateText() {
    teleprompterText.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
    resetScroll();
}

// Update font size
function updateFontSize() {
    fontSize = fontSizeSlider.value;
    fontSizeValue.textContent = fontSize;
    teleprompterText.style.fontSize = `${fontSize}px`;

    // Update fullscreen slider too
    fsFontSizeSlider.value = fontSize;
}

// Update from fullscreen controls
function updateFullscreenFontSize() {
    fontSize = fsFontSizeSlider.value;
    teleprompterText.style.fontSize = `${fontSize}px`;

    // Update main slider too
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = fontSize;
}

// Update speed from fullscreen controls
function updateFullscreenSpeed() {
    scrollSpeed = fsSpeedSlider.value;
    speedSlider.value = scrollSpeed;
    speedValue.textContent = scrollSpeed;
}

// Toggle mirroring
function toggleMirror() {
    if (mirrorToggle.checked) {
        teleprompterText.classList.add('mirrored');
    } else {
        teleprompterText.classList.remove('mirrored');
    }
}

// Reset scroll position
function resetScroll() {
    teleprompterText.style.transform = `translateY(100%)`;
    if (mirrorToggle.checked) {
        teleprompterText.classList.add('mirrored');
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!isFullscreen) {
        // Enter fullscreen
        isFullscreen = true;
        teleprompterContainer.classList.add('fullscreen-mode');

        // Update fullscreen control values
        fsSpeedSlider.value = speedSlider.value;
        fsFontSizeSlider.value = fontSizeSlider.value;

        // Start scrolling
        startScrolling();

        // If browser supports real fullscreen API, use it
        if (teleprompterContainer.requestFullscreen) {
            teleprompterContainer.requestFullscreen();
        } else if (teleprompterContainer.mozRequestFullScreen) {
            teleprompterContainer.mozRequestFullScreen();
        } else if (teleprompterContainer.webkitRequestFullscreen) {
            teleprompterContainer.webkitRequestFullscreen();
        } else if (teleprompterContainer.msRequestFullscreen) {
            teleprompterContainer.msRequestFullscreen();
        }

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    } else {
        // Exit fullscreen
        exitFullscreen();
    }
}

// Handle fullscreen change (might be triggered by Escape key)
function handleFullscreenChange() {
    // Check if browser is still in fullscreen mode
    if (!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement)) {
        exitFullscreen();
    }
}

// Exit fullscreen
function exitFullscreen() {
    if (isFullscreen) {
        isFullscreen = false;
        teleprompterContainer.classList.remove('fullscreen-mode');

        // If browser supports real fullscreen API, use it
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        // Remove event listeners for fullscreen changes
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    }
}

// Start scrolling
function startScrolling() {
    if (isScrolling) return;

    isScrolling = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Make sure we start from the right position
    const containerHeight = teleprompterContainer.offsetHeight;

    // Apply the correct transform based on mirror setting
    if (mirrorToggle.checked) {
        teleprompterText.style.transform = `translateY(${containerHeight}px) scale(-1, 1)`;
    } else {
        teleprompterText.style.transform = `translateY(${containerHeight}px)`;
    }

    // Calculate total distance to scroll (text height + container height)
    const textHeight = teleprompterText.offsetHeight;
    const totalScrollDistance = textHeight + containerHeight;

    // Start the animation
    let startTime = null;
    scrollSpeed = speedSlider.value;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        // Calculate position based on speed (lower number = more pixels per ms)
        const pixelsPerMs = scrollSpeed * 0.03;
        const position = containerHeight - (progress * pixelsPerMs);

        // Stop when the entire text has scrolled past
        if (position < -textHeight) {
            stopScrolling();
            return;
        }

        // Apply mirror transform
        if (mirrorToggle.checked) {
            teleprompterText.style.transform = `translateY(${position}px) scale(-1, 1)`;
        } else {
            teleprompterText.style.transform = `translateY(${position}px)`;
        }

        if (isScrolling) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

// Stop scrolling
function stopScrolling() {
    isScrolling = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Event listeners
updateBtn.addEventListener('click', updateText);
startBtn.addEventListener('click', startScrolling);
stopBtn.addEventListener('click', stopScrolling);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Fullscreen control events
fsStopBtn.addEventListener('click', stopScrolling);
fsStartBtn.addEventListener('click', startScrolling);
fsExitBtn.addEventListener('click', exitFullscreen);
fsSpeedSlider.addEventListener('input', updateFullscreenSpeed);
fsFontSizeSlider.addEventListener('input', updateFullscreenFontSize);

fontSizeSlider.addEventListener('input', updateFontSize);
speedSlider.addEventListener('input', () => {
    scrollSpeed = speedSlider.value;
    speedValue.textContent = scrollSpeed;
    fsSpeedSlider.value = scrollSpeed;
});

mirrorToggle.addEventListener('change', toggleMirror);

// Make sure text resets when window is resized
window.addEventListener('resize', () => {
    if (!isScrolling) {
        resetScroll();
    }
});
