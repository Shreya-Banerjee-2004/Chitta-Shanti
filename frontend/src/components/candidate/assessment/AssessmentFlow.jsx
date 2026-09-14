import { useState } from "react";

import ProgressStepper from "./ProgressStepper";
import QuestionStep from "./QuestionStep";
import RecordingStep from "./RecordingStep";
import QuestionnaireStep from "./QuestionnaireStep";
import ResultStep from "./ResultStep";

import {
  uploadAssessmentVideo,
  submitQuestionnaire,
} from "../../../api/assessmentApi";

import { getAuthToken } from "../../../utils/authToken";


const DEFAULT_QUESTION =
  "Tell me about a moment this week that felt harder to get through than usual.";

const ALTERNATIVE_QUESTIONS = [
  "Can you describe something recently that affected your energy or concentration?",
  "What has been on your mind more than usual over the past few days?",
  "Tell me about something this week that made you feel particularly tired or overwhelmed.",
];


export default function AssessmentFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [question, setQuestion] = useState(DEFAULT_QUESTION);

  const [recordedVideo, setRecordedVideo] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSubmittingQuestionnaire, setIsSubmittingQuestionnaire] =
    useState(false);

  const [error, setError] = useState("");


  const handleStartRecording = () => {
    setError("");
    setCurrentStep(2);
  };


  const handleDifferentPrompt = () => {
    const availableQuestions = ALTERNATIVE_QUESTIONS.filter(
      (item) => item !== question
    );

    const randomIndex = Math.floor(
      Math.random() * availableQuestions.length
    );

    setQuestion(availableQuestions[randomIndex]);
  };


  const handleVideoComplete = async (videoBlob) => {
    setRecordedVideo(videoBlob);
    setError("");
    setIsUploadingVideo(true);

    try {
      const token = getAuthToken();

      const response = await uploadAssessmentVideo(
        token,
        videoBlob
      );

      setSessionId(response.session_id);

      setCurrentStep(3);
    } catch (err) {
      console.error("Video upload failed:", err);
      setError(
        err.message || "Unable to process the recorded video."
      );
    } finally {
      setIsUploadingVideo(false);
    }
  };


  const handleQuestionnaireComplete = async (questionnaireAnswers) => {
    setError("");
    setIsSubmittingQuestionnaire(true);

    try {
      const token = getAuthToken();

      const response = await submitQuestionnaire(
        token,
        sessionId,
        questionnaireAnswers
      );

      setResult(response);
      setCurrentStep(4);
    } catch (err) {
      console.error("Questionnaire submission failed:", err);
      setError(
        err.message || "Unable to submit the questionnaire."
      );
    } finally {
      setIsSubmittingQuestionnaire(false);
    }
  };


  const handleNewAssessment = () => {
    setCurrentStep(1);
    setQuestion(DEFAULT_QUESTION);

    setRecordedVideo(null);
    setSessionId(null);
    setResult(null);

    setError("");
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuestionStep
            question={question}
            onStartRecording={handleStartRecording}
            onDifferentPrompt={handleDifferentPrompt}
          />
        );


      case 2:
        return (
          <>
            <RecordingStep
              onComplete={handleVideoComplete}
            />

            {isUploadingVideo && (
              <div className="mt-6 text-center text-[#858b97]">
                Processing your video. Please wait...
              </div>
            )}

            {error && (
              <div className="mt-6 text-center text-red-600">
                {error}
              </div>
            )}
          </>
        );


      case 3:
        return (
          <>
            <QuestionnaireStep
              onComplete={handleQuestionnaireComplete}
            />

            {isSubmittingQuestionnaire && (
              <div className="mt-6 text-center text-[#858b97]">
                Analyzing your assessment. Please wait...
              </div>
            )}

            {error && (
              <div className="mt-6 text-center text-red-600">
                {error}
              </div>
            )}
          </>
        );


      case 4:
        return (
          <ResultStep
            result={result}
            onNewAssessment={handleNewAssessment}
            onViewHistory={() => {
              // We'll connect this to /candidate/history later.
            }}
          />
        );


      default:
        return null;
    }
  };


  const stepDescription = {
    1: "read your prompt",
    2: "record your response",
    3: "reflect on your wellbeing",
    4: "review your result",
  };


  return (
    <section className="w-full">

      {/* Heading */}
      <div className="text-center mb-8">
        <h1
          className="
            text-[#172033]
            text-4xl
            sm:text-[44px]
            font-semibold
            tracking-[0.12em]
            uppercase
          "
        >
          New Assessment
        </h1>

        <p
          className="
            mt-2
            text-[#858b97]
            text-[16px]
          "
        >
          Step {currentStep} of 4 —{" "}
          {stepDescription[currentStep]}
        </p>
      </div>


      {/* Stepper */}
      <div className="mb-10">
        <ProgressStepper currentStep={currentStep} />
      </div>


      {/* Current step */}
      {renderStep()}

    </section>
  );
}