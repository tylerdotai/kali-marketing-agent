# Content Creation Workflow

## Overview
End-to-end content pipeline from idea to published post.

## When to Use
- "Create content for [topic]"
- "I need posts for [campaign]"
- "Generate social content"

---

## Phase 1: Ideation

### Input
- Topic/theme/campaign name
- Target audience
- Platform priorities
- Content quantity (3 posts? 1 week? 1 month?)

### Agent Actions
1. Research trending hashtags
2. Check competitor content (via web search)
3. Generate content angles

---

## Phase 2: Drafting

### Output Per Platform

**Instagram:**
- Hook line (first line of caption)
- 3-5 body paragraphs
- CTA
- 8-15 hashtags (mixed reach levels)
- Design request for Canva

**Facebook:**
- Headline
- 2-3 paragraph body
- CTA button text
- Hashtags (3-5)

**TikTok:**
- Hook concept (2-3 options)
- Script outline
- Caption with hashtags

---

## Phase 3: Design

### Canva Requests
```
"Create [count] Instagram post templates with:
- Theme: [mood/colors from brand guidelines]
- Text overlay: [main headline]
- Size: 1080x1080px
- Style: [modern/minimal/bold/etc]"
```

### Design Checklist
- [ ] Post graphics (1 per platform)
- [ ] Story graphics (if needed)
- [ ] Highlight covers (Instagram)
- [ ] Video thumbnails (if video content)

---

## Phase 4: Scheduling

### Reminders Setup
For each content piece, create reminder:
```
Title: "📱 Publish: [content title]"
Due: [scheduled date + time]
Notes: [platform, caption text, design file location]
```

### Best Times to Post (Default)
| Platform | Days | Times |
|----------|------|-------|
| Instagram | Tue-Thu, Sun | 9 AM, 7 PM |
| Facebook | Wed-Thu | 10 AM-12 PM |
| TikTok | Tue-Thu | 7 PM |

---

## Phase 5: Publishing

### Publishing Steps
1. Download final designs from Canva
2. Upload to social scheduler (Buffer, Later, etc.)
   - Or publish directly
3. Add UTM parameters for tracking
4. Confirm all posts scheduled

### Quick Publish Template
```
Platform: Instagram
Scheduled: March 20, 2026 @ 7:00 PM CST
Caption: [paste caption]
Image: [Canva file link]
UTM:?utm_source=instagram&utm_medium=social&utm_campaign=[campaign]
```

---

## Phase 6: Review

### Week After
- Check insights/analytics
- Note which posts performed best
- Gather engagement metrics
- Document learnings

### Content Performance Log
```
| Date | Platform | Topic | Reach | Engagements | Notes |
|------|----------|-------|-------|-------------|-------|
| 3/20 | IG | Tattoo reopening | 1.2K | 89 | Best performing |
```

---

## Canva MCP Integration

When OpenClaw has Canva MCP connected:

```bash
# Generate a post
"Design an Instagram post announcing our sale"

# Generate multiple variations
"Create 3 story templates for flash sale this weekend"

# Get design links
"Canva: Export the latest template as PNG"
```

---

## Quick Command Reference

| Command | Action |
|---------|--------|
| `content for [topic]` | Generate full content plan |
| `social posts for [campaign]` | Platform-specific posts |
| `canva [request]` | Generate designs |
| `schedule [content]` | Create calendar reminder |
| `analytics [date range]` | Pull performance data |
