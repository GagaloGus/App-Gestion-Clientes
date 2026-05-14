import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

@Component({
    selector: 'canvas-anim-circulos',
    standalone:true,
    template:'<canvas #bannerCanvas style="position:absolute; inset:0; width:100%; height: 100%"></canvas>'
})
export class CanvasAnimCirculos implements AfterViewInit, OnDestroy {
  @ViewChild('bannerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animId = 0;

  private readonly LIFESPAN = {min: 1, max:5};
  private readonly WIDTH_LIMIT = {min: 0.45, max:0.7};
  private readonly START_OPACITY = {min: 0.5, max:1};
  private readonly SPEED = {min: 0.5, max:1.8};
  private readonly MAX_CIRCLE_AMOUNT = 18

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const circles: any[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const spawn = (randomX = false) => {
      const lifespan = rand(this.LIFESPAN.min, this.LIFESPAN.max) * 1000;
      circles.push({
        x: randomX ? rand(canvas.width * 0.5, canvas.width) : canvas.width + rand(10, 60),
        y: rand(canvas.height * 0.1, canvas.height * 0.9),
        r: rand(4, 20),
        speed: rand(this.SPEED.min, this.SPEED.max),
        opacity: rand(this.START_OPACITY.min, this.START_OPACITY.max),
        lifespan,
        age: randomX ? rand(0, lifespan * 0.4) : 0,
        limitX: canvas.width * rand(this.WIDTH_LIMIT.min, this.WIDTH_LIMIT.max),
      });
    };

    for (let i = 0; i < this.MAX_CIRCLE_AMOUNT; i++) spawn(true);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        c.x -= c.speed;
        c.age += 16;

        const lifeProgress = c.age / c.lifespan;

        if (lifeProgress >= 1 || c.x <= c.limitX) {
          circles.splice(i, 1);
          spawn();
          continue;
        }

        let alpha: number;
        if (lifeProgress < 0.15) {
          alpha = c.opacity * (lifeProgress / 0.15);
        } else if (lifeProgress < 0.6) {
          alpha = c.opacity;
        } else {
          alpha = c.opacity * (1 - (lifeProgress - 0.6) / 0.4);
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha).toFixed(3)})`;
        ctx.fill();
      }

      this.animId = requestAnimationFrame(loop);
    };

    loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
  }
}