/**
 * Seed the "Манипуляции" month course by Nata Ustimenko from YouTube transcripts.
 *
 * Usage: node scripts/seed-nata-manipulations.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TRANSCRIPT_PATH = path.join(ROOT, "temp", "transcripts_combined.txt");

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function parseTranscripts(text) {
  const parts = text.split(/(?=^=== \d+\.)/m).filter((p) => p.trim());
  const videos = [];

  for (const part of parts) {
    const header = part.match(/^===\s*(\d+)\.\s*(.+?)\s*===/m);
    if (!header) continue;

    const url = part.match(/^URL:\s*(.+)$/m)?.[1]?.trim() ?? null;
    const unavailable = part.includes("[Транскрипт недоступний");
    const body = part
      .replace(/^===.+===\r?\n/m, "")
      .replace(/^URL:.*\r?\n/m, "")
      .replace(/^Мова субтитрів:.*\r?\n/m, "")
      .replace(/^={10,}.*$/m, "")
      .trim();

    const youtubeId = url?.match(/v=([^&]+)/)?.[1] ?? null;

    videos.push({
      num: Number(header[1]),
      rawTitle: header[2].trim(),
      url,
      youtubeId,
      unavailable,
      body,
    });
  }

  return videos;
}

function cleanTitle(raw) {
  return raw
    .replace(/^Маніпуляції\.\s*/i, "")
    .replace(/^Ч\.?\s*\d+\.\s*/i, "")
    .replace(/^Частина\s*\d+\s*-\s*/i, "")
    .replace(/\s*\|\s*Ната Устименко.*$/i, "")
    .replace(/\s*,\s*Таня Гукало.*$/i, "")
    .trim();
}

const TITLE_RU = {
  "Профілювання: маніпулятори та їх стратегії": "Профилирование: манипуляторы и их стратегии",
  "Впевненість. Жертви. Техніки обману": "Уверенность. Жертвы. Техники обмана",
  "Методи. Техніки. Хто і Для чого": "Методы. Техники. Кто и для чего",
  "Confidential. Як здобувати інформацію": "Confidential. Как добывать информацию",
  "Запитання: як правильно використовувати. Confidential": "Вопросы: как правильно использовать Confidential",
  "Таємниці людської природи та маніпуляції": "Тайны человеческой природы и манипуляции",
  Ідентичність: "Идентичность",
  "Емоції та Когніції в маніпуляціях": "Эмоции и когниции в манипуляциях",
  "Техніки еліситації. Завершуємо Confidential": "Техники элиситации. Завершаем Confidential",
  "Акторство: як покликання та як універсальна здібність": "Актерство: как призвание и универсальная способность",
  "Акторство: показуй - не розказуй!": "Актерство: показывай — не рассказывай!",
  "Акторство. Підготовка до ролі крок за кроком": "Актерство. Подготовка к роли шаг за шагом",
  "Профілювання по радикалам: істероїди, епілептоїди": "Профилирование по радикалам: истероиды, эпилептоиды",
  "Профілювання по радикалам: параноїди, емотиви, шизоїди": "Профилирование по радикалам: параноиды, эмотивы, шизоиды",
  "Профілювання по радикалам: тривожний, гіпертимний": "Профилирование по радикалам: тревожный, гипертимный",
  "Невербаліка брехні: початок. Обличчя": "Невербалика лжи: начало. Лицо",
  "Невербаліка брехні: продовження. Мова тіла": "Невербалика лжи: продолжение. Язык тела",
};

const TITLE_EN = {
  "Профілювання: маніпулятори та їх стратегії": "Profiling: manipulators and their strategies",
  "Впевненість. Жертви. Техніки обману": "Confidence. Victims. Deception techniques",
  "Методи. Техніки. Хто і Для чого": "Methods. Techniques. Who and why",
  "Confidential. Як здобувати інформацію": "Confidential. How to obtain information",
  "Запитання: як правильно використовувати. Confidential": "Q&A: using Confidential correctly",
  "Таємниці людської природи та маніпуляції": "Secrets of human nature and manipulation",
  Ідентичність: "Identity",
  "Емоції та Когніції в маніпуляціях": "Emotions and cognition in manipulation",
  "Техніки еліситації. Завершуємо Confidential": "Elicitation techniques. Finishing Confidential",
  "Акторство: як покликання та як універсальна здібність": "Acting: vocation and universal skill",
  "Акторство: показуй - не розказуй!": "Acting: show — don't tell!",
  "Акторство. Підготовка до ролі крок за кроком": "Acting. Preparing for a role step by step",
  "Профілювання по радикалам: істероїди, епілептоїди": "Radical profiling: hysteroid, epileptoid",
  "Профілювання по радикалам: параноїди, емотиви, шизоїди": "Radical profiling: paranoid, emotive, schizoid",
  "Профілювання по радикалам: тривожний, гіпертимний": "Radical profiling: anxious, hyperthymic",
  "Невербаліка брехні: початок. Обличчя": "Lie nonverbals: face",
  "Невербаліка брехні: продовження. Мова тіла": "Lie nonverbals: body language",
};

