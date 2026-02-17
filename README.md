# ResearchScout (Ubuntu Widget)

A lightweight GNOME extension and Python backend that tracks new academic research papers from ArXiv and provides simple executive summaries directly in your system tray. Currently only works for Ubuntu 20.04/22.04. I will be updating it to work for Ubuntu 24.04 at some point.

Designed for Ubuntu (20.04, 22.04) and GNOME 3.36+.

## Features
- **Periodic Queries:** Monitor specific ArXiv categories, keywords, or authors.
- **AI Summaries:** Uses NLP (LSA algorithm) to condense long abstracts into 2-3 key sentences. (this could be greatly improved upon)
- **System Tray Integration:** A clean indicator icon with a badge showing the number of new papers. You can edit the config file to change searches and number of papers.
- **Easy Config:** Simple JSON-based configuration for your research interests.

---

## Getting Started

### 1. Prerequisites
You will need Python 3.8+ (Python 3.10 recommended).

```bash
# Install Python dependencies in your project folder
pip3 install feedparser sumy nltk
```

### 2. Install the Extension
GNOME extensions must be linked to your local extensions directory to be recognized by the system.

```bash
# Create the directory if it doesn't exist
mkdir -p ~/.local/share/gnome-shell/extensions

# Link the extension folder (RUN THIS FROM INSIDE THE PROJECT FOLDER)
ln -s "$(pwd)/extension-legacy" ~/.local/share/gnome-shell/extensions/research-scout@local.dev
```

**Note:** After linking, press `Alt + F2`, type `r`, and hit `Enter` to restart GNOME Shell. Then enable it:
```bash
gnome-extensions enable research-scout@local.dev
```

### 3. Initialize the Backend
Run the "Brain" once to generate your configuration and fetch the first batch of papers.

```bash
python3 backend/main.py
```

---

## Configuration
You can customize your research interests by editing the config file created at:
`~/.config/research-watcher/config.json`

**Example Query:**
To track "Augmented Reality" by "Maria Gorlatova" in the Computer Vision category:
```json
{
  "query": "all:\"Augmented Reality\" OR au:Gorlatova OR cat:cs.CV",
  "limit": 5,
  "sentences_count": 2
}
```

---

## Automation (Weekly Updates)
To have the widget update automatically every Monday at midnight, add a cron job:

1. Run `crontab -e`.
2. Add this line at the bottom (replace `/path/to/project` with your actual path):
```cron
0 0 * * 1 /usr/bin/python3 /path/to/project/backend/main.py >> /path/to/project/cron.log 2>&1
```

---

## Project Structure
- `/backend`: Python logic for fetching and summarizing.
- `/extension-legacy`: GNOME 3.36/42+ compatible JavaScript UI.
- `status.json`: The "contract" file where the backend stores data for the UI.

## License
MIT
