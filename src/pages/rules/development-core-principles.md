---
title: Development Core Principles
description: PostgresAI rule - Development Core Principles
---

---
alwaysApply: true
description: "Core development principles for problem-solving and file management"
---

# Core development principles

## File management
- **Don't create extra files unless absolutely necessary**
- Prefer editing existing files over creating new ones
- Consolidate related functionality instead of splitting into multiple files
- Only create new files when functionality doesn't fit logically elsewhere
- Remove temporary files and clean up after tasks

## Problem-solving approach
- **Important: try to fix things at the cause, not the symptom**
- Identify root causes before implementing solutions
- Address underlying issues rather than applying band-aid fixes
- Understand the full context before making changes
- Consider long-term implications of fixes

## Documentation and communication
- **Be very detailed with summarization and do not miss out things that are important**
- Include all relevant details in summaries and explanations
- Don't omit important context or nuances
- Provide comprehensive information for decision-making
- Ensure completeness in documentation and reports

## Systematic debugging approach
When a fault, error, failure, or unexpected output is experienced:
- **Attempt a maximum of one fix at a time**
- **Validate if that fix has resolved the issue**
- **If that fix failed to resolve the issue, undo the fix, and reset the fix counter**
- **Reevaluate the issue ensuring you make use of detailed line-by-line analysis**
- **Continue to iterate on the above steps as required until the issue is resolved**

## Implementation guidelines
- Always investigate the underlying cause of issues
- Consolidate similar functionality into existing files
- Provide thorough explanations that cover all important aspects
- Clean up temporary artifacts after completing tasks
- Focus on sustainable, root-cause solutions
- Follow systematic debugging approach for all issues