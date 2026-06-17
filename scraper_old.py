import requests
from bs4 import BeautifulSoup
import re
import json

url = "https://gorkhapatraonline.com/news/210529"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, "lxml")

text = soup.get_text("\n", strip=True)

# Extract each question block
pattern = r'(\d+\.\s.*?\?)\s*\s*(.*?)(?=\d+\.|\Z)'

matches = re.findall(pattern, text, re.S)

questions = []

for q, block in matches:

    lines = [line.strip() for line in block.split("\n") if line.strip()]

    answer = lines[0] if lines else ""

    study_points = lines[1:] if len(lines) > 1 else []

    questions.append({
        "question": q.strip(),
        "answer": answer,
        "studyPoint": study_points
    })

with open("questions.json", "w", encoding="utf-8") as f:
    json.dump(
        questions,
        f,
        ensure_ascii=False,
        indent=2
    )

print(f"Saved {len(questions)} questions.")