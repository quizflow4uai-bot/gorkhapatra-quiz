import requests
from bs4 import BeautifulSoup
import re
import json

BASE_URL = "https://gorkhapatraonline.com"
CATEGORY_URL = BASE_URL + "/categories/loksewa"

headers = {
    "User-Agent": "Mozilla/5.0"
}

# --------------------------------
# Find latest article
# --------------------------------
response = requests.get(CATEGORY_URL, headers=headers)
soup = BeautifulSoup(response.text, "lxml")

latest_article = None

for a in soup.find_all("a", href=True):
    href = a["href"]

    if "/news/" in href:

        if href.startswith("/"):
            href = BASE_URL + href

        latest_article = href
        break

print("Latest article:")
print(latest_article)

# --------------------------------
# Open latest article
# --------------------------------
response = requests.get(latest_article, headers=headers)
soup = BeautifulSoup(response.text, "lxml")

text = soup.get_text("\n", strip=True)

# --------------------------------
# Extract article date and day
# --------------------------------
date_match = re.search(
    r'(\d+\s+[^\s]+\s+२०\d{2}),\s*([^\n]+)',
    text
)

article_date = ""
article_day = ""

if date_match:
    article_date = date_match.group(1)
    article_day = date_match.group(2)

# --------------------------------
# Remove everything after "यो पनि हेर्नुहोस्"
# --------------------------------
if "यो पनि हेर्नुहोस्" in text:
    text = text.split("यो पनि हेर्नुहोस्")[0]

# --------------------------------
# Extract questions
# --------------------------------
pattern = r'(\d+\.\s.*?\?)\s*\s*(.*?)(?=\d+\.|\Z)'

matches = re.findall(pattern, text, re.S)

questions = []

for q, block in matches:

    lines = [line.strip() for line in block.split("\n") if line.strip()]

    answer = lines[0] if len(lines) > 0 else ""

    study_points = []

    if len(lines) > 1:
        study_points = lines[1:]

    questions.append({
        "question": q.strip(),
        "answer": answer,
        "studyPoint": study_points
    })

# --------------------------------
# Final JSON structure
# --------------------------------
data = {
    "date": article_date,
    "day": article_day,
    "questions": questions
}

# --------------------------------
# Save JSON
# --------------------------------
with open("questions.json", "w", encoding="utf-8") as f:
    json.dump(
        data,
        f,
        ensure_ascii=False,
        indent=2
    )

print()
print("Saved", len(questions), "questions.")