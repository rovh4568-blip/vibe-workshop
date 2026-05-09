"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

type Signup = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  department: string;
  position: string;
  ai_experience: string;
  learning_goal: string;
  dietary_restrictions: string | null;
};

const DEPARTMENTS = ["프로덕트", "마케팅", "세일즈", "컨설팅", "개발", "디자인", "경영지원", "기타"];
const AI_EXPERIENCES = ["처음이에요", "ChatGPT 정도 써봤어요", "Claude도 써봤어요", "Claude Code까지 써봤어요"];
const LEARNING_GOALS = ["업무 자동화", "데이터 분석", "웹서비스 만들기", "AI 도구 전반", "기타"];

const CHART_COLORS = [
  "rgba(249,115,22,0.85)",
  "rgba(251,146,60,0.85)",
  "rgba(253,186,116,0.85)",
  "rgba(163,163,163,0.85)",
  "rgba(115,115,115,0.85)",
  "rgba(82,82,82,0.85)",
  "rgba(64,64,64,0.85)",
  "rgba(38,38,38,0.85)",
];

const CHART_BORDER = CHART_COLORS.map((c) => c.replace("0.85", "1"));

const chartBaseOptions = {
  plugins: {
    legend: {
      labels: { color: "#a3a3a3", font: { size: 12 } },
    },
  },
};

function countBy<T>(arr: T[], key: keyof T, labels: string[]): number[] {
  return labels.map((label) =>
    arr.filter((item) => {
      const val = String(item[key]);
      return labels.includes(val) ? val === label : label === "기타";
    }).length
  );
}

function toSeoulDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      d.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "2-digit",
        day: "2-digit",
      })
    );
  }
  return days;
}

