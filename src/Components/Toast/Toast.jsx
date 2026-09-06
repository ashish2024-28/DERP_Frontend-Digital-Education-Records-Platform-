import { useEffect, useState } from "react";
import "./Toast.css";

const AUTO_CLOSE_MS = 5000;

const ICONS = {
  success: "✓",
  error: "!",
  info: "i",
  warning: "!",
};

export default function Toast({ type = "success", message, onClose }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setLeaving(false);
    // trigger enter animation on next frame
    const enterFrame = requestAnimationFrame(() => setVisible(true));

    const closeTimer = setTimeout(() => {
      handleClose();
    }, AUTO_CLOSE_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  function handleClose() {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 200); // match exit animation duration
  }

  if (!message) return null;

  return (
    <div className="toast-viewport">
      <div
        className={`toast-card toast-${type} ${visible && !leaving ? "toast-enter" : ""} ${leaving ? "toast-leave" : ""}`}
        role="alert"
      >
        <div className="toast-icon-wrap">
          <span className="toast-icon">{ICONS[type] || ICONS.info}</span>
        </div>

        <div className="toast-body">
          <p className="toast-message">{message}</p>
        </div>

        <button
          type="button"
          className="toast-dismiss"
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          ×
        </button>

        <div className="toast-progress">
          <div className="toast-progress-bar" />
        </div>
      </div>
    </div>
  );
}