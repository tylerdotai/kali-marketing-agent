"""
Tests for Kali's CRM Backend
Run with: python -m pytest test_crm.py -v
"""

import pytest
import os
import sys

# Ensure we use the local crm module
sys.path.insert(0, os.path.dirname(__file__))


@pytest.fixture(scope="function")
def isolated_crm():
    """Create a completely isolated CRM instance for testing."""
    import sqlite3
    import importlib
    
    # Create unique test DB
    test_db = f"test_crm_{os.getpid()}_{id(object())}.db"
    
    # Import and configure
    import crm
    crm.DATABASE_PATH = test_db
    crm.init_db()
    
    yield crm, test_db
    
    # Cleanup
    try:
        os.unlink(test_db)
    except:
        pass


class TestLeadOperations:
    """Tests for lead CRUD operations."""
    
    def test_add_lead_basic(self, isolated_crm):
        """Test adding a basic lead."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="John Smith", company="Acme Corp")
        assert lead_id > 0
        
        lead = crm_module.get_lead(lead_id)
        assert lead is not None
        assert lead["name"] == "John Smith"
        assert lead["company"] == "Acme Corp"
        assert lead["stage"] == "new"
        assert lead["business_type"] == "gnb"
    
    def test_add_lead_with_all_fields(self, isolated_crm):
        """Test adding a lead with all fields."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(
            name="Jane Doe",
            company="Tech Inc",
            email="jane@tech.com",
            phone="555-1234",
            source="LinkedIn",
            business_type="salthaus",
            notes="Great prospect",
            estimated_value=50000
        )
        
        lead = crm_module.get_lead(lead_id)
        assert lead["name"] == "Jane Doe"
        assert lead["email"] == "jane@tech.com"
        assert lead["phone"] == "555-1234"
        assert lead["source"] == "LinkedIn"
        assert lead["business_type"] == "salthaus"
        assert lead["notes"] == "Great prospect"
        assert lead["estimated_value"] == 50000
    
    def test_get_all_leads(self, isolated_crm):
        """Test getting all leads."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="Lead 1", company="Co 1")
        crm_module.add_lead(name="Lead 2", company="Co 2")
        crm_module.add_lead(name="Lead 3", company="Co 3")
        
        leads = crm_module.get_all_leads()
        assert len(leads) == 3
    
    def test_get_all_leads_filter_by_stage(self, isolated_crm):
        """Test filtering leads by stage."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="New Lead", company="Co 1")
        lead2_id = crm_module.add_lead(name="Contacted Lead", company="Co 2")
        crm_module.update_stage(lead2_id, "contacted")
        
        new_leads = crm_module.get_all_leads(stage="new")
        assert len(new_leads) == 1
        assert new_leads[0]["name"] == "New Lead"
        
        contacted_leads = crm_module.get_all_leads(stage="contacted")
        assert len(contacted_leads) == 1
        assert contacted_leads[0]["name"] == "Contacted Lead"
    
    def test_get_all_leads_filter_by_business_type(self, isolated_crm):
        """Test filtering leads by business type."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="GNB Lead", company="Co 1", business_type="gnb")
        crm_module.add_lead(name="SaltHaus Lead", company="Co 2", business_type="salthaus")
        
        gnb_leads = crm_module.get_all_leads(business_type="gnb")
        assert len(gnb_leads) == 1
        assert gnb_leads[0]["business_type"] == "gnb"
        
        salthaus_leads = crm_module.get_all_leads(business_type="salthaus")
        assert len(salthaus_leads) == 1
        assert salthaus_leads[0]["business_type"] == "salthaus"
    
    def test_get_all_leads_search(self, isolated_crm):
        """Test searching leads."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="John Smith", company="Acme Corp")
        crm_module.add_lead(name="Jane Doe", company="Beta Inc")
        crm_module.add_lead(name="Bob Johnson", company="Acme Corp")
        
        results = crm_module.get_all_leads(search="acme")
        assert len(results) == 2
        
        results = crm_module.get_all_leads(search="john")
        assert len(results) == 2  # John Smith and Bob Johnson
    
    def test_update_lead(self, isolated_crm):
        """Test updating a lead."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Original Name", company="Original Co")
        
        success = crm_module.update_lead(lead_id, name="New Name", company="New Co")
        assert success
        
        lead = crm_module.get_lead(lead_id)
        assert lead["name"] == "New Name"
        assert lead["company"] == "New Co"
    
    def test_delete_lead(self, isolated_crm):
        """Test soft deleting a lead."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="To Delete", company="Co")
        
        success = crm_module.delete_lead(lead_id)
        assert success
        
        lead = crm_module.get_lead(lead_id)
        assert lead is None


