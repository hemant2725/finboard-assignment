"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, ArrowRight, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";
import { formatCurrency } from "@/lib/currency";

gsap.registerPlugin(ScrollTrigger);

export function ActivitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  //animate each one bars
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  //pulling data from context
  const { summary, weeklySpendingData, isLoading, error } = useDashboard();

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  const maxAmount = Math.max(...weeklySpendingData.map((day) => day.amount), 0);
  const chartMaxAmount = maxAmount || 1;
  const totalWeekly = weeklySpendingData.reduce((sum, day) => sum + day.amount, 0);
  const avgDaily = Math.round(totalWeekly / Math.max(weeklySpendingData.length, 1));
  //highest spend day calculation
  const highestDay =
    weeklySpendingData.reduce(
      (currentHighest, day) => (day.amount > currentHighest.amount ? day : currentHighest),
      weeklySpendingData[0] ?? {
        day: "Mon",
        amount: 0,
        date: "",
        fullDate: "No activity yet",
        transactionCount: 0,
      }
    );
    //budget calculations
  const budgetPercentage =
    summary.monthlyBudget > 0
      ? Math.min((summary.monthlySpent / summary.monthlyBudget) * 100, 100)
      : 0;
  const remaining = summary.monthlyBudget - summary.monthlySpent;

  useEffect(() => {
    //animate section content
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
          onComplete: () => setBarsAnimated(true),
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!barsAnimated) return;

    //animate bars height
    barsRef.current.forEach((bar, index) => {
      if (!bar) return;

      const amount = weeklySpendingData[index]?.amount ?? 0;
      const heightPct = amount > 0 ? Math.max((amount / chartMaxAmount) * 92, 8) : 0;

      gsap.fromTo(
        bar,
        { height: "0%" },
        {
          height: `${heightPct}%`,
          duration: 0.6,
          delay: index * 0.06,
          ease: "back.out(1.4)",
        }
      );
    });
  }, [barsAnimated, chartMaxAmount, weeklySpendingData]);

  useEffect(() => {
    if (!barsAnimated || !svgRef.current || !chartRef.current) return;

    //slight delay so that bars renders and animate
    const timer = window.setTimeout(() => {
      const svg = svgRef.current!;
      const width = chartRef.current!.clientWidth;
      const height = 140;
      const columnWidth = width / Math.max(weeklySpendingData.length, 1);

      //clear previous svg content
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const points = weeklySpendingData.map((day, index) => ({
        x: columnWidth * index + columnWidth / 2,
        y:
          height -
          Math.max((day.amount / chartMaxAmount) * height * 0.92, day.amount > 0 ? height * 0.08 : 0) -
          2,
      }));

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a3e635" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#a3e635" stop-opacity="0"/>
        </linearGradient>
      `;
      svg.appendChild(defs);

      //for building curve
      const buildPath = (inputPoints: { x: number; y: number }[]) =>
        inputPoints
          .map((point, index) => {
            if (index === 0) return `M ${point.x},${point.y}`;
            const previousPoint = inputPoints[index - 1];
            const controlX = (previousPoint.x + point.x) / 2;
            return `C ${controlX},${previousPoint.y} ${controlX},${point.y} ${point.x},${point.y}`;
          })
          .join(" ");

      const linePath = buildPath(points);
      //fill under the curve
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const areaPath = `${linePath} L ${lastPoint.x},${height} L ${firstPoint.x},${height} Z`;

      const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
      area.setAttribute("d", areaPath);
      area.setAttribute("fill", "url(#areaGrad)");
      svg.appendChild(area);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute("d", linePath);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", "#a3e635");
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("stroke-opacity", "0.65");
      const pathLength = line.getTotalLength();

      //animate line drawing effect
      line.setAttribute("stroke-dasharray", `${pathLength}`);
      line.setAttribute("stroke-dashoffset", `${pathLength}`);
      svg.appendChild(line);

      points.forEach(({ x, y }) => {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", `${x}`);
        dot.setAttribute("cy", `${y}`);
        dot.setAttribute("r", "3");
        dot.setAttribute("fill", "#a3e635");
        dot.setAttribute("fill-opacity", "0.85");
        svg.appendChild(dot);
      });

      requestAnimationFrame(() => {
        line.style.transition = "stroke-dashoffset 1.2s ease";
        line.setAttribute("stroke-dashoffset", "0");
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [barsAnimated, chartMaxAmount, weeklySpendingData]);

  //color changes based on budget usage 
  const budgetFillColor =
    budgetPercentage > 80 ? "#ef4444" : budgetPercentage > 50 ? "#fb923c" : "#a3e635";

  const weeklyTransactionCount = weeklySpendingData.reduce(
    (sum, day) => sum + day.transactionCount,
    0
  );

  return (
    <section ref={sectionRef} className="w-full py-16 bg-dark-bg">
      <div
        ref={contentRef}
        className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center"
        style={{ opacity: 0 }}
      >
        <div>
          <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime/10 flex items-center justify-center rounded-xl">
                  <Activity className="text-lime w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Activity</h3>
                  <p className="text-xs text-white/50 mt-0.5">Weekly spending</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                  {error ? "Sync issue" : isLoading ? "Syncing" : "This week"}
                </p>
                <p className="text-2xl font-semibold text-lime leading-none">
                  {formatCurrency(totalWeekly)}
                </p>
              </div>
            </div>

            <div ref={chartRef} className="relative h-[140px] flex items-end gap-[6px] mb-3">
              <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              />

              {weeklySpendingData.map((day, index) => {
                const isHighest = day.amount === maxAmount && day.amount > 0;
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={day.date}
                    className="relative flex flex-col items-center flex-1 h-full justify-end group"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className="absolute z-10 pointer-events-none transition-all duration-150"
                      style={{
                        bottom: "calc(100% + 28px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        opacity: isHovered ? 1 : 0,
                      }}
                    >
                      <div className="bg-black/90 border border-lime/30 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                        {formatCurrency(day.amount)}
                      </div>
                    </div>

                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full rounded-t-lg"
                        style={{ height: "100%", background: "rgba(255,255,255,0.07)" }}
                      />
                      <div
                        ref={(element) => {
                          barsRef.current[index] = element;
                        }}
                        className="absolute bottom-0 left-0 w-full rounded-t-lg transition-[background,box-shadow] duration-200"
                        style={{
                          height: "0%",
                          background: isHighest
                            ? "#a3e635"
                            : isHovered
                              ? "linear-gradient(to top, #a3e635, rgba(163,230,53,0.45))"
                              : "rgba(255,255,255,0.18)",
                          boxShadow:
                            isHighest || isHovered ? "0 0 14px rgba(163,230,53,0.4)" : "none",
                        }}
                      />
                    </div>

                    <span className="absolute -bottom-5 text-[10px] text-white/50">
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mb-4 h-5" />

            <p className="text-[11px] text-white/50 mb-4">
              {error ? (
                <>Unable to sync the latest activity. Showing the last known state.</>
              ) : (
                <>
                  Highest spending on{' '}
                  <span className="text-lime font-medium">{highestDay.day}</span>
                  {' | '}
                  {formatCurrency(highestDay.amount)}
                </>
              )}
            </p>

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/60">Monthly Budget</span>
                <span className="text-white font-medium">{formatCurrency(summary.monthlyBudget)}</span>
              </div>

              <div className="h-[6px] bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out"
                  style={{
                    width: `${Math.max(budgetPercentage, 1)}%`,
                    background: budgetFillColor,
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-white/40">
                <span>{Math.round(budgetPercentage)}% used</span>
                <span>{formatCurrency(remaining)} remaining</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                <TrendingUp className="text-lime w-4 h-4 mb-1" />
                <p className="text-[10px] text-white/50 mb-1">Highest</p>
                <p className="text-xs text-white font-medium">{formatCurrency(maxAmount)}</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                <Calendar className="text-blue-400 w-4 h-4 mb-1" />
                <p className="text-[10px] text-white/50 mb-1">Daily Avg</p>
                <p className="text-xs text-white font-medium">{formatCurrency(avgDaily)}</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                <Activity className="text-orange-400 w-4 h-4 mb-1" />
                <p className="text-[10px] text-white/50 mb-1">Transactions</p>
                <p className="text-xs text-white font-medium">{weeklyTransactionCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:text-right">
          <h2 className="text-4xl font-semibold text-white leading-tight">
            Track every
            <span className="text-lime"> rupee.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            See where money goes by week. Set a budget that actually fits your
            life and get quiet nudges before you drift.
          </p>
          <div className="flex gap-3 lg:justify-end">
            <Button variant="outline" className="group">
              View Transactions{" "}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <ul className="space-y-2 text-sm text-white/50 lg:text-right">
            <li className="flex items-center gap-2 lg:justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" />
              Weekly spending breakdown
            </li>
            <li className="flex items-center gap-2 lg:justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" />
              Budget tracking & alerts
            </li>
            <li className="flex items-center gap-2 lg:justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" />
              Category insights
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}