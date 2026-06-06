import { ColorSwatch, DemoSection } from "../demo-section";

export function ColorsSection() {
  return (
    <DemoSection
      id="colors"
      title="Цвета"
      description="Фирменная палитра и семантические токены из globals.css. Меняйте CSS-переменные и смотрите результат здесь."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ColorSwatch name="Honey" className="bg-[var(--honey)]" token="--honey" />
        <ColorSwatch
          name="Honey light"
          className="bg-[var(--honey-light)]"
          token="--honey-light"
        />
        <ColorSwatch name="Primary" className="bg-primary" token="--primary" />
        <ColorSwatch name="Background" className="bg-background" token="--background" />
        <ColorSwatch name="Foreground" className="bg-foreground" token="--foreground" />
        <ColorSwatch name="Card" className="bg-card" token="--card" />
        <ColorSwatch name="Muted" className="bg-muted" token="--muted" />
        <ColorSwatch name="Secondary" className="bg-secondary" token="--secondary" />
        <ColorSwatch name="Accent" className="bg-accent" token="--accent" />
        <ColorSwatch
          name="Destructive"
          className="bg-destructive/20"
          token="--destructive"
        />
        <ColorSwatch name="Border" className="bg-border" token="--border" />
        <ColorSwatch name="Ring" className="bg-ring/40" token="--ring" />
      </div>
    </DemoSection>
  );
}
