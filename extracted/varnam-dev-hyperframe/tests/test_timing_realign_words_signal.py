from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_ROOT = REPO_ROOT / "scripts" / "audio"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

import realign_words_signal as realign  # noqa: E402


def test_estimate_shift_recovers_known_offset() -> None:
    starts = np.array([1.0, 2.1, 3.3, 4.6, 6.0], dtype=np.float32)
    times = np.arange(0.0, 8.0, 0.01, dtype=np.float32)
    envelope = np.zeros_like(times, dtype=np.float32)

    true_shift = 0.08  # words need +80ms to hit onset peaks
    for t in starts + true_shift:
        envelope += np.exp(-((times - t) ** 2) / (2 * 0.012**2)).astype(np.float32)

    delta, _ = realign._estimate_shift(  # pylint: disable=protected-access
        starts,
        times,
        envelope,
        min_shift=-0.2,
        max_shift=0.2,
        step=0.0025,
    )
    assert math.isclose(delta, true_shift, abs_tol=0.01)


def test_apply_shifts_preserves_monotonicity() -> None:
    words = [
        {"word": "a", "start": 0.00, "end": 0.10},
        {"word": "b", "start": 0.11, "end": 0.21},
        {"word": "c", "start": 0.22, "end": 0.32},
    ]
    shifts = np.array([0.0, -0.2, 0.0], dtype=np.float32)

    corrected = realign._apply_shifts(  # pylint: disable=protected-access
        words,
        shifts=shifts,
        audio_duration=1.0,
        min_word_duration=0.03,
    )

    assert corrected[0]["start"] <= corrected[1]["start"] <= corrected[2]["start"]
    assert corrected[1]["start"] >= corrected[0]["end"]
    assert corrected[1]["end"] >= corrected[1]["start"]
