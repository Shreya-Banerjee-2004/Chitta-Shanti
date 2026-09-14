import os
import joblib
import numpy as np
import pandas as pd
from scipy import signal as sps
import librosa


# ---------------------------------------------------------
# 1. Biometric Signal Processing Functions
# ---------------------------------------------------------
def pos_algorithm(rgb_signal, fps):
    rgb_signal = np.asarray(rgb_signal, dtype=np.float64)
    n = rgb_signal.shape[0]
    window_len = int(fps * 1.6)
    if n < window_len:
        return np.zeros(n)

    pulse = np.zeros(n)
    weights = np.zeros(n)

    for start in range(0, n - window_len + 1):
        window = rgb_signal[start:start + window_len]
        mean_rgb = np.mean(window, axis=0)
        mean_rgb[mean_rgb == 0] = 1e-6
        normalized = window / mean_rgb

        Xs = 3 * normalized[:, 0] - 2 * normalized[:, 1]
        Ys = 1.5 * normalized[:, 0] + normalized[:, 1] - 1.5 * normalized[:, 2]

        std_x, std_y = np.std(Xs), np.std(Ys)
        alpha = std_x / std_y if std_y > 1e-8 else 0

        S = Xs - alpha * Ys
        pulse[start:start + window_len] += (S - np.mean(S))
        weights[start:start + window_len] += 1.0

    return np.divide(pulse, weights, out=np.zeros_like(pulse), where=weights > 0)


def bandpass_filter(sig, fps, low_hz=0.75, high_hz=3.0, order=3):
    sig = np.asarray(sig, dtype=np.float64)
    n = len(sig)
    if n < 15:
        return sig - np.mean(sig)

    nyq = fps / 2.0
    low = low_hz / nyq
    high = min(high_hz / nyq, 0.99)
    b, a = sps.butter(order, [low, high], btype="band")
    padlen = min(n - 1, 3 * max(len(a), len(b)))
    return sps.filtfilt(b, a, sig, padlen=padlen)


def estimate_hr_and_hrv(pulse_signal, fps):
    pulse_signal = np.asarray(pulse_signal, dtype=np.float64)
    n = len(pulse_signal)
    empty = {"hr_bpm": None, "rmssd_ms": None}
    if n < int(fps * 3) or np.std(pulse_signal) < 1e-6:
        return empty

    freqs, psd = sps.welch(pulse_signal - np.mean(pulse_signal), fs=fps, nperseg=min(n, int(fps * 6)))
    valid = (freqs >= 0.75) & (freqs <= 3.0)
    if not np.any(valid):
        return empty

    peak_freq = freqs[valid][np.argmax(psd[valid])]
    hr_bpm = peak_freq * 60.0

    expected_dist = int(fps / peak_freq)
    peaks, _ = sps.find_peaks(pulse_signal, distance=max(int(expected_dist * 0.75), 1), prominence=0.30 * np.std(pulse_signal))

    if len(peaks) < 3:
        return {"hr_bpm": round(float(hr_bpm), 1), "rmssd_ms": None}

    ibi_ms = (np.diff(peaks) / fps) * 1000.0
    med = np.median(ibi_ms)
    clean_ibi = ibi_ms[(ibi_ms >= 0.80 * med) & (ibi_ms <= 1.20 * med)]

    if len(clean_ibi) < 2:
        return {"hr_bpm": round(float(hr_bpm), 1), "rmssd_ms": None}

    rmssd_ms = np.sqrt(np.mean(np.diff(clean_ibi) ** 2))
    return {
        "hr_bpm": round(float(hr_bpm), 1),
        "rmssd_ms": round(float(min(rmssd_ms, 150.0)), 1),
    }


def eye_aspect_ratio(eye_pts):
    p1, p2, p3, p4, p5, p6 = eye_pts
    return (np.linalg.norm(p2 - p6) + np.linalg.norm(p3 - p5)) / (2.0 * np.linalg.norm(p1 - p4) + 1e-6)


