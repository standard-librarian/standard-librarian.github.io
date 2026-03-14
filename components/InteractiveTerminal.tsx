"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";

type InteractiveTerminalProps = {
  commands: Record<string, string>;
  prompt?: string;
  greeting?: string;
  /** When true, cycles through commands automatically with a typewriter effect, then clears and repeats. */
  autoplay?: boolean;
};

type HistoryEntry = { input: string; output: string };

export function InteractiveTerminal({
  commands,
  prompt = "$",
  greeting,
  autoplay = false,
}: InteractiveTerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(
    greeting ? [{ input: "", output: greeting }] : []
  );
  const [draft, setDraft] = useState("");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus on mount (interactive mode only)
  useEffect(() => {
    if (!autoplay) inputRef.current?.focus();
  }, [autoplay]);

  // Scroll to bottom when history grows
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, draft]);

  // Autoplay loop: type each command, show output, clear, repeat
  useEffect(() => {
    if (!autoplay) return;

    const entries = Object.entries(commands);
    if (entries.length === 0) return;

    let cmdIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;

    function typeNextChar() {
      const [input] = entries[cmdIdx];
      charIdx++;
      setDraft(input.slice(0, charIdx));

      if (charIdx < input.length) {
        timer = setTimeout(typeNextChar, 55);
      } else {
        // Finished typing — pause then commit
        timer = setTimeout(commitCommand, 280);
      }
    }

    function commitCommand() {
      const [input, output] = entries[cmdIdx];
      setDraft("");
      setHistory((h) => [...h, { input, output }]);
      charIdx = 0;
      cmdIdx++;

      if (cmdIdx < entries.length) {
        // More commands — pause then type next
        timer = setTimeout(typeNextChar, 900);
      } else {
        // All done — pause then clear and restart
        timer = setTimeout(clearAndRestart, 1800);
      }
    }

    function clearAndRestart() {
      setHistory([]);
      cmdIdx = 0;
      timer = setTimeout(typeNextChar, 500);
    }

    // Initial delay before starting
    timer = setTimeout(typeNextChar, 800);
    return () => clearTimeout(timer);
  }, [autoplay]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusInput = useCallback(() => {
    if (!autoplay) inputRef.current?.focus();
  }, [autoplay]);

  const execute = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      let output: string;
      if (cmd === "clear") {
        setHistory([]);
        setDraft("");
        setInputHistory((h) => [cmd, ...h]);
        setHistoryIndex(-1);
        return;
      } else if (cmd === "help") {
        const keys = Object.keys(commands);
        output = "Available commands: " + keys.join(", ") + ", help, clear";
      } else if (cmd in commands) {
        output = commands[cmd];
      } else {
        output = `command not found: ${cmd}`;
      }

      setHistory((h) => [...h, { input: cmd, output }]);
      setInputHistory((h) => [cmd, ...h]);
      setHistoryIndex(-1);
      setDraft("");
    },
    [commands]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        execute(draft);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHistoryIndex((idx) => {
          const next = Math.min(idx + 1, inputHistory.length - 1);
          setDraft(inputHistory[next] ?? "");
          return next;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHistoryIndex((idx) => {
          const next = idx - 1;
          if (next < 0) {
            setDraft("");
            return -1;
          }
          setDraft(inputHistory[next] ?? "");
          return next;
        });
      }
    },
    [draft, execute, inputHistory]
  );

  return (
    <div className="terminal" onClick={focusInput}>
      <div className="terminal-chrome">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <div className="terminal-line">
                <span className="terminal-prompt">{prompt}</span>
                <span>{entry.input}</span>
              </div>
            )}
            <div className="terminal-output">{entry.output}</div>
          </div>
        ))}
        <div className="terminal-line terminal-input-line">
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={draft}
            onChange={autoplay ? undefined : (e) => setDraft(e.target.value)}
            onKeyDown={autoplay ? undefined : handleKeyDown}
            readOnly={autoplay}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="terminal input"
            aria-hidden={autoplay}
            tabIndex={autoplay ? -1 : 0}
          />
        </div>
      </div>
    </div>
  );
}