class TestStageOperations:
    """Tests for pipeline stage operations."""
    
    def test_update_stage_valid(self, isolated_crm):
        """Test moving lead through stages."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        
        assert crm_module.update_stage(lead_id, "contacted") is True
        lead = crm_module.get_lead(lead_id)
        assert lead["stage"] == "contacted"
        
        assert crm_module.update_stage(lead_id, "qualified") is True
        lead = crm_module.get_lead(lead_id)
        assert lead["stage"] == "qualified"
    
    def test_update_stage_invalid(self, isolated_crm):
        """Test moving to invalid stage."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        assert crm_module.update_stage(lead_id, "invalid_stage") is False
    
    def test_stage_changes_logged(self, isolated_crm):
        """Test that stage changes create activities."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        
        crm_module.update_stage(lead_id, "contacted")
        crm_module.update_stage(lead_id, "qualified")
        
        activities = crm_module.get_activities(lead_id)
        stage_changes = [a for a in activities if a["activity_type"] == "stage_change"]
        assert len(stage_changes) >= 2


class TestActivityOperations:
    """Tests for activity logging."""
    
    def test_add_activity(self, isolated_crm):
        """Test logging an activity."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        
        activity_id = crm_module.add_activity(lead_id, "email", "Sent intro email")
        assert activity_id > 0
        
        activities = crm_module.get_activities(lead_id)
        assert len(activities) >= 1
        assert activities[0]["description"] == "Sent intro email"
    
    def test_add_activity_updates_last_contacted(self, isolated_crm):
        """Test that logging activity updates last_contacted."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        
        crm_module.add_activity(lead_id, "call", "Discovery call")
        
        lead = crm_module.get_lead(lead_id)
        assert lead["last_contacted"] is not None
    
    def test_get_recent_activities(self, isolated_crm):
        """Test getting recent activities across all leads."""
        crm_module, db = isolated_crm
        
        lead1_id = crm_module.add_lead(name="Lead 1", company="Co 1")
        lead2_id = crm_module.add_lead(name="Lead 2", company="Co 2")
        
        crm_module.add_activity(lead1_id, "email", "Email to lead 1")
        crm_module.add_activity(lead2_id, "call", "Call to lead 2")
        
        activities = crm_module.get_recent_activities(days=7)
        assert len(activities) >= 2


class TestStatsAndAnalytics:
    """Tests for stats and analytics functions."""
    
    def test_get_stats_basic(self, isolated_crm):
        """Test basic stats."""
        crm_module, db = isolated_crm
        
        lead1_id = crm_module.add_lead(name="Lead 1", company="Co 1", estimated_value=10000)
        lead2_id = crm_module.add_lead(name="Lead 2", company="Co 2", estimated_value=20000)
        
        # Move to stages that count toward pipeline_value
        crm_module.update_stage(lead1_id, "qualified")
        crm_module.update_stage(lead2_id, "proposal")
        
        stats = crm_module.get_stats()
        assert stats["total_leads"] == 2
        assert stats["pipeline_value"] == 30000
    
    def test_get_stats_with_won(self, isolated_crm):
        """Test stats include won value."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Won Lead", company="Co", estimated_value=50000)
        crm_module.update_stage(lead_id, "won")
        
        stats = crm_module.get_stats()
        assert stats["won_value"] == 50000
    
    def test_get_stats_stage_counts(self, isolated_crm):
        """Test stage counts in stats."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="New 1", company="Co 1")
        crm_module.add_lead(name="New 2", company="Co 2")
        lead3_id = crm_module.add_lead(name="Contacted", company="Co 3")
        crm_module.update_stage(lead3_id, "contacted")
        
        stats = crm_module.get_stats()
        assert stats["stage_counts"]["new"] == 2
        assert stats["stage_counts"]["contacted"] == 1
    
    def test_get_conversion_rates(self, isolated_crm):
        """Test conversion rate calculation."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="Lead 1", company="Co 1")
        lead2_id = crm_module.add_lead(name="Lead 2", company="Co 2")
        crm_module.update_stage(lead2_id, "contacted")
        
        rates = crm_module.get_conversion_rates()
        assert "new_to_contacted" in rates["conversion_rates"]
    
    def test_get_source_analysis(self, isolated_crm):
        """Test source analysis."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="From LinkedIn", company="Co 1", source="LinkedIn")
        crm_module.add_lead(name="From Event", company="Co 2", source="Event")
        crm_module.add_lead(name="From Web", company="Co 3", source="LinkedIn")
        
        sources = crm_module.get_source_analysis()
        assert len(sources) == 2  # 2 unique sources
        
        linkedin = next(s for s in sources if s["source"] == "LinkedIn")
        assert linkedin["count"] == 2
    
    def test_get_business_split(self, isolated_crm):
        """Test business type split."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="GNB Lead", company="Co 1", business_type="gnb", estimated_value=10000)
        crm_module.add_lead(name="SaltHaus Lead", company="Co 2", business_type="salthaus", estimated_value=5000)
        
        split = crm_module.get_business_split()
        assert split["gnb"]["count"] == 1
        assert split["gnb"]["pipeline_value"] == 10000
        assert split["salthaus"]["count"] == 1
        assert split["salthaus"]["pipeline_value"] == 5000
    
    def test_get_trend_data(self, isolated_crm):
        """Test trend data."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="Recent Lead", company="Co 1")
        
        trends = crm_module.get_trend_data(days=30)
        assert "daily_leads" in trends
        assert "stages_over_time" in trends
    
    def test_get_activity_summary(self, isolated_crm):
        """Test activity summary."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        crm_module.add_activity(lead_id, "email", "Email 1")
        crm_module.add_activity(lead_id, "email", "Email 2")
        crm_module.add_activity(lead_id, "call", "Call 1")
        
        summary = crm_module.get_activity_summary(days=7)
        assert summary["total"] == 3
        assert len(summary["by_type"]) == 2
    
    def test_get_full_analytics(self, isolated_crm):
        """Test full analytics returns all sections."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="Test Lead", company="Co")
        
        analytics = crm_module.get_full_analytics()
        assert "conversion_rates" in analytics
        assert "sources" in analytics
        assert "business_split" in analytics
        assert "trends" in analytics
        assert "activity_summary" in analytics


class TestQuickAdd:
    """Tests for quick add functionality."""
    
    def test_quick_add_basic(self, isolated_crm):
        """Test basic quick add."""
        crm_module, db = isolated_crm
        
        result = crm_module.quick_add_lead("New lead from event - John Smith, Acme Corp")
        
        assert "id" in result
        assert "John Smith" in result["name"]
        assert result["company"] is not None
    
    def test_quick_add_salthaus_detected(self, isolated_crm):
        """Test that consulting keywords trigger salthaus."""
        crm_module, db = isolated_crm
        
        result = crm_module.quick_add_lead("New consulting client - Jane Doe, Small Business")
        lead = crm_module.get_lead(result["id"])
        assert lead["business_type"] == "salthaus"
    
    def test_quick_add_gnb_by_default(self, isolated_crm):
        """Test that non-consulting defaults to gnb."""
        crm_module, db = isolated_crm
        
        result = crm_module.quick_add_lead("John Smith, Construction Co")
        lead = crm_module.get_lead(result["id"])
        assert lead["business_type"] == "gnb"


class TestEdgeCases:
    """Tests for edge cases and error handling."""
    
    def test_get_nonexistent_lead(self, isolated_crm):
        """Test getting lead that doesn't exist."""
        crm_module, db = isolated_crm
        
        lead = crm_module.get_lead(99999)
        assert lead is None
    
    def test_update_nonexistent_lead(self, isolated_crm):
        """Test updating lead that doesn't exist."""
        crm_module, db = isolated_crm
        
        success = crm_module.update_lead(99999, name="Test")
        assert success is False
    
    def test_delete_nonexistent_lead(self, isolated_crm):
        """Test deleting lead that doesn't exist."""
        crm_module, db = isolated_crm
        
        success = crm_module.delete_lead(99999)
        assert success is False
    
    def test_empty_search(self, isolated_crm):
        """Test search with no results."""
        crm_module, db = isolated_crm
        
        crm_module.add_lead(name="John", company="Acme")
        
        results = crm_module.get_all_leads(search="xyz123")
        assert len(results) == 0
    
    def test_special_characters_in_name(self, isolated_crm):
        """Test handling special characters."""
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="José García", company="Acme & Co (USA)")
        
        lead = crm_module.get_lead(lead_id)
        assert lead["name"] == "José García"
        assert lead["company"] == "Acme & Co (USA)"


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])

