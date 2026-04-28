import os
from pathlib import Path

def create_output_directory(directory_path):
    """
    Create the output directory if it doesn't exist.
    
    Args:
        directory_path (str): Path to the directory to create
    """
    Path(directory_path).mkdir(parents=True, exist_ok=True)
    return directory_path

def word_count(text):
    """
    Count the number of words in a text.
    
    Args:
        text (str): Text to count words in
        
    Returns:
        int: Number of words
    """
    if not text:
        return 0
    
    # Split by whitespace and count non-empty words
    words = [word for word in text.split() if word.strip()]
    return len(words)

def estimate_reading_time(word_count, wpm=250):
    """
    Estimate reading time in minutes.
    
    Args:
        word_count (int): Number of words
        wpm (int): Words per minute reading speed (default: 250)
        
    Returns:
        int: Estimated reading time in minutes
    """
    if word_count <= 0:
        return 0
    
    return max(1, round(word_count / wpm))

def sanitize_filename(filename):
    """
    Sanitize a filename to ensure it's valid.
    
    Args:
        filename (str): Filename to sanitize
        
    Returns:
        str: Sanitized filename
    """
    # Replace invalid characters with underscores
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Trim to reasonable length
    if len(filename) > 100:
        base, ext = os.path.splitext(filename)
        filename = base[:96] + ext
    
    return filename
