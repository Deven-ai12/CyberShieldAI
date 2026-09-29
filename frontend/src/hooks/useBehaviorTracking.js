import { useEffect, useRef } from 'react';
import { behaviorService } from '../services/behaviorService.js';
import { getDeviceFingerprint } from '../utils/device.js';
import { useSecurity } from '../context/SecurityContext.jsx';

// Send behavior data every 10 seconds
const tickMs = 10000;

function average(values) {
    if (!values.length) return 0;

    return values.reduce((total, value) => total + value, 0) / values.length;
}

function typingRhythmFromIntervals(intervals) {
    if (intervals.length < 3) return 100;

    const avg = average(intervals);

    const variance = average(
        intervals.map((value) => (value - avg) ** 2)
    );

    const normalized = Math.max(
        0,
        100 - Math.sqrt(variance) / 4
    );

    return Math.round(normalized);
}

export function useBehaviorTracking() {

    const { updateFromBehavior } = useSecurity();

    const keyIntervalsRef = useRef([]);
    const lastKeyAtRef = useRef(0);

    const mouseSpeedsRef = useRef([]);
    const mousePathRef = useRef([]);
    const lastMouseRef = useRef(null);

    const clickTimesRef = useRef([]);

    const tabSwitchCountRef = useRef(0);

    const copyPasteRef = useRef(false);
    const autofillRef = useRef(false);
    const rageClickRef = useRef(false);

    const scrollDepthRef = useRef(0);
    const scrollVelocityRef = useRef(0);

    const lastScrollRef = useRef({
        y: 0,
        at: performance.now(),
    });

    const lastActivityRef = useRef(Date.now());

    useEffect(() => {

        const markActivity = () => {
            lastActivityRef.current = Date.now();
        };

        // Keyboard Tracking
        const onKeyDown = (event) => {

            markActivity();

            if (
                event.key.length !== 1 &&
                event.key !== 'Backspace'
            ) {
                return;
            }

            const now = performance.now();

            if (lastKeyAtRef.current) {

                const interval =
                    now - lastKeyAtRef.current;

                if (
                    interval > 20 &&
                    interval < 3000
                ) {

                    keyIntervalsRef.current = [
                        ...keyIntervalsRef.current,
                        interval,
                    ].slice(-40);
                }
            }

            lastKeyAtRef.current = now;
        };

        // Mouse Movement Tracking
        const onMouseMove = (event) => {

            markActivity();

            const now = performance.now();

            const previous =
                lastMouseRef.current;

            const point = {
                x: event.clientX,
                y: event.clientY,
                t: now,
            };

            if (previous) {

                const distance = Math.hypot(
                    point.x - previous.x,
                    point.y - previous.y
                );

                const elapsed = Math.max(
                    1,
                    now - previous.t
                );

                mouseSpeedsRef.current = [
                    ...mouseSpeedsRef.current,
                    (distance / elapsed) * 1000,
                ].slice(-50);
            }

            lastMouseRef.current = point;

            mousePathRef.current = [
                ...mousePathRef.current,
                point,
            ].slice(-80);
        };

        // Click Tracking
        const onClick = () => {

            markActivity();

            const now = Date.now();

            clickTimesRef.current = [
                ...clickTimesRef.current,
                now,
            ].filter(
                (time) => now - time <= 10000
            );

            const burst =
                clickTimesRef.current.filter(
                    (time) => now - time <= 1600
                ).length;

            if (burst >= 7) {
                rageClickRef.current = true;
            }
        };

        // Copy / Paste Detection
        const onPaste = () => {
            markActivity();
            copyPasteRef.current = true;
        };

        const onCopy = () => {
            markActivity();
            copyPasteRef.current = true;
        };

        // Autofill Detection
        const onInput = (event) => {

            markActivity();

            const value =
                event.target?.value || '';

            const inputType =
                event.inputType || '';

            if (
                value.length >= 8 &&
                (
                    inputType ===
                    'insertReplacementText' ||
                    inputType === '' ||
                    event.detail === 0
                )
            ) {
                autofillRef.current = true;
            }
        };

        // Tab Switch Tracking
        const onVisibilityChange = () => {

            if (document.hidden) {
                tabSwitchCountRef.current += 1;
            }
        };

        // Scroll Tracking
        const onScroll = () => {

            markActivity();

            const now = performance.now();

            const y = window.scrollY;

            const docHeight = Math.max(
                1,
                document.documentElement
                    .scrollHeight -
                window.innerHeight
            );

            scrollDepthRef.current =
                Math.round((y / docHeight) * 100);

            const elapsed = Math.max(
                1,
                now - lastScrollRef.current.at
            );

            scrollVelocityRef.current =
                (
                    Math.abs(
                        y - lastScrollRef.current.y
                    ) / elapsed
                ) * 1000;

            lastScrollRef.current = {
                y,
                at: now,
            };
        };

        // Event Listeners
        window.addEventListener(
            'keydown',
            onKeyDown,
            { passive: true }
        );

        window.addEventListener(
            'mousemove',
            onMouseMove,
            { passive: true }
        );

        window.addEventListener(
            'click',
            onClick,
            { passive: true }
        );

        window.addEventListener(
            'paste',
            onPaste,
            { passive: true }
        );

        window.addEventListener(
            'copy',
            onCopy,
            { passive: true }
        );

        window.addEventListener(
            'input',
            onInput,
            { passive: true }
        );

        window.addEventListener(
            'scroll',
            onScroll,
            { passive: true }
        );

        document.addEventListener(
            'visibilitychange',
            onVisibilityChange
        );

        // Send Data Every 10 Seconds
        const interval = window.setInterval(() => {

            const intervals =
                keyIntervalsRef.current;

            const avgKeyInterval =
                average(intervals);

            const typingSpeed =
                avgKeyInterval
                    ? Math.round(
                        60000 / avgKeyInterval
                    )
                    : 0;

            const recentClicks =
                clickTimesRef.current.filter(
                    (time) =>
                        Date.now() - time <= 10000
                ).length;

            const payload = {

                typingSpeed,

                typingRhythm:
                    typingRhythmFromIntervals(
                        intervals
                    ),

                mouseMovementSpeed:
                    Math.round(
                        average(
                            mouseSpeedsRef.current
                        )
                    ),

                mousePath:
                    mousePathRef.current.map(
                        ({ x, y }) => ({
                            x,
                            y,
                        })
                    ),

                clickFrequency:
                    Math.round(recentClicks * 6),

                rageClickDetected:
                rageClickRef.current,

                copyPasteDetected:
                copyPasteRef.current,

                autofillDetected:
                autofillRef.current,

                tabSwitchCount:
                tabSwitchCountRef.current,

                inactiveTime:
                    Math.round(
                        (
                            Date.now() -
                            lastActivityRef.current
                        ) / 1000
                    ),

                scrollDepth:
                scrollDepthRef.current,

                scrollVelocity:
                    Math.round(
                        scrollVelocityRef.current
                    ),

                deviceFingerprint:
                    getDeviceFingerprint(),

                capturedAt:
                    new Date().toISOString(),
            };

            updateFromBehavior(payload);

            behaviorService
                .trackBehavior(payload)
                .catch(() => {});

            // Reset temporary flags
            copyPasteRef.current = false;
            autofillRef.current = false;
            rageClickRef.current = false;
            scrollVelocityRef.current = 0;

        }, tickMs);

        return () => {

            window.removeEventListener(
                'keydown',
                onKeyDown
            );

            window.removeEventListener(
                'mousemove',
                onMouseMove
            );

            window.removeEventListener(
                'click',
                onClick
            );

            window.removeEventListener(
                'paste',
                onPaste
            );

            window.removeEventListener(
                'copy',
                onCopy
            );

            window.removeEventListener(
                'input',
                onInput
            );

            window.removeEventListener(
                'scroll',
                onScroll
            );

            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange
            );

            window.clearInterval(interval);
        };

    }, [updateFromBehavior]);
}