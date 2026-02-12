# Plan Feature Skill

Interactive feature planning skill for the DODO app that asks questions before building.

## Usage

```bash
/plan-feature <feature description>
```

### Examples

```bash
/plan-feature Add wallet balance to profile screen
/plan-feature Create coupon sharing feature
/plan-feature Add influencer verification badge
/plan-feature Implement follow/unfollow functionality
```

## What It Does

1. **Explores** your codebase to understand existing patterns
2. **Asks** structured questions about:
   - Scope and location
   - Design preferences
   - Backend/database needs
   - Technical approach
   - Testing requirements
3. **Creates** a detailed implementation plan
4. **Waits** for your approval
5. **Implements** the feature following the plan

## DODO App Context

This skill is specifically designed for the DODO app and understands:
- ✅ React Native (Expo) with TypeScript
- ✅ Supabase backend with RLS
- ✅ RTL (Hebrew) layout requirements
- ✅ Design system (purple #7C3AED, Heebo font)
- ✅ Existing navigation structure
- ✅ Database schema (users, wallets, coupons, etc.)

## Why Use This?

**Without this skill:**
```
You: "Add wallet balance to profile"
Claude: *starts coding immediately*
Claude: "I added it as a modal. Does that work?"
You: "No, I wanted it inline..."
```

**With this skill:**
```
You: "/plan-feature Add wallet balance to profile"
Claude: "Should this be: (A) Inline in profile, (B) Modal, (C) New screen?"
You: "A"
Claude: "Should I use user_wallets table? (Y/N)"
You: "Y"
Claude: *creates detailed plan*
You: "Looks good!"
Claude: *implements exactly what you want*
```

## Tips

- Be as specific or vague as you want in the feature description
- The skill will ask follow-up questions to clarify
- You can always choose "Other" to provide custom answers
- The skill learns from your DODO codebase patterns
- Plans are saved in your conversation for reference

## Customization

Edit [SKILL.md](SKILL.md) to:
- Add/remove question categories
- Change default recommendations
- Add DODO-specific validation rules
- Include additional context or constraints
