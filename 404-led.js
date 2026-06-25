document.addEventListener('DOMContentLoaded', () => {
    const ledCanvas = document.getElementById("ledCanvas");
    if (!ledCanvas) return;
    const gl = ledCanvas.getContext("webgl2", { alpha: false, antialias: false, depth: false });
    let rows, cols;
    const INTERNAL_HEIGHT = 877; 
    const spacing = 15.8; 
    let activeLines = [];
    const MIN_LEN = 5;            
    const MAX_LEN = 15;           
    const LED_RANDOMNESS = 0.25;
    const SPAWN_CHANCE = 0.8;

    let ledProgram, vao, instanceBuffer, texture;
    let maxInstances = 30000;
    let instanceData = new Float32Array(maxInstances * 3);
    let atlasCanvas;

    const vsSource = `#version 300 es
    in vec2 a_position;
    in vec2 a_texCoord;
    in vec3 a_instanceData;
    uniform vec2 u_resolution;
    out vec2 v_texCoord;
    out float v_texIndex;
    void main() {
        vec2 pos = a_position * 100.0 + a_instanceData.xy;
        vec2 zeroToOne = pos / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_texCoord = a_texCoord;
        v_texIndex = a_instanceData.z;
    }`;

    const fsSource = `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    in float v_texIndex;
    uniform sampler2D u_image;
    out vec4 outColor;
    void main() {
        vec2 texCoord = vec2(v_texCoord.x, (v_texCoord.y + v_texIndex) / 11.0);
        outColor = texture(u_image, texCoord);
    }`;

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function preRenderLED() {
        atlasCanvas = document.createElement('canvas');
        atlasCanvas.width = 100;
        atlasCanvas.height = 1100;
        const sCtx = atlasCanvas.getContext('2d');
        for (let i = 0; i <= 10; i++) {
            const displayInt = i / 10;
            const size = 100; 
            const centerX = size / 2; const centerY = size / 2 + i * size;
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
        }
    }

    function initWebGL() {
        if (!gl) return;
        const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
        ledProgram = gl.createProgram();
        gl.attachShader(ledProgram, vs);
        gl.attachShader(ledProgram, fs);
        gl.linkProgram(ledProgram);

        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ]), gl.STATIC_DRAW);
        
        const posLoc = gl.getAttribLocation(ledProgram, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ]), gl.STATIC_DRAW);
        const texLoc = gl.getAttribLocation(ledProgram, "a_texCoord");
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

        instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, maxInstances * 3 * 4, gl.DYNAMIC_DRAW);
        
        const instLoc = gl.getAttribLocation(ledProgram, "a_instanceData");
        gl.enableVertexAttribArray(instLoc);
        gl.vertexAttribPointer(instLoc, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(instLoc, 1);

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    function initLED() {
        const TARGET_WIDTH = 1280;
        if (ledCanvas.width === TARGET_WIDTH) return;
        ledCanvas.width = TARGET_WIDTH;
        ledCanvas.height = INTERNAL_HEIGHT;
        cols = Math.ceil(TARGET_WIDTH / spacing);
        rows = Math.ceil(INTERNAL_HEIGHT / spacing);
        activeLines = activeLines.filter(p => p.r < rows && p.c < cols);
        if (gl) gl.viewport(0, 0, TARGET_WIDTH, INTERNAL_HEIGHT);
    }

    function updateLED(dt = 1) {
        if (Math.random() < (1 - Math.pow(1 - SPAWN_CHANCE, dt))) {
            for(let i = 0; i < 30; i++) {
                activeLines.push({
                    r: Math.floor(Math.random() * rows),
                    c: Math.floor(Math.random() * cols),
                    len: Math.floor(Math.random() * (MAX_LEN - MIN_LEN + 1) + MIN_LEN),
                    age: 0,
                    speed: (0.024 + (Math.random() * 0.01)),
                    noiseFactors: Array.from({length: MAX_LEN * 2 + 1}, () => 1 - (Math.random() * LED_RANDOMNESS))
                });
            }
        }
        for (let i = activeLines.length - 1; i >= 0; i--) {
            const p = activeLines[i];
            p.age += p.speed * dt;
            if (p.age >= 1) {
                activeLines.splice(i, 1);
                continue;
            }
        }
    }

    function drawLED() {
        if (!gl) return;
        gl.clearColor(12/255, 10/255, 5/255, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(ledProgram);
        gl.bindVertexArray(vao);

        const resLoc = gl.getUniformLocation(ledProgram, "u_resolution");
        gl.uniform2f(resLoc, ledCanvas.width, ledCanvas.height);

        let instanceCount = 0;

        activeLines.forEach(p => {
            const masterIntensity = Math.sin(p.age * Math.PI);
            const centerY = (p.r * spacing + spacing/2);
            for (let offset = -p.len; offset <= p.len; offset++) {
                const targetC = p.c + offset;
                if (targetC >= 0 && targetC < cols) {
                    const distFalloff = 1 - (Math.abs(offset) / p.len);
                    const noise = p.noiseFactors[offset + MAX_LEN];
                    const intensity = masterIntensity * distFalloff * noise;
                    if (intensity < 0.1) continue;
                    const cacheIdx = Math.min(10, Math.max(0, Math.floor(intensity * 10)));
                    
                    const centerX = (targetC * spacing + spacing/2);
                    
                    if (instanceCount < maxInstances) {
                        const idx = instanceCount * 3;
                        instanceData[idx] = centerX;
                        instanceData[idx+1] = centerY;
                        instanceData[idx+2] = cacheIdx;
                        instanceCount++;
                    }
                }
            }
        });

        if (instanceCount > 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData.subarray(0, instanceCount * 3));
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, instanceCount);
        }
    }

    preRenderLED();
    initWebGL();
    initLED();
    ledCanvas.classList.add('visible');
    
    let lastLedTime = performance.now();
    function loopBackground(currentTime) {
        const dt = (currentTime - lastLedTime) / (1000 / 60);
        lastLedTime = currentTime;
        updateLED(dt || 1);
        drawLED();
        requestAnimationFrame(loopBackground);
    }
    requestAnimationFrame(loopBackground);
});
