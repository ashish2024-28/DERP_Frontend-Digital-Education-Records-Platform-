
import { useEffect, useState } from "react";
import ClickChallenge from "./games/ClickChallenge";
import NumberMemoryGame from "./games/NumberMemoryGame";
import "./WaitingGame.css";

const MESSAGES = [
    "Waking up the DERP server...",
    "Preparing your university list...",
    "Your campus is almost ready...",
    "A little game while we wait!",
];

export default function WaitingGame({
    serverReady = false,
    onContinue,
    onKeepPlaying,
    onRetry,
    error = "",
}) {
    const [selectedGame, setSelectedGame] = useState("memory");
    const [elapsed, setElapsed] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (serverReady) return undefined;

        const timer = setInterval(() => {
            setElapsed((value) => value + 1);
        }, 1000);

        const messageTimer = setInterval(() => {
            setMessageIndex((value) => (value + 1) % MESSAGES.length);
        }, 4000);

        return () => {
            clearInterval(timer);
            clearInterval(messageTimer);
        };
    }, [serverReady]);

    return (
        <main className="waiting-game-page">
            
            {/* LEFT: Server status */}
            <section className="waiting-game-card waiting-status">
                <div className="wg-brand">
                    <img src="/Logo.png" alt="DERP logo" />
                    <span>DERP</span>
                </div>

                <div className="wg-illustration" aria-hidden="true">
                    <div className="wg-ring" />
                    <div className="wg-cap">🎓</div>
                    <span className="wg-float wg-book">📚</span>
                    <span className="wg-float wg-star">✨</span>
                    <span className="wg-float wg-note">📝</span>
                </div>

                {!serverReady ? (
                    <>
                        <p className="wg-eyebrow">PLEASE WAIT A MOMENT</p>

                        <h1>Your campus is getting ready!</h1>

                        <p className="wg-description" aria-live="polite">
                            {error || MESSAGES[messageIndex]}
                        </p>

                        <div className="wg-connection">
                            <span className="wg-pulse" />
                            <span>
                                {error
                                    ? "The connection needs attention."
                                    : "Connecting to the university server..."}
                            </span>
                        </div>

                        <div
                            className="wg-progress"
                            role="progressbar"
                            aria-label="Server connection in progress"
                        >
                            <div className="wg-progress-bar" />
                        </div>

                        <p className="wg-time" aria-live="off">
                            Server waiting time: {Math.floor(elapsed / 60)}m{" "}
                            {elapsed % 60}s
                        </p>

                        {onRetry && (
                            <button
                                type="button"
                                className="wg-secondary wg-retry"
                                onClick={onRetry}
                            >
                                ↻ Retry connection
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <p className="wg-eyebrow">CONNECTION READY</p>

                        <h1>Your university list is ready!</h1>

                        <p className="wg-description">
                            Your campus is ready. Continue whenever you like.
                        </p>

                        <div className="wg-ready-actions">
                            <button
                                type="button"
                                className="wg-primary"
                                onClick={onContinue}
                            >
                                Continue to Home
                            </button>

                            <button
                                type="button"
                                className="wg-secondary"
                                onClick={onKeepPlaying}
                            >
                                Keep Playing
                            </button>
                        </div>
                    </>
                )}

                <div className="wg-status-footer">
                    <span className="wg-status-dot" />
                    {serverReady
                        ? "Successfully connected"
                        : "Automatic connection checks are in progress"}
                </div>
            </section>

            {/* RIGHT: Games */}
            <section className="waiting-game-card waiting-games">
                <div className="wg-games-heading">
                    <p className="wg-eyebrow">YOUR WAITING PLAYGROUND</p>
                    <h2>Make the wait productive.</h2>
                    <p className="wg-description">
                        Play a quick brain game while DERP gets ready.
                    </p>
                </div>

                <div className="wg-game-switcher" role="group" aria-label="Choose a game">
                    <button
                        type="button"
                        className={`wg-game-tab ${
                            selectedGame === "memory" ? "active" : ""
                        }`}
                        aria-pressed={selectedGame === "memory"}
                        onClick={() => setSelectedGame("memory")}
                    >
                        <span aria-hidden="true">🧠</span>
                        <span>Number Memory</span>
                    </button>

                    <button
                        type="button"
                        className={`wg-game-tab ${
                            selectedGame === "click" ? "active" : ""
                        }`}
                        aria-pressed={selectedGame === "click"}
                        onClick={() => setSelectedGame("click")}
                    >
                        <span aria-hidden="true">⚡</span>
                        <span>Click Challenge</span>
                    </button>
                </div>

                <div className="wg-game-content">
                    {selectedGame === "memory" ? (
                        <NumberMemoryGame />
                    ) : (
                        <ClickChallenge />
                    )}
                </div>

                <p className="wg-footer">
                    {serverReady
                        ? "DERP is ready. You can continue whenever you want."
                        : "Your connection check continues while you play."}
                </p>
            </section>
        </main>
    );
}
