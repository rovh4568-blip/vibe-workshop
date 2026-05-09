"use client";

import { useState } from "react";
import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from "@heroicons/react/16/solid";

type FormData = {
  name: string;
  email: string;
  team: string;
  level: string;
  aiExperience: string;
  learningGoal: string;
  dietary: string;
};

const INITIAL: FormData = {
  name: "",
  email: "",
  team: "",
  level: "",
  aiExperience: "",
  learningGoal: "",
  dietary: "",
};

const SUBMITTED_KEY = "vw_submitted_emails";

const inputClass =
  "w-full h-10 px-3 text-sm bg-white/5 focus:bg-white/10 outline-none transition-colors placeholder:text-neutral-600";
const labelClass = "block text-xs text-neutral-400 mb-1.5";
const errorClass = "text-xs text-orange-500 mt-1.5";

type SelectFieldProps = {
  label: string;
  field: keyof FormData;
  options: string[];
  form: FormData;
  errors: Partial<FormData>;
  onChange: (
    field: keyof FormData
  ) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

function SelectField({
  label,
  field,
  options,
  form,
  errors,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label className={labelClass}>{label} *</label>
      <div className="relative">
        <select
          value={form[field]}
          onChange={onChange(field)}
          className={`${inputClass} appearance-none pr-8 cursor-pointer`}
        >
          <option value="" disabled className="bg-neutral-900 text-neutral-400">
            선택해주세요
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-neutral-900 text-white">
              {o}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
      </div>
      {errors[field] && <p className={errorClass}>{errors[field]}</p>}
    </div>
  );
}

export default function Page() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dupError, setDupError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function onChange(field: keyof FormData) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      if (field === "email") setDupError(false);
    };
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요";
    if (!form.email.trim()) {
      e.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "올바른 이메일 형식이 아닙니다";
    }
    if (!form.team) e.team = "소속 팀을 선택해주세요";
    if (!form.level) e.level = "직급을 선택해주세요";
    if (!form.aiExperience) e.aiExperience = "AI 도구 사용 경험을 선택해주세요";
    if (!form.learningGoal) e.learningGoal = "배우고 싶은 것을 선택해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const prev: string[] = JSON.parse(
      localStorage.getItem(SUBMITTED_KEY) ?? "[]"
    );
    if (prev.includes(form.email.toLowerCase())) {
      setDupError(true);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const { supabase } = await import("../lib/supabase");
    if (!supabase) {
      setSubmitError("서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("signups").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.team,
      position: form.level,
      ai_experience: form.aiExperience,
      learning_goal: form.learningGoal,
      dietary_restrictions: form.dietary.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        setDupError(true);
      } else {
        setSubmitError("신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      return;
    }

    localStorage.setItem(
      SUBMITTED_KEY,
      JSON.stringify([...prev, form.email.toLowerCase()])
    );
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center py-24">
          <p className="text-2xl font-semibold">신청이 완료되었습니다! 🎉</p>
          <p className="text-base text-neutral-400 mt-3 leading-relaxed">
            당일 노트북 꼭 챙겨오세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-0">

        {/* 헤드라인 */}
        <section className="py-16">
          <h1 className="text-2xl md:text-4xl font-semibold">
            AI 바이브 코딩 마스터클래스
          </h1>
          <p className="text-lg text-neutral-400 mt-3">
            코딩 없이 AI로 업무 도구를 만드는 법
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            강사: AI커피챗 (외부 초청 강사)
          </p>
        </section>

        <div className="border-t border-white/10" />

        {/* 강의 소개 */}
        <section className="py-16">
          <p className="text-base text-neutral-300 leading-relaxed max-w-lg">
            AI에게 말로 지시하면 앱이 만들어집니다.
            <br />
            코딩 경험이 전혀 없어도 괜찮아요.
            <br />
            4시간이면 여러분만의 업무 도구를 직접 만들 수 있습니다.
          </p>
        </section>

        <div className="border-t border-white/10" />

        {/* 행사 정보 */}
        <section className="py-16">
          <div className="border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="flex items-start gap-3 py-6 border-b border-white/10 md:border-r md:border-white/10 md:pr-6">
                <CalendarDaysIcon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400 mb-1">일시</p>
                  <p className="text-sm">2026년 4월 2일 (목) 오후 1시~5시</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-6 border-b border-white/10 md:pl-6">
                <MapPinIcon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400 mb-1">장소</p>
                  <p className="text-sm">본사 대회의실</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-6 border-b border-white/10 md:border-r md:border-white/10 md:pr-6">
                <UsersIcon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400 mb-1">대상</p>
                  <p className="text-sm">전 직원 (개발/비개발 무관)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-6 border-b border-white/10 md:pl-6">
                <ComputerDesktopIcon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400 mb-1">준비물</p>
                  <p className="text-sm">개인 노트북</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-white/10" />

        {/* 신청 폼 */}
        <section className="py-16">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder="홍길동"
                  className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>이메일 *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="hong@company.com"
                  className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
                {dupError && (
                  <p className={errorClass}>이미 신청하신 이메일입니다</p>
                )}
              </div>

              <SelectField
                label="소속 팀/부서"
                field="team"
                options={[
                  "프로덕트",
                  "마케팅",
                  "세일즈",
                  "컨설팅",
                  "개발",
                  "디자인",
                  "경영지원",
                  "기타",
                ]}
                form={form}
                errors={errors}
                onChange={onChange}
              />

              <SelectField
                label="직급"
                field="level"
                options={["사원", "대리", "과장", "차장", "부장", "임원"]}
                form={form}
                errors={errors}
                onChange={onChange}
              />

              <SelectField
                label="AI 도구 사용 경험"
                field="aiExperience"
                options={[
                  "처음이에요",
                  "ChatGPT 정도 써봤어요",
                  "Claude도 써봤어요",
                  "Claude Code까지 써봤어요",
                ]}
                form={form}
                errors={errors}
                onChange={onChange}
              />

              <SelectField
                label="강의에서 가장 배우고 싶은 것"
                field="learningGoal"
                options={[
                  "업무 자동화",
                  "데이터 분석",
                  "웹서비스 만들기",
                  "AI 도구 전반",
                  "기타",
                ]}
                form={form}
                errors={errors}
                onChange={onChange}
              />

              <div>
                <label className={labelClass}>식이 제한이나 알레르기</label>
                <input
                  type="text"
                  value={form.dietary}
                  onChange={onChange("dietary")}
                  placeholder="간식 준비 참고용"
                  className={inputClass}
                />
              </div>
            </div>

            {submitError && (
              <p className="mt-4 text-xs text-orange-500">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full h-10 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
            >
              {submitting ? "제출 중..." : "신청하기"}
            </button>
          </form>
        </section>

        <div className="border-t border-white/10" />

        <footer className="py-8 text-center">
          <p className="text-xs text-neutral-600">Powered by Listeningmind ☕</p>
        </footer>
      </div>
    </main>
  );
}
