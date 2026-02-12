---
name: plan-feature
description: Ask questions and gather requirements before building new features
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

# Feature Planning for $ARGUMENTS

Before implementing this feature, let me gather requirements to ensure we build exactly what you need.

## Step 1: Understand the Feature Context

First, let me explore the codebase to understand:
- Existing patterns and conventions
- Related screens and components
- Similar features already implemented
- Relevant Supabase tables and types

## Step 2: Ask Clarifying Questions

Based on the feature "$ARGUMENTS", I'll ask you questions about:

1. **Scope & Location**
   - Which screen(s) should this feature appear on?
   - Is this a new screen or modification to existing one?
   - Should this be a reusable component or screen-specific?

2. **Design & UX**
   - Follow existing DODO design system (purple #7C3AED)?
   - Any specific UI preferences (icons, layout, animations)?
   - RTL considerations for Hebrew text?

3. **Backend & Data**
   - Which Supabase tables are involved?
   - Do we need new database fields or tables?
   - Real-time updates needed?
   - RLS policies required?

4. **Technical Approach**
   - Should we follow existing patterns in the codebase?
   - Any third-party libraries needed?
   - Navigation changes required?

5. **Validation & Testing**
   - What are the success criteria?
   - Edge cases to handle?
   - Should I test it after implementation?

## Step 3: Create Implementation Plan

After gathering your answers, I'll:
1. Create a detailed implementation plan
2. List all files to create/modify
3. Identify potential challenges
4. Present the plan for your approval before coding

## Step 4: Build & Test

Once approved:
1. Implement the feature following the plan
2. Follow DODO design system and RTL conventions
3. Add proper TypeScript types
4. Test the implementation
5. Report results and next steps

---

**Note:** This skill ensures we're aligned before I start coding, preventing wasted effort and ensuring the feature meets your exact needs.
