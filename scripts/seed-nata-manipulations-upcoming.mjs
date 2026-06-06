/**
 * Seed upcoming September 2026 live cohort of "Манипуляции" by Nata Ustimenko.
 *
 * Usage: node scripts/seed-nata-manipulations-upcoming.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

/** September 2026: Tue–Sat blocks, lectures 19:00, seminars 18:00 (Kyiv). */
function buildScheduleSlots() {
  const weekDays = [
    [1, 2, 3, 4, 5],
    [8, 9, 10, 11, 12],
    [15, 16, 17, 18, 19],
    [22, 23, 24, 25, 26],
  ];
  const slots = [];
  for (const days of weekDays) {
    for (let i = 0; i < 5; i++) {
      const day = days[i];
      const isSeminar = i === 4;
      const hour = isSeminar ? 18 : 19;
      slots.push(`2026-09-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00+03:00`);
    }
  }
  return slots;
}

const SCHEDULE = buildScheduleSlots();

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
      {
        type: "lecture",
        duration: 120,
        title_ru: "Профилирование: манипуляторы и их стратегии",
        title_uk: "Профілювання: маніпулятори та їх стратегії",
        title_en: "Profiling: manipulators and their strategies",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Уверенность. Жертвы. Техники обмана",
        title_uk: "Впевненість. Жертви. Техніки обману",
        title_en: "Confidence. Victims. Deception techniques",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Методы. Техники. Кто и для чего",
        title_uk: "Методи. Техніки. Хто і Для чого",
        title_en: "Methods. Techniques. Who and why",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Confidential. Как добывать информацию",
        title_uk: "Confidential. Як здобувати інформацію",
        title_en: "Confidential. How to obtain information",
      },
      {
        type: "seminar",
        duration: 180,
        title_ru: "Вопросы: как правильно использовать Confidential",
        title_uk: "Запитання: як правильно використовувати. Confidential",
        title_en: "Q&A: using Confidential correctly",
      },
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
      {
        type: "lecture",
        duration: 120,
        title_ru: "Тайны человеческой природы и манипуляции",
        title_uk: "Таємниці людської природи та маніпуляції",
        title_en: "Secrets of human nature and manipulation",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Идентичность",
        title_uk: "Ідентичність",
        title_en: "Identity",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Эмоции и когниции в манипуляциях",
        title_uk: "Емоції та Когніції в маніпуляціях",
        title_en: "Emotions and cognition in manipulation",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Техники элиситации. Завершаем Confidential",
        title_uk: "Техніки еліситації. Завершуємо Confidential",
        title_en: "Elicitation techniques. Finishing Confidential",
      },
      {
        type: "seminar",
        duration: 180,
        title_ru: "Семинар: элиситация и разбор кейсов",
        title_uk: "Семінар: еліситація та розбір кейсів",
        title_en: "Seminar: elicitation and case studies",
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
      {
        type: "lecture",
        duration: 120,
        title_ru: "Актерство: как призвание и универсальная способность",
        title_uk: "Акторство: як покликання та як універсальна здібність",
        title_en: "Acting: vocation and universal skill",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Актерство: показывай — не рассказывай!",
        title_uk: "Акторство: показуй - не розказуй!",
        title_en: "Acting: show — don't tell!",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Актерство. Подготовка к роли шаг за шагом",
        title_uk: "Акторство. Підготовка до ролі крок за кроком",
        title_en: "Acting. Preparing for a role step by step",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Профилирование по радикалам: истероиды, эпилептоиды",
        title_uk: "Профілювання по радикалам: істероїди, епілептоїди",
        title_en: "Radical profiling: hysteroid, epileptoid",
      },
      {
        type: "seminar",
        duration: 180,
        title_ru: "Семинар: актерская практика и профилирование",
        title_uk: "Семінар: акторська практика та профілювання",
        title_en: "Seminar: acting practice and profiling",
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
      {
        type: "lecture",
        duration: 120,
        title_ru: "Профилирование по радикалам: параноиды, эмотивы, шизоиды",
        title_uk: "Профілювання по радикалам: параноїди, емотиви, шизоїди",
        title_en: "Radical profiling: paranoid, emotive, schizoid",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Профилирование по радикалам: тревожный, гипертимный",
        title_uk: "Профілювання по радикалам: тривожний, гіпертимний",
        title_en: "Radical profiling: anxious, hyperthymic",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Невербалика лжи: начало. Лицо",
        title_uk: "Невербаліка брехні: початок. Обличчя",
        title_en: "Lie nonverbals: face",
      },
      {
        type: "lecture",
        duration: 120,
        title_ru: "Невербалика лжи: продолжение. Язык тела",
        title_uk: "Невербаліка брехні: продовження. Мова тіла",
        title_en: "Lie nonverbals: body language",
      },
      {
        type: "seminar",
        duration: 180,
        title_ru: "Финальный семинар: профилирование и невербалика",
        title_uk: "Фінальний семінар: профілювання та невербаліка",
        title_en: "Final seminar: profiling and nonverbals",
      },
    ],
  },
];

