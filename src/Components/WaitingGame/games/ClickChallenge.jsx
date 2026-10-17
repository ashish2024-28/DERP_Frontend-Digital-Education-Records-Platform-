//  # 1-minute / 2-minute click game


import { useCallback, useEffect, useState } from "react";
import "./Games.css";

const COLORS = [
    { value: 1, color: "#4285F4" },
    { value: 2, color: "#EA4335" },
    { value: 3, color: "#34A853" },
    { value: 4, color: "#F9AB00" },
    { value: 5, color: "#A142F4" },
];

export default function ClickChallenge() {
    const [duration, setDuration] = useState(60);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [target, setTarget] = useState(COLORS[0]);
    const [started, setStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (!started) return;

        const timer = setInterval(() => {
            setTimeLeft((remaining) => {
                if (remaining <= 1) {
                    clearInterval(timer);
                    setStarted(false);
                    setGameOver(true);
                    return 0;
                }

                return remaining - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [started]);

    const startGame = (seconds = duration) => {
        setDuration(seconds);
        setTimeLeft(seconds);
        setScore(0);
        setTarget(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setGameOver(false);
        setStarted(true);
    };

    const catchNumber = useCallback(() => {
        if (!started || gameOver || timeLeft <= 0) return;

        setScore((current) => current + 1);
        setTarget(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }, [started, gameOver, timeLeft]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const element = document.activeElement;
            const tag = element?.tagName;

            if (
                event.code === "Space" &&
                tag !== "BUTTON" &&
                tag !== "INPUT" &&
                tag !== "TEXTAREA" &&
                !element?.isContentEditable &&
                started &&
                !gameOver
            ) {
                event.preventDefault();
                catchNumber();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [catchNumber, started, gameOver]);

    return (
        <section className="game-panel">
            <div className="game-heading">
                <div>
                    <span className="game-eyebrow">REACTION GAME</span>
                    <h2>Click Challenge</h2>
                    <p>Click the number as quickly as you can!</p>
                </div>

                <div className="game-score">
                    <span>CLICKS</span>
                    <strong>{score}</strong>
                </div>
            </div>

            <div className="game-duration-options">
                {[60, 120].map((seconds) => (
                    <button
                        key={seconds}
                        type="button"
                        className={`game-option ${
                            duration === seconds ? "selected" : ""
                        }`}
                        disabled={started}
                        onClick={() => {
                            setDuration(seconds);
                            setTimeLeft(seconds);
                            setScore(0);
                            setGameOver(false);
                        }}
                    >
                        {seconds === 60 ? "1 Minute" : "2 Minutes"}
                    </button>
                ))}
            </div>

            <div className="game-clock">
                <span>TIME LEFT</span>
                <strong>
                    {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, "0")}
                </strong>
            </div>

            {!started && !gameOver && (
                <button
                    type="button"
                    className="game-primary"
                    onClick={() => startGame()}
                >
                    Start Challenge
                </button>
            )}

            {started && (
                <div className="click-play-area">
                    <p>Every click earns one point.</p>

                    <button
                        type="button"
                        className="click-target"
                        style={{ "--target-color": target.color }}
                        onClick={catchNumber}
                        aria-label="Click to earn one point"
                    >
                        {target.value}
                    </button>

                    <p className="game-hint">
                        Click the number or press Space
                    </p>
                </div>
            )}

            {gameOver && (
                <div className="game-result">
                    <h3>Challenge complete!</h3>
                    <p>
                        You scored <strong>{score}</strong> clicks in{" "}
                        {duration / 60} minute{duration === 120 ? "s" : ""}.
                    </p>

                    <button
                        type="button"
                        className="game-primary"
                        onClick={() => startGame()}
                    >
                        Play Again
                    </button>
                </div>
            )}
        </section>
    );
}
