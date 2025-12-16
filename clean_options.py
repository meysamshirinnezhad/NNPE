#!/usr/bin/env python3
"""
Data cleaning script to sanitize question answer choices by removing hardcoded prefixes.
Removes prefixes like "A)", "B.", "C ", "A-", etc. from the beginning of option text.
"""

import re
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'nppe')
DB_USER = os.getenv('DB_USER', 'nppe')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'StrongP@ss_123')

def clean_option_text(option_text):
    """
    Remove common prefixes from option text.
    Examples:
    - "A) Option text" -> "Option text"
    - "B. Option text" -> "Option text"
    - "C Option text" -> "Option text"
    - "A- Option text" -> "Option text"
    """
    if not option_text:
        return option_text

    # Pattern to match common prefixes: letter followed by ), ., -, or space
    pattern = r'^[A-Z][\)\.\-\s]+\s*'
    cleaned = re.sub(pattern, '', option_text.strip())

    return cleaned.strip()

def main():
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        print("Connected to database. Starting option cleaning...")

        # Get all question options
        cursor.execute("SELECT id, option_text FROM question_options WHERE option_text IS NOT NULL")
        options = cursor.fetchall()

        print(f"Found {len(options)} options to process")

        updated_count = 0
        for option_id, option_text in options:
            cleaned = clean_option_text(option_text)
            if cleaned != option_text:
                # Update the option
                cursor.execute(
                    "UPDATE question_options SET option_text = %s WHERE id = %s",
                    (cleaned, option_id)
                )
                updated_count += 1
                if updated_count % 100 == 0:
                    print(f"Processed {updated_count} options...")

        # Commit changes
        conn.commit()

        print(f"Successfully cleaned {updated_count} options")

        # Close connection
        cursor.close()
        conn.close()

        print("Option cleaning completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
