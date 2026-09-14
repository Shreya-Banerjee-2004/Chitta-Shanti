import { useState } from "react";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "age",
    question: "How old are you?",
    type: "number",
    placeholder: "Enter your age",
    min: 1,
    max: 120,
    step: "1",
  },
  {
    id: "gender",
    question: "What is your gender?",
    type: "select",
    options: ["Male", "Female", "Other", "Prefer not to say"],
  },
  {
    id: "sleep_hours_per_night",
    question: "How many hours of sleep do you usually get per night?",
    type: "number",
    placeholder: "Enter hours",
    min: 0,
    max: 24,
    step: "0.1",
  },
  {
    id: "sleep_quality",
    question: "How would you rate the quality of your sleep?",
    type: "scale",
    min: 1,
    max: 5,
    scaleLabels: {
      1: "Poor",
      5: "Excellent",
    },
  },
  {
    id: "wake_up_time",
    question: "What time do you usually wake up?",
    type: "time",
  },
  {
    id: "bed_time",
    question: "What time do you usually go to bed?",
    type: "time",
  },
  {
    id: "physical_activity_hours_daily",
    question: "How much time do you spend on physical activities each day?",
    type: "number",
    placeholder: "Enter minutes",
    min: 0,
    max: 1440,
    step: "1",
    suffix: "minutes per day",
  },
  {
    id: "daily_screen_time_hours",
    question: "How many hours of screen time do you have per day?",
    type: "number",
    placeholder: "Enter hours",
    min: 0,
    max: 24,
    step: "0.1",
  },
  {
    id: "caffeinated_drinks_per_day",
    question: "How many caffeinated drinks do you consume per day?",
    type: "number",
    placeholder: "Enter number of drinks",
    min: 0,
    max: 50,
    step: "1",
  },
  {
    id: "alcoholic_drinks_per_day",
    question: "How many alcoholic drinks do you consume per day?",
    type: "number",
    placeholder: "Enter number of drinks",
    min: 0,
    max: 50,
    step: "1",
  },
  {
    id: "smokes",
    question: "Do you smoke?",
    type: "choice",
    options: ["Yes", "No"],
  },
  {
    id: "avg_work_hours_per_day",
    question: "What is your average number of work hours per day?",
    type: "number",
    placeholder: "Enter hours",
    min: 0,
    max: 24,
    step: "0.1",
  },
  {
    id: "daily_commute_hours",
    question:
      "How much time do you spend travelling or commuting each day?",
    type: "number",
    placeholder: "Enter hours",
    min: 0,
    max: 24,
    step: "0.1",
  },
  {
    id: "social_activity_hours_per_day",
    question:
      "How much time do you spend in social activities per day?",
    type: "number",
    placeholder: "Enter hours",
    min: 0,
    max: 24,
    step: "0.1",
  },
  {
    id: "meditates_regularly",
    question: "Do you meditate regularly?",
    type: "choice",
    options: ["Yes", "No"],
  },
  {
    id: "preferred_exercise_type",
    question: "What is your preferred type of exercise?",
    type: "select",
    options: [
      "Cardio",
      "Yoga",
      "Strength Training",
      "Walking",
      "Sports",
      "Other",
      "None",
    ],
  },
];

