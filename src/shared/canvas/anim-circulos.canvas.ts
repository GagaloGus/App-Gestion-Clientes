import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

@Component({
    selector: 'canvas-anim-circulos',
    standalone: true,
    template: '<canvas #bannerCanvas style="position:absolute; inset:0; width:100%; height: 100%"></canvas>',
    styles: [`:host { display: block; position: absolute; inset: 0; }`]
})
export class CanvasAnimCirculos implements AfterViewInit, OnDestroy {
  @ViewChild('bannerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animId = 0;

  // Rango de hasta donde llega la burbuja (% del ancho, desde la derecha)
  private readonly TRAVEL_LIMIT = { min: 0.45, max: 0.65 };
  private readonly START_OPACITY = { min: 0.4, max: 1 };
  private readonly SPEED = { min: 0.6, max: 2.5 };
  private readonly RADIUS = { min: 4, max: 20 };
  private readonly MAX_CIRCLE_AMOUNT = 30;

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
      const startX  = canvas.width + rand(10, 60);
      // limitX es la posicion X minima que alcanzara la burbuja
      const limitX  = canvas.width * rand(this.TRAVEL_LIMIT.min, this.TRAVEL_LIMIT.max);
      const totalDist = startX - limitX; // distancia total que recorreria si llegara al limite

      circles.push({
        x: startX,
        y: rand(canvas.height * 0.1, canvas.height * 0.9),
        r: rand(this.RADIUS.min, this.RADIUS.max),
        speed: rand(this.SPEED.min, this.SPEED.max),
        opacity: rand(this.START_OPACITY.min, this.START_OPACITY.max),
        startX: randomX ? canvas.width : startX,
        limitX,
        totalDist,
      });
    };

    for (let i = 0; i < this.MAX_CIRCLE_AMOUNT; i++) spawn(true);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        c.x -= c.speed;

        // progress: 0 = acaba de nacer en la derecha, 1 = llego al limite
        const progress = Math.min(1, (c.startX - c.x) / c.totalDist);

        if (progress >= 1) {
          circles.splice(i, 1);
          spawn();
          continue;
        }

        // fade in en el primer 15%, estable hasta 55%, fade out hasta el final
        let alpha: number;
        if (progress < 0.15) {
          alpha = c.opacity * (progress / 0.15);
        } else if (progress < 0.55) {
          alpha = c.opacity;
        } else {
          alpha = c.opacity * (1 - (progress - 0.55) / 0.45);
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