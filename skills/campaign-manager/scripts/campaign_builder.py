#!/usr/bin/env python3
"""
Campaign Builder - Generate marketing campaigns from brief
Usage: python campaign_builder.py "campaign description"
"""

import sys
import json
from datetime import datetime, timedelta

def generate_campaign(brief: str) -> dict:
    """Generate a full campaign plan from a brief description."""
    
    # Simple keyword extraction for channels
    brief_lower = brief.lower()
    
    channels = []
    if any(w in brief_lower for w in ['social', 'instagram', 'facebook', 'tiktok', 'twitter', 'post']):
        channels.append("social")
    if any(w in brief_lower for w in ['email', 'newsletter', 'mail']):
        channels.append("email")
    if any(w in brief_lower for w in ['launch', 'product', 'announce']):
        channels.append("press")
    
    # Default channels if none detected
    if not channels:
        channels = ["social", "email"]
    
    # Generate timeline
    start_date = datetime.now()
    launch_date = start_date + timedelta(weeks=4)
    
    campaign = {
        "name": brief[:50] + "..." if len(brief) > 50 else brief,
        "brief": brief,
        "channels": channels,
        "timeline": {
            "start": start_date.strftime("%Y-%m-%d"),
            "launch": launch_date.strftime("%Y-%m-%d"),
            "duration_weeks": 4
        },
        "phases": [
            {
                "name": "Pre-Launch (Week 1-2)",
                "goals": [
                    "Finalize messaging and branding",
                    "Create content assets",
                    "Build email list",
                    "Set up tracking"
                ],
                "deliverables": [
                    "Campaign brief finalized",
                    "Content calendar approved",
                    "All visuals ready"
                ]
            },
            {
                "name": "Soft Launch (Week 3)",
                "goals": [
                    "Teaser content",
                    "Warm up audience",
                    "Test all channels"
                ],
                "deliverables": [
                    "3 teaser posts",
                    "Email sequence drafted",
                    "UTMs tracked"
                ]
            },
            {
                "name": "Launch Week (Week 4)",
                "goals": [
                    "Full campaign execution",
                    "Maximum engagement",
                    "Convert leads"
                ],
                "deliverables": [
                    "Daily posts",
                    "Email drip active",
                    "Performance monitoring"
                ]
            }
        ],
        "content_calendar": generate_content_calendar(channels, 4),
        "kpis": [
            "Reach/impressions",
            "Engagement rate",
            "Click-through rate",
            "Conversions",
            "Revenue generated"
        ]
    }
    
    return campaign

def generate_content_calendar(channels: list, weeks: int) -> list:
    """Generate a content calendar template."""
    calendar = []
    platforms = {
        "social": ["Instagram", "Facebook", "TikTok"],
        "email": ["Newsletter"],
        "press": ["Press Release", "Media Outreach"]
    }
    
    post_types = [
        "Educational/How-to",
        "Behind the scenes",
        "Testimonial/Social proof",
        "Promotional/CTA",
        "Engagement/Question"
    ]
    
    for week in range(1, weeks + 1):
        for day in range(3):  # 3 posts per week
            entry = {
                "week": week,
                "day": ["Monday", "Wednesday", "Friday"][day],
                "content_type": post_types[(week + day) % len(post_types)],
            }
            
            if "social" in channels:
                entry["social"] = platforms["social"]
            if "email" in channels and week >= 3:
                entry["email"] = "Campaign email"
                
            calendar.append(entry)
    
    return calendar

def create_reminders(campaign: dict) -> list:
    """Generate reminder tasks for Apple Reminders."""
    reminders = []
    
    # Phase reminders
    for phase in campaign["phases"]:
        reminders.append({
            "title": f"Campaign Phase: {phase['name']}",
            "notes": "\n".join([f"- {g}" for g in phase["goals"]]),
            "due": calculate_due_date(campaign["timeline"]["start"], phase["name"])
        })
    
    # Launch day
    reminders.append({
        "title": f"🚀 LAUNCH DAY: {campaign['name']}",
        "notes": "Execute full campaign. Monitor metrics hourly.",
        "due": campaign["timeline"]["launch"]
    })
    
    # Week 1 review
    review_date = datetime.strptime(campaign["timeline"]["launch"], "%Y-%m-%d") + timedelta(days=7)
    reminders.append({
        "title": "Campaign Week 1 Review",
        "notes": "Check KPIs, engagement rates, adjust strategy",
        "due": review_date.strftime("%Y-%m-%d")
    })
    
    return reminders

def calculate_due_date(start: str, phase_name: str) -> str:
    """Calculate due date based on phase."""
    start_date = datetime.strptime(start, "%Y-%m-%d")
    
    if "Pre-Launch" in phase_name:
        return (start_date + timedelta(weeks=2)).strftime("%Y-%m-%d")
    elif "Soft" in phase_name:
        return (start_date + timedelta(weeks=3)).strftime("%Y-%m-%d")
    else:
        return (start_date + timedelta(weeks=4)).strftime("%Y-%m-%d")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: campaign_builder.py 'campaign description'")
        sys.exit(1)
    
    brief = " ".join(sys.argv[1:])
    campaign = generate_campaign(brief)
    reminders = create_reminders(campaign)
    
    print(json.dumps({"campaign": campaign, "reminders": reminders}, indent=2))
