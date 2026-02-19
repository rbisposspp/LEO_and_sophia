// js/common.js - Shared JavaScript for all pages.
// Handles navigation, high-contrast mode, and global student progress.

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Navigation Toggle Logic
    const navToggle = document.getElementById('navToggle');
    const primaryNav = document.getElementById('primaryNav');

    function closeNav() {
        if (!navToggle || !primaryNav) return;
        primaryNav.setAttribute('data-visible', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isVisible = primaryNav.getAttribute('data-visible') === 'true';
            primaryNav.setAttribute('data-visible', String(!isVisible));
            navToggle.setAttribute('aria-expanded', String(!isVisible));
        });

        primaryNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeNav();
        });
    }

    // 2. High-Contrast Mode Logic
    const contrastToggle = document.getElementById('contrastToggle');
    const body = document.body;
    const themeStorageKey = 'highContrastMode';

    function applySavedTheme() {
        const savedMode = localStorage.getItem(themeStorageKey);
        if (savedMode === 'true') {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
    }

    if (contrastToggle) {
        contrastToggle.addEventListener('click', () => {
            const isHighContrast = body.classList.toggle('high-contrast');
            localStorage.setItem(themeStorageKey, String(isHighContrast));
        });
    }

    // 3. Global Student Progress (points, actions, and streak)
    const progressStorageKey = 'eslSparkLabProgress';

    function getTodayString() {
        return new Date().toISOString().slice(0, 10);
    }

    function readProgress() {
        const fallback = {
            points: 0,
            actions: 0,
            streak: 0,
            lastActionDate: ''
        };

        try {
            const raw = localStorage.getItem(progressStorageKey);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return {
                points: Number.isFinite(parsed.points) ? parsed.points : 0,
                actions: Number.isFinite(parsed.actions) ? parsed.actions : 0,
                streak: Number.isFinite(parsed.streak) ? parsed.streak : 0,
                lastActionDate: typeof parsed.lastActionDate === 'string' ? parsed.lastActionDate : ''
            };
        } catch (error) {
            return fallback;
        }
    }

    function writeProgress(progress) {
        localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    }

    function dayDifference(fromDate, toDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        const to = new Date(`${toDate}T00:00:00`);
        const diffMs = to.getTime() - from.getTime();
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    }

    function updateProgressWidgets(progress) {
        document.querySelectorAll('[data-progress-points]').forEach(el => {
            el.textContent = String(progress.points);
        });
        document.querySelectorAll('[data-progress-actions]').forEach(el => {
            el.textContent = String(progress.actions);
        });
        document.querySelectorAll('[data-progress-streak]').forEach(el => {
            el.textContent = String(progress.streak);
        });
    }

    function commitProgress(pointsToAdd = 0) {
        const progress = readProgress();
        const today = getTodayString();

        if (progress.lastActionDate !== today) {
            if (!progress.lastActionDate) {
                progress.streak = 1;
            } else {
                const diff = dayDifference(progress.lastActionDate, today);
                if (diff === 1) {
                    progress.streak += 1;
                } else if (diff > 1) {
                    progress.streak = 1;
                }
            }
            progress.lastActionDate = today;
        }

        progress.actions += 1;
        progress.points += Math.max(0, pointsToAdd);

        writeProgress(progress);
        updateProgressWidgets(progress);
        document.dispatchEvent(new CustomEvent('lab:progress-updated', { detail: progress }));
        return progress;
    }

    function addDailyVisitPoints() {
        const today = getTodayString();
        const pageVisitKey = `eslSparkVisit:${window.location.pathname}:${today}`;
        if (localStorage.getItem(pageVisitKey) === 'true') return;
        localStorage.setItem(pageVisitKey, 'true');
        commitProgress(1);
    }

    window.labProgress = {
        addPoints(points = 1) {
            return commitProgress(points);
        },
        recordAction(points = 0) {
            return commitProgress(points);
        },
        getProgress() {
            return readProgress();
        },
        refresh() {
            updateProgressWidgets(readProgress());
        }
    };

    applySavedTheme();
    updateProgressWidgets(readProgress());
    addDailyVisitPoints();
});
