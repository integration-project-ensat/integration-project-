from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "career_dataset.csv"
MODEL_PATH = BASE_DIR / "saved_model.pkl"


def build_training_text(row: pd.Series) -> str:
    return " ".join(
        [
            str(row.get("skills", "")),
            str(row.get("projects", "")),
            str(row.get("technologies", "")),
            str(row.get("badges", "")),
        ]
    )


def train_model() -> Pipeline:
    dataset = pd.read_csv(DATASET_PATH)
    dataset["profile_text"] = dataset.apply(build_training_text, axis=1)

    x_train, x_test, y_train, y_test = train_test_split(
        dataset["profile_text"],
        dataset["career"],
        test_size=0.25,
        random_state=42,
        stratify=dataset["career"],
    )

    model = Pipeline(
        steps=[
            ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            (
                "classifier",
                LogisticRegression(max_iter=1200, class_weight="balanced"),
            ),
        ]
    )

    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    print(classification_report(y_test, predictions, zero_division=0))

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return model


if __name__ == "__main__":
    train_model()
