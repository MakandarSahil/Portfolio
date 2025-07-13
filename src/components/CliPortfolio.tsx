"use client";
import React, {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface HistoryEntry {
  id: string;
  type: "input" | "output";
  value: string | ReactNode;
  isTyping?: boolean;
  typedValue?: string | ReactNode;
}

const extractTextFromReactNode = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join("");
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextFromReactNode(props.children);
    }
  }
  return "";
};

const typeReactNodeProgressively = (
  node: ReactNode,
  charsToReveal: number
): { typedNode: ReactNode; charsConsumed: number } => {
  let charsConsumed = 0;
  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    const typedText = text.substring(0, Math.min(text.length, charsToReveal));
    charsConsumed = Math.min(text.length, charsToReveal);
    return { typedNode: typedText, charsConsumed };
  }
  if (Array.isArray(node)) {
    const typedChildren: ReactNode[] = [];
    for (let i = 0; i < node.length; i++) {
      const child = node[i];
      const { typedNode, charsConsumed: childChars } =
        typeReactNodeProgressively(child, charsToReveal - charsConsumed);
      typedChildren.push(typedNode);
      charsConsumed += childChars;
    }
    return { typedNode: typedChildren, charsConsumed };
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const typedChildren: ReactNode[] = [];
    let childIndex = 0;
    React.Children.forEach(element.props.children, (child) => {
      if (child === null || child === undefined) {
        typedChildren.push(child);
        return;
      }
      const { typedNode, charsConsumed: childChars } =
        typeReactNodeProgressively(child, charsToReveal - charsConsumed);
      if (React.isValidElement(typedNode) && !typedNode.key) {
        typedChildren.push(
          React.cloneElement(typedNode, { key: `typed-${childIndex}` })
        );
      } else {
        typedChildren.push(typedNode);
      }
      charsConsumed += childChars;
      childIndex++;
    });
    return {
      typedNode: React.cloneElement(element, element.props, ...typedChildren),
      charsConsumed,
    };
  }
  return { typedNode: node, charsConsumed: 0 };
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const CliPortfolio: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [command, setCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState("~");
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const typeOutput = (content: string | ReactNode, entryId: string) => {
    const fullTextLength =
      typeof content === "string"
        ? content.length
        : extractTextFromReactNode(content).length;
    let currentCharsRevealed = 0;
    const animateTyping = () => {
      if (currentCharsRevealed <= fullTextLength && !isInterrupted) {
        let typedContent: string | ReactNode;
        if (typeof content === "string") {
          typedContent = content.substring(0, currentCharsRevealed);
        } else {
          const { typedNode } = typeReactNodeProgressively(
            content,
            currentCharsRevealed
          );
          typedContent = typedNode;
        }
        setHistory((prev) => {
          const newHistory = [...prev];
          const entryIndex = newHistory.findIndex(
            (entry) => entry.id === entryId
          );
          if (entryIndex !== -1 && newHistory[entryIndex].type === "output") {
            newHistory[entryIndex] = {
              ...newHistory[entryIndex],
              typedValue: typedContent,
              isTyping: currentCharsRevealed < fullTextLength,
            };
          }
          return newHistory;
        });
        currentCharsRevealed++;
        setTimeout(animateTyping, Math.random() * 20 + 10);
      } else {
        setHistory((prev) => {
          const newHistory = [...prev];
          const entryIndex = newHistory.findIndex(
            (entry) => entry.id === entryId
          );
          if (entryIndex !== -1 && newHistory[entryIndex].type === "output") {
            newHistory[entryIndex] = {
              ...newHistory[entryIndex],
              typedValue: isInterrupted ? "^C" : content,
              isTyping: false,
            };
          }
          return newHistory;
        });
        setIsProcessing(false);
        setIsInterrupted(false);
      }
    };
    animateTyping();
  };

  useEffect(() => {
    const welcomeMessage = (
      <div className="py-1">
        {/* Hide ASCII art on very small screens */}
        <div className="text-green-400 mb-2 hidden sm:block">
          <pre className="text-xs sm:text-sm overflow-x-auto">
            {`
 ██████╗██╗     ██╗    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔════╝██║     ██║    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██║     ██║     ██║    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██║     ██║     ██║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
╚██████╗███████╗██║    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝╚══════╝╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`}
          </pre>
        </div>
        {/* Mobile-friendly title */}
        <div className="text-green-400 mb-2 block sm:hidden">
          <h2 className="text-lg font-bold">CLI PORTFOLIO</h2>
        </div>
        <p className="text-green-400">
          Welcome to Sahil Makandar's CLI Portfolio!
        </p>
        <p className="break-words">
          Type <span className="text-green-400">'help'</span> to see available
          commands.
        </p>
        <p className="text-green-300/60 text-sm sm:text-base mt-2 break-words">
          💡 Try:{" "}
          <span className="text-green-400">ls, pwd, whoami, neofetch</span>
        </p>
        <p className="text-green-300/60 text-sm sm:text-base break-words">
          ⌨️ Shortcuts: Ctrl+C, Ctrl+L, ↑↓
        </p>
      </div>
    );
    const welcomeEntryId = generateId();
    setHistory([
      {
        id: welcomeEntryId,
        type: "output",
        value: welcomeMessage,
        isTyping: true,
        typedValue: "",
      },
    ]);
    setTimeout(() => {
      typeOutput(welcomeMessage, welcomeEntryId);
    }, 500);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ctrl+C interrupt
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        if (isProcessing) {
          setIsInterrupted(true);
          const interruptId = generateId();
          setHistory((prev) => [
            ...prev,
            {
              id: interruptId,
              type: "output",
              value: "^C",
              isTyping: false,
              typedValue: "^C",
            },
          ]);
          setIsProcessing(false);
          setCommand("");
          inputRef.current?.focus();
        }
      }
      // Ctrl+L clear screen
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        setHistory([]);
        setCommand("");
        inputRef.current?.focus();
      }
      // Ctrl+D exit
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        const exitId = generateId();
        setHistory((prev) => [
          ...prev,
          {
            id: exitId,
            type: "output",
            value: "logout\n[Process completed]",
            isTyping: false,
            typedValue: "logout\n[Process completed]",
          },
        ]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing]);

  const handleCommandSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle arrow keys for command history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
      return;
    }

    if (e.key === "Enter" && !isProcessing) {
      const trimmedCommand = command.trim();
      if (trimmedCommand === "") return;

      // Add to command history
      setCommandHistory((prev) => [...prev, trimmedCommand]);
      setHistoryIndex(-1);

      setIsProcessing(true);
      inputRef.current?.blur();
      const inputEntryId = generateId();
      const outputEntryId = generateId();
      const newHistory: HistoryEntry[] = [
        ...history,
        {
          id: inputEntryId,
          type: "input",
          value: trimmedCommand,
          isTyping: false,
          typedValue: trimmedCommand,
        },
        {
          id: outputEntryId,
          type: "output",
          value: "",
          isTyping: true,
          typedValue: "",
        },
      ];
      setHistory(newHistory);
      setCommand("");
      let output: string | ReactNode = "";

      // Handle cd command with arguments
      if (trimmedCommand.startsWith("cd ") || trimmedCommand === "cd") {
        const args = trimmedCommand.split(" ");
        const targetDir = args[1] || "~";

        let output: string | ReactNode = "";

        switch (targetDir) {
          case "~":
          case "":
            setCurrentDirectory("~");
            output = (
              <div className="py-1 text-green-400">
                Changed directory to home (~)
              </div>
            );
            break;
          case "..":
            if (currentDirectory !== "~") {
              setCurrentDirectory("~");
              output = (
                <div className="py-1 text-green-400">
                  Changed directory to home (~)
                </div>
              );
            } else {
              output = (
                <div className="py-1 text-yellow-400">
                  Already at root directory
                </div>
              );
            }
            break;
          case "projects":
            setCurrentDirectory("~/projects");
            output = (
              <div className="py-1">
                <p className="text-green-400">
                  Changed directory to ~/projects
                </p>
                <p className="text-green-300/80 text-sm sm:text-base mt-1 break-words">
                  📁 Available: project-alpha, project-beta, cli-portfolio,
                  weather-dashboard
                </p>
              </div>
            );
            break;
          case "skills":
            setCurrentDirectory("~/skills");
            output = (
              <div className="py-1">
                <p className="text-green-400">Changed directory to ~/skills</p>
                <p className="text-green-300/80 text-sm sm:text-base mt-1 break-words">
                  💻 Categories: languages, frontend, backend, databases, devops
                </p>
              </div>
            );
            break;
          case "experience":
            setCurrentDirectory("~/experience");
            output = (
              <div className="py-1">
                <p className="text-green-400">
                  Changed directory to ~/experience
                </p>
                <p className="text-green-300/80 text-sm sm:text-base mt-1 break-words">
                  💼 History: tech-innovators-inc, digital-solutions-ltd
                </p>
              </div>
            );
            break;
          case "education":
            setCurrentDirectory("~/education");
            output = (
              <div className="py-1">
                <p className="text-green-400">
                  Changed directory to ~/education
                </p>
                <p className="text-green-300/80 text-sm sm:text-base mt-1 break-words">
                  🎓 Records: computer-science-degree, certifications
                </p>
              </div>
            );
            break;
          default:
            output = (
              <div className="py-1 text-red-400">
                cd: {targetDir}: No such file or directory
              </div>
            );
        }

        setTimeout(() => typeOutput(output, outputEntryId), 100);
        return;
      }

      // Handle mkdir command
      if (trimmedCommand.startsWith("mkdir ")) {
        const args = trimmedCommand.split(" ");
        const dirName = args[1];

        if (dirName) {
          output = (
            <div className="py-1 text-green-400">
              mkdir: created directory '{dirName}'
            </div>
          );
        } else {
          output = (
            <div className="py-1 text-red-400">mkdir: missing operand</div>
          );
        }

        setTimeout(() => typeOutput(output, outputEntryId), 100);
        return;
      }

      switch (trimmedCommand.toLowerCase()) {
        case "help":
          output = (
            <div className="py-1">
              <p className="text-green-400 mb-2">📋 Available commands:</p>
              <div className="space-y-2">
                <div>
                  <p className="text-green-300/80 font-semibold text-sm">
                    Portfolio Commands:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:text-base">
                    {[
                      { cmd: "about", desc: "Learn more about me" },
                      { cmd: "projects", desc: "See my projects" },
                      { cmd: "skills", desc: "List my skills" },
                      { cmd: "contact", desc: "How to reach me" },
                      { cmd: "education", desc: "Academic background" },
                      { cmd: "experience", desc: "Work experience" },
                    ].map(({ cmd, desc }) => (
                      <div key={cmd} className="flex flex-col sm:flex-row">
                        <span className="text-green-400 w-full sm:w-20 font-mono">
                          {cmd}
                        </span>
                        <span className="text-green-300/70 text-sm sm:text-base">
                          - {desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-green-300/80 font-semibold text-sm">
                    System Commands:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-sm sm:text-base">
                    {[
                      { cmd: "ls", desc: "List directory contents" },
                      { cmd: "pwd", desc: "Print working directory" },
                      { cmd: "whoami", desc: "Current user info" },
                      { cmd: "date", desc: "Show current date/time" },
                      { cmd: "uptime", desc: "System uptime" },
                      { cmd: "neofetch", desc: "System information" },
                      { cmd: "matrix", desc: "Enter the matrix" },
                      { cmd: "cowsay", desc: "Make a cow say something" },
                      { cmd: "fortune", desc: "Random quote" },
                      { cmd: "clear", desc: "Clear terminal" },
                    ].map(({ cmd, desc }) => (
                      <div key={cmd} className="flex flex-col sm:flex-row">
                        <span className="text-green-400 w-full sm:w-20 font-mono">
                          {cmd}
                        </span>
                        <span className="text-green-300/70 text-sm sm:text-base">
                          - {desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-green-300/60 text-sm sm:text-base">
                <p>⌨️ Keyboard shortcuts:</p>
                <p className="break-words">
                  • Ctrl+C - Interrupt • Ctrl+L - Clear • Ctrl+D - Exit
                </p>
                <p>• ↑↓ Arrow keys - Command history</p>
              </div>
            </div>
          );
          break;

        case "ls":
          let lsContent;
          switch (currentDirectory) {
            case "~/projects":
              lsContent = (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base">
                  <span className="text-green-400 break-all">
                    📄 project-alpha.md
                  </span>
                  <span className="text-green-400 break-all">
                    📄 project-beta.md
                  </span>
                  <span className="text-green-400 break-all">
                    📄 cli-portfolio.md
                  </span>
                  <span className="text-green-400 break-all">
                    📄 weather-dashboard.md
                  </span>
                  <span className="text-blue-400">📁 demos/</span>
                  <span className="text-blue-400">📁 screenshots/</span>
                </div>
              );
              break;
            case "~/skills":
              lsContent = (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base">
                  <span className="text-blue-400">📁 languages/</span>
                  <span className="text-blue-400">📁 frontend/</span>
                  <span className="text-blue-400">📁 backend/</span>
                  <span className="text-blue-400">📁 databases/</span>
                  <span className="text-blue-400">📁 devops/</span>
                  <span className="text-green-400 break-all">
                    📄 skills-summary.txt
                  </span>
                </div>
              );
              break;
            case "~/experience":
              lsContent = (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base">
                  <span className="text-blue-400 break-all">
                    📁 tech-innovators-inc/
                  </span>
                  <span className="text-blue-400 break-all">
                    📁 digital-solutions-ltd/
                  </span>
                  <span className="text-green-400">📄 resume.pdf</span>
                  <span className="text-green-400 break-all">
                    📄 recommendations.txt
                  </span>
                </div>
              );
              break;
            case "~/education":
              lsContent = (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base">
                  <span className="text-blue-400 break-all">
                    📁 computer-science/
                  </span>
                  <span className="text-blue-400">📁 certifications/</span>
                  <span className="text-green-400">📄 transcript.pdf</span>
                  <span className="text-green-400">📄 degree.pdf</span>
                </div>
              );
              break;
            default:
              lsContent = (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base">
                  <span className="text-blue-400">📁 projects/</span>
                  <span className="text-blue-400">📁 skills/</span>
                  <span className="text-blue-400">📁 experience/</span>
                  <span className="text-blue-400">📁 education/</span>
                  <span className="text-green-400">📄 about.txt</span>
                  <span className="text-green-400">📄 contact.md</span>
                  <span className="text-green-400">📄 resume.pdf</span>
                  <span className="text-yellow-400">⚡ portfolio.exe</span>
                </div>
              );
          }
          output = <div className="py-1 font-mono">{lsContent}</div>;
          break;

        case "pwd":
          output = (
            <div className="py-1 text-green-400 break-all text-sm sm:text-base">
              /home/sahil/portfolio
              {currentDirectory === "~"
                ? ""
                : currentDirectory.replace("~", "")}
            </div>
          );
          break;

        case "whoami":
          output = (
            <div className="py-1">
              <p className="text-green-400">sahil</p>
              <p className="text-green-300/80 text-sm sm:text-base break-words">
                Full Name: Sahil Makandar
              </p>
              <p className="text-green-300/80 text-sm sm:text-base">
                Role: Software Engineer
              </p>
              <p className="text-green-300/80 text-sm sm:text-base break-words">
                Status: Available for opportunities
              </p>
            </div>
          );
          break;

        case "date":
          output = (
            <div className="py-1 text-green-400 text-sm sm:text-base break-all">
              {new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
              })}
            </div>
          );
          break;

        case "uptime":
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = uptime % 60;
          output = (
            <div className="py-1 text-green-400 text-sm sm:text-base">
              <p>
                System uptime: {hours}h {minutes}m {seconds}s
              </p>
              <p className="break-words">
                Portfolio session active since page load
              </p>
            </div>
          );
          break;

        case "neofetch":
          output = (
            <div className="py-1 font-mono text-sm">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="text-green-400 hidden sm:block">
                  <pre className="text-xs sm:text-sm">{`
    ██████╗ 
   ██╔════╝ 
   ██║  ███╗
   ██║   ██║
   ╚██████╔╝
    ╚═════╝ 
                  `}</pre>
                </div>
                <div className="space-y-1 text-sm sm:text-base">
                  <p className="break-words">
                    <span className="text-green-400">User:</span>{" "}
                    sahil@portfolio
                  </p>
                  <p>
                    <span className="text-green-400">OS:</span> Portfolio OS
                    v0.1
                  </p>
                  <p>
                    <span className="text-green-400">Shell:</span> CLI Portfolio
                  </p>
                  <p className="break-words">
                    <span className="text-green-400">Languages:</span>{" "}
                    JavaScript, TypeScript, Python
                  </p>
                  <p className="break-words">
                    <span className="text-green-400">Frameworks:</span> React,
                    Next.js, Node.js
                  </p>
                  <p>
                    <span className="text-green-400">Database:</span> MongoDB,
                    PostgreSQL
                  </p>
                  <p>
                    <span className="text-green-400">Cloud:</span> AWS, Vercel
                  </p>
                  <p>
                    <span className="text-green-400">Status:</span>{" "}
                    <span className="animate-pulse">Online</span>
                  </p>
                </div>
              </div>
            </div>
          );
          break;

        case "matrix":
          output = (
            <div className="py-1">
              <div className="text-green-400 animate-pulse">
                <pre className="text-xs sm:text-sm leading-tight overflow-x-auto">
                  {`01001000 01100101 01101100 01101100 01101111
01010111 01101111 01110010 01101100 01100100
01000101 01101110 01110100 01100101 01110010
01010100 01101000 01100101 01001101 01100001
01110100 01110010 01101001 01111000 00100001`}
                </pre>
              </div>
              <p className="text-green-300/80 mt-2 text-sm sm:text-base">
                Welcome to the Matrix, Neo... 🕶️
              </p>
              <p className="text-green-300/60 text-sm break-words">
                The code you see is "Hello World Enter The Matrix!" in binary
              </p>
            </div>
          );
          break;

        case "cowsay":
          const messages = [
            "Moo-ve over, here comes Sahil!",
            "Code is my superpower! 🚀",
            "Building the future, one commit at a time",
            "React makes me happy! ⚛️",
            "TypeScript > JavaScript (fight me)",
          ];
          const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];
          output = (
            <div className="py-1 font-mono text-xs sm:text-sm">
              <pre className="text-green-400 overflow-x-auto">
                {` _${Array(Math.min(randomMessage.length + 2, 30))
                  .fill("_")
                  .join("")}_
< ${randomMessage.substring(0, 28)} >
 -${Array(Math.min(randomMessage.length + 2, 30))
   .fill("-")
   .join("")}-
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
              </pre>
            </div>
          );
          break;

        case "fortune":
          const fortunes = [
            "The best way to predict the future is to invent it. - Alan Kay",
            "Code is like humor. When you have to explain it, it's bad. - Cory House",
            "First, solve the problem. Then, write the code. - John Johnson",
            "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
            "The only way to learn a new programming language is by writing programs in it. - Dennis Ritchie",
            "Talk is cheap. Show me the code. - Linus Torvalds",
          ];
          const randomFortune =
            fortunes[Math.floor(Math.random() * fortunes.length)];
          output = (
            <div className="py-1">
              <p className="text-green-400 text-sm">🔮 Fortune Cookie:</p>
              <p className="text-green-300/90 italic mt-1 text-sm sm:text-base break-words">
                "{randomFortune}"
              </p>
            </div>
          );
          break;

        case "history":
          output = (
            <div className="py-1">
              <p className="text-green-400 mb-2 text-sm">Command History:</p>
              {commandHistory.slice(-10).map((cmd, index) => (
                <p key={index} className="text-green-300/80 text-sm break-all">
                  {commandHistory.length - 10 + index + 1}: {cmd}
                </p>
              ))}
            </div>
          );
          break;

        // Original commands with responsive improvements
        case "about":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="break-words mb-2">
                Hello! I'm Sahil Makandar, a Software Engineer passionate about
                building interactive and user-friendly applications.
              </p>
              <p className="break-words mb-2">
                I specialize in front-end development with a strong focus on
                React, Next.js, and modern web technologies.
              </p>
              <p className="break-words">
                When I'm not coding, you can find me contributing to open-source
                projects, learning new technologies, or exploring the outdoors.
              </p>
            </div>
          );
          break;

        case "projects":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">Here are some of my key projects:</p>
              <div className="space-y-1">
                {[
                  {
                    id: "project-alpha",
                    name: "Project Alpha",
                    desc: "A web application for task management built with React and Firebase.",
                  },
                  {
                    id: "project-beta",
                    name: "Project Beta",
                    desc: "An e-commerce platform built with microservices architecture.",
                  },
                  {
                    id: "cli-portfolio",
                    name: "CLI Portfolio",
                    desc: "This very interactive terminal-style portfolio!",
                  },
                  {
                    id: "weather-dashboard",
                    name: "Weather Dashboard",
                    desc: "Real-time weather application with interactive maps.",
                  },
                ].map((project) => (
                  <div key={`project-${project.id}`} className="mb-1">
                    <span className="text-green-400 font-semibold">
                      {project.name}
                    </span>
                    <p className="text-green-300/80 text-sm break-words ml-2">
                      {project.desc}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Type <span className="text-green-400">'help'</span> for more
                commands.
              </p>
            </div>
          );
          break;

        case "skills":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">My technical skills include:</p>
              <div className="space-y-2">
                {[
                  {
                    id: "languages",
                    category: "Languages",
                    skills: "JavaScript, TypeScript, Python, Java",
                  },
                  {
                    id: "frontend",
                    category: "Frontend",
                    skills: "React, Next.js, Redux, TailwindCSS",
                  },
                  {
                    id: "backend",
                    category: "Backend",
                    skills: "Node.js, Express.js, Django",
                  },
                  {
                    id: "databases",
                    category: "Databases",
                    skills: "MongoDB, PostgreSQL, Firebase/Firestore",
                  },
                  {
                    id: "devops",
                    category: "DevOps",
                    skills: "Docker, Kubernetes, AWS, CI/CD",
                  },
                ].map((skill) => (
                  <div key={`skill-${skill.id}`}>
                    <span className="text-green-400 font-semibold">
                      {skill.category}:
                    </span>
                    <p className="text-green-300/80 text-sm break-words ml-2">
                      {skill.skills}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "experience":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">My work experience:</p>
              <div className="space-y-2">
                <div>
                  <span className="text-green-400 font-semibold">
                    Senior Software Engineer
                  </span>
                  <p className="text-green-300/80 text-sm break-words">
                    Tech Innovators Inc. (2022-Present)
                  </p>
                  <div className="ml-2 text-sm space-y-1">
                    <p>• Led development of 3 major product features</p>
                    <p>• Mentored junior developers</p>
                    <p>• Improved application performance by 40%</p>
                  </div>
                </div>
                <div>
                  <span className="text-green-400 font-semibold">
                    Full Stack Developer
                  </span>
                  <p className="text-green-300/80 text-sm break-words">
                    Digital Solutions Ltd. (2020-2022)
                  </p>
                  <div className="ml-2 text-sm space-y-1">
                    <p>• Built responsive web applications</p>
                    <p>• Implemented CI/CD pipelines</p>
                  </div>
                </div>
              </div>
            </div>
          );
          break;

        case "contact":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">You can reach me at:</p>
              <div className="space-y-1">
                {[
                  {
                    id: "email",
                    method: "Email",
                    value: "sahil.makandar@example.com",
                  },
                  {
                    id: "linkedin",
                    method: "LinkedIn",
                    value: "linkedin.com/in/sahilmakandar",
                  },
                  {
                    id: "github",
                    method: "GitHub",
                    value: "github.com/sahilmakandar",
                  },
                  {
                    id: "twitter",
                    method: "Twitter",
                    value: "twitter.com/sahilmakandar",
                  },
                ].map((contact) => (
                  <div key={`contact-${contact.id}`}>
                    <span className="text-green-400 font-semibold">
                      {contact.method}:
                    </span>
                    <p className="text-green-300/80 text-sm break-all ml-2">
                      {contact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "education":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">My educational background:</p>
              <div>
                <span className="text-green-400 font-semibold">
                  Bachelor of Science in Computer Science
                </span>
                <p className="text-green-300/80 text-sm break-words">
                  University of XYZ (2018-2022)
                </p>
                <div className="ml-2 text-sm space-y-1">
                  <p>• GPA: 3.8/4.0</p>
                  <p>• Specialization in Software Engineering</p>
                </div>
              </div>
            </div>
          );
          break;

        case "certifications":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">Here are some of my certifications:</p>
              <div className="space-y-1">
                {[
                  {
                    id: "aws-cert",
                    name: "AWS Certified Developer - Associate",
                    year: "2023",
                  },
                  {
                    id: "cka-cert",
                    name: "Certified Kubernetes Administrator (CKA)",
                    year: "2022",
                  },
                  {
                    id: "gcp-cert",
                    name: "Google Professional Cloud Architect",
                    year: "2023",
                  },
                ].map((cert) => (
                  <div key={`cert-${cert.id}`}>
                    <span className="text-green-400 font-semibold break-words">
                      {cert.name}
                    </span>
                    <span className="text-green-300/80 text-sm">
                      {" "}
                      ({cert.year})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
          break;

        case "leadership":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="mb-2">My leadership experiences include:</p>
              <div className="space-y-2">
                <div>
                  <span className="text-green-400 font-semibold">
                    Lead Developer
                  </span>
                  <p className="text-green-300/80 text-sm break-words">
                    Tech Innovators Inc. (2022-Present)
                  </p>
                  <div className="ml-2 text-sm space-y-1">
                    <p>• Managed a team of 5 developers</p>
                    <p>• Led the development of 3 major products</p>
                  </div>
                </div>
                <div>
                  <span className="text-green-400 font-semibold">
                    Open Source Maintainer
                  </span>
                  <p className="text-green-300/80 text-sm break-words">
                    Various projects (2020-Present)
                  </p>
                </div>
              </div>
            </div>
          );
          break;

        case "sudo":
          output = (
            <div className="py-1 text-sm sm:text-base">
              <p className="text-red-500 break-words">
                Permission denied: You are not in the sudoers file. This
                incident will be reported.
              </p>
              <p className="mt-2 text-yellow-400 break-words">
                [SECURITY NOTICE] Unauthorized sudo attempt logged at{" "}
                {currentTime}
              </p>
              <p className="text-red-400 text-sm mt-1">
                🚨 FBI is on the way... just kidding! 😄
              </p>
            </div>
          );
          break;

        case "clear":
          setHistory([]);
          setCommand("");
          setIsProcessing(false);
          inputRef.current?.focus();
          break;

        default:
          output = (
            <div className="text-sm sm:text-base">
              <p className="break-words">Command not found: {trimmedCommand}</p>
              <p>Type 'help' for a list of available commands.</p>
            </div>
          );
      }

      if (trimmedCommand.toLowerCase() !== "clear") {
        setTimeout(() => typeOutput(output, outputEntryId), 100);
      }
    }
  };

  return (
    <div className="text-gray-200 font-mono flex flex-col items-center justify-center p-2 sm:p-4 antialiased h-full relative">
      <style>
        {`
          /* Custom scrollbar for Webkit browsers */
          .terminal-output::-webkit-scrollbar {
            width: 6px;
          }
          .terminal-output::-webkit-scrollbar-track {
            background: #1a202c;
          }
          .terminal-output::-webkit-scrollbar-thumb {
            background-color: #4a5568;
            border-radius: 4px;
            border: 1px solid #1a202c;
          }
          .terminal-output::-webkit-scrollbar-thumb:hover {
            background-color: #68d391;
          }
          /* Cursor blinking animation */
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .typing-cursor {
            display: inline-block;
            width: 6px;
            height: 12px;
            background-color: #4ade80;
            vertical-align: middle;
            margin-left: 2px;
            animation: blink 1s step-end infinite;
          }
          /* Command prompt styling */
          .command-prompt {
            color: #4ade80;
          }
          .command-prompt::before {
            content: "┌──(";
          }
          .command-prompt::after {
            content: ")";
          }
          .command-prompt-user {
            color: #60a5fa;
          }
          .command-prompt-path {
            color: #f472b6;
          }
          /* Glow effect for terminal */
          .terminal-glow {
            box-shadow: 0 0 15px rgba(74, 222, 128, 0.1);
          }
          /* Responsive text sizing */
          @media (max-width: 640px) {
            .terminal-output {
              font-size: 14px;
              line-height: 1.4;
            }
          }
        `}
      </style>

      <div className="w-full bg-gray-800 border border-green-500 rounded-lg shadow-lg flex flex-col h-[85vh] sm:h-[80vh] md:h-[70vh] lg:h-[60vh] terminal-glow overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-700 p-2 border-b border-green-500 flex items-center justify-between">
          <div className="flex space-x-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></span>
          </div>
          <div className="text-sm sm:text-base font-semibold flex items-center space-x-1 sm:space-x-2">
            <span className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">
              sahilmakandar.me — Terminal
            </span>
            <span className="sm:hidden">Terminal</span>
          </div>
          <div className="text-xs sm:text-sm text-green-400">v2.4.1</div>
        </div>

        {/* Terminal Output Area */}
        <div
          ref={terminalRef}
          className="flex-1 p-2 sm:p-4 overflow-y-auto text-sm sm:text-base terminal-output bg-gray-900 min-h-0"
          onClick={() => inputRef.current && inputRef.current.focus()}
        >
          {history.map((entry) => (
            <div key={entry.id} className="mb-1 sm:mb-2">
              {entry.type === "input" ? (
                <div className="flex items-start flex-wrap">
                  <div className="command-prompt flex-shrink-0">
                    <span className="command-prompt-user">sahil</span>
                    <span className="text-gray-400">@</span>
                    <span className="command-prompt-path">portfolio</span>
                  </div>
                  <span className="text-gray-400 mx-1">:</span>
                  <span className="text-purple-400 break-all">
                    {currentDirectory}
                  </span>
                  <span className="text-gray-400">$</span>
                  <span className="ml-1 break-all">{entry.typedValue}</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {entry.typedValue}
                  {entry.isTyping && <span className="typing-cursor"></span>}
                </div>
              )}
            </div>
          ))}

          {/* Current input line */}
          <div className="flex items-center mt-1 flex-wrap">
            <div className="command-prompt flex-shrink-0">
              <span className="command-prompt-user">sahil</span>
              <span className="text-gray-400">@</span>
              <span className="command-prompt-path">portfolio</span>
            </div>
            <span className="text-gray-400 mx-1">:</span>
            <span className="text-purple-400 break-all">
              {currentDirectory}
            </span>
            <span className="text-gray-400">$</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-grow bg-transparent outline-none text-gray-200 caret-green-400 ml-1 min-w-0"
              value={command}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCommand(e.target.value)
              }
              onKeyDown={handleCommandSubmit}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : ""}
            />
            {isProcessing && (
              <div className="ml-2 flex space-x-1 flex-shrink-0">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Terminal status bar */}
        <div className="bg-gray-700 p-1 text-xs sm:text-sm text-gray-400 border-t border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span>[NORMAL]</span>
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
          </div>
          <div className="hidden sm:block">UTF-8</div>
          <div className="text-xs sm:text-sm truncate">{currentTime}</div>
        </div>
      </div>

      {/* System info footer */}
      <div className="mt-2 sm:mt-4 text-gray-500 text-xs sm:text-sm text-center px-2">
        <span className="animate-pulse">●</span> Connected to
        sahil-makandar-terminal v2.4.1 • Type 'help' for commands
      </div>
    </div>
  );
};

export default CliPortfolio;
