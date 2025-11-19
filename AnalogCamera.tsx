import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const CameraIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" opacity="0" />
        <path d="M12 7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0-2C9.24 5 7 7.24 7 10s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm8-2h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
);

const ApertureIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
        <line x1="9.69" y1="8" x2="21.17" y2="8" />
        <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
        <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
        <line x1="14.31" y1="16" x2="2.83" y2="16" />
        <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
);

// --- TYPES ---
interface Photo {
    id: string;
    url: string;
    filter: string;
    filterName: string;
    date: string;
    rotation: number;
}

// --- CONSTANTS ---
const FILM_STOCKS: Record<string, { name: string, filter: string, desc: string }> = {
    'standard': { name: 'STD-100', filter: 'contrast(1.05) saturate(1.05)', desc: 'Balanced daylight' },
    'portra': { name: 'PRT-400', filter: 'sepia(0.1) contrast(1.1) saturate(1.2) brightness(1.05)', desc: 'Warm skin tones' },
    'bw': { name: 'MONO-X', filter: 'grayscale(1) contrast(1.3) brightness(0.9) sepia(0.1)', desc: 'High contrast B&W' },
    'cinestill': { name: 'CINE-800', filter: 'sepia(0.2) hue-rotate(-10deg) contrast(1.1) saturate(1.1) brightness(1.1) drop-shadow(0 0 5px rgba(255,0,0,0.3))', desc: 'Tungsten glow' },
    'fuji': { name: 'VELVIA', filter: 'saturate(1.4) contrast(1.2) hue-rotate(5deg)', desc: 'Vivid colors' },
    'instant': { name: 'INSTANT', filter: 'sepia(0.3) contrast(0.9) brightness(1.1) saturate(0.8)', desc: 'Faded vintage' },
};

