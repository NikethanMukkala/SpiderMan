class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
        this.initParticles();
        this.animate = this.animate.bind(this);
        this.animate();
        
        // Handle resizing if the section height changes dynamically
        setInterval(this.resize, 1000);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (this.width !== rect.width || this.height !== rect.height) {
            this.width = this.canvas.width = rect.width;
            this.height = this.canvas.height = rect.height;
            // Add a few particles to account for new area if needed
            if (this.particles.length === 0) {
                this.initParticles();
            }
        }
    }

    initParticles() {
        this.particles = [];
        // Determine particle count based on the area size (so tall sections get more)
        const area = this.width * this.height;
        const numParticles = Math.max(50, Math.floor(area / 15000));
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);
        }
        requestAnimationFrame(this.animate);
    }
}

class Particle {
    constructor(system) {
        this.system = system;
        this.reset();
        // distribute initially over the whole section height
        this.y = Math.random() * this.system.height;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life -= this.decay;
        this.size += this.growth;
        
        if (this.life <= 0 || this.size <= 0 || this.y < 0) {
            this.reset();
        }
    }

    reset() {
        this.x = Math.random() * this.system.width;
        // spawn below the section
        this.y = this.system.height + 10;
        this.life = 1;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1.5 + 0.5; // Upward speed
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.decay = Math.random() * 0.003 + 0.001; 
        this.growth = Math.random() * 0.01;
        this.hue = Math.random() * 40; // 0 to 40 (red to yellow)
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const alpha = Math.max(0, this.life);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
        ctx.shadowBlur = this.size * 2 + 5;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
        ctx.fill();
    }
}

// Initialize particles on all matching canvases
document.querySelectorAll('.particles-bg').forEach(canvas => {
    new ParticleSystem(canvas);
});
