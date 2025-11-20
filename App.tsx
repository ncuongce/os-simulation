
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AnalogCamera } from './AnalogCamera';
import { SpaceTimeSim } from './SpaceTimeSim';

// --- SVG ICONS ---
const NotepadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V9L15 3M19 19H5V5H14V10H19V19M17 14H7V12H17V14M17 17H7V15H17V17Z" /></svg>
);
const CalculatorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z" /></svg>
);
const BrowserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.01 7.5 10.5 7.5c1.24 0 2.37.52 3.17 1.33L12 10.5h5v-5l-1.68 1.68C14.12 5.9 12.4 5 10.5 5 6.91 5 4 7.91 4 11.5s2.91 6.5 6.5 6.5c3.22 0 5.88-2.35 6.39-5.36h-2.08c-.46 1.8-2.11 3.11-4.16 3.11z" /></svg>
);
const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.99854 13L12 22L18.0015 13H5.99854Z" fill="#888CF3" />
        <path d="M5.99854 11L12 2L18.0015 11H5.99854Z" fill="#4A43E1" />
    </svg>
);
const StartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);
const TetrisIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 3H13V9H19V11H13V17H11V11H5V9H11V3Z" />
    </svg>
);
const CameraAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
);
const PlanetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

// --- TYPES AND INTERFACES ---
interface WindowState {
    id: string;
    appId: string;
    title: string;
    // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    icon: React.ReactElement;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    prevX?: number;
    prevY?: number;
    prevWidth?: number;
    prevHeight?: number;
}

interface AppDefinition {
    id: string;
    title: string;
    // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    icon: React.ReactElement;
    component: React.FC<any>;
    defaultWidth: number;
    defaultHeight: number;
}

