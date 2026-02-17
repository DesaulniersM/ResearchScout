import feedparser
import datetime

def fetch_arxiv_papers(query='cat:cs.LG', limit=5):
    """
    Fetches papers from ArXiv based on a flexible query string.
    Examples: 
      - 'cat:cs.LG' (Category)
      - 'all:transformer' (Keyword in any field)
      - 'au:del_maestro' (Author)
      - 'cat:cs.LG AND all:diffusion' (Combined)
    """
    # URL encode the query to handle spaces and special characters
    import urllib.parse
    encoded_query = urllib.parse.quote(query)
    
    url = f'http://export.arxiv.org/api/query?search_query={encoded_query}&sortBy=submittedDate&sortOrder=descending&max_results={limit}'
    feed = feedparser.parse(url)
    
    papers = []
    for entry in feed.entries:
        papers.append({
            "id": entry.id.split('/')[-1],
            "title": entry.title.replace('\n', ' ').strip(),
            "summary": entry.summary.replace('\n', ' ').strip(),
            "url": entry.link,
            "source": "ArXiv",
            "published_date": entry.published[:10]  # YYYY-MM-DD
        })
    
    return papers

if __name__ == "__main__":
    # Quick test
    papers = fetch_arxiv_papers()
    for p in papers:
        print(f"[{p['published_date']}] {p['title']}")
