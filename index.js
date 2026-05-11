document.addEventListener('DOMContentLoaded', () => {
	const ledCanvas = document.getElementById("ledCanvas");
	const lctx = ledCanvas.getContext("2d", { alpha: false });
    let internalWidth, rows, cols;
    const INTERNAL_HEIGHT = 877; 
    const spacing = 15.8; 
    let grid, activeLines = [];
    const tieredSprites = [];
    const LINES_PER_FRAME = 30;   
    const PULSE_SPEED = 0.024;
    const MIN_LEN = 5;            
    const MAX_LEN = 15;           
    const LED_RANDOMNESS = 0.25;
    const SPAWN_CHANCE = 0.8;
    function preRenderLED() {
        for (let i = 0; i <= 10; i++) {
            const intensity = i / 10;
            const displayInt = Math.max(0.06, intensity);
            const sCanvas = document.createElement('canvas');
            const sCtx = sCanvas.getContext('2d');
            const size = 100; 
            sCanvas.width = size; sCanvas.height = size;
            const centerX = size / 2; const centerY = size / 2;
            if (displayInt < 0.5) {
                const t = displayInt * 2;
                const r = 139 + (255 - 139) * t; 
                const g = 69 + (179 - 69) * t; 
                const b = 0 + (30 - 0) * t;
                const rad = 1.3 + t * 1.5;
                sCtx.shadowBlur = t * 12;
                sCtx.shadowColor = `rgba(255, 140, 0, 0.3)`;
                sCtx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
                sCtx.beginPath(); sCtx.arc(centerX, centerY, rad, 0, Math.PI*2); sCtx.fill();
            } else {
                const t = (displayInt - 0.5) * 2;
                const coreRad = 2.5 + t * 4.5;
                const haloRad = coreRad * 1.18;
                sCtx.shadowBlur = 15 + t * 30;
                sCtx.shadowColor = `rgba(255, 165, 0, 0.5)`;
                sCtx.fillStyle = "#FFB300";
                sCtx.beginPath(); sCtx.arc(centerX, centerY, haloRad, 0, Math.PI * 2); sCtx.fill();
                sCtx.shadowBlur = 0;
                sCtx.fillStyle = "#FFF9E5"; 
                sCtx.beginPath(); sCtx.arc(centerX, centerY, coreRad, 0, Math.PI * 2); sCtx.fill();
            }
            tieredSprites[i] = sCanvas;
        }
    }
    function initLED() {
        const aspect = window.innerWidth / window.innerHeight;
        internalWidth = INTERNAL_HEIGHT * aspect;
        ledCanvas.width = internalWidth;
        ledCanvas.height = INTERNAL_HEIGHT;
        cols = Math.ceil(internalWidth / spacing);
        rows = Math.ceil(INTERNAL_HEIGHT / spacing);
        const newSize = rows * cols;
        if (!grid || grid.length !== newSize) {
            grid = new Float32Array(newSize);
        }
        activeLines = activeLines.filter(p => p.r < rows && p.c < cols);
    }
    function updateLED() {
        grid.fill(0);
        if (Math.random() < SPAWN_CHANCE) {
            for(let i = 0; i < LINES_PER_FRAME; i++) {
                activeLines.push({
                    r: Math.floor(Math.random() * rows),
                    c: Math.floor(Math.random() * cols),
                    len: Math.floor(Math.random() * (MAX_LEN - MIN_LEN + 1) + MIN_LEN),
                    age: 0,
                    speed: PULSE_SPEED + (Math.random() * 0.01),
                    noiseFactors: Array.from({length: MAX_LEN * 2 + 1}, () => 1 - (Math.random() * LED_RANDOMNESS))
                });
            }
        }
        for (let i = activeLines.length - 1; i >= 0; i--) {
            const p = activeLines[i];
            p.age += p.speed;
            if (p.age >= 1) {
                activeLines.splice(i, 1);
                continue;
            }
            const masterIntensity = Math.sin(p.age * Math.PI);
            for (let offset = -p.len; offset <= p.len; offset++) {
                const targetC = p.c + offset;
                if (targetC >= 0 && targetC < cols) {
                    const distFalloff = 1 - (Math.abs(offset) / p.len);
                    const noise = p.noiseFactors[offset + MAX_LEN];
                    const finalVal = masterIntensity * distFalloff * noise;
                    const idx = p.r * cols + targetC;
                    if (finalVal > grid[idx]) grid[idx] = finalVal;
                }
            }
        }
    }
    function drawLED() {
        lctx.fillStyle = '#0c0a05';
        lctx.fillRect(0, 0, internalWidth, INTERNAL_HEIGHT);
        lctx.globalCompositeOperation = 'screen';
        const halfSize = 50; 
        for (let r = 0; r < rows; r++) {
            const rowOff = r * cols;
            const yPos = (r * spacing + spacing/2) - halfSize;
            for (let c = 0; c < cols; c++) {
                const intensity = grid[rowOff + c];
                const cacheIdx = Math.min(10, Math.max(0, Math.floor(intensity * 10)));
                lctx.drawImage(tieredSprites[cacheIdx], (c * spacing + spacing/2) - halfSize, yPos);
            }
        }
        lctx.globalCompositeOperation = 'source-over';
    }
    preRenderLED();
    initLED();
    let prevLedWidth = window.innerWidth;
    window.addEventListener('resize', () => {

        if (window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01) {
            return;
        }
        const currentWidth = window.innerWidth;
        if (currentWidth === prevLedWidth) return;
        prevLedWidth = currentWidth;
        initLED();
    });

    let seed = 45;
    const prng = () => (seed = (seed * 9301 + 49297) % 233280, seed / 233280);

    const nebula = document.getElementById('nebula');
    const system = document.getElementById('beamSystem');
    const viewport = document.getElementById('viewport');
    const energyFieldContainer = document.getElementById('energy-field-container');
    const spotColors = ['#bc00ff', '#00ff88', '#00d4ff', '#5555ff', '#ff0055'];
    const spotlights = nebula?.querySelectorAll('.spotlight') || [];
    spotlights.forEach((spot, i) => {
        spot.style.background = `radial-gradient(circle, ${spotColors[i%5]}, transparent 75%)`;
        spot.style.left = prng()*100 + 'vw';
        spot.style.top = prng()*100 + 'vh';
        spot.style.setProperty('--sx', (prng()-0.5)*30 + 'vw');
        spot.style.setProperty('--sy', (prng()-0.5)*30 + 'vh');
        spot.style.setProperty('--ex', (prng()-0.5)*30 + 'vw');
        spot.style.setProperty('--ey', (prng()-0.5)*30 + 'vh');
        spot.style.animation = `floatSpot ${10 + prng()*15}s infinite ease-in-out`;
    });
    const corners = [
        {top: 0, left: 0, origin: '0% 0%'},
        {top: 0, right: 0, origin: '100% 0%'},
        {bottom: 0, left: 0, origin: '0% 100%'},
        {bottom: 0, right: 0, origin: '100% 100%'},
        {top: '50%', left: 0, origin: '0% 50%'},
        {top: '50%', right: 0, origin: '100% 50%'}
    ];
    const setupBeams = () => {
        const beams = system?.querySelectorAll('.beam:not(.master-pivot)') || [];
        beams.forEach(ray => {
            const corner = corners[Math.floor(prng()*corners.length)];
            if(corner.left !== undefined) ray.style.left = corner.left;
            if(corner.right !== undefined) ray.style.right = corner.right;
            if(corner.top !== undefined) ray.style.top = corner.top;
            if(corner.bottom !== undefined) ray.style.bottom = corner.bottom;
            ray.style.transformOrigin = corner.origin;
            const colors = [['#00d4ff', '#ffffff'], ['#cc44ff', '#22ff88'], ['#ff0055', '#cc44ff'], ['#22ff88', '#00d4ff']][Math.floor(prng()*4)];
            const th = 0.2 + prng() * 1.5, glow = 0.2 + prng() * 0.4;
            ray.innerHTML = `<div class="beam-glow" style="opacity: ${glow}; background: linear-gradient(to bottom, transparent, ${colors[0]}, ${colors[1]}, transparent)"></div>
                             <div class="beam-body" style="height: ${th}vw; background: linear-gradient(to bottom, transparent, ${colors[0]}, ${colors[1]}, transparent)"></div>`;
            ray.style.setProperty('--startAngle', (prng()*360) + 'deg');
            ray.style.setProperty('--endAngle', (prng()*360) + 'deg');
            ray.style.setProperty('--z', (prng()*40 - 20) + 'vw');
            ray.style.animation = `sweepSecondary ${8 + prng()*20}s infinite ease-in-out`;
            ray.style.opacity = 0.3 + prng()*0.5;
        });
    };
    setupBeams();
    setInterval(() => {
        if(viewport && Math.random() > 0.85) {
            viewport.classList.add('glitch-active');
            setTimeout(() => viewport.classList.remove('glitch-active'), 200);
        }
    }, 2000);

    setTimeout(() => {
        if (energyFieldContainer) energyFieldContainer.classList.add('hidden');
        if (ledCanvas) ledCanvas.classList.add('visible');
        loopBackground();
    }, 5500);
	function loopBackground() {
        updateLED();
        drawLED();
		requestAnimationFrame(loopBackground);
	}

    const canvas = document.getElementById('hero-canvas');
	const canvassolid = document.getElementById('hero-canvas-solid');
        const ctx = canvas.getContext('2d');
		const ctxsolid = canvassolid.getContext('2d');
        let width, height, scaleFactor, particles = [];
        const CONFIG = {
            baseCount: 225,
            baseDist: 85,
            gatherRadius: 180,
            lockRadius: 260,
            lerp: 0.05,
			freeSpeed: 0.3,
            followSpeed: 0.03,
            labelChance: 0.25,
            transSpeed: 0.04,
            upgradeThreshold: 5,
            glitchStrength: 200,
            glitchFreq: 0.01,
            scaleBase: 70,
            scaleVar: 0.25,
            vertexScaleMult: 2,
			shapeGracePeriod: 1000
        };
        const techLabels = [
            "LX12→", "DMX(?)", "CH7*", "U4#", "FX-A", "BUS-?", "AUX+", "GND!",
            "16A-3P", "32A~", "PH3", "3Ø", "V230~", "Hz50", "RX-1", "TX(9)",
            "PWR-2", "PSU(A)", "SIG-L", "I/O", "DM3<", "LX05(C)", "UNI2(B)",
            "SUB4.1", "CH09-", "FX7→", "REF(3)", "ALT-1", "TMP*", "LIVE", "CUT", "OFF"
        ];
        let mouse = { x: -1000, y: -1000 }, rotation = { y: 0, p: 0 }, isIn = false;
        let shapeCenter = null, shapePoints = [], shapeEdges = [], activeGroup = [], ghostGroup = [], ghostEdges = [], shapeState = 'idle';
        let currentScale = 70;
		let shapeStartTime = 0;
		let currentShapeSettings = null;
		let lastShapeID = -1;
        const Geo = {
            link: (pts, edges) => ({ pts, edges }),
            pyramid: (n, s) => {
                const pts = [{ x: 0, y: -s, z: 0 }], edges = [], sides = n - 1;
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * Math.PI * 2;
                    pts.push({ x: Math.cos(a) * s, y: s * 0.6, z: Math.sin(a) * s });
                    edges.push([0, i + 1], [i + 1, (i === sides - 1) ? 1 : i + 2]);
                }
                return Geo.link(pts, edges);
            },
            prism: (sides, s) => {
                const pts = [], edges = [];
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * Math.PI * 2;
                    pts.push({ x: Math.cos(a) * s, y: -s * 0.5, z: Math.sin(a) * s }, { x: Math.cos(a) * s, y: s * 0.5, z: Math.sin(a) * s });
                    const t = i * 2, b = i * 2 + 1, nt = (i === sides - 1) ? 0 : (i + 1) * 2, nb = (i === sides - 1) ? 1 : (i + 1) * 2 + 1;
                    edges.push([t, b], [t, nt], [b, nb]);
                }
                return Geo.link(pts, edges);
            },
            dipyramid: (n, s) => {
                const pts = [{ x: 0, y: -s, z: 0 }, { x: 0, y: s, z: 0 }], edges = [], sides = n - 2;
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * Math.PI * 2;
                    pts.push({ x: Math.cos(a) * s, y: 0, z: Math.sin(a) * s });
                    const cur = i + 2, nxt = (i === sides - 1) ? 2 : i + 3;
                    edges.push([0, cur], [1, cur], [cur, nxt]);
                }
                return Geo.link(pts, edges);
            },
            plane: (n, s) => {
                let cols = 0;
                for (let i = Math.floor(Math.sqrt(n)); i >= 3; i--) { if (n % i === 0 && (n / i) >= 3) { cols = i; break; } }
                if (!cols) return null;
                const pts = [], edges = [], rows = n / cols, sp = (s * 2.8) / Math.max(cols, rows);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const idx = r * cols + c;
                        pts.push({ x: (c - (cols - 1) / 2) * sp, y: (r - (rows - 1) / 2) * sp, z: 0 });
                        if (c < cols - 1) edges.push([idx, idx + 1]);
                        if (r < rows - 1) edges.push([idx, idx + cols]);
                    }
                }
                return Geo.link(pts, edges);
            },
            sphere: (n, s) => {
                const pts = [], edges = [], phi = Math.PI * (3 - Math.sqrt(5));
                for (let i = 0; i < n; i++) {
                    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), t = phi * i;
                    pts.push({ x: Math.cos(t) * r * s, y: y * s, z: Math.sin(t) * r * s });
                }
                for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y, pts[i].z - pts[j].z) < s * 1.1) edges.push([i, j]);
                return Geo.link(pts, edges);
            },
			calculate: (type, n, s) => Geo[type]?.(type === 'prism' ? n / 2 : n, s) || Geo.pyramid(n, s),
			getNewShapeSettings: (n) => {
				const rs = (1 + (Math.random() * 2 - 1) * CONFIG.scaleVar), gf = 1 + (n * CONFIG.vertexScaleMult) / 100;
				let p = n <= 5 ? ['pyramid', 'dipyramid'] : n <= 14 ? ['pyramid', 'dipyramid', (n % 2 === 0 ? 'prism' : 'pyramid')] : ['plane', 'sphere', 'pyramid', 'dipyramid'];
				let c = p.filter(t => t !== lastShapeID);
				return { type: c[Math.floor(Math.random() * (c.length || p.length))] || p[0], randScale: rs, growthFactor: gf };
			}
        };
        class Particle {
            constructor(id) {
                this.id = id;
                this.reset(true);
            }
            reset(rand = false) {
				this.rx = rand ? Math.random() : this.x / width;
				this.ry = rand ? Math.random() : this.y / height;
				this.x = this.rx * width; this.y = this.ry * height;
                this.vx = (Math.random() - 0.5) * CONFIG.freeSpeed * scaleFactor;
                this.vy = (Math.random() - 0.5) * CONFIG.freeSpeed * scaleFactor;
                this.mode = 'free'; this.shapeIndex = -1; this.trans = 0;
                this.label = Math.random() < CONFIG.labelChance ? techLabels[Math.floor(Math.random() * techLabels.length)] : null;
                this.glitchX = this.glitchY = 0;
            }
            update() {
                this.trans += ((this.mode === 'shape' ? 1 : 0) - this.trans) * CONFIG.transSpeed;
                if (this.mode === 'shape' && Math.random() < CONFIG.glitchFreq) {
					const gs = currentScale / CONFIG.scaleBase;
                    this.glitchX = (Math.random() - 0.5) * CONFIG.glitchStrength * gs;
                    this.glitchY = (Math.random() - 0.5) * CONFIG.glitchStrength * gs;
                } else { this.glitchX *= 0.7; this.glitchY *= 0.7; }
                if (this.mode === 'free') {
                    this.x = (this.x + this.vx + width) % width;
                    this.y = (this.y + this.vy + height) % height;
                } else if (shapeState === 'active' && shapePoints[this.shapeIndex]) {
                    const p = shapePoints[this.shapeIndex], cy = Math.cos(rotation.y), sy = Math.sin(rotation.y), cp = Math.cos(rotation.p), sp = Math.sin(rotation.p);
                    const dx = p.x * cy - p.z * sy, dz = p.x * sy + p.z * cy, dy = p.y * cp - dz * sp;
                    this.x += (dx + shapeCenter.x + this.glitchX - this.x) * CONFIG.lerp;
                    this.y += (dy + shapeCenter.y + this.glitchY - this.y) * CONFIG.lerp;
                }
				this.rx = this.x / width; this.ry = this.y / height;
            }
            draw(ox = 0, oy = 0) {
                const dx = this.x + ox, dy = this.y + oy;
                if (dx < -20 || dx > width + 20 || dy < -20 || dy > height + 20) return;
                ctx.fillStyle = `rgba(255,255,255,${0.4 + this.trans * 0.6})`;
                ctx.beginPath(); ctx.arc(dx, dy, (2.4 + this.trans) * scaleFactor, 0, Math.PI * 2); ctx.fill();
                if (this.label) {
                    let txt = (this.mode === 'shape' && Math.random() > 0.98) ? "ERR" : this.label;
                    ctx.font = `${13 * scaleFactor}px monospace`; ctx.fillStyle = `rgba(255,255,255,${0.15 + this.trans * 0.5})`;
                    ctx.fillText(txt, dx + 8, dy + 3);
                }
            }
        }
        const renderFullStructure = (group, edges, ghost = false) => {
			const needsTilingX = shapeCenter.x < currentScale || shapeCenter.x > width - currentScale;
			const needsTilingY = shapeCenter.y < currentScale || shapeCenter.y > height - currentScale;
			for (let ox = needsTilingX ? -1 : 0; ox <= (needsTilingX ? 1 : 0); ox++) {
				for (let oy = needsTilingY ? -1 : 0; oy <= (needsTilingY ? 1 : 0); oy++) {
                    const offX = ox * width, offY = oy * height;
                    edges.forEach(e => {
                        const p1 = group[e[0]], p2 = group[e[1]];
                        if (p1 && p2) {
                            const alpha = Math.min(p1.trans, p2.trans) * (ghost ? 0.3 : 0.7);
                            if (alpha < 0.02) return;
							ctx.lineWidth = 2.0 * scaleFactor;
                            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                            ctx.beginPath(); ctx.moveTo(p1.x + offX, p1.y + offY); ctx.lineTo(p2.x + offX, p2.y + offY); ctx.stroke();
                        }
                    });
                    if (!ghost) group.forEach(p => p.draw(offX, offY));
                }
            }
        };
		const triggerShape = (potential) => {
			if (shapeState === 'active' && (Date.now() - shapeStartTime < CONFIG.shapeGracePeriod)) return; 
			if (activeGroup.length > 0) release();
			activeGroup = potential.sort((a, b) => a.id - b.id);
			currentShapeSettings = Geo.getNewShapeSettings(activeGroup.length);
			lastShapeID = currentShapeSettings.type;
			currentScale = CONFIG.scaleBase * currentShapeSettings.randScale * currentShapeSettings.growthFactor * scaleFactor;
			const data = Geo.calculate(currentShapeSettings.type, activeGroup.length, currentScale);
			shapeStartTime = Date.now();
			shapePoints = data.pts; 
			shapeEdges = data.edges;
			shapeCenter = { x: mouse.x, y: mouse.y };
			activeGroup.forEach((p, i) => { p.mode = 'shape'; p.shapeIndex = i; });
			shapeState = 'active';
		};
        const release = () => {
            if (activeGroup.length > 0) {
                ghostGroup = activeGroup.map(p => ({ x: p.x, y: p.y, trans: p.trans }));
                ghostEdges = [...shapeEdges];
                activeGroup.forEach(p => { p.mode = 'free'; p.vx = (Math.random() - 0.5) * 1.5 * scaleFactor; p.vy = (Math.random() - 0.5) * 1.5 * scaleFactor; });
            }
            activeGroup = []; shapeState = 'idle';
        };
		const init = () => {
			const ratioX = shapeCenter ? shapeCenter.x / width : null;
			const ratioY = shapeCenter ? shapeCenter.y / height : null;
			width = canvas.width = canvassolid.width = canvas.parentElement.offsetWidth;
			height = canvas.height = canvassolid.height = Math.max(100, canvas.parentElement.offsetHeight - 88);
			scaleFactor = height / 1080;
			if (shapeCenter && ratioX !== null) {
				shapeCenter.x = ratioX * width;
				shapeCenter.y = ratioY * height;
			}
			if (particles.length > 0) {
				particles.forEach(p => {
					p.x = p.rx * width;
					p.y = p.ry * height;
					const angle = Math.atan2(p.vy, p.vx);
					p.vx = Math.cos(angle) * CONFIG.freeSpeed * scaleFactor;
					p.vy = Math.sin(angle) * CONFIG.freeSpeed * scaleFactor;
				});
				if (shapeState === 'active' && activeGroup.length > 0 && currentShapeSettings) {
					currentScale = CONFIG.scaleBase * currentShapeSettings.randScale * currentShapeSettings.growthFactor * scaleFactor;
					const data = Geo.calculate(currentShapeSettings.type, activeGroup.length, currentScale);
					shapePoints = data.pts;
					shapeEdges = data.edges;
				}
			} else {
				const count = Math.floor(CONFIG.baseCount * (width / height / 1.77));
				for (let i = 0; i < count; i++) particles.push(new Particle(i));
			}
			updateMousePos(mouse.x, mouse.y);
		};
        window.addEventListener('resize', init);
		window.addEventListener('pointermove', e => {
			if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
				const r = canvas.getBoundingClientRect();
				updateMousePos(e.clientX - r.left, e.clientY - r.top);
			}
		});
		window.addEventListener('pointerdown', e => {
			const r = canvas.getBoundingClientRect();
			updateMousePos(e.clientX - r.left, e.clientY - r.top);
			isIn = true;
		});
		const updateMousePos = (x, y) => {
			mouse.x = x;
			mouse.y = y;
			isIn = (mouse.x >= 0 && mouse.x <= width && mouse.y >= 0 && mouse.y <= height);
		};
        init();
        function animate() {
            ctx.clearRect(0, 0, width, height);
            if (isIn) {
                const potential = particles.filter(p => Math.hypot(p.x - mouse.x, p.y - mouse.y) < CONFIG.gatherRadius * scaleFactor);
                if (shapeState === 'idle' && potential.length >= 4) triggerShape(potential);
                else if (shapeState === 'active') {
                    if (Math.hypot(mouse.x - shapeCenter.x, mouse.y - shapeCenter.y) > CONFIG.lockRadius * scaleFactor) release();
                    else if (potential.length > activeGroup.length + CONFIG.upgradeThreshold) triggerShape(potential);
                }
            } else if (shapeState !== 'idle') release();
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    if (d < CONFIG.baseDist * scaleFactor && p1.mode === 'free' && p2.mode === 'free') {
						ctx.lineWidth = 1.75 * scaleFactor;
                        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / (CONFIG.baseDist * scaleFactor)) * 0.5})`;
                        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                    }
                }
            }
            if (shapeState === 'active') {
                rotation.y += 0.008; rotation.p += 0.005;
                shapeCenter.x += (mouse.x - shapeCenter.x) * CONFIG.followSpeed;
                shapeCenter.y += (mouse.y - shapeCenter.y) * CONFIG.followSpeed;
                renderFullStructure(activeGroup, shapeEdges, false);
            }
            if (ghostGroup.length > 0) {
                let visible = false;
                ghostEdges.forEach(e => {
                    const p1 = ghostGroup[e[0]], p2 = ghostGroup[e[1]];
                    if (p1 && p2 && p1.trans > 0.01) {
						ctx.lineWidth = 1.75 * scaleFactor;
                        ctx.strokeStyle = `rgba(255,255,255,${Math.min(p1.trans, p2.trans) * 0.3})`;
                        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                        visible = true;
                    }
                });
                ghostGroup.forEach(p => p.trans *= 0.88);
                if (!visible) ghostGroup = [];
            }
            particles.forEach(p => { if (p.mode === 'free') { p.update(); p.draw(); } else { p.update(); } });
			ctxsolid.clearRect(0, 0, width, height);
			ctxsolid.drawImage(canvas, 0, 0);
			const sourceTitle = document.querySelector('.hero-title-large');
			const s = window.getComputedStyle(sourceTitle);
			const rectT = sourceTitle.getBoundingClientRect(), rectC = canvassolid.getBoundingClientRect();
			const lines = sourceTitle.innerHTML.split(/<br\s*\/?>/i);
			const fs = parseFloat(s.fontSize);
			ctxsolid.font = `${s.fontWeight} ${s.fontSize} system-ui, sans-serif`;
			ctxsolid.textAlign = "center";
			ctxsolid.textBaseline = "middle";
			ctxsolid.letterSpacing = s.letterSpacing;
			ctxsolid.globalCompositeOperation = 'destination-out';
			const x = width / 2;
			const yBase = (rectT.top + rectT.height / 2) - rectC.top + (fs * 0.135);
			const lh = parseFloat(s.lineHeight) || fs;
			lines.forEach((line, i) => {
				const txt = line.replace(/<\/?[^>]+(>|$)/g, "").trim();
				ctxsolid.fillText(txt, x, yBase + (i - (lines.length - 1) / 2) * lh);
			});
			ctxsolid.globalCompositeOperation = 'source-over';
            requestAnimationFrame(animate);
        }
        animate();
    function initReviewsCarousel() {
        const track = document.getElementById('reviews-track');
        const dotsContainer = document.getElementById('carousel-dots');
        if (!track || !dotsContainer) return;
        const cards = track.children;
        if (cards.length === 0) return;
        let currentIndex = 0;
        let autoSlideTimer;
        dotsContainer.innerHTML = Array.from(cards).map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        function updateCarousel(index) {
            currentIndex = index;
            track.style.transform = `translateX(calc(-${currentIndex} * (100% + 40px)))`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        function handleSwipe() {
            const swipeDist = touchStartX - touchEndX;
            if (Math.abs(swipeDist) > 50) {
                if (swipeDist > 0) {
                    updateCarousel((currentIndex + 1) % cards.length);
                } else {
                    updateCarousel((currentIndex - 1 + cards.length) % cards.length);
                }
                startAutoSlide();
            }
        }
        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                updateCarousel((currentIndex + 1) % cards.length);
            }, 5000);
        }
        function stopAutoSlide() {
            clearInterval(autoSlideTimer);
        }
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                updateCarousel(parseInt(dot.dataset.index, 10));
                startAutoSlide();
            });
        });
        const prevBtn = document.getElementById('prev-review');
        const nextBtn = document.getElementById('next-review');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateCarousel((currentIndex - 1 + cards.length) % cards.length);
                startAutoSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateCarousel((currentIndex + 1) % cards.length);
                startAutoSlide();
            });
        }
        const carousel = document.querySelector('.reviews-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }
        startAutoSlide();
    }
    initReviewsCarousel();

    function initServiceAccordion() {
        const container = document.getElementById('service-details-container');
        const titleEl = document.getElementById('service-details-title');
        const textEl = document.getElementById('service-details-text');
        const galleryEl = document.getElementById('service-details-gallery');
        const grid = document.querySelector('.services-grid');
        if (!container || !grid) return;
        const serviceImages = {
            'rental': [
                'img/index/service_rental1.avif',
                'img/index/service_rental2.webp'
            ],
            'production': [
                'img/index/service_production1.jpg',
                'img/index/service_production2.jpg'
            ],
            'design': [
                'img/index/service_design1.webp',
                'img/index/service_design2.webp'
            ],
            'support': [
                'img/index/service_event1.png',
                'img/index/service_event2.png'
            ]
        };
        const cards = Array.from(grid.querySelectorAll('.service-card[data-service-id]'));
        const placeContainer = (card) => {
            const top = card.offsetTop, row = cards.filter(c => c.offsetTop === top);
            const first = row[0], last = row[row.length - 1];
            last.insertAdjacentElement('afterend', container);
            container.classList.toggle('first-in-row', card === first);
            container.classList.toggle('last-in-row', card === last);
        };
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const serviceId = card.dataset.serviceId;
                const isActive = card.classList.contains('active');

                cards.forEach(c => c.classList.remove('active', 'is-first-in-row', 'is-last-in-row'));
                if (isActive) {
                    container.style.display = 'none'; // Toggle off
                    return;
                }
                card.classList.add('active');
                placeContainer(card);

                const isFirst = container.classList.contains('first-in-row');
                const isLast = container.classList.contains('last-in-row');
                if (isFirst) card.classList.add('is-first-in-row');
                if (isLast) card.classList.add('is-last-in-row');
                titleEl.setAttribute('data-i18n', `services.${serviceId}.title`);
                const textKey = `services.${serviceId}.modalText`;
                textEl.setAttribute('data-i18n', textKey);
                galleryEl.innerHTML = '';
                if (serviceImages[serviceId] && serviceImages[serviceId].length > 0) {
                    const template = document.getElementById('service-img-template');
                    serviceImages[serviceId].forEach(src => {
                        if (template) {
                            const clone = template.content.cloneNode(true);
                            const img = clone.querySelector('img');
                            img.src = src;
                            galleryEl.appendChild(clone);
                        }
                    });
                }
                if (window.changeLanguage && window.currentLang) {
                    window.changeLanguage(window.currentLang);
                }
                container.style.display = 'block';
                setTimeout(() => {
                    const header = document.querySelector('.site-header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const offset = 20;
                    const targetY = card.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset;
                    window.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                }, 100);
            });
        });

        let resizeTimer;
        let prevWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            const currentWidth = window.innerWidth;
            if (currentWidth === prevWidth) return; // Ignore height-only changes (mobile URL bar)
            prevWidth = currentWidth;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const activeCard = grid.querySelector('.service-card.active');
                if (activeCard) {
                    placeContainer(activeCard);
                }
            }, 100);
        });

        if (cards.length > 0) {
            cards[0].click();
        }
    }
    initServiceAccordion();
});