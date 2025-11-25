#!/usr/bin/env python3
"""
Parse NPPE Question Bank DOCX file and generate .qbank.md format
"""
import re
import sys
from typing import Dict, List, Optional

def map_difficulty(difficulty_str: str) -> str:
    """Map difficulty string to our format"""
    if "1 (EASY)" in difficulty_str:
        return "easy"
    elif "2 (MODERATE)" in difficulty_str:
        return "medium"
    elif "3 (DIFFICULT)" in difficulty_str:
        return "hard"
    return "medium"  # default

def map_topic(syllabus_area: str) -> str:
    """Map syllabus area to topic name"""
    area_prefix = syllabus_area.split('.')[0].upper()

    topic_map = {
        'I': "Professionalism",
        'II': "Ethics & Professional Practice",
        'III': "Professional Law & Liability",
        'IV': "Law, Regulation & Environment",
        'V': "Regulation & Licensing"
    }

    return topic_map.get(area_prefix, "General")

def parse_question_block(block: str) -> Optional[Dict]:
    """Parse a single question block"""
    try:
        # Extract question number and text
        q_match = re.search(r'^(\d+)\.\s+(.+?)(?=A\.|\nA\.)', block, re.DOTALL)
        if not q_match:
            return None

        q_num = int(q_match.group(1))
        q_text = q_match.group(2).strip()

        # Extract options
        options = {}
        for letter in ['A', 'B', 'C', 'D']:
            opt_match = re.search(rf'{letter}\.\s+(.+?)(?=[A-D]\.|Hint:|Answer Key)', block, re.DOTALL)
            if opt_match:
                options[letter] = opt_match.group(1).strip()

        if len(options) != 4:
            print(f"Warning: Question {q_num} has {len(options)} options, expected 4")
            return None

        # Extract correct answer
        correct_match = re.search(r'Correct Answer:\s*([A-D])', block)
        if not correct_match:
            return None
        correct_letter = correct_match.group(1)

        # Extract rationale
        rationale_match = re.search(r'Rationale:\s+(.+?)(?=Difficulty:)', block, re.DOTALL)
        rationale = rationale_match.group(1).strip() if rationale_match else ""

        # Extract difficulty
        diff_match = re.search(r'Difficulty:\s+(.+?)(?=NPPE Syllabus Area:)', block)
        difficulty = map_difficulty(diff_match.group(1)) if diff_match else "medium"

        # Extract syllabus area
        syllabus_match = re.search(r'NPPE Syllabus Area:\s*(.+?)(?=Source Reference:)', block, re.DOTALL)
        syllabus_area = syllabus_match.group(1).strip() if syllabus_match else ""

        # Extract source reference
        source_match = re.search(r'Source Reference:\s+(.+?)(?=--------------------------------------------------------------------------------|$)', block, re.DOTALL)
        source_ref = source_match.group(1).strip() if source_match else ""

        # Generate slug
        clean_text = re.sub(r'[^\w\s]', '', q_text.lower())
        words = clean_text.split()[:6]
        slug_base = '-'.join(words)
        if syllabus_area:
            slug = f"{slug_base}-{syllabus_area.replace('.', '').replace(' ', '-').lower()}"
        else:
            slug = f"{slug_base}-q{q_num}"

        return {
            'number': q_num,
            'content': q_text,
            'options': options,
            'correct': correct_letter,
            'rationale': rationale,
            'difficulty': difficulty,
            'topic': map_topic(syllabus_area),
            'subtopic': syllabus_area,
            'reference_source': source_ref,
            'slug': slug
        }

    except Exception as e:
        print(f"Error parsing question block: {e}")
        return None

def generate_qbank_md(question: Dict) -> str:
    """Generate .qbank.md format for a question"""
    lines = []

    # Front matter
    lines.append("---")
    lines.append("type: multiple_choice_single")
    lines.append(f"difficulty: {question['difficulty']}")
    lines.append(f"topic: \"{question['topic']}\"")
    if question['subtopic']:
        lines.append(f"subtopic: \"{question['subtopic']}\"")
    lines.append("province:")
    lines.append("active: true")
    lines.append(f"reference_source: \"{question['reference_source']}\"")
    lines.append(f"slug: \"{question['slug']}\"")
    lines.append("---")
    lines.append("")

    # Question content
    lines.append(f"**{question['content']}**")
    lines.append("")

    # Options
    for letter, text in question['options'].items():
        marker = "[x]" if letter == question['correct'] else "[ ]"
        lines.append(f"- {marker} {text}")

    lines.append("")

    # Explanation
    lines.append(f"**Explanation:** {question['rationale']}")
    lines.append("")

    return "\n".join(lines)

def main():
    if len(sys.argv) != 2:
        print("Usage: python parse_docx.py <docx_content_file>")
        sys.exit(1)

    input_file = sys.argv[1]

    # Read the DOCX content
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into question blocks
    question_blocks = re.split(r'-{80,}', content)

    questions = []
    for block in question_blocks:
        block = block.strip()
        if not block or not re.search(r'^\d+\.', block):
            continue

        question = parse_question_block(block)
        if question:
            questions.append(question)
            print(f"✓ Parsed question {question['number']}")
        else:
            print(f"✗ Failed to parse block: {block[:100]}...")

    # Generate output
    output_lines = []
    for question in questions:
        output_lines.append(generate_qbank_md(question))
        output_lines.append("")  # Extra blank line between questions

    output_content = "\n".join(output_lines)

    # Write to file
    output_file = "questions/nppe_r1.qbank.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)

    print(f"\n📝 Generated {len(questions)} questions in {output_file}")

    # Validation summary
    print("\n📊 Validation Summary:")
    print(f"  Total questions: {len(questions)}")
    print(f"  Topics: {set(q['topic'] for q in questions)}")
    print(f"  Difficulty distribution: {dict((d, sum(1 for q in questions if q['difficulty'] == d)) for d in ['easy', 'medium', 'hard'])}")

    # Check for issues
    issues = []
    for q in questions:
        if len(q['options']) != 4:
            issues.append(f"Q{q['number']}: {len(q['options'])} options")
        if not q['content'].strip():
            issues.append(f"Q{q['number']}: empty content")
        if not q['rationale'].strip():
            issues.append(f"Q{q['number']}: empty rationale")

    if issues:
        print(f"\n⚠️  Issues found ({len(issues)}):")
        for issue in issues[:5]:  # Show first 5
            print(f"  {issue}")
        if len(issues) > 5:
            print(f"  ... and {len(issues) - 5} more")
    else:
        print("\n✅ No validation issues found")

if __name__ == "__main__":
    main()
