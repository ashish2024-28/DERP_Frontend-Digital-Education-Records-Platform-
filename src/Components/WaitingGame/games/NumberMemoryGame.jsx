
import { useEffect, useState } from "react";
import "./Games.css";

const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const makeSequence = (length) =>
    Array.from({ length }, () => randomInt(0, 9));

const getMemorizeTime = (length) => {
    if (length <= 9) return 3;
    if (length <= 15) return 5;
    return 8;
};

const sequenceKey = (sequence) => sequence.join(",");

function createOptions(correct) {
    const options = [correct];
    const seen = new Set([sequenceKey(correct)]);

    while (options.length < 4) {
        const candidate = [...correct];

        // Change 2–3 positions to make similar options.
        const changes = randomInt(
            2,
            Math.min(3, candidate.length)
        );

        const positions = new Set();

        while (positions.size < changes) {
            positions.add(randomInt(0, candidate.length - 1));
        }

        positions.forEach((index) => {
            let newNumber;

            do {
                newNumber = randomInt(0, 9);
            } while (newNumber === candidate[index]);

            candidate[index] = newNumber;
        });

        const key = sequenceKey(candidate);

        if (!seen.has(key)) {
            seen.add(key);
            options.push(candidate);
        }
    }

    // Shuffle so the correct option appears in a random position.
    for (let i = options.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}

function createRound() {
    const length = randomInt(5, 20);

    return {
        length,
        seconds: getMemorizeTime(length),
        sequence: makeSequence(length),
    };
}

export default function NumberMemoryGame() {
    const [round, setRound] = useState(createRound);
    const [options, setOptions] = useState([]);
    const [phase, setPhase] = useState("memorize");
    const [timeLeft, setTimeLeft] = useState(round.seconds);
    const [score, setScore] = useState(0);
    const [roundNumber, setRoundNumber] = useState(1);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [lastCorrect, setLastCorrect] = useState(null);

    useEffect(() => {
        if (phase !== "memorize") return;

        setTimeLeft(round.seconds);

        const startedAt = Date.now();

        const countdown = setInterval(() => {
            const elapsed = (Date.now() - startedAt) / 1000;
            setTimeLeft(
                Math.max(0, round.seconds - elapsed)
            );
        }, 50);

        const hideTimer = setTimeout(() => {
            setTimeLeft(0);
            setOptions(createOptions(round.sequence));
            setPhase("answer");
        }, round.seconds * 1000);

        return () => {
            clearInterval(countdown);
            clearTimeout(hideTimer);
        };
    }, [phase, round]);

    const chooseAnswer = (option) => {
        if (phase !== "answer") return;

        const isCorrect =
            sequenceKey(option) === sequenceKey(round.sequence);

        setSelected(sequenceKey(option));
        setLastCorrect(isCorrect);

        setFeedback(
            isCorrect
                ? "Correct! +1 point"
                : "Wrong answer! -1 point"
        );

        setScore((current) =>
            isCorrect
                ? current + 1
                : Math.max(0, current - 1)
        );

        setPhase("result");
    };

    const nextRound = () => {
        const next = createRound();

        setRound(next);
        setOptions([]);
        setSelected(null);
        setFeedback("");
        setLastCorrect(null);
        setTimeLeft(next.seconds);
        setRoundNumber((current) => current + 1);
        setPhase("memorize");
    };

    const restart = () => {
        const next = createRound();

        setRound(next);
        setOptions([]);
        setSelected(null);
        setFeedback("");
        setLastCorrect(null);
        setScore(0);
        setRoundNumber(1);
        setTimeLeft(next.seconds);
        setPhase("memorize");
    };

    const formatTime = (seconds) =>
        Math.max(0, seconds).toFixed(1);

    return (
        <section className="game-panel">
            <div className="game-heading">
                <div>
                    <span className="game-eyebrow">
                        MEMORY GAME
                    </span>

                    <h2>Number Memory</h2>

                    <p>
                        Memorize the sequence and select the
                        exact matching option.
                    </p>
                </div>

                <div className="game-score">
                    <span>SCORE</span>
                    <strong>{score}</strong>
                </div>
            </div>

            <div className="memory-stats">
                <span>Round {roundNumber}</span>
                <span>{round.length} numbers</span>
                <span>{round.seconds}s to memorize</span>
            </div>

            {phase === "memorize" && (
                <div className="memory-area">
                    <p className="memory-instruction">
                        Remember the numbers!
                    </p>

                    <div
                        className="memory-sequence"
                        aria-label="Number sequence to memorize"
                    >
                        {round.sequence.map((number, index) => (
                            <span
                                className="memory-digit"
                                key={index}
                            >
                                {number}
                            </span>
                        ))}
                    </div>

                    <div className="memory-countdown">
                        {formatTime(timeLeft)}
                        <span>seconds remaining</span>
                    </div>
                </div>
            )}

            {phase === "answer" && (
                <div className="memory-area">
                    <p className="memory-instruction">
                        Which sequence did you see?
                    </p>

                    <div className="memory-options">
                        {options.map((option, index) => {
                            const key = sequenceKey(option);

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className="memory-option"
                                    onClick={() => chooseAnswer(option)}
                                >
                                    <span className="memory-option-label">
                                        Option {String.fromCharCode(65 + index)}
                                    </span>

                                    <span className="memory-option-digits">
                                        {option.join(" ")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {phase === "result" && (
                <div className="game-result">
                    <h3>
                        {lastCorrect
                            ? "Correct! 🎉"
                            : "Not quite!"}
                    </h3>

                    <p>{feedback}</p>

                    <p className="memory-answer-label">
                        Correct sequence:
                    </p>

                    <div className="memory-sequence">
                        {round.sequence.map((number, index) => (
                            <span
                                className="memory-digit"
                                key={index}
                            >
                                {number}
                            </span>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="game-primary"
                        onClick={nextRound}
                    >
                        Next Round
                    </button>

                    <button
                        type="button"
                        className="game-option"
                        onClick={restart}
                    >
                        Restart Game
                    </button>
                </div>
            )}
        </section>
    );
}