export default function QuestionnaireStep({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] ?? "";

const updateAnswer = (value) => {
  const numericTypes = ["number", "scale"];

  const processedValue =
    numericTypes.includes(question.type) && value !== ""
      ? Number(value)
      : value;

  setAnswers((previous) => ({
    ...previous,
    [question.id]: processedValue,
  }));
};

  const handleNext = () => {
    if (currentAnswer === "" || currentAnswer === null) {
      return;
    }

    if (currentQuestion === QUESTIONS.length - 1) {
      onComplete(answers);
      return;
    }

    setCurrentQuestion((previous) => previous + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      return;
    }

    setCurrentQuestion((previous) => previous - 1);
  };

  const progress =
    ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-[760px] mx-auto">
      <div
        className="
          bg-white
          rounded-[24px]
          border border-[#f0dce3]
          shadow-[0_8px_25px_rgba(209,43,99,0.06)]
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="px-7 sm:px-10 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#d12b63]">
                REFLECT
              </p>

              <p className="mt-1 text-sm text-[#9da0a8]">
                Question {currentQuestion + 1} of{" "}
                {QUESTIONS.length}
              </p>
            </div>

            <div
              className="
                h-11 w-11
                rounded-full
                bg-[#fff0f4]
                text-[#d12b63]
                flex items-center justify-center
              "
            >
              <CheckCircle2 size={21} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-2 w-full rounded-full bg-[#f5e5ea] overflow-hidden">
            <div
              className="
                h-full
                rounded-full
                bg-[#d12b63]
                transition-all duration-300
              "
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-7 sm:px-10 py-10">
          <h2
            className="
              text-[#172033]
              text-2xl
              sm:text-[27px]
              font-semibold
              leading-[1.35]
            "
          >
            {question.question}
          </h2>

          {/* Number input */}
          {question.type === "number" && (
            <div className="mt-8">
              <input
                type="number"
                min={question.min}
                max={question.max}
                step={question.step}
                value={currentAnswer}
                onChange={(event) =>
                  updateAnswer(event.target.value)
                }
                placeholder={question.placeholder}
                className="
                  w-full
                  px-5
                  py-4
                  rounded-xl
                  border border-[#e8d6de]
                  bg-[#fffafb]
                  text-[#172033]
                  text-lg
                  outline-none
                  focus:border-[#d12b63]
                  focus:ring-4
                  focus:ring-[#d12b63]/10
                  transition
                "
              />

              {question.suffix && (
                <p className="mt-2 text-sm text-[#9da0a8]">
                  {question.suffix}
                </p>
              )}
            </div>
          )}

          {/* Time input */}
          {question.type === "time" && (
            <div className="mt-8">
              <input
                type="time"
                value={currentAnswer}
                onChange={(event) =>
                  updateAnswer(event.target.value)
                }
                className="
                  w-full
                  px-5
                  py-4
                  rounded-xl
                  border border-[#e8d6de]
                  bg-[#fffafb]
                  text-[#172033]
                  text-lg
                  outline-none
                  focus:border-[#d12b63]
                  focus:ring-4
                  focus:ring-[#d12b63]/10
                  transition
                "
              />
            </div>
          )}

          {/* Select input */}
          {question.type === "select" && (
            <div className="mt-8">
              <select
                value={currentAnswer}
                onChange={(event) =>
                  updateAnswer(event.target.value)
                }
                className="
                  w-full
                  px-5
                  py-4
                  rounded-xl
                  border border-[#e8d6de]
                  bg-[#fffafb]
                  text-[#172033]
                  text-lg
                  outline-none
                  focus:border-[#d12b63]
                  focus:ring-4
                  focus:ring-[#d12b63]/10
                  transition
                "
              >
                <option value="" disabled>
                  Select an option
                </option>

                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Yes / No / choice buttons */}
          {question.type === "choice" && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((option) => {
                const selected = currentAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateAnswer(option)}
                    className={`
                      px-5
                      py-4
                      rounded-xl
                      border
                      font-semibold
                      text-lg
                      transition-all
                      ${
                        selected
                          ? "bg-[#d12b63] border-[#d12b63] text-white shadow-[0_5px_0_#a91f4e]"
                          : "bg-[#fffafb] border-[#e8d6de] text-[#76243f] hover:bg-[#fff0f4] hover:border-[#dcaec0]"
                      }
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Scale */}
          {question.type === "scale" && (
            <div className="mt-8">
              <div className="grid grid-cols-5 gap-2">
                {Array.from(
                  {
                    length:
                      question.max - question.min + 1,
                  },
                  (_, index) => {
                    const value = question.min + index;

                    const selected =
                      Number(currentAnswer) === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateAnswer(value)}
                        className={`
                          h-12
                          rounded-xl
                          border
                          font-semibold
                          transition-all
                          ${
                            selected
                              ? "bg-[#d12b63] border-[#d12b63] text-white shadow-[0_4px_0_#a91f4e]"
                              : "bg-[#fffafb] border-[#e8d6de] text-[#76243f] hover:bg-[#fff0f4] hover:border-[#dcaec0]"
                          }
                        `}
                      >
                        {value}
                      </button>
                    );
                  }
                )}
              </div>

              {question.scaleLabels && (
                <div className="mt-3 flex justify-between text-xs text-[#9da0a8]">
                  <span>
                    {question.min}:{" "}
                    {question.scaleLabels[question.min]}
                  </span>

                  <span>
                    {question.max}:{" "}
                    {question.scaleLabels[question.max]}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div
          className="
            border-t border-[#f0dce3]
            px-7 sm:px-10
            py-5
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-3
              rounded-xl
              border border-[#ead7df]
              bg-white
              text-[#76243f]
              font-semibold
              hover:bg-[#fff7f9]
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition
            "
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentAnswer === ""}
            className="
              inline-flex
              items-center
              gap-2
              px-6
              py-3
              rounded-xl
              bg-[#d12b63]
              text-white
              font-semibold
              shadow-[0_5px_0_#a91f4e]
              hover:bg-[#bd2457]
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition-all
            "
          >
            {currentQuestion === QUESTIONS.length - 1
              ? "Finish"
              : "Next"}

            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-[#9da0a8]">
        Answer as accurately as you can. There are no right or
        wrong answers.
      </p>
    </div>
  );
}