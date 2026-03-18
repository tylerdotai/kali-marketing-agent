# Lead Nurturing Workflow

## Overview
Systematic approach to converting new leads into customers.

## When to Use
- "New lead from [source]"
- "Follow up with [lead]"
- "Lead moved to [stage]"
- "Lead went cold"

---

## Lead Stages

```
NEW → INITIAL CONTACT → QUALIFIED → PROPOSAL → NEGOTIATION → WON
                                                      ↘ LOST
```

---

## Stage 1: NEW

### Entry Criteria
- Form submission
- Social media inquiry
- In-person meeting
- Referral

### Agent Actions
1. Create lead card
2. Log source and timestamp
3. Set initial follow-up reminder (same day or next)
4. Add to CRM

### Reminder Created
```
Title: 📞 Initial contact: [Lead Name]
Due: [Today or Tomorrow]
Notes: 
- Source: [how they found you]
- Company: [company name]
- Interest: [what they want]
```

---

## Stage 2: INITIAL CONTACT

### Entry Criteria
- First email/call/msg exchanged

### Agent Actions
1. Update lead status
2. Gather requirements (if not done)
3. Send intro materials
4. Schedule discovery call
5. Set follow-up reminder

### Sample Discovery Questions
- What are you looking to achieve?
- What's your timeline?
- What's your budget range?
- Who else is involved in the decision?

---

## Stage 3: QUALIFIED

### Entry Criteria
- Confirmed budget
- Confirmed timeline
- Confirmed decision-maker

### Agent Actions
1. Update lead status
2. Send proposal/quote
3. Set proposal follow-up (3-5 days)
4. Add to nurture sequence

### Nurture Sequence
```
Day 1: Proposal sent
Day 3: Check-in email
Day 7: Value-add content (case study)
Day 14: Second check-in
Day 21: Final follow-up + urgency
```

---

## Stage 4: PROPOSAL

### Entry Criteria
- Proposal/quote delivered

### Agent Actions
1. Update status
2. Schedule presentation call
3. Prepare custom materials
4. Set decision deadline
5. Add to proposal tracker

---

## Stage 5: NEGOTIATION

### Entry Criteria
- Active negotiation on price/terms

### Agent Actions
1. Update status
2. Track objections
3. Prepare counter-offers
4. Set daily check-ins if urgent

---

## Stage 6: WON/LOST

### WON Entry
- Contract signed
- Payment received

### Agent Actions
1. Update final status → WON
2. Create onboarding reminders
3. Add to testimonial request list
4. Cross-sell/up-sell opportunity

### LOST Entry
- Explicit "no" or no response after 5+ attempts

### Agent Actions
1. Update final status → LOST
2. Log reason (if known)
3. Add to re-engagement campaign (6-12 months)
4. Archive lead

---

## Cold Lead Re-Engagement

### Trigger
- No contact in 14+ days
- Unresponsive to 3+ follow-ups

### Strategy
1. Change content type (email → social)
2. Send value-first content
3. 30-day silence → phone call
4. 60-day silence → "thinking of you" note
5. 90-day silence → archive

### Re-engagement Email Template
```
Subject: Still thinking about [problem you solve]?

Hey [Name],

I know you're busy — just wanted to check in.

We've helped companies like [similar company] achieve [benefit].

[Link to relevant content]

Still interested in chatting? Even just 15 min would help me understand if we're a fit.

No pressure,
[Your name]
```

---

## Quick Commands

| Command | Action |
|---------|--------|
| `new lead: [name], [company], [source]` | Create lead card + reminder |
| `[name] status [stage]` | Update pipeline stage |
| `[name] note [text]` | Add note to lead |
| `[name] won` | Mark as won customer |
| `[name] lost` | Archive with reason |
| `leads` | List all active leads |
| `leads [stage]` | Filter by stage |
| `followups today` | Show today's follow-ups |
