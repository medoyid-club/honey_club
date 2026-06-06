import { FontPicker, FontSpecimen } from "../font-picker";
import { DemoSection } from "../demo-section";

export function FontsSection() {
  return (
    <DemoSection
      id="fonts"
      title="Шрифты"
      description="IBM Plex Sans, Iosevka Charon, Libre Franklin и пары sans + heading. Переключатель влияет на всю песочницу ниже."
    >
      <div className="space-y-8">
        <FontPicker />

        <div className="grid gap-4 lg:grid-cols-2">
          <FontSpecimen
            title="IBM Plex Sans"
            sansVar="var(--font-ibm-plex-sans)"
            headingVar="var(--font-ibm-plex-sans)"
            note="sans + heading"
          />
          <FontSpecimen
            title="Libre Franklin"
            sansVar="var(--font-libre-franklin)"
            headingVar="var(--font-libre-franklin)"
            note="latin only"
          />
          <FontSpecimen
            title="Iosevka Charon"
            sansVar="var(--font-iosevka-charon)"
            headingVar="var(--font-iosevka-charon)"
            note="плотный UI"
          />
          <FontSpecimen
            title="Geist (сейчас на сайте)"
            sansVar="var(--font-geist)"
            headingVar="var(--font-geist)"
            note="baseline"
          />
          <FontSpecimen
            title="Franklin заголовки + IBM текст"
            sansVar="var(--font-ibm-plex-sans)"
            headingVar="var(--font-libre-franklin)"
            note="смешанная пара"
          />
          <FontSpecimen
            title="Charon заголовки + IBM текст"
            sansVar="var(--font-ibm-plex-sans)"
            headingVar="var(--font-iosevka-charon)"
            note="смешанная пара"
          />
        </div>
      </div>
    </DemoSection>
  );
}
