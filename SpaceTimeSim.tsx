import React, { useRef, useEffect, useState } from 'react';

export const SpaceTimeSim: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mass, setMass] = useState(50); // Earth mass simulation

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.clientWidth;
        let height = canvas.height = canvas.clientHeight;

        // Grid parameters
        const rows = 30;
        const cols = 30;
        const spacing = 30; // Base spacing

        // We'll generate a grid of points centered around 0,0
        // The grid needs to be large enough to cover the screen
        const gridPoints: { x: number, y: number }[] = [];
        for (let i = -rows; i <= rows; i++) {
            for (let j = -cols; j <= cols; j++) {
                gridPoints.push({ x: j * spacing, y: i * spacing });
            }
        }

        let animationFrameId: number;
        let time = 0;

        const render = () => {
            // Handle resize
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                width = canvas.width = canvas.clientWidth;
                height = canvas.height = canvas.clientHeight;
            }

            // Clear background
            ctx.fillStyle = '#050508'; // Deep space black
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            // Physics constants for simulation
            const gravityStrength = mass * 100;

            // Helper to project 3D point to 2D screen
            // We simulate a camera looking at the grid from an angle
            const project = (x: number, y: number, z: number) => {
                const fov = 800;
                const cameraY = -600; // Camera height
                const cameraZ = 600;  // Camera distance back
                const angleX = 0.8;   // Tilt angle

                // Rotate world coordinates to camera space
                // Simple rotation around X axis
                const rx = x;
                const ry = y * Math.cos(angleX) - z * Math.sin(angleX);
                const rz = y * Math.sin(angleX) + z * Math.cos(angleX);

                // Perspective projection
                const scale = fov / (fov + rz + cameraZ);
                const screenX = rx * scale + cx;
                const screenY = ry * scale + cy;

                return { x: screenX, y: screenY, scale };
            };

            // Draw Grid Lines
            ctx.strokeStyle = 'rgba(64, 164, 255, 0.15)';
            ctx.lineWidth = 1;

            // We need to calculate transformed positions for all points first
            // Z is calculated based on gravity well
            const transformedPoints = gridPoints.map(p => {
                const dist = Math.sqrt(p.x * p.x + p.y * p.y);
                // Gravity well: Z drops as we get closer to center (0,0)
                // Formula: -1 / (dist + k)
                let z = -gravityStrength / (dist * 0.05 + 10);

                // Add subtle wave motion
                z += Math.sin(dist * 0.05 - time * 0.02) * 5;

                return { ...p, z, proj: project(p.x, p.y, z) };
            });

            // Draw horizontal lines (connecting adjacent columns)
            ctx.beginPath();
            for (let i = 0; i < 2 * rows + 1; i++) {
                for (let j = 0; j < 2 * cols; j++) {
                    const idx = i * (2 * cols + 1) + j;
                    const p1 = transformedPoints[idx];
                    const p2 = transformedPoints[idx + 1];

                    // Don't draw if lines are too long (wrapping artifacts) or off screen
                    if (Math.abs(p1.x - p2.x) < spacing * 2) {
                        ctx.moveTo(p1.proj.x, p1.proj.y);
                        ctx.lineTo(p2.proj.x, p2.proj.y);
                    }
                }
            }
            ctx.stroke();

            // Draw vertical lines (connecting adjacent rows)
            ctx.beginPath();
            for (let j = 0; j < 2 * cols + 1; j++) {
                for (let i = 0; i < 2 * rows; i++) {
                    const idx = i * (2 * cols + 1) + j;
                    const nextRowIdx = (i + 1) * (2 * cols + 1) + j;

                    if (nextRowIdx < transformedPoints.length) {
                        const p1 = transformedPoints[idx];
                        const p2 = transformedPoints[nextRowIdx];
                        ctx.moveTo(p1.proj.x, p1.proj.y);
                        ctx.lineTo(p2.proj.x, p2.proj.y);
                    }
                }
            }
            ctx.stroke();

            // Draw "Earth" Mass
            // Position is at 0,0,z_center
            const centerZ = -gravityStrength / 10;
            const earthProj = project(0, 0, centerZ);

            // Glow
            const gradient = ctx.createRadialGradient(earthProj.x, earthProj.y, 5 * earthProj.scale, earthProj.x, earthProj.y, 60 * earthProj.scale);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(50, 100, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(earthProj.x, earthProj.y, 60 * earthProj.scale, 0, Math.PI * 2);
            ctx.fill();

            // Solid core
            ctx.fillStyle = '#88ccff';
            ctx.beginPath();
            ctx.arc(earthProj.x, earthProj.y, 15 * earthProj.scale, 0, Math.PI * 2);
            ctx.fill();

            // Draw particles orbiting
            const particleCount = 20;
            for (let i = 0; i < particleCount; i++) {
                const angle = (time * 0.02) + (i * (Math.PI * 2 / particleCount));
                const radius = 150 + Math.sin(time * 0.01 + i) * 20;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                const pz = -gravityStrength / (radius * 0.05 + 10);

                const proj = project(px, py, pz);

                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2 * proj.scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            time++;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [mass]);

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 p-6 text-blue-200 font-mono text-xs pointer-events-none select-none">
                <h1 className="text-xl font-bold mb-2 tracking-widest text-white">RELATIVITY</h1>
                <div className="space-y-1 opacity-70">
                    <p>SPACETIME CURVATURE SIMULATION</p>
                    <p>GRID_METRIC: EUCLIDEAN_DISTORTED</p>
                    <p>GRAVITY_WELL: ACTIVE</p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <span className="text-xs font-mono text-blue-300 whitespace-nowrap">MASS INTENSITY</span>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={mass}
                        onChange={(e) => setMass(Number(e.target.value))}
                        className="w-full h-1 bg-blue-900 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-xs font-mono text-blue-300 w-8">{mass}%</span>
                </div>
            </div>
        </div>
    );
};
