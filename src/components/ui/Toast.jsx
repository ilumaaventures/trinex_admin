import { useEffect } from "react";
import { TechnicalIcon } from "./TechnicalIcon";

export function Toast({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#315C3C] text-white border border-[#527C50] rounded-[3px] shadow-2xl animate-bounce-short text-xs font-sans font-medium select-none"
      role="alert"
    >
      <span className="w-2 h-2 rounded-full bg-[#A6C96A] animate-pulse" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white ml-2 p-0.5"
      >
        <TechnicalIcon name="x" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