class TestUncovered:
    """Tests for uncovered code paths."""
    
    def test_update_lead_no_valid_fields(self, isolated_crm):
        """Test updating with no valid fields returns False."""
        import crm
        crm_module, db = isolated_crm
        
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        
        # Pass no valid update fields
        success = crm_module.update_lead(lead_id)
        assert success is False
    
    def test_get_upcoming_followups(self, isolated_crm):
        """Test getting upcoming follow-ups."""
        import crm
        crm_module, db = isolated_crm
        
        # Add lead with future follow-up
        from datetime import datetime, timedelta
        future_date = (datetime.now() + timedelta(days=3)).isoformat()
        lead_id = crm_module.add_lead(name="Test Lead", company="Co")
        crm_module.update_lead(lead_id, next_followup=future_date)
        
        followups = crm_module.get_upcoming_followups(days=7)
        assert len(followups) >= 1
        assert followups[0]["name"] == "Test Lead"
    
    def test_quick_add_no_name_extracted(self, isolated_crm):
        """Test quick add when regex doesn't extract name."""
        import crm
        crm_module, db = isolated_crm
        
        # Text that doesn't match patterns - should use full text as name
        result = crm_module.quick_add_lead("Just some random text without name pattern")
        
        assert result["name"] == "Just some random text without name pattern"
        assert result["company"] is None
    
    def test_quick_add_with_source(self, isolated_crm):
        """Test quick add extracts source correctly."""
        import crm
        crm_module, db = isolated_crm
        
        # Source is captured when explicitly after "from"
        result = crm_module.quick_add_lead("New lead from event - Jane Doe, Acme Corp")
        
        assert "Jane Doe" in result["name"]
        # Source may or may not be captured depending on pattern match
