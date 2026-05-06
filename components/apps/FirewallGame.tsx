/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Zap, Lock, Eye, Play, Pause, RefreshCw, Server, AlertTriangle, Bug, Wifi } from 'lucide-react';

/* ==========================================================================
   CONSTANTS & CONFIGURATION
   ========================================================================== */
const CELL_SIZE = 32; // px
const GRID_W = 22;
const GRID_H = 14;
const TICK_RATE = 30; // ms

// Define the path the malicious packets will take
const PATH_COORDS = [
   { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
   { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 },
   { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }, { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 },
   { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 },
   { x: 7, y: 8 }, { x: 7, y: 7 }, { x: 7, y: 6 }, { x: 7, y: 5 }, { x: 7, y: 4 },
   { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 },
   { x: 11, y: 5 }, { x: 11, y: 6 }, { x: 11, y: 7 }, { x: 11, y: 8 }, { x: 11, y: 9 }, { x: 11, y: 10 },
   { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 },
   { x: 16, y: 9 }, { x: 16, y: 8 }, { x: 16, y: 7 },
   { x: 17, y: 7 }, { x: 18, y: 7 }, { x: 19, y: 7 }, { x: 20, y: 7 }, { x: 21, y: 7 }
];

/* ==========================================================================
   TYPE DEFINITIONS
   ========================================================================== */
type TowerType = 'basic' | 'sniper' | 'slow' | 'aoe';

interface TowerDef {
   type: TowerType;
   name: string;
   icon: React.ElementType;
   cost: number;
   range: number;
   damage: number;
   rate: number; // Cooldown in ticks
   color: string;
   desc: string;
}

const TOWERS: Record<TowerType, TowerDef> = {
   basic: { type: 'basic', name: 'Packet Filter', icon: Shield, cost: 40, range: 3, damage: 15, rate: 20, color: 'text-blue-400', desc: "Standard reliable firewall rule." },
   sniper: { type: 'sniper', name: 'Deep Inspector', icon: Eye, cost: 100, range: 7, damage: 80, rate: 60, color: 'text-purple-400', desc: "Long range, high damage analysis." },
   slow: { type: 'slow', name: 'Encryption Node', icon: Lock, cost: 70, range: 3.5, damage: 5, rate: 15, color: 'text-green-400', desc: "Slows down intruder packets." },
   aoe: { type: 'aoe', name: 'DDoS Blocker', icon: Zap, cost: 150, range: 2.5, damage: 50, rate: 45, color: 'text-yellow-400', desc: "High damage area denial." },
};

interface Entity {
   id: number;
   x: number;
   y: number;
}

interface Enemy extends Entity {
   pathIndex: number;
   progress: number; // 0 to 1 between path nodes
   hp: number;
   maxHp: number;
   speed: number;
   frozen: number; // ticks remaining
}

interface Tower extends Entity {
   type: TowerType;
   lastShot: number;
}

interface Projectile extends Entity {
   targetId: number;
   damage: number;
   speed: number;
   color: string;
   type: TowerType; // To know if it slows etc
}

import { useOS } from '../../context/OSContext';
import { WindowState } from '../../types';

interface FirewallGameProps {
   windowState?: WindowState;
}

/* ==========================================================================
   MAIN COMPONENT: FirewallGame
   ========================================================================== */
const FirewallGame: React.FC<FirewallGameProps> = ({ windowState }) => {
   /* --- Hooks & Context State --- */
   const { updateWindowData, triggerNetworkAttack, updateShiftStats } = useOS();
   const savedState = windowState?.data || {};

   const [currency, setCurrency] = useState(savedState.currency ?? 150);
   const [health, setHealth] = useState(savedState.health ?? 20);
   const [wave, setWave] = useState(savedState.wave ?? 1);
   const [isPlaying, setIsPlaying] = useState(false);
   const [gameOver, setGameOver] = useState(savedState.gameOver ?? false);

   // Game State Refs (for loop)
   const enemiesRef = useRef<Enemy[]>(savedState.enemies || []);
   const towersRef = useRef<Tower[]>(savedState.towers || []);
   const projectilesRef = useRef<Projectile[]>(savedState.projectiles || []);
   const tickRef = useRef<number>(savedState.tick || 0);
   const animationFrameRef = useRef<number>(0);
   const waveActiveRef = useRef<boolean>(savedState.waveActive || false);
   const enemiesToSpawnRef = useRef<number>(savedState.enemiesToSpawn || 0);
   const spawnTimerRef = useRef<number>(savedState.spawnTimer || 0);

   /* --- Effects --- */
   // Auto-pause if minimized
   useEffect(() => {
      if (windowState?.isMinimized && isPlaying) {
         setIsPlaying(false);
      }
   }, [windowState?.isMinimized]);

   // Sync state back to OSContext on a regular interval or unmount
   useEffect(() => {
      const persist = () => {
         if (windowState?.id) {
            updateWindowData(windowState.id, {
               currency,
               health,
               wave,
               gameOver,
               enemies: enemiesRef.current,
               towers: towersRef.current,
               projectiles: projectilesRef.current,
               tick: tickRef.current,
               waveActive: waveActiveRef.current,
               enemiesToSpawn: enemiesToSpawnRef.current,
               spawnTimer: spawnTimerRef.current
            });
            // Sync to global shift stats - Use wave and currency as score base
            updateShiftStats({ firewallDefenseScore: (wave * 100) + currency });
         }
      };

      const interval = setInterval(persist, 2000); // Persist every 2 seconds
      return () => {
         clearInterval(interval);
         persist(); // Final persistence on unmount
      };
   }, [currency, health, wave, gameOver, windowState?.id, updateShiftStats]);

   // Force render for React UI updates from game loop
   const [, setTick] = useState(0);

   /* ==========================================================================
      GAME LOOP LOGIC
      ========================================================================== */

   const spawnEnemy = () => {
      const hp = 20 + (wave * 15);
      const speed = 0.05 + (Math.min(wave * 0.005, 0.05));

      enemiesRef.current.push({
         id: Date.now() + Math.random(),
         x: PATH_COORDS[0].x,
         y: PATH_COORDS[0].y,
         pathIndex: 0,
         progress: 0,
         hp,
         maxHp: hp,
         speed,
         frozen: 0
      });
   };

   const updateGame = () => {
      tickRef.current++;

      // Spawning logic
      if (waveActiveRef.current && enemiesToSpawnRef.current > 0) {
         spawnTimerRef.current++;
         if (spawnTimerRef.current > 30) { // Spawn every second approx
            spawnEnemy();
            enemiesToSpawnRef.current--;
            spawnTimerRef.current = 0;
         }
      } else if (waveActiveRef.current && enemiesToSpawnRef.current === 0 && enemiesRef.current.length === 0) {
         // Wave complete
         waveActiveRef.current = false;
         setIsPlaying(false);
         setWave(w => w + 1);
         setCurrency(c => c + 50 + (wave * 10)); // Wave clear bonus
      }

      // Move Enemies
      enemiesRef.current.forEach(enemy => {
         // Apply slow effect
         const currentSpeed = enemy.frozen > 0 ? enemy.speed * 0.5 : enemy.speed;
         if (enemy.frozen > 0) enemy.frozen--;

         enemy.progress += currentSpeed;
         if (enemy.progress >= 1) {
            enemy.progress = 0;
            enemy.pathIndex++;
            if (enemy.pathIndex >= PATH_COORDS.length - 1) {
               // Reached end
               enemy.hp = 0; // Kill
               setHealth(h => {
                  const newH = h - 1;
                  if (newH <= 0) {
                     setGameOver(true);
                     setIsPlaying(false);
                     triggerNetworkAttack();
                  }
                  return newH;
               });
            }
         }

         // Update visual pos
         const current = PATH_COORDS[enemy.pathIndex];
         const next = PATH_COORDS[enemy.pathIndex + 1];
         if (current && next) {
            enemy.x = current.x + (next.x - current.x) * enemy.progress;
            enemy.y = current.y + (next.y - current.y) * enemy.progress;
         }
      });

      // Cleanup dead enemies
      enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0);

      // Towers Fire
      towersRef.current.forEach(tower => {
         const def = TOWERS[tower.type];
         if (tickRef.current - tower.lastShot > def.rate) {
            // Find target
            const target = enemiesRef.current.find(e => {
               const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
               return dist <= def.range;
            });

            if (target) {
               tower.lastShot = tickRef.current;
               projectilesRef.current.push({
                  id: Math.random(),
                  x: tower.x,
                  y: tower.y,
                  targetId: target.id,
                  damage: def.damage,
                  speed: 0.5,
                  color: def.type === 'slow' ? '#4ade80' : def.type === 'sniper' ? '#c084fc' : '#60a5fa',
                  type: tower.type
               });
            }
         }
      });

      // Move Projectiles
      projectilesRef.current.forEach(proj => {
         const target = enemiesRef.current.find(e => e.id === proj.targetId);
         if (target) {
            const dx = target.x - proj.x;
            const dy = target.y - proj.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 0.5) {
               // Hit
               target.hp -= proj.damage;
               if (target.hp <= 0) {
                  setCurrency(c => c + 5); // Kill reward
               }
               if (proj.type === 'slow') {
                  target.frozen = 60; // Slow for 2 seconds
               }
               if (proj.type === 'aoe') {
                  // Splash damage
                  enemiesRef.current.forEach(e => {
                     if (Math.hypot(e.x - target.x, e.y - target.y) < 2) {
                        e.hp -= proj.damage / 2;
                     }
                  });
               }
               proj.targetId = -1; // Mark for deletion
            } else {
               // Move towards
               proj.x += (dx / dist) * proj.speed;
               proj.y += (dy / dist) * proj.speed;
            }
         } else {
            proj.targetId = -1; // Target lost
         }
      });

      projectilesRef.current = projectilesRef.current.filter(p => p.targetId !== -1);

      // Only trigger re-render every few ticks to save performance, or just use raf
      setTick(t => t + 1);
   };

   const loop = () => {
      if (isPlaying && !gameOver) {
         updateGame();
         // setTimeout instead of RAF for fixed tick rate logic simpler for this scale
      }
   };

   useEffect(() => {
      const interval = setInterval(loop, TICK_RATE);
      return () => clearInterval(interval);
   }, [isPlaying, gameOver]);


   /* ==========================================================================
      INTERACTIONS & HANDLERS
      ========================================================================== */

   const startNextWave = () => {
      if (!waveActiveRef.current) {
         enemiesToSpawnRef.current = 5 + Math.floor(wave * 1.5);
         waveActiveRef.current = true;
      }
      setIsPlaying(true);
   };

   const resetGame = () => {
      setCurrency(150);
      setHealth(20);
      setWave(1);
      setIsPlaying(false);
      setGameOver(false);
      enemiesRef.current = [];
      towersRef.current = [];
      projectilesRef.current = [];
      tickRef.current = 0;
      waveActiveRef.current = false;
   };

   const handleDrop = (e: React.DragEvent, gx: number, gy: number) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('towerType') as TowerType;
      if (!type || !TOWERS[type]) return;

      // Check cost
      if (currency < TOWERS[type].cost) return;

      // Check valid placement (not on path, not on other tower)
      const onPath = PATH_COORDS.some(p => p.x === gx && p.y === gy);
      const onTower = towersRef.current.some(t => t.x === gx && t.y === gy);

      if (!onPath && !onTower) {
         setCurrency(c => c - TOWERS[type].cost);
         towersRef.current.push({
            id: Date.now(),
            x: gx,
            y: gy,
            type,
            lastShot: 0
         });
      }
   };

   const handleDragStart = (e: React.DragEvent, type: TowerType) => {
      e.dataTransfer.setData('towerType', type);
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
   };

   // --- Render Helpers ---

   // Grid Construction
   const gridCells = [];
   for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
         const isPath = PATH_COORDS.some(p => p.x === x && p.y === y);
         const isStart = x === PATH_COORDS[0].x && y === PATH_COORDS[0].y;
         const isEnd = x === PATH_COORDS[PATH_COORDS.length - 1].x && y === PATH_COORDS[PATH_COORDS.length - 1].y;

         let bgClass = 'bg-[#111] border-[#222]';
         if (isPath) bgClass = 'bg-[#222] border-[#222]';
         if (isStart) bgClass = 'bg-red-900/40 border-red-900';
         if (isEnd) bgClass = 'bg-blue-900/40 border-blue-900';

         gridCells.push(
            <div
               key={`${x}-${y}`}
               className={`w-full h-full border ${bgClass} relative`}
               onDrop={(e) => handleDrop(e, x, y)}
               onDragOver={handleDragOver}
            >
               {isStart && <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 font-bold">IN</div>}
               {isEnd && <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-500 font-bold">OUT</div>}
            </div>
         );
      }
   }

   /* ==========================================================================
      RENDER RETURN
      ========================================================================== */
   return (
      <div className="flex h-full bg-[#050505] text-gray-300 font-mono select-none overflow-hidden">
         {/* --- Sidebar: Stats and Tower Shop --- */}
         <div className="w-64 bg-[#121212] border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-[#1f1f1f]">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="text-blue-500" size={20} /> Firewall Defense
               </h2>
               <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Integrity:</span>
                     <div className="flex items-center text-green-400 font-bold">
                        <Server size={14} className="mr-2" /> {health}
                     </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Bandwidth:</span>
                     <div className="flex items-center text-yellow-400 font-bold">
                        <Wifi size={14} className="mr-2" /> {currency} MB
                     </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Wave:</span>
                     <span className="text-white font-bold">{wave}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
               <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Defense Systems</h3>
               <div className="space-y-3">
                  {(Object.entries(TOWERS) as [TowerType, TowerDef][]).map(([key, def]) => (
                     <div
                        key={key}
                        draggable
                        onDragStart={(e) => handleDragStart(e, key)}
                        className={`p-3 bg-[#1e1e1e] rounded border border-white/10 hover:border-blue-500 cursor-grab active:cursor-grabbing group transition-colors ${currency < def.cost ? 'opacity-50 grayscale' : ''}`}
                     >
                        <div className="flex items-center mb-2">
                           <def.icon className={`${def.color} mr-3`} size={20} />
                           <div>
                              <div className="font-bold text-sm text-gray-200">{def.name}</div>
                              <div className="text-xs text-yellow-500 font-mono">{def.cost} MB</div>
                           </div>
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight">{def.desc}</div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#1f1f1f]">
               {!gameOver ? (
                  <button
                     onClick={() => isPlaying ? setIsPlaying(false) : startNextWave()}
                     className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-yellow-700 hover:bg-yellow-600 text-white' : 'bg-blue-700 hover:bg-blue-600 text-white'}`}
                  >
                     {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                     {isPlaying ? 'PAUSE STREAM' : 'START WAVE'}
                  </button>
               ) : (
                  <button
                     onClick={resetGame}
                     className="w-full py-3 rounded font-bold flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white"
                  >
                     <RefreshCw size={16} /> REBOOT SYSTEM
                  </button>
               )}
            </div>
         </div>

         {/* --- Game Board: Grid and Entities --- */}
         <div className="flex-1 relative overflow-hidden bg-[#050505] flex items-center justify-center p-4">
            <div
               className="grid relative shadow-2xl border border-white/10"
               style={{
                  width: GRID_W * CELL_SIZE,
                  height: GRID_H * CELL_SIZE,
                  gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_H}, 1fr)`
               }}
            >
               {gridCells}

               {/* Render Path Highlight Line */}
               <svg className="absolute inset-0 pointer-events-none opacity-20" width="100%" height="100%">
                  <polyline
                     points={PATH_COORDS.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                     fill="none"
                     stroke="#444"
                     strokeWidth="4"
                     strokeLinejoin="round"
                  />
               </svg>

               {/* Towers */}
               {towersRef.current.map(tower => {
                  const def = TOWERS[tower.type];
                  return (
                     <div
                        key={tower.id}
                        className="absolute flex items-center justify-center"
                        style={{
                           left: tower.x * CELL_SIZE,
                           top: tower.y * CELL_SIZE,
                           width: CELL_SIZE,
                           height: CELL_SIZE,
                        }}
                     >
                        <div className="w-6 h-6 bg-[#222] rounded-full border border-gray-500 flex items-center justify-center shadow-lg z-10">
                           <def.icon size={14} className={def.color} />
                        </div>
                        {/* Range Indicator (faint) */}
                        {/* <div className="absolute rounded-full border border-white/10 bg-white/5 pointer-events-none" style={{ width: def.range * CELL_SIZE * 2, height: def.range * CELL_SIZE * 2 }} /> */}
                     </div>
                  );
               })}

               {/* Enemies */}
               {enemiesRef.current.map(enemy => (
                  <div
                     key={enemy.id}
                     className="absolute flex items-center justify-center transition-transform z-20"
                     style={{
                        left: enemy.x * CELL_SIZE,
                        top: enemy.y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        transform: `translate(${enemy.frozen > 0 ? '1px, 1px' : '0, 0'})` // Shake if frozen?
                     }}
                  >
                     <div className="relative">
                        <div className={`w-4 h-4 rounded-full ${enemy.frozen > 0 ? 'bg-cyan-400' : 'bg-red-500'} shadow-[0_0_8px_rgba(239,68,68,0.6)] flex items-center justify-center`}>
                           <Bug size={10} className="text-black" />
                        </div>
                        {/* HP Bar */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                        </div>
                     </div>
                  </div>
               ))}

               {/* Projectiles */}
               {projectilesRef.current.map(proj => (
                  <div
                     key={proj.id}
                     className="absolute w-2 h-2 rounded-full z-30"
                     style={{
                        left: proj.x * CELL_SIZE + CELL_SIZE / 2 - 4,
                        top: proj.y * CELL_SIZE + CELL_SIZE / 2 - 4,
                        backgroundColor: proj.color,
                        boxShadow: `0 0 5px ${proj.color}`
                     }}
                  />
               ))}
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                  <AlertTriangle size={64} className="text-red-500 mb-4 animate-bounce" />
                  <h2 className="text-4xl font-bold text-white mb-2">SYSTEM BREACHED</h2>
                  <p className="text-gray-400 mb-8">Malicious packets compromised the server.</p>
                  <button
                     onClick={resetGame}
                     className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold flex items-center gap-2"
                  >
                     <RefreshCw size={20} /> REBOOT FIREWALL
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default FirewallGame;