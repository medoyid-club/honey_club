import { BadgesSection } from "./_components/sections/badges-section";
import { ButtonsSection } from "./_components/sections/buttons-section";
import { CardsSection } from "./_components/sections/cards-section";
import { ColorsSection } from "./_components/sections/colors-section";
import { EffectsSection } from "./_components/sections/effects-section";
import { FontsSection } from "./_components/sections/fonts-section";
import { FormsSection } from "./_components/sections/forms-section";
import { NavigationSection } from "./_components/sections/navigation-section";
import { TypographySection } from "./_components/sections/typography-section";
import { SandboxShell } from "./_components/sandbox-shell";

export default function SandboxPage() {
  return (
    <SandboxShell>
      <FontsSection />
      <ColorsSection />
      <TypographySection />
      <ButtonsSection />
      <BadgesSection />
      <CardsSection />
      <FormsSection />
      <EffectsSection />
      <NavigationSection />
    </SandboxShell>
  );
}
