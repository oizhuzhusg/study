# Architecture

## Runtime

```text
Cloudflare Worker
  - serves static assets
  - exposes /api/*
  - calls OpenAI
  - applies mastery updates

Browser
  - renders the learning interface
  - compresses uploaded photos
  - stores MVP mastery in localStorage
```

## Learning Loop

```text
lesson
-> question
-> typed answer or photo
-> transcription confirmation
-> grading
-> mastery update
-> targeted next question
```

## OpenAI Calls

### Photo Transcription

Input:

- question prompt
- expected answer for context
- answer image data URL

Output:

```json
{
  "is_readable": true,
  "recognized_answer": "",
  "uncertain_parts": [],
  "needs_retake_reason": ""
}
```

### Grading

Input:

- question prompt
- expected answer
- rubric
- allowed skill ids
- confirmed student answer

Output:

```json
{
  "score": 0,
  "max_score": 0,
  "correct_points": [],
  "missing_points": [],
  "misconceptions": [],
  "weak_skills": [],
  "mastery_updates": [
    {
      "skill_id": "state_symbols",
      "delta": -4,
      "reason": "Missing state symbols."
    }
  ],
  "next_action": "practice_state_symbols",
  "feedback_to_student": ""
}
```

## Mastery Model

Precipitation Reactions tracks:

```text
precipitate_concept
solubility_prediction
formulae
balancing
state_symbols
spectator_ions
ionic_equation
observation_inference
explanation_quality
```

The Worker keeps the update logic constrained so the model cannot arbitrarily rewrite the learning state.