export const AnalogCamera: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([
        {
            id: 'test-1',
            url: 'https://picsum.photos/seed/camera/400/400',
            filter: FILM_STOCKS['standard'].filter,
            filterName: FILM_STOCKS['standard'].name,
            date: new Date().toLocaleDateString(),
            rotation: -2
        }
    ]);
    const [view, setView] = useState<'camera' | 'gallery'>('camera');
    const [currentStock, setCurrentStock] = useState('standard');
    const [flash, setFlash] = useState(false);
    const [shutterSpeed, setShutterSpeed] = useState(60);
    const [aperture, setAperture] = useState(2.8);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = () => {
        if (!image) return;

        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 150); // Fast flash

        // "Develop" photo
        const newPhoto: Photo = {
            id: Date.now().toString(),
            url: image,
            filter: FILM_STOCKS[currentStock].filter,
            filterName: FILM_STOCKS[currentStock].name,
            date: new Date().toLocaleDateString(),
            rotation: (Math.random() * 6) - 3 // Subtle rotation
        };

        // Add to gallery after a slight delay to simulate mechanism
        setTimeout(() => {
            setPhotos(prev => [newPhoto, ...prev]);
        }, 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setImage(url);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-[#e0e0e0] font-mono overflow-hidden select-none">
            {/* --- FLASH OVERLAY --- */}
            <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-100 ease-out ${flash ? 'opacity-100' : 'opacity-0'}`} />

            {/* --- HEADER --- */}
            <div className="h-14 bg-[#222] border-b border-[#333] flex items-center justify-between px-4 shadow-md z-20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="font-bold tracking-widest text-sm text-gray-400">REC</span>
                </div>
                <div className="flex bg-[#111] rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setView('camera')}
                        className={`px-4 py-1 rounded text-xs font-bold transition-all ${view === 'camera' ? 'bg-[#e0e0e0] text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        VIEWFINDER
                    </button>
                    <button
                        onClick={() => setView('gallery')}
                        className={`px-4 py-1 rounded text-xs font-bold transition-all ${view === 'gallery' ? 'bg-[#e0e0e0] text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        GALLERY <span className="ml-1 opacity-60">({photos.length})</span>
                    </button>
                </div>
                <div className="text-xs text-gray-500">BAT 84%</div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 relative overflow-hidden bg-[#121212]">
                {view === 'camera' ? (
                    <div className="h-full flex flex-col">
                        {/* Viewfinder Area */}
                        <div className="flex-1 flex items-center justify-center p-4 relative bg-black/50 min-h-0">
                            <div className="relative w-full max-w-[600px] max-h-full aspect-[4/3] bg-black rounded-sm shadow-2xl overflow-hidden border border-[#333] group">
                                {/* Image Display */}
                                {image ? (
                                    <div className="w-full h-full relative overflow-hidden">
                                        <img
                                            src={image}
                                            alt="Viewfinder preview"
                                            className="w-full h-full object-cover transition-all duration-500"
                                            style={{ filter: FILM_STOCKS[currentStock].filter }}
                                        />
                                        {/* Grain Overlay */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#444] bg-[#0a0a0a]">
                                        <ApertureIcon className="w-16 h-16 mb-4 opacity-20" />
                                        <span className="text-xs tracking-widest">NO FILM LOADED</span>
                                    </div>
                                )}

                                {/* Viewfinder HUD */}
                                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between opacity-80">
                                    <div className="flex justify-between items-start">
                                        <div className="w-8 h-8 border-t-2 border-l-2 border-white/50"></div>
                                        <div className="w-8 h-8 border-t-2 border-r-2 border-white/50"></div>
                                    </div>

                                    {/* Center Crosshair */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/30"></div>
                                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/30"></div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="w-8 h-8 border-b-2 border-l-2 border-white/50"></div>
                                        <div className="flex gap-4 text-[10px] font-mono text-white/70">
                                            <span>ISO {currentStock === 'cinestill' ? '800' : '400'}</span>
                                            <span>1/{shutterSpeed}</span>
                                            <span>f/{aperture}</span>
                                        </div>
                                        <div className="w-8 h-8 border-b-2 border-r-2 border-white/50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls Area */}
                        <div className="h-48 shrink-0 bg-[#1a1a1a] border-t border-[#333] p-4 flex items-center justify-center gap-8 relative z-10">
                            {/* Left: Settings */}
                            <div className="flex flex-col gap-3 w-48">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Film Stock</label>
                                    <div className="relative">
                                        <select
                                            value={currentStock}
                                            onChange={(e) => setCurrentStock(e.target.value)}
                                            className="w-full bg-[#222] border border-[#333] text-xs text-gray-300 rounded px-2 py-2 appearance-none focus:outline-none focus:border-gray-500 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                                        >
                                            {Object.entries(FILM_STOCKS).map(([key, stock]) => (
                                                <option key={key} value={key}>{stock.name} - {stock.desc}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Speed</label>
                                        <div className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-center text-gray-400 cursor-pointer hover:text-white" onClick={() => setShutterSpeed(s => s === 1000 ? 60 : s * 2)}>
                                            1/{shutterSpeed}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Aperture</label>
                                        <div className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-center text-gray-400 cursor-pointer hover:text-white" onClick={() => setAperture(a => a >= 16 ? 1.4 : Math.round(a * 1.4 * 10) / 10)}>
                                            f/{aperture}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Shutter */}
                            <div className="relative">
                                <button
                                    onClick={handleCapture}
                                    disabled={!image}
                                    className={`w-20 h-20 rounded-full border-4 border-[#333] flex items-center justify-center shadow-lg transition-all active:scale-95 ${image ? 'bg-[#e0e0e0] hover:bg-white cursor-pointer' : 'bg-[#333] cursor-not-allowed opacity-50'}`}
                                >
                                    <div className="w-16 h-16 rounded-full border border-gray-300/50"></div>
                                </button>
                            </div>

                            {/* Right: Load */}
                            <div className="w-48 flex justify-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-[#222] transition-colors"
                                >
                                    <div className="w-12 h-12 rounded border border-[#444] border-dashed flex items-center justify-center text-gray-500 group-hover:text-white group-hover:border-gray-400 transition-all">
                                        <span className="text-2xl font-light">+</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider group-hover:text-gray-300">Load Film</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto bg-[#e5e5e5] p-8 relative">
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="max-w-5xl mx-auto flex flex-wrap justify-center content-start p-12 gap-4">
                            {photos.map((photo, i) => (
                                <div
                                    key={photo.id}
                                    className="group relative bg-white p-3 pb-12 shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] cursor-pointer -ml-8 -mt-8 first:ml-0 first:mt-0"
                                    style={{
                                        transform: `rotate(${photo.rotation}deg)`,
                                        width: '220px'
                                    }}
                                >
                                    <div className="aspect-square bg-[#1a1a1a] overflow-hidden mb-2 relative">
                                        <img src={photo.url} alt={`Photo taken on ${photo.date}`} className="w-full h-full object-cover" style={{ filter: photo.filter }} />
                                        {/* Texture overlay for print effect */}
                                        <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
                                    </div>
                                    <div className="absolute bottom-3 left-0 right-0 text-center">
                                        <p className="font-handwriting text-gray-500 text-xs font-medium tracking-wide transform -rotate-1">{photo.filterName}</p>
                                        <p className="text-[8px] text-gray-300 uppercase tracking-widest mt-1">{photo.date}</p>
                                    </div>

                                    {/* Tape effect (visual only) */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/80 opacity-80 rotate-1 shadow-sm"></div>
                                </div>
                            ))}
                        </div>

                        {photos.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                                <div className="text-6xl mb-4 opacity-20">📷</div>
                                <p className="text-sm tracking-widest uppercase opacity-50">Darkroom Empty</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
