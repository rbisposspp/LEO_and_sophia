// js/story.js - Logic for the interactive story on story.html.
// Handles scene navigation, progress UI, learned-scene tracking, and custom audio playback.

document.addEventListener('DOMContentLoaded', () => {

    const storyContainer = document.getElementById('story-container');
    if (!storyContainer) return;

    const scenes = document.querySelectorAll('.story-scene');
    const prevBtn = document.getElementById('prevSceneBtn');
    const nextBtn = document.getElementById('nextSceneBtn');
    const sceneIndicator = document.getElementById('sceneIndicator');
    const sceneProgressPercent = document.getElementById('sceneProgressPercent');
    const sceneProgressBar = document.getElementById('sceneProgressBar');
    const learnedSceneCount = document.getElementById('learnedSceneCount');
    const markSceneLearnedBtn = document.getElementById('markSceneLearnedBtn');
    const learnedFeedback = document.getElementById('learnedFeedback');

    const learnedScenesStorageKey = 'storyLearnedScenes';
    const audioPlayer = new Audio();
    let currentPlayingButton = null;
    let playbackRequestId = 0;
    let currentSceneIndex = 0;
    const sessionVisitedScenes = new Set();

    function readLearnedScenes() {
        try {
            const raw = localStorage.getItem(learnedScenesStorageKey);
            if (!raw) return new Set();
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return new Set();
            return new Set(parsed.filter((value) => Number.isInteger(value)));
        } catch (error) {
            return new Set();
        }
    }

    function writeLearnedScenes(learnedSet) {
        localStorage.setItem(learnedScenesStorageKey, JSON.stringify(Array.from(learnedSet)));
    }

    const learnedScenes = readLearnedScenes();

    function updateLearnedUI() {
        if (learnedSceneCount) {
            learnedSceneCount.textContent = String(learnedScenes.size);
        }

        if (markSceneLearnedBtn) {
            if (learnedScenes.has(currentSceneIndex)) {
                markSceneLearnedBtn.textContent = 'Scene Already Learned';
                markSceneLearnedBtn.classList.add('secondary-btn');
            } else {
                markSceneLearnedBtn.textContent = 'Mark Scene as Learned';
                markSceneLearnedBtn.classList.remove('secondary-btn');
            }
        }
    }

    function updateSceneProgressUI(index) {
        const progressPercent = Math.round(((index + 1) / scenes.length) * 100);
        if (sceneProgressPercent) {
            sceneProgressPercent.textContent = `${progressPercent}%`;
        }
        if (sceneProgressBar) {
            sceneProgressBar.style.width = `${progressPercent}%`;
        }
    }

    function stopAudio() {
        playbackRequestId++;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        if (currentPlayingButton) {
            currentPlayingButton.innerHTML = '<span class="play-icon">▶</span><span class="pause-icon" hidden>❚❚</span> Play';
            currentPlayingButton.classList.remove('playing');
            currentPlayingButton = null;
        }
    }

    function setPlayingState(playButton) {
        playButton.innerHTML = '<span class="play-icon" hidden>▶</span><span class="pause-icon">❚❚</span> Pause';
        playButton.classList.add('playing');
    }

    async function toggleAudioForButton(playButton) {
        if (!playButton) return;
        const audioSrc = playButton.dataset.audioSrc;
        if (!audioSrc) return;

        if (currentPlayingButton === playButton) {
            stopAudio();
            return;
        }

        if (currentPlayingButton) {
            stopAudio();
        }

        currentPlayingButton = playButton;
        audioPlayer.src = audioSrc;
        const requestId = ++playbackRequestId;

        try {
            await audioPlayer.play();
            if (requestId !== playbackRequestId || currentPlayingButton !== playButton) return;
            setPlayingState(playButton);
            if (window.labProgress) {
                window.labProgress.recordAction(0);
            }
        } catch (error) {
            if (requestId !== playbackRequestId || currentPlayingButton !== playButton) return;
            stopAudio();
        }
    }

    function showScene(index) {
        stopAudio();

        scenes.forEach((scene, i) => {
            scene.classList.toggle('active', i === index);
        });

        if (sceneIndicator) {
            sceneIndicator.textContent = `Scene ${index + 1} of ${scenes.length}`;
        }
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === scenes.length - 1;

        updateSceneProgressUI(index);
        updateLearnedUI();

        if (!sessionVisitedScenes.has(index)) {
            sessionVisitedScenes.add(index);
            if (window.labProgress) {
                window.labProgress.addPoints(1);
            }
        }
    }

    function markCurrentSceneAsLearned() {
        if (learnedScenes.has(currentSceneIndex)) {
            if (learnedFeedback) {
                learnedFeedback.textContent = 'You already marked this scene.';
                learnedFeedback.classList.remove('error');
            }
            return;
        }

        learnedScenes.add(currentSceneIndex);
        writeLearnedScenes(learnedScenes);
        updateLearnedUI();

        if (learnedFeedback) {
            learnedFeedback.textContent = `Nice work. Scene ${currentSceneIndex + 1} marked as learned.`;
            learnedFeedback.classList.remove('error');
        }

        if (window.labProgress) {
            window.labProgress.addPoints(3);
        }
    }

    storyContainer.addEventListener('click', async (event) => {
        const playButton = event.target.closest('.play-audio-btn');
        if (!playButton) return;
        await toggleAudioForButton(playButton);
    });

    audioPlayer.addEventListener('ended', () => {
        stopAudio();
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSceneIndex < scenes.length - 1) {
                currentSceneIndex += 1;
                showScene(currentSceneIndex);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSceneIndex > 0) {
                currentSceneIndex -= 1;
                showScene(currentSceneIndex);
            }
        });
    }

    if (markSceneLearnedBtn) {
        markSceneLearnedBtn.addEventListener('click', markCurrentSceneAsLearned);
    }

    document.addEventListener('keydown', async (event) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

        if (event.key === 'ArrowRight') {
            if (currentSceneIndex < scenes.length - 1) {
                currentSceneIndex += 1;
                showScene(currentSceneIndex);
            }
        } else if (event.key === 'ArrowLeft') {
            if (currentSceneIndex > 0) {
                currentSceneIndex -= 1;
                showScene(currentSceneIndex);
            }
        } else if (event.key.toLowerCase() === 'a') {
            const activeScene = scenes[currentSceneIndex];
            const currentSceneAudioButton = activeScene.querySelector('.play-audio-btn');
            await toggleAudioForButton(currentSceneAudioButton);
        }
    });

    showScene(currentSceneIndex);
});
