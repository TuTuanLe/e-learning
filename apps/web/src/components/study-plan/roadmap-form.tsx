"use client";

import { useState, type FormEvent } from "react";
import type { StudyPlanIntake } from "@dictation/contracts";
import { LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

const goalOptions = ["Giao tiếp", "Thi HSK", "Công việc", "Du lịch", "Du học"];
const interestOptions = ["Đời sống", "Ẩm thực", "Công việc", "Du lịch", "Văn hóa", "Công nghệ"];
const weaknessOptions = ["Nghe", "Phát âm", "Từ vựng", "Ngữ pháp", "Phản xạ", "Chữ Hán"];

type RoadmapFormProps = {
  initialValue: StudyPlanIntake;
  updating: boolean;
  submitting: boolean;
  error: string;
  onCancel?: () => void;
  onSubmit: (intake: StudyPlanIntake) => Promise<void>;
};

export function RoadmapForm({
  initialValue,
  updating,
  submitting,
  error,
  onCancel,
  onSubmit
}: RoadmapFormProps) {
  const [intake, setIntake] = useState(initialValue);
  const [customInterest, setCustomInterest] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const interests = customInterest.trim()
      ? [...new Set([...intake.interests, customInterest.trim()])]
      : intake.interests;
    await onSubmit({ ...intake, interests });
  }

  return (
    <form
      className="notion-shadow rounded-2xl border border-hairline bg-white p-5 sm:p-7"
      onSubmit={submit}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.5px]">
            {updating ? `Cập nhật lộ trình HSK ${intake.hskLevel}` : `Tạo lộ trình HSK ${intake.hskLevel}`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            AI sẽ tạo lesson cụ thể cho từng tuần theo đúng nhịp học của bạn.
          </p>
        </div>
        {onCancel ? (
          <button
            className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-canvas-soft"
            type="button"
            onClick={onCancel}
          >
            Đóng
          </button>
        ) : null}
      </div>

      {updating ? (
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          Các bài đã hoàn thành được giữ nguyên. Chỉ phần chưa học được tạo lại và sắp xếp tiếp nối.
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Mục tiêu chính"
          value={intake.primaryGoal}
          options={goalOptions}
          onChange={(primaryGoal) => setIntake({ ...intake, primaryGoal })}
        />
        <NumberField
          label="Số tuần"
          value={intake.durationWeeks}
          min={2}
          max={16}
          onChange={(durationWeeks) => setIntake({ ...intake, durationWeeks })}
        />
        <NumberField
          label="Bài học mỗi tuần"
          value={intake.lessonsPerWeek}
          min={2}
          max={10}
          onChange={(lessonsPerWeek) => setIntake({ ...intake, lessonsPerWeek })}
        />
        <NumberField
          label="Phút học mỗi ngày"
          value={intake.minutesPerDay}
          min={10}
          max={180}
          onChange={(minutesPerDay) => setIntake({ ...intake, minutesPerDay })}
        />
        <NumberField
          label="Số ngày mỗi tuần"
          value={intake.daysPerWeek}
          min={1}
          max={7}
          onChange={(daysPerWeek) => setIntake({ ...intake, daysPerWeek })}
        />
        <label className="block">
          <span className="text-sm font-medium">Ngày muốn đạt mục tiêu</span>
          <input
            required
            className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline px-3.5 outline-none"
            type="date"
            value={intake.targetDate}
            onChange={(event) => setIntake({ ...intake, targetDate: event.target.value })}
          />
        </label>
      </div>

      <ChoiceField
        label="Chủ đề bạn quan tâm"
        options={interestOptions}
        selected={intake.interests}
        onChange={(interests) => setIntake({ ...intake, interests })}
      />
      <label className="mt-3 block">
        <span className="sr-only">Chủ đề khác</span>
        <input
          className="focus-ring h-11 w-full rounded-lg border border-hairline px-3.5 text-sm outline-none"
          placeholder="Chủ đề khác, ví dụ: tiếng Trung ngành logistics"
          value={customInterest}
          onChange={(event) => setCustomInterest(event.target.value)}
        />
      </label>

      <ChoiceField
        label="Điểm yếu hiện tại"
        options={weaknessOptions}
        selected={intake.weaknesses}
        onChange={(weaknesses) => setIntake({ ...intake, weaknesses })}
      />

      <label className="mt-6 block">
        <span className="text-sm font-medium">Bạn muốn dùng tiếng Trung cho điều gì?</span>
        <textarea
          required
          className="focus-ring mt-2 min-h-28 w-full resize-y rounded-lg border border-hairline p-3.5 outline-none"
          placeholder="Ví dụ: Tôi cần giao tiếp với nhà cung cấp Trung Quốc trong 5 tuần tới..."
          value={intake.useCase}
          onChange={(event) => setIntake({ ...intake, useCase: event.target.value })}
        />
      </label>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white transition hover:bg-primary-active disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : updating ? (
          <RefreshCw className="size-4" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {submitting
          ? updating
            ? "Đang cập nhật..."
            : "Đang xây lộ trình..."
          : updating
            ? "Cập nhật phần chưa học"
            : "Tạo lộ trình"}
      </button>
    </form>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline bg-white px-3.5 outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline px-3.5 outline-none"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ChoiceField({
  label,
  options,
  selected,
  onChange
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              className={`focus-ring rounded-full border px-3 py-2 text-sm transition ${
                active
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-hairline hover:bg-canvas-soft"
              }`}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== option)
                    : [...selected, option]
                )
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
