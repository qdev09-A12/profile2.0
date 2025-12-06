const canvas = document.getElementById("dustCanvas");
const ctx = canvas.getContext("2d");

let w, h, DPR;

function resize(){
    DPR = window.devicePixelRatio || 1;
    w = canvas.clientWidth = canvas.offsetWidth;
    h = canvas.clientHeight = canvas.offsetHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// cấu hình bụi
const settings = {
    count: 220,
    sizeMin: 0.6,
    sizeMax: 3.8,
    speedYMin: -0.02,
    speedYMax: -0.25,
    speedXRange: 0.05,
    alphaMin: 0.04,
    alphaMax: 0.28,
    lifeMin: 6,
    lifeMax: 18,
    beamArea:{
        xStartRatio: 0.35,
        xEndRatio: 1.05,
        yStartRatio: -0.2,
        yEndRatio: 0.6
    }
};

const particles = [];

function rand(min, max){
    return Math.random() * (max - min) + min;
}

function spawn(i){
    const b = settings.beamArea;
    const inBeam = Math.random() < 0.78;
    let x, y;

    if(inBeam){
        x = rand(w * b.xStartRatio, w * b.xEndRatio);
        y = rand(h * b.yStartRatio, h * b.yEndRatio);
    } else {
        x = rand(0, w);
        y = rand(0, h);
    }

    particles[i] = {
        x,
        y,
        size: rand(settings.sizeMin, settings.sizeMax),
        speedX: rand(-settings.speedXRange, settings.speedXRange),
        speedY: rand(settings.speedYMin, settings.speedYMax),
        alpha: rand(settings.alphaMin, settings.alphaMax),
        life: rand(settings.lifeMin, settings.lifeMax),
        age: 0
    };
}

for(let i = 0; i < settings.count; i++) spawn(i);

let last = performance.now();

function step(now){
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for(let i = 0; i < particles.length; i++){
        const p = particles[i];
        p.age += dt;

        p.x += p.speedX * 40 * dt;
        p.y += p.speedY * 40 * dt;

        if(p.age > p.life || p.x < -30 || p.x > w+30 || p.y < -50 || p.y > h+50){
            spawn(i);
            continue;
        }

        // tăng sáng khi gần góc nguồn sáng
        const dx = p.x - w * 0.9;
        const dy = p.y + h * 0.2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const shine = Math.max(0, 1 - dist/(Math.max(w,h)*0.9));

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size*4);
        const a = Math.min(1, p.alpha + shine * 0.8);

        grd.addColorStop(0, `rgba(255,240,200,${a})`);
        grd.addColorStop(0.4, `rgba(255,240,200,${a*0.45})`);
        grd.addColorStop(1, `rgba(255,240,200,0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI*2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(step);
}

requestAnimationFrame(step);