class BlinkCounter:
    def __init__(self, threshold: float = 0.21, consec_frames: int = 2):
        self.threshold = threshold
        self.consec_frames = consec_frames
        self._below_count = 0
        self.blink_count = 0

    def update(self, ear_value: float):
        if ear_value < self.threshold:
            self._below_count += 1
        else:
            if self._below_count >= self.consec_frames:
                self.blink_count += 1
            self._below_count = 0

    def finalize(self) -> int:
        if self._below_count >= self.consec_frames:
            self.blink_count += 1
            self._below_count = 0
        return self.blink_count


def extract_voice_stress_features(audio_data, sr=22050):
    if len(audio_data) < sr * 1:
        return {"pitch_mean_hz": 0.0, "pitch_std_hz": 0.0, "vocal_stress_subscore": 50.0}

    audio_data = audio_data / (np.max(np.abs(audio_data)) + 1e-6)
    f0, _, _ = librosa.pyin(audio_data, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr)
    valid_f0 = f0[~np.isnan(f0)] if f0 is not None else np.array([])

    if len(valid_f0) > 5:
        pitch_mean, pitch_std = float(np.mean(valid_f0)), float(np.std(valid_f0))
    else:
        pitch_mean, pitch_std = 120.0, 5.0

    spec_cent = librosa.feature.spectral_centroid(y=audio_data, sr=sr)
    mean_spec_cent = float(np.mean(spec_cent))

    s_pitch_var = np.clip((pitch_std - 15.0) / (45.0 - 15.0) * 100.0, 0, 100)
    s_spectral = np.clip((mean_spec_cent - 1200.0) / (2800.0 - 1200.0) * 100.0, 0, 100)
    vocal_subscore = 0.60 * s_pitch_var + 0.40 * s_spectral

    return {
        "pitch_mean_hz": round(pitch_mean, 1),
        "pitch_std_hz": round(pitch_std, 1),
        "vocal_stress_subscore": round(float(vocal_subscore), 1),
    }

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "lifestyle_stress_model.joblib"
)

_lifestyle_model = None


def _load_lifestyle_model():
    global _lifestyle_model

    if _lifestyle_model is None and os.path.exists(MODEL_PATH):
        try:
            _lifestyle_model = joblib.load(MODEL_PATH)
        except Exception:
            _lifestyle_model = None

    return _lifestyle_model


def parse_time_to_hours(time_str):
    """
    Convert a time string such as '07:30 AM' or '23:30'
    into decimal hours.
    """
    if time_str is None or time_str == "":
        return 7.0

    if isinstance(time_str, (int, float)):
        return float(time_str)

    time_str = str(time_str).strip()

    dt = pd.to_datetime(
        time_str,
        format="%I:%M %p",
        errors="coerce"
    )

    if pd.isna(dt):
        dt = pd.to_datetime(
            time_str,
            format="%H:%M",
            errors="coerce"
        )

    if pd.isna(dt):
        return 7.0

    return dt.hour + dt.minute / 60.0


