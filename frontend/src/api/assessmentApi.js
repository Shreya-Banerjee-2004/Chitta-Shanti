const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function uploadAssessmentVideo(token, videoBlob) {
  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in again."
    );
  }

  if (!videoBlob) {
    throw new Error("Recorded video is missing.");
  }

  const formData = new FormData();

  formData.append("video", videoBlob, "assessment.webm");

  const response = await fetch(
    `${API_BASE_URL}/api/assessment/upload-video`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let message = "Unable to upload the assessment video.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.detail === "string") {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    if (response.status === 401) {
      message = "Authentication failed. Please log in again.";
    }

    throw new Error(message);
  }

  return response.json();
}


export async function submitQuestionnaire(
  token,
  sessionId,
  questionnaireAnswers
) {
  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in again."
    );
  }

  if (!sessionId) {
    throw new Error("Assessment session ID is missing.");
  }

  if (!questionnaireAnswers) {
    throw new Error("Questionnaire answers are missing.");
  }

  const payload = {
    session_id: sessionId,
    ...questionnaireAnswers,
  };

  const response = await fetch(
    `${API_BASE_URL}/api/assessment/submit-questionnaire`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    let message = "Unable to submit the questionnaire.";

    try {
      const errorData = await response.json();

      if (typeof errorData?.detail === "string") {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    if (response.status === 401) {
      message = "Authentication failed. Please log in again.";
    }

    if (response.status === 422) {
      message =
        "Some assessment answers are invalid. Please check your responses.";
    }

    throw new Error(message);
  }

  return response.json();
}