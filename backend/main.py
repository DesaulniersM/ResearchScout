import json
import os
import datetime
from pathlib import Path
from fetchers import fetch_arxiv_papers
from summarizer import summarize_text

CONFIG_DIR = Path.home() / ".config" / "research-watcher"
CONFIG_FILE = CONFIG_DIR / "config.json"
CACHE_DIR = Path.home() / ".cache" / "research-watcher"
STATUS_FILE = CACHE_DIR / "status.json"

DEFAULT_CONFIG = {
    "query": "cat:cs.LG",  # Change this to 'all:transformer' or 'au:LeCun'
    "limit": 5,
    "sentences_count": 2
}

def load_config():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if not CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'w') as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)
        return DEFAULT_CONFIG
    
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

def main():
    config = load_config()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        print(f"Fetching papers for: {config['query']}")
        papers = fetch_arxiv_papers(query=config['query'], limit=config['limit'])
        
        processed_papers = []
        for paper in papers:
            # Shorten the summary using the configurable sentence count
            paper['summary'] = summarize_text(paper['summary'], sentences_count=config.get('sentences_count', 2))
            processed_papers.append(paper)
            
        status_data = {
            "status": "success",
            "message": f"{len(processed_papers)} New Papers",
            "color": "#e67e22",
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "papers": processed_papers
        }
        
        with open(STATUS_FILE, 'w') as f:
            json.dump(status_data, f, indent=2)
            
        print(f"Success: Updated {STATUS_FILE}")
        
    except Exception as e:
        error_data = {
            "status": "error",
            "message": f"Error: {str(e)}",
            "color": "#e74c3c",
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "papers": []
        }
        with open(STATUS_FILE, 'w') as f:
            json.dump(error_data, f, indent=2)
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
