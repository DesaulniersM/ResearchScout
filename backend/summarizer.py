from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk

def summarize_text(text, sentences_count=2):
    """
    Summarizes the given text using the LSA (Latent Semantic Analysis) algorithm.
    """
    # Ensure nltk resources are downloaded
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        nltk.download('punkt_tab', quiet=True)

    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    
    summary_sentences = summarizer(parser.document, sentences_count)
    return " ".join([str(sentence) for sentence in summary_sentences])

if __name__ == "__main__":
    test_text = """
    In this work, we propose a new method for deep learning on graphs. 
    Our approach leverages the spectral properties of the graph Laplacian 
    to define a convolution operator in the Fourier domain. We show that 
    this operator can be efficiently approximated using a Chebychev 
    polynomial expansion. Our results demonstrate that our method 
    outperforms existing state-of-the-art graph neural networks on 
    several benchmark datasets.
    """
    print("Summary:", summarize_text(test_text))