function toRuTitle(ukTitle) {
  return TITLE_RU[ukTitle] ?? ukTitle;
}

function toEnTitle(ukTitle) {
  return TITLE_EN[ukTitle] ?? ukTitle;
}

function summarizeTranscript(body, maxLen = 2200) {
  if (!body) return "";
  const cleaned = body
    .replace(/\s+/g, " ")
    .replace(/[?]{2,}/g, "?")
    .trim();

  if (cleaned.length <= maxLen) return cleaned;

  const slice = cleaned.slice(0, maxLen);
  const lastStop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  return (lastStop > 400 ? slice.slice(0, lastStop + 1) : slice) + "…";
}

function lessonContent({ titleUk, url, body, type }) {
  const summary = summarizeTranscript(body);
  const kind =
    type === "seminar"
      ? "семинар"
      : type === "lecture"
        ? "лекция"
        : "практическое занятие";

  const lines = [
    `## О занятии`,
    "",
    `Это ${kind} курса **«Манипуляции»** Наты Устименко.`,
    "",
    `### Тема`,
    titleUk,
    "",
  ];

  if (summary) {
    lines.push("### Краткое содержание", "", summary, "");
  }

  if (url) {
    lines.push("### Видеозапись", "", `[Смотреть на YouTube](${url})`, "");
  }

  if (type === "seminar") {
    lines.push(
      "### Формат семинара",
      "",
      "- разбор вопросов участников",
      "- практические упражнения на материале недели",
      "- закрепление техник в парах и мини-группах",
      ""
    );
  }

  return lines.join("\n");
}