// --- APPLICATION COMPONENTS ---
const Notepad: React.FC = () => {
    return <textarea className="w-full h-full p-2 bg-white text-black border-none resize-none focus:outline-none" />;
};

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');

    const handleButtonClick = (value: string) => {
        if (value === 'C') {
            setDisplay('0');
        } else if (value === '=') {
            try {
                // Using eval is not safe in production, but acceptable for this simulation.
                const result = eval(display.replace(/[^-()\d/*+.]/g, ''));
                setDisplay(String(result));
            } catch (e) {
                setDisplay('Error');
            }
        } else {
            setDisplay(prev => (prev === '0' || prev === 'Error' ? value : prev + value));
        }
    };

    const buttons = [
        'C', '(', ')', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '='
    ];

    return (
        <div className="flex flex-col h-full bg-gray-200 p-2">
            <div className="bg-white text-right p-4 rounded text-2xl font-mono text-black mb-2 overflow-x-auto">{display}</div>
            <div className="grid grid-cols-4 gap-2 flex-1">
                {buttons.map(btn => {
                    const isOperator = ['/', '*', '-', '+', '='].includes(btn);
                    return (
                        <button
                            key={btn}
                            onClick={() => handleButtonClick(btn)}
                            className={`text-xl rounded-md transition-colors ${isOperator ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : 'bg-gray-300 hover:bg-gray-400 text-black'
                                } ${btn === '=' ? 'col-span-2' : ''}`}
                        >
                            {btn}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const Browser: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex items-center p-1 bg-gray-100 border-b border-gray-300">
                <div className="flex-1 bg-white rounded-full px-4 py-1 text-sm text-gray-700">https://www.google.com</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google" className="h-24 mb-8" />
                <div className="w-full max-w-lg px-4">
                    <input type="text" className="w-full border border-gray-300 rounded-full py-2 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="mt-6">
                    <button className="bg-gray-100 text-gray-800 py-2 px-4 rounded text-sm mx-2 hover:bg-gray-200">Google Search</button>
                    <button className="bg-gray-100 text-gray-800 py-2 px-4 rounded text-sm mx-2 hover:bg-gray-200">I'm Feeling Lucky</button>
                </div>
            </div>
        </div>
    );
};

interface ChatMessage {
    author: 'user' | 'model';
    content: string;
}

const GeminiChat: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                systemInstruction: "You are a helpful assistant integrated into a desktop OS simulation. Be concise and friendly.",
            });
            setChat(chatSession);
        } catch (e) {
            console.error(e);
            setHistory([{ author: 'model', content: "Error initializing Gemini. Please ensure your API key is set up correctly." }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { author: 'user', content: input };
        setHistory(prev => [...prev, userMessage, { author: 'model', content: '' }]);
        setIsLoading(true);
        setInput('');

        try {
            const result = await chat.sendMessageStream({ message: input });
            let text = '';
            for await (const chunk of result) {
                text += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].content = text;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = errorMessage;
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-prose p-3 rounded-lg ${msg.author === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            <pre className="whitespace-pre-wrap font-sans">{msg.content}{isLoading && msg.author === 'model' && index === history.length - 1 ? '...' : ''}</pre>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center bg-gray-700 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent p-3 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="p-3 disabled:opacity-50 hover:bg-gray-600 rounded-r-lg">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- TETRIS GAME ---
const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
const TETRIS_SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
    O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' }
};

type TetrominoType = keyof typeof TETRIS_SHAPES;

const getRandomTetromino = (): { type: TetrominoType, shape: number[][], color: string } => {
    const types = Object.keys(TETRIS_SHAPES) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return { type, ...TETRIS_SHAPES[type] };
};

const Tetris: React.FC = () => {
    const [grid, setGrid] = useState<string[][]>(Array(TETRIS_ROWS).fill(null).map(() => Array(TETRIS_COLS).fill('')));
    const [currentPiece, setCurrentPiece] = useState<{ type: TetrominoType, shape: number[][], color: string, x: number, y: number } | null>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const spawnPiece = useCallback(() => {
        const newPiece = getRandomTetromino();
        setCurrentPiece({
            ...newPiece,
            x: Math.floor(TETRIS_COLS / 2) - Math.floor(newPiece.shape[0].length / 2),
            y: 0
        });
    }, []);

    const checkCollision = (piece: any, gridState: string[][], offsetX = 0, offsetY = 0) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    if (newX < 0 || newX >= TETRIS_COLS || newY >= TETRIS_ROWS || (newY >= 0 && gridState[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const mergePiece = () => {
        if (!currentPiece) return;
        const newGrid = [...grid.map(row => [...row])];
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    if (currentPiece.y + y >= 0) {
                        newGrid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                    }
                }
            }
        }

        // Check for lines
        let linesCleared = 0;
        for (let y = TETRIS_ROWS - 1; y >= 0; y--) {
            if (newGrid[y].every(cell => cell !== '')) {
                newGrid.splice(y, 1);
                newGrid.unshift(Array(TETRIS_COLS).fill(''));
                linesCleared++;
                y++; // Check same row again
            }
        }

        setScore(s => s + linesCleared * 100);
        setGrid(newGrid);

        if (currentPiece.y <= 0) {
            setGameOver(true);
            return;
        }

        spawnPiece();
    };

    const move = (dirX: number, dirY: number) => {
        if (!currentPiece || gameOver || isPaused) return;
        if (!checkCollision(currentPiece, grid, dirX, dirY)) {
            setCurrentPiece(prev => prev ? ({ ...prev, x: prev.x + dirX, y: prev.y + dirY }) : null);
            return true;
        } else if (dirY > 0) {
            // Hit bottom or another piece
            mergePiece();
            return false;
        }
        return false;
    };

    const rotate = () => {
        if (!currentPiece || gameOver || isPaused) return;
        const newShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
        const newPiece = { ...currentPiece, shape: newShape };
        if (!checkCollision(newPiece, grid)) {
            setCurrentPiece(newPiece);
        }
    };

    useEffect(() => {
        if (!currentPiece && !gameOver) {
            spawnPiece();
        }
    }, [currentPiece, gameOver, spawnPiece]);

    useEffect(() => {
        if (gameOver || isPaused) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }
        gameLoopRef.current = setInterval(() => {
            move(0, 1);
        }, 1000 - Math.min(score, 900)); // Speed up
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [currentPiece, gameOver, isPaused, score, grid]); // Dependencies for move/merge



    useEffect(() => {
        containerRef.current?.focus();
    }, []);


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (gameOver) return;
        switch (e.key) {
            case 'ArrowLeft': move(-1, 0); break;
            case 'ArrowRight': move(1, 0); break;
            case 'ArrowDown': move(0, 1); break;
            case 'ArrowUp': rotate(); break;
            case ' ': setIsPaused(p => !p); break;
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-2 outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            ref={containerRef}
            onClick={() => containerRef.current?.focus()}
        >
            <div className="mb-2 text-xl font-bold">Score: {score}</div>
            <div className="relative bg-gray-800 border-2 border-gray-600" style={{ width: TETRIS_COLS * 20, height: TETRIS_ROWS * 20 }}>
                {grid.map((row, y) => row.map((color, x) => (
                    color ? <div key={`${x}-${y}`} className={`absolute w-5 h-5 ${color} border border-black/20`} style={{ left: x * 20, top: y * 20 }} /> : null
                )))}
                {currentPiece && currentPiece.shape.map((row, y) => row.map((val, x) => (
                    val ? <div key={`p-${x}-${y}`} className={`absolute w-5 h-5 ${currentPiece.color} border border-black/20`} style={{ left: (currentPiece.x + x) * 20, top: (currentPiece.y + y) * 20 }} /> : null
                )))}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col">
                        <div className="text-2xl font-bold text-red-500 mb-2">GAME OVER</div>
                        <button onClick={() => { setGrid(Array(TETRIS_ROWS).fill(null).map(() => Array(TETRIS_COLS).fill(''))); setScore(0); setGameOver(false); setCurrentPiece(null); }} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Restart</button>
                    </div>
                )}
                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-2xl font-bold text-white">PAUSED</div>
                    </div>
                )}
            </div>
            <div className="mt-2 text-sm text-gray-400">
                Click to focus. Arrows to move/rotate. Space to pause.
            </div>
        </div>
    );
};

// --- APP DEFINITIONS ---
const APPS: Record<string, AppDefinition> = {
    'notepad': { id: 'notepad', title: 'Notepad', icon: <NotepadIcon />, component: Notepad, defaultWidth: 500, defaultHeight: 400 },
    'calculator': { id: 'calculator', title: 'Calculator', icon: <CalculatorIcon />, component: Calculator, defaultWidth: 300, defaultHeight: 400 },
    'browser': { id: 'browser', title: 'Edge Browser', icon: <BrowserIcon />, component: Browser, defaultWidth: 800, defaultHeight: 600 },
    'gemini': { id: 'gemini', title: 'Gemini Chat', icon: <GeminiIcon />, component: GeminiChat, defaultWidth: 500, defaultHeight: 650 },
    'tetris': { id: 'tetris', title: 'Tetris', icon: <TetrisIcon />, component: Tetris, defaultWidth: 300, defaultHeight: 600 },
    'camera': { id: 'camera', title: 'Analog Cam', icon: <CameraAppIcon />, component: AnalogCamera, defaultWidth: 800, defaultHeight: 650 },
    'spacetime': { id: 'spacetime', title: 'Relativity', icon: <PlanetIcon />, component: SpaceTimeSim, defaultWidth: 800, defaultHeight: 600 },
};

// --- UI COMPONENTS ---
const Window: React.FC<{
    state: WindowState,
    onClose: (id: string) => void,
    onMinimize: (id: string) => void,
    onMaximize: (id: string) => void,
    onFocus: (id: string) => void,
    onDrag: (id: string, x: number, y: number) => void,
    desktopSize: { width: number, height: number }
}> = ({ state, onClose, onMinimize, onMaximize, onFocus, onDrag, desktopSize }) => {

    const headerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (state.isMaximized) return;
        onFocus(state.id);
        isDragging.current = true;
        dragStartPos.current = {
            x: e.clientX - state.x,
            y: e.clientY - state.y,
        };
        document.body.style.cursor = 'grabbing';
        document.body.classList.add('select-none');
    }, [state.x, state.y, state.id, onFocus, state.isMaximized]);

    const AppContent = APPS[state.appId].component;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                let newX = e.clientX - dragStartPos.current.x;
                let newY = e.clientY - dragStartPos.current.y;

                // Clamp to viewport
                newX = Math.max(0, Math.min(newX, desktopSize.width - state.width));
                newY = Math.max(0, Math.min(newY, desktopSize.height - state.height));

                onDrag(state.id, newX, newY);
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
            document.body.classList.remove('select-none');
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onDrag, state.id, desktopSize, state.width, state.height]);

    const windowStyle: React.CSSProperties = state.isMaximized ? {
        top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)',
    } : {
        top: state.y, left: state.x, width: state.width, height: state.height
    };

    return (
        <div
            className={`absolute flex flex-col bg-gray-200 border border-gray-400 rounded-lg shadow-2xl transition-all duration-100 ${state.isMinimized ? 'opacity-0 pointer-events-none transform scale-90' : ''}`}
            style={{ ...windowStyle, zIndex: state.zIndex }}
            onClick={() => onFocus(state.id)}
        >
            <div
                ref={headerRef}
                className={`flex items-center justify-between h-8 pl-2 pr-1 rounded-t-lg bg-gray-100 ${!state.isMaximized && 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onDoubleClick={() => onMaximize(state.id)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5">{state.icon}</div>
                    <span className="text-sm font-semibold text-gray-800 select-none">{state.title}</span>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMinimize(state.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-7 h-6 flex items-center justify-center rounded hover:bg-gray-300"
                    >
                        <div className="w-3 h-0.5 bg-black" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMaximize(state.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-7 h-6 flex items-center justify-center rounded hover:bg-gray-300"
                    >
                        <div className="w-2.5 h-2.5 border border-black rounded-sm" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(state.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-7 h-6 flex items-center justify-center rounded hover:bg-red-500 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-white overflow-hidden">
                <AppContent />
            </div>
        </div>
    );
};

const Taskbar: React.FC<{
    windows: WindowState[],
    onTaskbarClick: (id: string) => void,
    onStartClick: () => void,
}> = ({ windows, onTaskbarClick, onStartClick }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-200/80 backdrop-blur-md flex items-center px-2 z-[10000]">
            <button onClick={onStartClick} className="p-2 rounded hover:bg-white/50">
                <StartIcon className="w-6 h-6 text-gray-800" />
            </button>
            <div className="h-full border-l border-gray-400/50 mx-2"></div>
            <div className="flex items-center gap-2">
                {windows.map(win => (
                    <button
                        key={win.id}
                        onClick={() => onTaskbarClick(win.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors h-9 ${!win.isMinimized && win.zIndex === Math.max(...windows.map(w => w.zIndex)) ? 'bg-white/70' : 'hover:bg-white/50'}`}
                    >
                        <div className="w-5 h-5">{win.icon}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const StartMenu: React.FC<{
    isOpen: boolean,
    onAppClick: (appId: string) => void,
}> = ({ isOpen, onAppClick }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute bottom-14 left-2 w-72 bg-gray-100/90 backdrop-blur-lg rounded-lg shadow-2xl p-2 z-[9999]">
            <div className="font-bold text-lg p-2 text-gray-800">Start</div>
            <div className="flex flex-col gap-1 mt-2">
                {Object.values(APPS).map(app => (
                    <button
                        key={app.id}
                        onClick={() => onAppClick(app.id)}
                        className="flex items-center gap-3 p-2 text-left rounded hover:bg-blue-500 hover:text-white transition-colors"
                    >
                        <div className="w-8 h-8 p-1">{app.icon}</div>
                        <span className="font-medium">{app.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [nextZIndex, setNextZIndex] = useState(1);
    const desktopRef = useRef<HTMLDivElement>(null);

    const getDesktopSize = () => {
        if (desktopRef.current) {
            return { width: desktopRef.current.clientWidth, height: desktopRef.current.clientHeight };
        }
        return { width: window.innerWidth, height: window.innerHeight - 48 }; // 48 for taskbar
    };

    const openApp = (appId: string) => {
        const app = APPS[appId];
        if (!app) return;

        const newWindow: WindowState = {
            id: `${appId}-${Date.now()}`,
            appId,
            title: app.title,
            icon: app.icon,
            x: Math.random() * (getDesktopSize().width - app.defaultWidth),
            y: Math.random() * (getDesktopSize().height - app.defaultHeight),
            width: app.defaultWidth,
            height: app.defaultHeight,
            zIndex: nextZIndex,
            isMinimized: false,
            isMaximized: false,
        };
        setWindows(wins => [...wins, newWindow]);
        setNextZIndex(z => z + 1);
        setStartMenuOpen(false);
    };

    const closeWindow = (id: string) => {
        setWindows(wins => wins.filter(win => win.id !== id));
    };

    const focusWindow = (id: string) => {
        const highestZIndex = Math.max(...windows.map(w => w.zIndex), 0);
        setWindows(wins =>
            wins.map(win =>
                win.id === id
                    ? { ...win, zIndex: highestZIndex + 1, isMinimized: false }
                    : win
            )
        );
        setNextZIndex(highestZIndex + 2);
    };

    const minimizeWindow = (id: string) => {
        setWindows(wins =>
            wins.map(win => (win.id === id ? { ...win, isMinimized: true } : win))
        );
    };

    const maximizeWindow = (id: string) => {
        setWindows(wins =>
            wins.map(win => {
                if (win.id === id) {
                    if (win.isMaximized) { // Restore
                        return {
                            ...win,
                            isMaximized: false,
                            x: win.prevX ?? win.x,
                            y: win.prevY ?? win.y,
                            width: win.prevWidth ?? win.width,
                            height: win.prevHeight ?? win.height,
                        };
                    } else { // Maximize
                        return {
                            ...win,
                            isMaximized: true,
                            prevX: win.x,
                            prevY: win.y,
                            prevWidth: win.width,
                            prevHeight: win.height,
                        };
                    }
                }
                return win;
            })
        );
    };

    const dragWindow = (id: string, x: number, y: number) => {
        setWindows(wins =>
            wins.map(win => (win.id === id ? { ...win, x, y } : win))
        );
    };

    const handleTaskbarClick = (id: string) => {
        const win = windows.find(w => w.id === id);
        if (!win) return;

        const highestZIndex = Math.max(...windows.map(w => w.zIndex), 0);
        if (win.zIndex === highestZIndex && !win.isMinimized) {
            minimizeWindow(id);
        } else {
            focusWindow(id);
        }
    };

    const handleDesktopClick = (e: React.MouseEvent) => {
        if (e.target === desktopRef.current) {
            setStartMenuOpen(false);
        }
    };

    return (
        <div
            ref={desktopRef}
            className="w-screen h-screen bg-cover bg-center"
            style={{ backgroundImage: 'url(https://picsum.photos/1920/1080)' }}
            onClick={handleDesktopClick}
        >
            {windows.map(win => (
                <Window
                    key={win.id}
                    state={win}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    onFocus={focusWindow}
                    onDrag={dragWindow}
                    desktopSize={getDesktopSize()}
                />
            ))}
            <StartMenu isOpen={startMenuOpen} onAppClick={openApp} />
            <Taskbar windows={windows} onTaskbarClick={handleTaskbarClick} onStartClick={() => setStartMenuOpen(o => !o)} />
        </div>
    );
}
