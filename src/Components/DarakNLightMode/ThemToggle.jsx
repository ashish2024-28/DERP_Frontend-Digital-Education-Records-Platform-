import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{ zIndex: 2147483647 }}
      className="fixed top-4 right-4 w-8 h-8 rounded-full shadow-lg
                 flex items-center justify-center text-xl
                 border border-gray-200 dark:border-gray-600
                 hover:scale-110 transition-transform"
    >
      {theme === "light" ? "🌙" : "🌞"}
    </button>
  );
}