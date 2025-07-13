"use client"; // This directive marks the component as a Client Component

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";

// Define the type for a history entry
interface HistoryEntry {
  id: string; // Add unique ID for each entry
  type: "input" | "output";
  value: string | ReactNode;
  isTyping?: boolean; // Indicates if the output is currently being typed
  typedValue?: string | ReactNode; // The value as it's being typed
}

// Helper function to extract plain text from a ReactNode
// This is used to get the total character count for the typing animation duration.
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

// Recursive function to type out text within a ReactNode structure.
// It returns the partially typed ReactNode and the number of characters consumed
// from the total 'charsToReveal' budget.
const typeReactNodeProgressively = (
  node: ReactNode,
  charsToReveal: number
): { typedNode: ReactNode; charsConsumed: number } => {
  let charsConsumed = 0;

  // If it's a string or number, substring it based on charsToReveal
  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    const typedText = text.substring(0, Math.min(text.length, charsToReveal));
    charsConsumed = Math.min(text.length, charsToReveal);
    return { typedNode: typedText, charsConsumed };
  }

  // If it's an array of children, recursively process each child
  if (Array.isArray(node)) {
    const typedChildren: ReactNode[] = [];
    for (let i = 0; i < node.length; i++) {
      const child = node[i];
      // Pass remaining charsToReveal to the child
      const { typedNode, charsConsumed: childChars } =
        typeReactNodeProgressively(child, charsToReveal - charsConsumed);
      typedChildren.push(typedNode);
      charsConsumed += childChars; // Accumulate consumed characters
    }
    return { typedNode: typedChildren, charsConsumed };
  }

  // If it's a valid React element, clone it and recursively process its children
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const typedChildren: ReactNode[] = [];
    let childIndex = 0;

    React.Children.forEach(element.props.children, (child) => {
      if (child === null || child === undefined) {
        typedChildren.push(child); // Keep null/undefined children as is
        return;
      }
      // Pass remaining charsToReveal to the child
      const { typedNode, charsConsumed: childChars } =
        typeReactNodeProgressively(child, charsToReveal - charsConsumed);

      // If the child is a React element and doesn't have a key, add one
      if (React.isValidElement(typedNode) && !typedNode.key) {
        typedChildren.push(
          React.cloneElement(typedNode, { key: `typed-${childIndex}` })
        );
      } else {
        typedChildren.push(typedNode);
      }

      charsConsumed += childChars; // Accumulate consumed characters
      childIndex++;
    });

    // Clone the element, passing its original props and the new typed children
    return {
      typedNode: React.cloneElement(element, element.props, ...typedChildren),
      charsConsumed,
    };
  }

  // For any other type of node (e.g., boolean, symbol), return as is
  return { typedNode: node, charsConsumed: 0 };
};

