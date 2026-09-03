import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      title={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      style={{ zIndex: 2147483647 }}
      className="
        fixed top-4 right-4
        w-9 h-9
        rounded-full
        shadow-lg
        flex items-center justify-center
        text-lg
        border border-gray-200
        dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-white
        hover:scale-110
        transition-transform
      "
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}