def score_stress(video_features: dict, survey_data: dict) -> dict:

    field_mapping = {
        "age": "Age",
        "gender": "Gender",

        "sleep_duration": "Sleep_Duration",
        "sleep_hours_per_night": "Sleep_Duration",

        "sleep_quality": "Sleep_Quality",
        "wake_up_time": "Wake_Up_Time",
        "bed_time": "Bed_Time",

        # Current frontend questionnaire fields
        "physical_activity_hours_daily": "Physical_Activity",
        "daily_screen_time_hours": "Screen_Time",
        "caffeinated_drinks_per_day": "Caffeine_Intake",
        "alcoholic_drinks_per_day": "Alcohol_Intake",
        "smokes": "Smoking_Habit",
        "avg_work_hours_per_day": "Work_Hours",
        "daily_commute_hours": "Travel_Time",
        "social_activity_hours_per_day": "Social_Interactions",
        "meditates_regularly": "Meditation_Practice",
        "preferred_exercise_type": "Exercise_Type",

        # Also support the older/internal names
        "physical_activity": "Physical_Activity",
        "screen_time": "Screen_Time",
        "caffeine_intake": "Caffeine_Intake",
        "alcohol_intake": "Alcohol_Intake",
        "smoking_habit": "Smoking_Habit",
        "work_hours": "Work_Hours",
        "travel_time": "Travel_Time",
        "social_interactions": "Social_Interactions",
        "meditation_practice": "Meditation_Practice",
        "exercise_type": "Exercise_Type",
    }

    mapped_survey = {}

    for k, v in survey_data.items():
        mapped_key = field_mapping.get(k.lower(), k)

        if mapped_key in ("Wake_Up_Time", "Bed_Time"):
            v = parse_time_to_hours(v)

        mapped_survey[mapped_key] = v

    # 1. Biometric Subscore
    rmssd = video_features.get("rmssd_ms", 45.0)

    s_hrv = (
        1.0 -
        (np.clip(rmssd, 20.0, 80.0) - 20.0) / 60.0
    ) * 100.0

    s_voice = min(
        100.0,
        max(0.0, video_features.get("pitch_std_hz", 5.0) * 4.0)
    )

    blink_rate = video_features.get("blink_rate_bpm", 18.0)
    brow_ratio = video_features.get("brow_ratio", 0.22)

    s_blink = np.clip(
        (blink_rate - 14.0) / (32.0 - 14.0) * 100.0,
        0,
        100
    )

    s_brow = np.clip(
        (0.22 - brow_ratio) / (0.22 - 0.14) * 100.0,
        0,
        100
    )

    s_behavior = 0.60 * s_blink + 0.40 * s_brow

    biometric_score = (
        0.40 * s_hrv +
        0.30 * s_voice +
        0.30 * s_behavior
    )

    # 2. Lifestyle Subscore
    model = _load_lifestyle_model()

    if model is not None:
        try:
            df_in = pd.DataFrame([mapped_survey])

            lifestyle_score = float(
                model.predict(df_in)[0]
            )

            lifestyle_score = float(
                np.clip(lifestyle_score, 0.0, 100.0)
            )

        except Exception:
            lifestyle_score = 50.0

    else:
        lifestyle_score = 50.0

    # 3. Multimodal Weighted Fusion
    final_score = round(
        0.55 * biometric_score +
        0.45 * lifestyle_score,
        1
    )

    stress_prob = round(final_score / 100.0, 2)

    is_critical = final_score >= 65.0

    # Insights
    key_insights = []
    recommendations = []

    if rmssd < 30.0:
        key_insights.append(
            f"Low HRV (RMSSD: {rmssd}ms) indicates autonomic fatigue."
        )
        recommendations.append(
            "Execute 2 minutes of box breathing (4s in, 4s hold, 4s out)."
        )

    if blink_rate > 25.0:
        key_insights.append(
            f"Elevated blink rate ({blink_rate} bpm) signals cognitive strain."
        )

    sleep_hours = mapped_survey.get("Sleep_Duration", 8.0)

    try:
        sleep_hours = float(sleep_hours)
    except (TypeError, ValueError):
        sleep_hours = 8.0

    if sleep_hours < 6.5:
        key_insights.append(
            f"Sleep deficit ({sleep_hours} hrs) exacerbates stress."
        )
        recommendations.append(
            "Prioritize 7+ hours of uninterrupted sleep."
        )

    if not key_insights:
        key_insights.append(
            "Biometric markers and lifestyle habits are balanced."
        )
        recommendations.append(
            "Maintain existing recovery and sleep routine."
        )
            # 4. Final Result
    classification = "Critical Fatigue" if is_critical else "Cleared"
    readiness_status = (
        "Mandatory Rest Required"
        if is_critical
        else "Fit for Duty"
    )

    shap_attribution = [
        {
            "feature": "biometric_score",
            "description": f"Multimodal biometric stress score: {biometric_score:.1f}/100",
        },
        {
            "feature": "lifestyle_score",
            "description": f"Lifestyle-based stress score: {lifestyle_score:.1f}/100",
        },
    ]

    return {
        "stress_probability": stress_prob,
        "classification": classification,
        "readiness_status": readiness_status,
        "shap_attribution": shap_attribution,
        "key_insights": key_insights,
        "recommendations": recommendations,
    }