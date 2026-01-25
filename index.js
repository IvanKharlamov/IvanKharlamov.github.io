// Index JS: Hero Animation, Reviews, Team Modal

document.addEventListener('DOMContentLoaded', () => {
	const video = document.getElementById("heroVideo");

	video.addEventListener("ended", function() {
		video.src = "assets/video/VideoHeaderLoop.webm";
		video.loop = true;
		video.play();
	}, { once: true });

    // --- Background Animation (Constellation Effect & Geometric Attraction) ---
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
                for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
                    if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y, pts[i].z - pts[j].z) < s * 1.1) edges.push([i, j]);
                }
                return Geo.link(pts, edges);
            },
			calculate: (type, n, s) => {
				if (type === 'pyramid') return Geo.pyramid(n, s);
				if (type === 'prism') return Geo.prism(n / 2, s);
				if (type === 'dipyramid') return Geo.dipyramid(n, s);
				if (type === 'plane') return Geo.plane(n, s) || Geo.pyramid(n, s);
				if (type === 'sphere') return Geo.sphere(n, s);
				return null;
			},
			getNewShapeSettings: (n) => {
				const randScale = (1 + (Math.random() * 2 - 1) * CONFIG.scaleVar);
				const growthFactor = 1 + (n * CONFIG.vertexScaleMult) / 100;
				
				let pool = [];
				if (n == 4) pool = ['pyramid'];
				else if (n == 5) pool = ['pyramid', 'dipyramid'];
				else if (n <= 14) pool = ['pyramid', 'dipyramid', (n % 2 === 0 ? 'prism' : 'pyramid')];
				else pool = ['plane', 'sphere', 'pyramid', 'dipyramid'];

				let choices = pool.filter(type => type !== lastShapeID);
				if (choices.length === 0) choices = pool;
				const selected = choices[Math.floor(Math.random() * choices.length)];
				
				return { type: selected, randScale, growthFactor };
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
				this.x = this.rx * width;
				this.y = this.ry * height;
                this.vx = (Math.random() - 0.5) * CONFIG.freeSpeed * scaleFactor;
                this.vy = (Math.random() - 0.5) * CONFIG.freeSpeed * scaleFactor;
                this.mode = 'free'; this.shapeIndex = -1; this.trans = 0;
                this.label = Math.random() < CONFIG.labelChance ? techLabels[Math.floor(Math.random() * techLabels.length)] : null;
                this.glitchX = 0; this.glitchY = 0;
            }
            update() {
                this.trans += ((this.mode === 'shape' ? 1 : 0) - this.trans) * CONFIG.transSpeed;
                if (this.mode === 'shape' && Math.random() < CONFIG.glitchFreq) {
					const glitchScale = currentScale / CONFIG.scaleBase;
                    this.glitchX = (Math.random() - 0.5) * CONFIG.glitchStrength * glitchScale;
                    this.glitchY = (Math.random() - 0.5) * CONFIG.glitchStrength * glitchScale;
                } else {
                    this.glitchX *= 0.7; this.glitchY *= 0.7;
                }
                if (this.mode === 'free') {
                    this.x += this.vx; this.y += this.vy;
                    if (this.x < 0) this.x = this.x + width; else if (this.x > width) this.x = this.x - width;
                    if (this.y < 0) this.y = this.y + height; else if (this.y > height) this.y = this.y - height;
                } else if (shapeState === 'active' && shapePoints[this.shapeIndex]) {
                    const p = shapePoints[this.shapeIndex];
                    const cy = Math.cos(rotation.y), sy = Math.sin(rotation.y), cp = Math.cos(rotation.p), sp = Math.sin(rotation.p);
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
		window.addEventListener('mousemove', e => {
			const r = canvas.getBoundingClientRect();
			updateMousePos(e.clientX - r.left, e.clientY - r.top);
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

			ctxsolid.font = `${s.fontWeight} ${s.fontSize} "Inter", sans-serif`;
			ctxsolid.textAlign = "center";
			ctxsolid.textBaseline = "middle";
			ctxsolid.letterSpacing = s.letterSpacing;

			ctxsolid.globalCompositeOperation = 'destination-out';
				
			const x = width / 2;
			const yBase = (rectT.top + rectT.height / 2) - rectC.top + (fs * 0.06);
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
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                updateCarousel((currentIndex + 1) % cards.length);
            }, 6000);
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

    // --- Meet the Team Modal ---
    const btnMeetTeam = document.getElementById('btn-meet-team');
    const teamModal = document.getElementById('team-modal');
    const closeTeamModalBtn = document.getElementById('close-team-modal');

    if (btnMeetTeam && teamModal && closeTeamModalBtn) {
        btnMeetTeam.addEventListener('click', () => {
            teamModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });

        const closeTeamModal = () => {
            teamModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        };

        closeTeamModalBtn.addEventListener('click', closeTeamModal);

        // Close on background click
        teamModal.addEventListener('click', (e) => {
            if (e.target === teamModal) closeTeamModal();
        });

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && teamModal.classList.contains('active')) {
                closeTeamModal();
            }
        });
    }
});