function lessonContent({ title_ru, type, scheduled_at }) {
  const kind = type === "seminar" ? "семинар" : "лекция";
  const when = new Date(scheduled_at).toLocaleString("ru-UA", {
    timeZone: "Europe/Kyiv",
    dateStyle: "long",
    timeStyle: "short",
  });

  return [
    "## О занятии",
    "",
    `Живое ${kind} курса **«Манипуляции»** (поток сентябрь 2026).`,
    "",
    "### Тема",
    title_ru,
    "",
    "### Дата и время",
    when + " (Europe/Kyiv)",
    "",
    "Запись эфира и материалы будут доступны участникам потока после занятия.",
    "",
  ].join("\n");
}

async function main() {
  loadEnv();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: authorPage, error: authorErr } = await supabase
    .from("author_pages")
    .select("id, profile_id, display_name")
    .eq("slug", "nata-ustimenko")
    .single();

  if (authorErr || !authorPage) {
    throw new Error("Author page nata-ustimenko not found");
  }

  const courseSlug = "manipulyatsii-sentyabr-2026";
  const cohortStartsAt = SCHEDULE[0];

  const coursePayload = {
    slug: courseSlug,
    title_ru: "Манипуляции — поток сентябрь 2026",
    title_uk: "Маніпуляції — потік вересень 2026",
    title_en: "Manipulation — September 2026 cohort",
    summary_ru:
      "Живой месячный поток Наты Устименко в сентябре 2026: 4 недели, 20 онлайн-занятий с расписанием. Лекции по 2 часа и семинары по 3 часа.",
    summary_uk:
      "Живий місячний потік Нати Устименко у вересні 2026: 4 тижні, 20 онлайн-занять з розкладом. Лекції по 2 години та семінари по 3 години.",
    summary_en:
      "Nata Ustimenko's live September 2026 cohort: 4 weeks, 20 scheduled online sessions — 2-hour lectures and 3-hour seminars.",
    description_ru:
      "Запланированный онлайн-поток с фиксированным расписанием. Каждая неделя: четыре вечерних лекции (вт–пт, 19:00) и субботний семинар (18:00) по киевскому времени. Программа совпадает с записанным курсом «Манипуляции», но проходит вживую с разбором вопросов участников.",
    description_uk:
      "Запланований онлайн-потік із фіксованим розкладом. Кожен тиждень: чотири вечірні лекції (вт–пт, 19:00) та суботній семінар (18:00) за київським часом. Програма збігається із записаним курсом «Маніпуляції», але проходить наживо з розбором питань учасників.",
    description_en:
      "A scheduled live online cohort. Each week: four evening lectures (Tue–Fri, 19:00) and a Saturday seminar (18:00) Kyiv time. Same curriculum as the recorded Manipulation course, delivered live with Q&A.",
    author_name: authorPage.display_name || "Ната Устименко",
    author_id: authorPage.profile_id,
    author_page_id: authorPage.id,
    status: "upcoming",
    cohort_starts_at: cohortStartsAt,
    schedule_timezone: "Europe/Kyiv",
    cover_url: null,
    format: "course",
    level: "advanced",
    duration_hours: 44,
    lessons: 20,
    price_usd: 19900,
    price_online_usd: 19900,
    price_offline_usd: 14900,
    tags: ["манипуляции", "психология", "профилирование", "сентябрь-2026"],
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
    await supabase.from("courses").update(coursePayload).eq("id", courseId);
    const { data: oldModules } = await supabase
      .from("course_modules")
      .select("id")
      .eq("course_id", courseId);
    const oldModuleIds = (oldModules ?? []).map((m) => m.id);
    if (oldModuleIds.length) {
      await supabase.from("lessons").delete().in("module_id", oldModuleIds);
      await supabase.from("course_modules").delete().eq("course_id", courseId);
    }
    console.log("Updated course:", courseSlug);
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

  let slotIndex = 0;
  let totalMinutes = 0;

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
        price_online_usd: 5900,
        price_offline_usd: 0,
      })
      .select("id")
      .single();
    if (modErr) throw modErr;

    for (let i = 0; i < week.lessons.length; i++) {
      const spec = week.lessons[i];
      const scheduled_at = SCHEDULE[slotIndex++];
      const content_ru = lessonContent({
        title_ru: spec.title_ru,
        type: spec.type,
        scheduled_at,
      });

      const { error: lessonErr } = await supabase.from("lessons").insert({
        module_id: mod.id,
        position: i + 1,
        type: spec.type,
        title_ru: spec.title_ru,
        title_uk: spec.title_uk,
        title_en: spec.title_en,
        content_ru,
        content_uk: content_ru,
        content_en: content_ru,
        duration_minutes: spec.duration,
        scheduled_at,
        video_url: null,
      });
      if (lessonErr) throw lessonErr;
      totalMinutes += spec.duration;
    }
  }

  console.log(`Done. 20 lessons, ${totalMinutes / 60} hours.`);
  console.log(`Starts: ${cohortStartsAt}`);
  console.log(`Course URL: /ru/courses/${courseSlug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