function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mode(arr: string[]): string {
  if (!arr.length) return "-";
  const freq: Record<string, number> = {};
  for (const v of arr) freq[v] = (freq[v] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function todaySeoul(): string {
  return new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function DashboardPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    const { supabase } = await import("../../lib/supabase");
    if (!supabase) {
      setError("Supabase가 연결되지 않았습니다.");
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError("데이터를 불러오지 못했습니다.");
    } else {
      setSignups(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // 요약 카드 계산
  const total = signups.length;
  const todayStr = todaySeoul();
  const todayCount = signups.filter(
    (s) => toSeoulDate(s.created_at) === todayStr
  ).length;
  const topDept = mode(signups.map((s) => s.department));
  const topAi = mode(signups.map((s) => s.ai_experience));

  // 차트 데이터
  const deptCounts = countBy(signups, "department", DEPARTMENTS);
  const aiCounts = countBy(signups, "ai_experience", AI_EXPERIENCES);
  const goalCounts = countBy(signups, "learning_goal", LEARNING_GOALS);

  const last7 = getLast7Days();
  const dailyCounts = last7.map(
    (day) =>
      signups.filter((s) => {
        const d = toSeoulDate(s.created_at).replace(/\./g, ".").trim();
        return d === day;
      }).length
  );

  const summaryCards = [
    { label: "총 신청 인원", value: `${total}명` },
    { label: "오늘 신청 인원", value: `${todayCount}명` },
    { label: "가장 많은 소속 팀", value: topDept },
    { label: "가장 많은 AI 경험", value: topAi },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-semibold">신청 현황</h1>
            <p className="text-sm text-neutral-400 mt-1">AI 바이브 코딩 마스터클래스</p>
          </div>
          <button
            onClick={fetchData}
            className="h-8 px-4 text-xs text-neutral-400 border border-white/10 hover:border-white/20 hover:text-white transition-colors rounded-full"
          >
            새로고침
          </button>
        </div>

        {error && (
          <p className="text-sm text-orange-500 mb-8">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-neutral-500">불러오는 중...</p>
        ) : (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10 mb-16">
              {summaryCards.map((card, i) => (
                <div
                  key={card.label}
                  className={`py-6 ${i < 3 ? "md:border-r border-white/10" : ""} ${i < 2 ? "border-b md:border-b-0 border-white/10" : ""} ${i % 2 === 0 && i < 2 ? "border-r border-white/10 md:border-r-0" : ""} pr-6 ${i > 0 ? "pl-6 md:pl-6" : ""}`}
                >
                  <p className="text-xs text-neutral-400 mb-2">{card.label}</p>
                  <p className="text-xl font-semibold truncate">{card.value}</p>
                </div>
              ))}
            </div>

            {/* 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">

              {/* 소속 팀별 도넛 */}
              <div>
                <p className="text-xs text-neutral-400 mb-6">소속 팀별 신청 분포</p>
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={{
                      labels: DEPARTMENTS,
                      datasets: [{
                        data: deptCounts,
                        backgroundColor: CHART_COLORS,
                        borderColor: CHART_BORDER,
                        borderWidth: 1,
                      }],
                    }}
                    options={{
                      ...chartBaseOptions,
                      plugins: {
                        ...chartBaseOptions.plugins,
                        legend: { ...chartBaseOptions.plugins.legend, position: "bottom" },
                      },
                    }}
                  />
                </div>
              </div>

              {/* AI 경험 수평 바 */}
              <div>
                <p className="text-xs text-neutral-400 mb-6">AI 도구 사용 경험 분포</p>
                <Bar
                  data={{
                    labels: AI_EXPERIENCES,
                    datasets: [{
                      label: "인원",
                      data: aiCounts,
                      backgroundColor: CHART_COLORS.slice(0, 4),
                      borderColor: CHART_BORDER.slice(0, 4),
                      borderWidth: 1,
                      borderRadius: 4,
                    }],
                  }}
                  options={{
                    indexAxis: "y" as const,
                    ...chartBaseOptions,
                    scales: {
                      x: {
                        ticks: { color: "#737373", stepSize: 1 },
                        grid: { color: "rgba(255,255,255,0.05)" },
                        border: { color: "rgba(255,255,255,0.1)" },
                      },
                      y: {
                        ticks: { color: "#a3a3a3", font: { size: 11 } },
                        grid: { display: false },
                        border: { color: "rgba(255,255,255,0.1)" },
                      },
                    },
                    plugins: {
                      ...chartBaseOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                />
              </div>

              {/* 배우고 싶은 것 파이 */}
              <div>
                <p className="text-xs text-neutral-400 mb-6">배우고 싶은 것 분포</p>
                <div className="max-w-xs mx-auto">
                  <Pie
                    data={{
                      labels: LEARNING_GOALS,
                      datasets: [{
                        data: goalCounts,
                        backgroundColor: CHART_COLORS.slice(0, 5),
                        borderColor: CHART_BORDER.slice(0, 5),
                        borderWidth: 1,
                      }],
                    }}
                    options={{
                      ...chartBaseOptions,
                      plugins: {
                        ...chartBaseOptions.plugins,
                        legend: { ...chartBaseOptions.plugins.legend, position: "bottom" },
                      },
                    }}
                  />
                </div>
              </div>

              {/* 일별 신청 추이 라인 */}
              <div>
                <p className="text-xs text-neutral-400 mb-6">일별 신청 추이 (최근 7일)</p>
                <Line
                  data={{
                    labels: last7,
                    datasets: [{
                      label: "신청",
                      data: dailyCounts,
                      borderColor: "rgba(249,115,22,1)",
                      backgroundColor: "rgba(249,115,22,0.1)",
                      borderWidth: 2,
                      pointBackgroundColor: "rgba(249,115,22,1)",
                      pointRadius: 4,
                      tension: 0.3,
                      fill: true,
                    }],
                  }}
                  options={{
                    ...chartBaseOptions,
                    scales: {
                      x: {
                        ticks: { color: "#737373", font: { size: 11 } },
                        grid: { color: "rgba(255,255,255,0.05)" },
                        border: { color: "rgba(255,255,255,0.1)" },
                      },
                      y: {
                        ticks: { color: "#737373", stepSize: 1 },
                        grid: { color: "rgba(255,255,255,0.05)" },
                        border: { color: "rgba(255,255,255,0.1)" },
                        min: 0,
                      },
                    },
                    plugins: {
                      ...chartBaseOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* 신청자 테이블 */}
            <div className="py-16">
              <p className="text-xs text-neutral-400 mb-6">
                신청자 목록 ({total}명)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["이름", "이메일", "소속 팀", "직급", "AI 경험", "배우고 싶은 것", "식이 제한", "신청일시"].map(
                        (h) => (
                          <th
                            key={h}
                            className="pb-3 pr-4 text-left text-xs text-neutral-400 font-normal whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {signups.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-neutral-600 text-xs">
                          신청 데이터가 없습니다
                        </td>
                      </tr>
                    ) : (
                      signups.map((s) => (
                        <tr key={s.id} className="hover:bg-white/2">
                          <td className="py-3 pr-4 whitespace-nowrap">{s.name}</td>
                          <td className="py-3 pr-4 text-neutral-400 whitespace-nowrap">{s.email}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">{s.department}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">{s.position}</td>
                          <td className="py-3 pr-4 whitespace-nowrap text-xs">{s.ai_experience}</td>
                          <td className="py-3 pr-4 whitespace-nowrap text-xs">{s.learning_goal}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {s.dietary_restrictions ? (
                              <span className="px-2 py-0.5 rounded text-xs bg-yellow-400/20 text-yellow-300">
                                {s.dietary_restrictions}
                              </span>
                            ) : (
                              <span className="text-neutral-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 text-neutral-500 text-xs whitespace-nowrap">
                            {formatDateTime(s.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="border-t border-white/10" />
        <footer className="py-8 text-center">
          <p className="text-xs text-neutral-600">Powered by Listeningmind ☕</p>
        </footer>
      </div>
    </main>
  );
}