const WEEKS = [
  {
    position: 1,
    title_ru: "Неделя 1. Основы манипуляций и профилирование",
    title_uk: "Тиждень 1. Основи маніпуляцій і профілювання",
    title_en: "Week 1. Foundations of manipulation and profiling",
    summary_ru:
      "Тёмная триада, макиавеллизм, типы манипуляторов и первые техники обмана. Введение в методологию Confidential.",
    summary_uk:
      "Темна тріада, макіавелізм, типи маніпуляторів і перші техніки обману. Вступ до методології Confidential.",
    summary_en:
      "Dark triad, Machiavellianism, manipulator types, and first deception techniques. Introduction to the Confidential methodology.",
    lessons: [
      { videoNum: 2, type: "lecture", duration: 120 },
      { videoNum: 3, type: "lecture", duration: 120 },
      { videoNum: 4, type: "lecture", duration: 120 },
      { videoNum: 5, type: "lecture", duration: 120 },
      { videoNum: 6, type: "seminar", duration: 180 },
    ],
  },
  {
    position: 2,
    title_ru: "Неделя 2. Confidential и человеческая природа",
    title_uk: "Тиждень 2. Confidential і людська природа",
    title_en: "Week 2. Confidential and human nature",
    summary_ru:
      "Тайны человеческой природы, идентичность, эмоции и когниции. Техники элиситации и завершение блока Confidential.",
    summary_uk:
      "Таємниці людської природи, ідентичність, емоції та когніції. Техніки еліситації та завершення блоку Confidential.",
    summary_en:
      "Secrets of human nature, identity, emotions and cognition. Elicitation techniques and closing the Confidential block.",
    lessons: [
      { videoNum: 7, type: "lecture", duration: 120 },
      { videoNum: 8, type: "lecture", duration: 120 },
      { videoNum: 9, type: "lecture", duration: 120 },
      { videoNum: 10, type: "lecture", duration: 120 },
      {
        type: "seminar",
        duration: 180,
        title_uk: "Семінар: еліситація та розбір кейсів",
        title_ru: "Семинар: элиситация и разбор кейсов",
        title_en: "Seminar: elicitation and case studies",
        content_ru: lessonContent({
          titleUk: "Семінар: еліситація та розбір кейсів",
          url: null,
          body: "Практический семинар по закреплению техник элиситации из книги Confidential. Участники разбирают реальные и учебные кейсы, отрабатывают формулировки вопросов и учатся распознавать манипулятивные ответы.",
          type: "seminar",
        }),
      },
    ],
  },
  {
    position: 3,
    title_ru: "Неделя 3. Актерство и радикалы",
    title_uk: "Тиждень 3. Акторство і радикали",
    title_en: "Week 3. Acting and personality radicals",
    summary_ru:
      "Актерские техники для манипуляций и профилирование по системе Пономаренко: истероидные и эпилептоидные типы.",
    summary_uk:
      "Акторські техніки для маніпуляцій і профілювання за системою Пономаренка: істероїдні та епілептоїдні типи.",
    summary_en:
      "Acting techniques for manipulation and Ponomarenko radical profiling: hysteroid and epileptoid types.",
    lessons: [
      { videoNum: 11, type: "lecture", duration: 120 },
      { videoNum: 12, type: "lecture", duration: 120 },
      { videoNum: 13, type: "lecture", duration: 120 },
      { videoNum: 14, type: "lecture", duration: 120 },
      {
        type: "seminar",
        duration: 180,
        title_uk: "Семінар: акторська практика та профілювання",
        title_ru: "Семинар: актерская практика и профилирование",
        title_en: "Seminar: acting practice and profiling",
        content_ru: lessonContent({
          titleUk: "Семінар: акторська практика та профілювання",
          url: null,
          body: "Практический семинар: участники отрабатывают принцип «показывай — не рассказывай», готовят мини-роли и применяют профилирование по радикалам к учебным сценариям общения.",
          type: "seminar",
        }),
      },
    ],
  },
  {
    position: 4,
    title_ru: "Неделя 4. Радикалы и невербалика лжи",
    title_uk: "Тиждень 4. Радикали та невербаліка брехні",
    title_en: "Week 4. Radicals and lie nonverbals",
    summary_ru:
      "Параноидные, эмотивные, шизоидные, тревожные и гипертимные типы. Невербальные признаки лжи: лицо и язык тела.",
    summary_uk:
      "Параноїдні, емотивні, шизоїдні, тривожні та гіпертимні типи. Невербальні ознаки брехні: обличчя та мова тіла.",
    summary_en:
      "Paranoid, emotive, schizoid, anxious, and hyperthymic types. Nonverbal signs of lying: face and body language.",
    lessons: [
      { videoNum: 15, type: "lecture", duration: 120 },
      { videoNum: 16, type: "lecture", duration: 120 },
      { videoNum: 17, type: "lecture", duration: 120 },
      { videoNum: 18, type: "lecture", duration: 120 },
      {
        type: "seminar",
        duration: 180,
        title_uk: "Фінальний семінар: профілювання та невербаліка",
        title_ru: "Финальный семинар: профилирование и невербалика",
        title_en: "Final seminar: profiling and nonverbals",
        content_ru: lessonContent({
          titleUk: "Фінальний семінар: профілювання та невербаліка",
          url: null,
          body: "Итоговый практический семинар курса. Участники синтезируют знания о радикалах, невербалике и манипулятивных техниках, разбирают комплексные кейсы и формируют личный чек-лист защиты.",
          type: "seminar",
        }),
      },
    ],
  },
];

