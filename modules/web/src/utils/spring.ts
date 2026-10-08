// A damped spring (spec D24, §8.3): it heads for `target`, keeps its speed when the target moves,
// and picks up from wherever it is, so motion never jumps. Stepped in small fixed slices, so it
// behaves the same at 60 and at 120 frames a second.
const slice = 1 / 240;

// Longer frames (a tab coming back from the background) are cut short rather than replayed.
const maxFrame = 1 / 20;

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  stiffness: number;
  damping: number;

  constructor(value: number, stiffness = 170, damping = 26) {
    this.value = value;
    this.target = value;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  get isSettled(): boolean {
    return Math.abs(this.value - this.target) < 0.0005 && Math.abs(this.velocity) < 0.001;
  }

  // Puts it straight at `value`, at rest.
  snap(value: number): void {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  step(dt: number): void {
    let left = Math.min(dt, maxFrame);

    while (left > 0) {
      const part = Math.min(slice, left);
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;

      this.velocity += force * part;
      this.value += this.velocity * part;
      left -= part;
    }
  }
}
