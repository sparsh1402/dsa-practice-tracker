#!/usr/bin/env python3
"""
Helper script to add a new DSA question to the tracker.
Usage: python add_question.py <topic_number> <question_name>
Example: python add_question.py 1 "Two Sum"
"""

import os
import sys
from datetime import datetime

# Topic mapping
TOPICS = {
    1: "01-Arrays-Strings",
    2: "02-Linked-Lists",
    3: "03-Stacks-Queues",
    4: "04-Trees",
    5: "05-Graphs",
    6: "06-Dynamic-Programming",
    7: "07-Backtracking",
    8: "08-Greedy-Algorithms",
    9: "09-Binary-Search",
    10: "10-Hash-Tables",
    11: "11-Heaps",
    12: "12-Sliding-Window",
    13: "13-Two-Pointers",
    14: "14-Bit-Manipulation"
}

def create_question_folder(topic_num, question_name):
    """Create folder structure for a new question"""
    if topic_num not in TOPICS:
        print(f"Error: Invalid topic number. Must be between 1-14")
        return False
    
    topic_folder = TOPICS[topic_num]
    question_folder = os.path.join(topic_folder, question_name.replace(" ", "-"))
    
    if os.path.exists(question_folder):
        print(f"Error: Question folder already exists: {question_folder}")
        return False
    
    # Create question folder
    os.makedirs(question_folder, exist_ok=True)
    print(f"✓ Created folder: {question_folder}")
    
    # Copy template
    template_path = "templates/solution_template.md"
    solution_path = os.path.join(question_folder, "solution.md")
    
    if os.path.exists(template_path):
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
        
        # Replace placeholder with question name
        template = template.replace("[Question Title]", question_name)
        
        with open(solution_path, 'w', encoding='utf-8') as f:
            f.write(template)
        print(f"✓ Created solution template: {solution_path}")
    else:
        print(f"⚠ Warning: Template not found at {template_path}")
    
    print(f"\n✓ Question folder created successfully!")
    print(f"\nNext steps:")
    print(f"1. Edit {solution_path} with your solution")
    print(f"2. Update README.md to add this question to the topic section")
    print(f"3. Update progress.md with today's date")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_question.py <topic_number> <question_name>")
        print("\nTopics:")
        for num, folder in TOPICS.items():
            print(f"  {num}: {folder}")
        sys.exit(1)
    
    try:
        topic_num = int(sys.argv[1])
        question_name = " ".join(sys.argv[2:])
        create_question_folder(topic_num, question_name)
    except ValueError:
        print("Error: Topic number must be an integer")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

