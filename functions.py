import random
from textwrap import shorten

# ✅ Predefined jokes
JOKES = [
    "Why don’t skeletons fight each other? They don’t have the guts.",
    "I told my computer I needed a break, and it said: 'No problem — I’ll go to sleep.'",
    "Why did the function break up with the loop? It needed some space.",
    "Why do Java developers wear glasses? Because they can’t C#.",
    "Why was the JavaScript developer sad? Because they didn’t Node how to Express themselves."
]

# ✅ Predefined motivational quotes
QUOTES = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Whether you think you can, or you think you can't—you're right. – Henry Ford",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "The best way to predict the future is to invent it. – Alan Kay"
]

def tell_joke() -> str:
    """
    Return a random joke from the list.
    """
    return random.choice(JOKES)

def get_motivational_quote() -> str:
    """
    Return a random motivational quote.
    """
    return random.choice(QUOTES)

def summarize(text: str, max_chars: int = 220) -> str:
    """
    Summarize text by truncating to a given max character length.
    """
    if not text or not text.strip():
        return "No text provided to summarize."
    # Replace line breaks with spaces before shortening
    cleaned_text = text.strip().replace("\n", " ")
    return shorten(cleaned_text, width=max_chars, placeholder="…")