// Utility function to generate unique IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const CliPortfolio: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [command, setCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false); // State to prevent multiple commands while processing
  const [currentTime, setCurrentTime] = useState(""); // State for client-side time

  // Update current time every second for the status bar
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  // Function to simulate typing out content (string or ReactNode) character by character
  const typeOutput = (content: string | ReactNode, entryId: string) => {
    // Get the total plain text length to determine the animation duration
    const fullTextLength =
      typeof content === "string"
        ? content.length
        : extractTextFromReactNode(content).length;
    let currentCharsRevealed = 0; // Tracks how many characters of the *full plain text* have been revealed

    const animateTyping = () => {
      if (currentCharsRevealed <= fullTextLength) {
        let typedContent: string | ReactNode;

        if (typeof content === "string") {
          // If the original content is a string, simply substring it
          typedContent = content.substring(0, currentCharsRevealed);
        } else {
          // If the original content is a ReactNode, use the recursive helper to progressively reveal it
          const { typedNode } = typeReactNodeProgressively(
            content,
            currentCharsRevealed
          );
          typedContent = typedNode;
        }

        // Update the history entry with the partially typed content and typing status
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

        currentCharsRevealed++; // Move to the next character
        // Schedule the next animation frame with a random delay for natural feel
        setTimeout(animateTyping, Math.random() * 20 + 10);
      } else {
        // Typing is complete, ensure the full original content is displayed and release lock
        setHistory((prev) => {
          const newHistory = [...prev];
          const entryIndex = newHistory.findIndex(
            (entry) => entry.id === entryId
          );
          if (entryIndex !== -1 && newHistory[entryIndex].type === "output") {
            newHistory[entryIndex] = {
              ...newHistory[entryIndex],
              typedValue: content, // Set to the full original content (ReactNode or string)
              isTyping: false,
            };
          }
          return newHistory;
        });
        setIsProcessing(false); // Release the processing lock
      }
    };
    animateTyping(); // Start the typing animation
  };

  // Initial welcome message with typing effect
  useEffect(() => {
    const welcomeMessage = (
      <div className="py-1">
        <p className="text-green-400">
          Welcome to Sahil Makandar's CLI Portfolio!
        </p>
        <p>
          Type <span className="text-green-400">'help'</span> to see available
          commands.
        </p>
      </div>
    );

    const welcomeEntryId = generateId();

    // Initialize history with a placeholder for the welcome message
    setHistory([
      {
        id: welcomeEntryId,
        type: "output",
        value: welcomeMessage,
        isTyping: true, // Start with typing true for the welcome message
        typedValue: "", // Initially empty for typing effect
      },
    ]);

    // Start typing the welcome message after a short delay
    setTimeout(() => {
      typeOutput(welcomeMessage, welcomeEntryId); // Call typeOutput for the first entry
    }, 500); // Small delay before typing starts
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to scroll to bottom whenever history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]); // Scroll whenever history changes

  // Effect to manage input focus after processing completes (for mobile keyboard behavior)
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]); // Re-focus when processing stops

  // Handles command submission when Enter is pressed
  const handleCommandSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isProcessing) {
      const trimmedCommand = command.trim();
      if (trimmedCommand === "") return; // Do nothing if command is empty

      setIsProcessing(true); // Acquire processing lock
      inputRef.current?.blur(); // Unfocus input immediately for mobile keyboard dismissal

      const inputEntryId = generateId();
      const outputEntryId = generateId();

      // Add the user's command to history
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
          value: "", // Placeholder for the output that will be typed
          isTyping: true, // Mark as typing
          typedValue: "", // Start with empty typed value
        },
      ];

      setHistory(newHistory);
      setCommand(""); // Clear the input field

      // Determine the output based on the command
      let output: string | ReactNode = "";

      switch (trimmedCommand.toLowerCase()) {
        case "help":
          output = (
            <div className="py-1">
              <p>Available commands:</p>
              <ul className="list-disc list-inside ml-4">
                {[
                  { cmd: "help", desc: "Displays this help message." },
                  { cmd: "about", desc: "Learn more about me." },
                  { cmd: "projects", desc: "See my projects." },
                  { cmd: "skills", desc: "List my skills." },
                  { cmd: "contact", desc: "How to reach me." },
                  { cmd: "education", desc: "My academic background." },
                  { cmd: "certifications", desc: "My certifications." },
                  { cmd: "leadership", desc: "My leadership experience." },
                  { cmd: "sudo", desc: "Try something risky." },
                  { cmd: "clear", desc: "Clears the terminal history." },
                ].map(({ cmd, desc }) => (
                  <li key={`help-cmd-${cmd}`}>
                    <span className="text-green-400">{cmd}</span> - {desc}
                  </li>
                ))}
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "about":
          output = (
            <div className="py-1">
              <p>
                Hello! I'm Sahil Makandar, a Software Engineer passionate about
                building interactive and user-friendly applications.
              </p>
              <p>
                I specialize in front-end development with a strong focus on
                React, Next.js, and modern web technologies.
              </p>
              <p className="mt-2">
                When I'm not coding, you can find me contributing to open-source
                projects, learning new technologies, or exploring the outdoors.
              </p>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "projects":
          output = (
            <div className="py-1">
              <p>Here are some of my key projects:</p>
              <ul className="list-disc list-inside ml-4">
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
                  <li key={`project-${project.id}`}>
                    <span className="text-green-400">{project.name}</span>:{" "}
                    {project.desc}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                Type <span className="text-green-400">'help'</span> for more
                commands.
              </p>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "skills":
          output = (
            <div className="py-1">
              <p>My technical skills include:</p>
              <ul className="list-disc list-inside ml-4">
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
                  <li key={`skill-${skill.id}`}>
                    <span className="text-green-400">{skill.category}</span>:{" "}
                    {skill.skills}
                  </li>
                ))}
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "contact":
          output = (
            <div className="py-1">
              <p>You can reach me at:</p>
              <ul className="list-disc list-inside ml-4">
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
                  <li key={`contact-${contact.id}`}>
                    <span className="text-green-400">{contact.method}</span>:{" "}
                    {contact.value}
                  </li>
                ))}
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "education":
          output = (
            <div className="py-1">
              <p>My educational background:</p>
              <ul className="list-disc list-inside ml-4">
                <li key="education-bachelors">
                  <span className="text-green-400">
                    Bachelor of Science in Computer Science
                  </span>{" "}
                  - University of XYZ (2018-2022)
                  <ul className="list-disc list-inside ml-6">
                    <li key="education-gpa">GPA: 3.8/4.0</li>
                    <li key="education-specialization">
                      Specialization in Software Engineering
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "certifications":
          output = (
            <div className="py-1">
              <p>Here are some of my certifications:</p>
              <ul className="list-disc list-inside ml-4">
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
                  <li key={`cert-${cert.id}`}>
                    <span className="text-green-400">{cert.name}</span> (
                    {cert.year})
                  </li>
                ))}
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "leadership":
          output = (
            <div className="py-1">
              <p>My leadership experiences include:</p>
              <ul className="list-disc list-inside ml-4">
                <li key="leadership-lead-dev">
                  <span className="text-green-400">Lead Developer</span> at Tech
                  Innovators Inc. (2022-Present)
                  <ul className="list-disc list-inside ml-6">
                    <li key="leadership-team-mgmt">
                      Managed a team of 5 developers
                    </li>
                    <li key="leadership-product-dev">
                      Led the development of 3 major products
                    </li>
                  </ul>
                </li>
                <li key="leadership-opensource">
                  <span className="text-green-400">Open Source Maintainer</span>{" "}
                  for various projects (2020-Present)
                </li>
              </ul>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "sudo":
          output = (
            <div className="py-1">
              <p className="text-red-500">
                Permission denied: You are not in the sudoers file. This
                incident will be reported.
              </p>
              <p className="mt-2 text-yellow-400">
                [SECURITY NOTICE] Unauthorized sudo attempt logged at{" "}
                {currentTime}
              </p>
            </div>
          );
          typeOutput(output, outputEntryId);
          break;

        case "clear":
          setHistory([]);
          setCommand("");
          setIsProcessing(false);
          inputRef.current?.focus();
          break;

        default:
          output = (
            <div>
              <p>Command not found: {trimmedCommand}</p>
              <p>Type 'help' for a list of available commands.</p>
            </div>
          );
          typeOutput(output, outputEntryId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-mono flex flex-col items-center justify-center p-4 antialiased">
      <style>
        {`
          /* Custom scrollbar for Webkit browsers */
          .terminal-output::-webkit-scrollbar {
            width: 8px;
          }

          .terminal-output::-webkit-scrollbar-track {
            background: #1a202c;
          }

          .terminal-output::-webkit-scrollbar-thumb {
            background-color: #4a5568;
            border-radius: 4px;
            border: 2px solid #1a202c;
          }

          /* Cursor blinking animation */
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          .typing-cursor {
            display: inline-block;
            width: 8px;
            height: 16px;
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
        `}
      </style>
      <div className="w-full max-w-4xl bg-gray-800 border border-green-500 rounded-lg shadow-lg overflow-hidden flex flex-col h-[80vh] md:h-[70vh] lg:h-[60vh]">
        {/* Terminal Header */}
        <div className="bg-gray-700 p-2 border-b border-green-500 flex items-center justify-between">
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="text-sm font-semibold">
            sahilmakandar.me — Terminal
          </div>
          <div className="text-xs">v2.4.1</div>
        </div>

        {/* Terminal Output Area */}
        <div
          ref={terminalRef}
          className="flex-grow p-4 overflow-y-auto text-sm terminal-output bg-gray-900"
          onClick={() => inputRef.current && inputRef.current.focus()}
        >
          {history.map((entry) => (
            <div key={entry.id} className="mb-2">
              {entry.type === "input" ? (
                <div className="flex items-start">
                  <div className="command-prompt">
                    <span className="command-prompt-user">sahil</span>
                    <span className="text-gray-400">@</span>
                    <span className="command-prompt-path">portfolio</span>
                  </div>
                  <span className="text-gray-400 ml-1">$</span>
                  <span className="ml-1">{entry.typedValue}</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {entry.typedValue}
                  {entry.isTyping && <span className="typing-cursor"></span>}
                </div>
              )}
            </div>
          ))}

          {/* Current input line */}
          <div className="flex items-center mt-1">
            <div className="command-prompt">
              <span className="command-prompt-user">sahil</span>
              <span className="text-gray-400">@</span>
              <span className="command-prompt-path">portfolio</span>
            </div>
            <span className="text-gray-400 ml-1">$</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-grow bg-transparent outline-none text-gray-200 caret-green-400 ml-1"
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
              <div className="ml-2 flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Terminal status bar */}
        <div className="bg-gray-700 p-1 text-xs text-gray-400 border-t border-gray-600 flex justify-between">
          <div>[NORMAL]</div>
          <div>UTF-8</div>
          <div>{currentTime}</div> {/* Display client-side time */}
        </div>
      </div>

      {/* System info footer */}
      <div className="mt-4 text-gray-500 text-xs">
        Connected to sahil-makandar-terminal v2.4.1 • Type 'help' for available
        commands
      </div>
    </div>
  );
};

export default CliPortfolio;