async function main() {
  loadEnv();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const transcriptText = fs.readFileSync(TRANSCRIPT_PATH, "utf8");
  const videos = parseTranscripts(transcriptText);
  const byNum = new Map(videos.map((v) => [v.num, v]));

  const { data: authorPage, error: authorErr } = await supabase
    .from("author_pages")
    .select("id, profile_id, display_name")
    .eq("slug", "nata-ustimenko")
    .single();

  if (authorErr || !authorPage) {
    throw new Error("Author page nata-ustimenko not found");
  }

  const courseSlug = "manipulyatsii-nata-ustimenko";

  const coursePayload = {
    slug: courseSlug,
    title_ru: "Манипуляции",
    title_uk: "Маніпуляції",
    title_en: "Manipulation",
    summary_ru:
      "Месячный курс Наты Устименко: 4 недели, 20 занятий. Разбираем манипуляции, профилирование, актёрские техники, радикалы личности и невербалику лжи.",
    summary_uk:
      "Місячний курс Нати Устименко: 4 тижні, 20 занять. Розбираємо маніпуляції, профілювання, акторські техніки, радикали особистості та невербаліку брехні.",
    summary_en:
      "Nata Ustimenko's month-long course: 4 weeks, 20 sessions on manipulation, profiling, acting techniques, personality radicals, and lie nonverbals.",
    description_ru:
      "Структурированный образовательный курс на основе лекций и семинаров Наты Устименко. Каждая неделя включает 4 лекции по 2 часа и один семинар на 3 часа. Материал охватывает тёмную триаду, макиавеллизм, методологию Confidential, эмоции и когниции, актёрские техники, профилирование по радикалам Пономаренко и невербальные признаки обмана.",
    description_uk:
      "Структурований освітній курс на основі лекцій і семінарів Нати Устименко. Кожен тиждень включає 4 лекції по 2 години та один семінар на 3 години. Матеріал охоплює темну тріаду, макіавелізм, методологію Confidential, емоції та когніції, акторські техніки, профілювання за радикалами Пономаренка та невербальні ознаки обману.",
    description_en:
      "A structured course based on Nata Ustimenko's lectures and seminars. Each week includes 4 two-hour lectures and one three-hour seminar covering the dark triad, Machiavellianism, Confidential methodology, emotions and cognition, acting techniques, Ponomarenko radical profiling, and nonverbal deception cues.",
    author_name: authorPage.display_name || "Ната Устименко",
    author_id: authorPage.profile_id,
    author_page_id: authorPage.id,
    status: "completed",
    cover_url: null,
    format: "course",
    level: "advanced",
    duration_hours: 44,
    lessons: 20,
    price_usd: 14900,
    price_online_usd: 19900,
    price_offline_usd: 14900,
    tags: ["манипуляции", "психология", "профилирование", "невербалика"],
    published: true,
  };

  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  let courseId;

  if (existing?.id) {
    courseId = existing.id;
    const { error } = await supabase
      .from("courses")
      .update(coursePayload)
      .eq("id", courseId);
    if (error) throw error;
    console.log("Updated course:", courseSlug);

    const { data: oldModules } = await supabase
      .from("course_modules")
      .select("id")
      .eq("course_id", courseId);
    const oldModuleIds = (oldModules ?? []).map((m) => m.id);
    if (oldModuleIds.length) {
      await supabase.from("lessons").delete().in("module_id", oldModuleIds);
      await supabase.from("course_modules").delete().eq("course_id", courseId);
    }
  } else {
    const { data: created, error } = await supabase
      .from("courses")
      .insert(coursePayload)
      .select("id")
      .single();
    if (error) throw error;
    courseId = created.id;
    console.log("Created course:", courseSlug);
  }

  let totalMinutes = 0;
  let lessonCount = 0;

  for (const week of WEEKS) {
    const { data: mod, error: modErr } = await supabase
      .from("course_modules")
      .insert({
        course_id: courseId,
        position: week.position,
        title_ru: week.title_ru,
        title_uk: week.title_uk,
        title_en: week.title_en,
        summary_ru: week.summary_ru,
        summary_uk: week.summary_uk,
        summary_en: week.summary_en,
        price_online_usd: 4900,
        price_offline_usd: 3900,
      })
      .select("id")
      .single();

    if (modErr) throw modErr;

    for (let i = 0; i < week.lessons.length; i++) {
      const spec = week.lessons[i];
      let title_uk, title_ru, title_en, content_ru, content_uk, content_en, video_url;

      if (spec.videoNum) {
        const video = byNum.get(spec.videoNum);
        if (!video || video.unavailable) {
          throw new Error(`Video #${spec.videoNum} missing or unavailable`);
        }
        const uk = cleanTitle(video.rawTitle);
        title_uk = uk;
        title_ru = toRuTitle(uk);
        title_en = toEnTitle(uk);
        video_url = video.url;
        content_ru = lessonContent({
          titleUk: uk,
          url: video.url,
          body: video.body,
          type: spec.type,
        });
        content_uk = content_ru;
        content_en = content_ru;
      } else {
        title_uk = spec.title_uk;
        title_ru = spec.title_ru;
        title_en = spec.title_en;
        video_url = null;
        content_ru = spec.content_ru;
        content_uk = content_ru;
        content_en = content_ru;
      }

      const { error: lessonErr } = await supabase.from("lessons").insert({
        module_id: mod.id,
        position: i + 1,
        type: spec.type,
        title_ru,
        title_uk,
        title_en,
        content_ru,
        content_uk,
        content_en,
        duration_minutes: spec.duration,
        video_url,
      });

      if (lessonErr) throw lessonErr;
      totalMinutes += spec.duration;
      lessonCount++;
    }
  }

  await supabase
    .from("courses")
    .update({
      lessons: lessonCount,
      duration_hours: Math.round((totalMinutes / 60) * 10) / 10,
    })
    .eq("id", courseId);

  console.log(`Done. ${lessonCount} lessons, ${totalMinutes / 60} hours.`);
  console.log(`Course URL: /ru/courses/${courseSlug}`);
  console.log(`Author URL: /ru/authors/nata-ustimenko/courses`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
