"""
CRM API Tests
Run with: python -m pytest test_api.py -v --cov=. --cov-report=term-missing
"""
import pytest
import os
import sys
import tempfile
import shutil

# Test database path
TEST_DB = None

def setup_module(module):
    """Create temp directory for test database."""
    global TEST_DB
    TEST_DB = os.path.join(tempfile.gettempdir(), "test_crm.db")
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def teardown_module(module):
    """Clean up test database."""
    global TEST_DB
    if TEST_DB and os.path.exists(TEST_DB):
        os.remove(TEST_DB)

# Import after setting up
from database import init_db, get_lead, get_all_leads, create_lead, update_lead, delete_lead, move_stage, add_activity, get_activities, get_pipeline, get_stats, export_csv, STAGES, ACTIVITY_TYPES, get_db
import database as db

@pytest.fixture(autouse=True)
def fresh_db():
    """Reset database before each test."""
    global TEST_DB
    # Remove existing test db
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    # Re-init
    db.init_db()
    yield
    # Cleanup after
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


# ============ DATABASE TESTS ============

class TestDatabaseInit:
    """Test database initialization."""
    
    def test_init_db_creates_tables(self):
        """Database initializes without error."""
        db.init_db()  # Should not raise
        conn = db.get_db()
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        assert 'leads' in tables
        assert 'activities' in tables
    
    def test_stages_constant(self):
        """STAGES constant is defined."""
        assert STAGES == ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won']
    
    def test_activity_types_constant(self):
        """ACTIVITY_TYPES constant is defined."""
        assert 'call' in ACTIVITY_TYPES
        assert 'email' in ACTIVITY_TYPES
        assert 'meeting' in ACTIVITY_TYPES
        assert 'note' in ACTIVITY_TYPES


class TestLeadOperations:
    """Test lead CRUD operations."""
    
    def test_create_lead_minimal(self):
        """Can create a lead with just name."""
        lead_id = db.create_lead(name="Test User")
        assert lead_id == 1
        lead = db.get_lead(lead_id)
        assert lead['name'] == "Test User"
        assert lead['stage'] == "new"
    
    def test_create_lead_full(self):
        """Can create a lead with all fields."""
        lead_id = db.create_lead(
            name="Full Lead",
            company="Test Corp",
            email="test@test.com",
            phone="555-0123",
            source="LinkedIn",
            value=50000,
            stage="qualified",
            notes="Test notes"
        )
        assert lead_id == 1
        lead = db.get_lead(lead_id)
        assert lead['name'] == "Full Lead"
        assert lead['company'] == "Test Corp"
        assert lead['email'] == "test@test.com"
        assert lead['phone'] == "555-0123"
        assert lead['source'] == "LinkedIn"
        assert lead['value'] == 50000
        assert lead['stage'] == "qualified"
        assert lead['notes'] == "Test notes"
    
    def test_create_lead_multiple(self):
        """Can create multiple leads."""
        id1 = db.create_lead(name="Lead 1")
        id2 = db.create_lead(name="Lead 2")
        assert id2 == id1 + 1
    
    def test_get_lead_found(self):
        """Can retrieve existing lead."""
        db.create_lead(name="Find Me")
        lead = db.get_lead(1)
        assert lead is not None
        assert lead['name'] == "Find Me"
    
    def test_get_lead_not_found(self):
        """Returns None for non-existent lead."""
        lead = db.get_lead(9999)
        assert lead is None
    
    def test_get_all_leads_empty(self):
        """Returns empty list when no leads."""
        leads = db.get_all_leads()
        assert leads == []
    
    def test_get_all_leads_multiple(self):
        """Returns all leads."""
        db.create_lead(name="Lead 1")
        db.create_lead(name="Lead 2")
        leads = db.get_all_leads()
        assert len(leads) == 2
    
    def test_get_all_leads_filter_stage(self):
        """Can filter by stage."""
        db.create_lead(name="New Lead", stage="new")
        db.create_lead(name="Contacted Lead", stage="contacted")
        
        new_leads = db.get_all_leads(stage="new")
        assert len(new_leads) == 1
        assert new_leads[0]['name'] == "New Lead"
    
    def test_get_all_leads_filter_none(self):
        """Filter with no matches returns empty."""
        db.create_lead(name="Lead", stage="new")
        leads = db.get_all_leads(stage="won")
        assert leads == []
    
    def test_get_all_leads_search_name(self):
        """Can search by name."""
        db.create_lead(name="John Doe")
        db.create_lead(name="Jane Smith")
        
        results = db.get_all_leads(search="john")
        assert len(results) == 1
        assert results[0]['name'] == "John Doe"
    
    def test_get_all_leads_search_company(self):
        """Can search by company."""
        db.create_lead(name="Person 1", company="Acme Corp")
        db.create_lead(name="Person 2", company="Tech Inc")
        
        results = db.get_all_leads(search="acme")
        assert len(results) == 1
        assert results[0]['company'] == "Acme Corp"
    
    def test_get_all_leads_search_email(self):
        """Can search by email."""
        db.create_lead(name="Person 1", email="john@acme.com")
        db.create_lead(name="Person 2", email="jane@tech.com")
        
        results = db.get_all_leads(search="acme")
        assert len(results) == 1
    
    def test_update_lead_single_field(self):
        """Can update single field."""
        db.create_lead(name="Original")
        db.update_lead(1, name="Updated")
        lead = db.get_lead(1)
        assert lead['name'] == "Updated"
    
    def test_update_lead_multiple_fields(self):
        """Can update multiple fields."""
        db.create_lead(name="Original")
        db.update_lead(1, name="New Name", company="New Co", value=999)
        lead = db.get_lead(1)
        assert lead['name'] == "New Name"
        assert lead['company'] == "New Co"
        assert lead['value'] == 999
    
    def test_update_lead_ignores_invalid_fields(self):
        """Ignores fields not in allowed list."""
        db.create_lead(name="Original")
        db.update_lead(1, invalid_field="Should be ignored", name="Updated")
        lead = db.get_lead(1)
        assert lead['name'] == "Updated"
    
    def test_update_lead_not_found(self):
        """Update non-existent returns False."""
        result = db.update_lead(9999, name="Test")
        assert result is False
    
    def test_delete_lead(self):
        """Can delete lead."""
        db.create_lead(name="To Delete")
        result = db.delete_lead(1)
        assert result is True
        assert db.get_lead(1) is None
    
    def test_delete_lead_cascades_activities(self):
        """Deleting lead removes activities."""
        db.create_lead(name="Lead")
        db.add_activity(1, "call", "Test")
        db.delete_lead(1)
        conn = db.get_db()
        cursor = conn.execute("SELECT COUNT(*) FROM activities WHERE lead_id = 1")
        count = cursor.fetchone()[0]
        conn.close()
        assert count == 0


class TestStageOperations:
    """Test stage movement."""
    
    def test_move_stage_valid(self):
        """Can move to valid stage."""
        db.create_lead(name="Lead")
        result = db.move_stage(1, "contacted")
        assert result is True
        assert db.get_lead(1)['stage'] == "contacted"
    
    def test_move_stage_invalid(self):
        """Invalid stage returns False."""
        db.create_lead(name="Lead")
        result = db.move_stage(1, "invalid")
        assert result is False
    
    def test_move_stage_updates_timestamp(self):
        """Moving stage updates last_contacted."""
        db.create_lead(name="Lead")
        original = db.get_lead(1)['last_contacted']
        db.move_stage(1, "contacted")
        updated = db.get_lead(1)['last_contacted']
        assert updated is not None
    
    def test_move_stage_logs_activity(self):
        """Moving stage creates activity."""
        db.create_lead(name="Lead")
        db.move_stage(1, "qualified")
        activities = db.get_activities(lead_id=1, days=365)
        stage_changes = [a for a in activities if a['type'] == 'stage_change']
        assert len(stage_changes) >= 1


class TestActivityOperations:
    """Test activity logging."""
    
    def test_add_activity_call(self):
        """Can log a call."""
        db.create_lead(name="Lead")
        activity_id = db.add_activity(1, "call", "Discovery call")
        assert activity_id is not None
        activities = db.get_activities(lead_id=1, days=365)
        assert len(activities) == 1
        assert activities[0]['type'] == "call"
        assert activities[0]['description'] == "Discovery call"
    
    def test_add_activity_email(self):
        """Can log an email."""
        db.create_lead(name="Lead")
        db.add_activity(1, "email", "Sent proposal")
        activities = db.get_activities(lead_id=1, days=365)
        assert activities[0]['type'] == "email"
    
    def test_add_activity_meeting(self):
        """Can log a meeting."""
        db.create_lead(name="Lead")
        db.add_activity(1, "meeting", "On-site visit")
        activities = db.get_activities(lead_id=1, days=365)
        assert activities[0]['type'] == "meeting"
    
    def test_add_activity_note(self):
        """Can log a note."""
        db.create_lead(name="Lead")
        db.add_activity(1, "note", "General note")
        activities = db.get_activities(lead_id=1, days=365)
        assert activities[0]['type'] == "note"
    
    def test_add_activity_invalid_type_defaults_to_note(self):
        """Invalid type becomes 'note'."""
        db.create_lead(name="Lead")
        db.add_activity(1, "invalid_type", "Test")
        activities = db.get_activities(lead_id=1, days=365)
        assert activities[0]['type'] == "note"
    
    def test_get_activities_for_lead(self):
        """Can get activities for specific lead."""
        db.create_lead(name="Lead 1")
        db.create_lead(name="Lead 2")
        db.add_activity(1, "call", "For Lead 1")
        db.add_activity(2, "call", "For Lead 2")
        
        activities1 = db.get_activities(lead_id=1, days=365)
        assert len(activities1) == 1
        assert activities1[0]['description'] == "For Lead 1"
    
    def test_get_activities_all_leads(self):
        """Can get activities across all leads."""
        db.create_lead(name="Lead 1")
        db.create_lead(name="Lead 2")
        db.add_activity(1, "call", "Call 1")
        db.add_activity(2, "call", "Call 2")
        
        activities = db.get_activities(days=365)
        assert len(activities) == 2
    
    def test_get_activities_includes_lead_info(self):
        """Activities include lead name and company."""
        db.create_lead(name="Test Lead", company="Test Corp")
        db.add_activity(1, "call", "Test")
        
        activities = db.get_activities(lead_id=1, days=365)
        assert activities[0]['lead_name'] == "Test Lead"
        assert activities[0]['lead_company'] == "Test Corp"


class TestPipelineAndStats:
    """Test pipeline and statistics."""
    
    def test_pipeline_structure(self):
        """Pipeline returns correct structure."""
        pipeline = db.get_pipeline()
        assert 'stages' in pipeline
        assert 'totals' in pipeline
        assert len(pipeline['stages']) == 6
    
    def test_pipeline_stage_names(self):
        """Pipeline has correct stage names."""
        pipeline = db.get_pipeline()
        stage_ids = [s['id'] for s in pipeline['stages']]
        assert stage_ids == STAGES
    
    def test_pipeline_empty(self):
        """Empty pipeline shows zeros."""
        pipeline = db.get_pipeline()
        for stage in pipeline['stages']:
            assert stage['count'] == 0
            assert stage['value'] == 0
        assert pipeline['totals']['leads'] == 0
        assert pipeline['totals']['value'] == 0
    
    def test_pipeline_with_leads(self):
        """Pipeline calculates correctly with leads."""
        db.create_lead(name="Lead 1", stage="new", value=10000)
        db.create_lead(name="Lead 2", stage="new", value=20000)
        db.create_lead(name="Lead 3", stage="contacted", value=15000)
        
        pipeline = db.get_pipeline()
        
        new_stage = next(s for s in pipeline['stages'] if s['id'] == 'new')
        assert new_stage['count'] == 2
        assert new_stage['value'] == 30000
        
        contacted_stage = next(s for s in pipeline['stages'] if s['id'] == 'contacted')
        assert contacted_stage['count'] == 1
        
        assert pipeline['totals']['leads'] == 3
        assert pipeline['totals']['value'] == 45000
    
    def test_stats_structure(self):
        """Stats returns correct structure."""
        stats = db.get_stats()
        assert 'total_leads' in stats
        assert 'total_value' in stats
        assert 'won_value' in stats
        assert 'won_count' in stats
        assert 'avg_deal_size' in stats
        assert 'conversion_rate' in stats
    
    def test_stats_empty(self):
        """Stats with no leads shows zeros."""
        stats = db.get_stats()
        assert stats['total_leads'] == 0
        assert stats['total_value'] == 0
        assert stats['won_value'] == 0
        assert stats['won_count'] == 0
        assert stats['avg_deal_size'] == 0
    
    def test_stats_with_won_leads(self):
        """Stats calculate won correctly."""
        db.create_lead(name="Won 1", stage="won", value=50000)
        db.create_lead(name="Won 2", stage="won", value=30000)
        db.create_lead(name="Lost", stage="lost", value=10000)
        db.create_lead(name="Active", stage="qualified", value=20000)
        
        stats = db.get_stats()
        assert stats['total_leads'] == 4
        assert stats['total_value'] == 110000
        assert stats['won_value'] == 80000
        assert stats['won_count'] == 2
    
    def test_stats_avg_deal_size(self):
        """Avg deal size calculated correctly."""
        db.create_lead(name="L1", value=10000)
        db.create_lead(name="L2", value=30000)
        db.create_lead(name="L3", value=50000)
        
        stats = db.get_stats()
        assert stats['avg_deal_size'] == 30000


class TestExport:
    """Test CSV export."""
    
    def test_export_csv_headers(self):
        """CSV has correct headers."""
        csv = db.export_csv()
        headers = csv.split('\n')[0]
        assert 'ID' in headers
        assert 'Name' in headers
        assert 'Company' in headers
        assert 'Email' in headers
        assert 'Stage' in headers
        assert 'Value' in headers
    
    def test_export_csv_with_data(self):
        """CSV exports lead data."""
        db.create_lead(name="Export Me", company="Test Corp", value=10000)
        csv = db.export_csv()
        assert 'Export Me' in csv
        assert 'Test Corp' in csv


# ============ API TESTS ============

from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

class TestAPIHealth:
    """Test health and info endpoints."""
    
    def test_health_endpoint(self):
        """Health returns ok status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert 'time' in data
    
    def test_skill_md_endpoint(self):
        """Skill.md is served."""
        response = client.get("/.well-known/skill.md")
        assert response.status_code == 200


class TestAPILeads:
    """Test lead endpoints."""
    
    def test_list_leads_empty(self):
        """List leads when empty."""
        response = client.get("/api/leads")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_leads_with_data(self):
        """List returns all leads."""
        client.post("/api/leads", json={"name": "Lead 1"})
        client.post("/api/leads", json={"name": "Lead 2"})
        
        response = client.get("/api/leads")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_list_leads_filter_stage(self):
        """List can filter by stage."""
        client.post("/api/leads", json={"name": "New", "stage": "new"})
        client.post("/api/leads", json={"name": "Contacted", "stage": "contacted"})
        
        response = client.get("/api/leads?stage=new")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]['name'] == 'New'
    
    def test_list_leads_search(self):
        """List can search."""
        client.post("/api/leads", json={"name": "John Doe"})
        client.post("/api/leads", json={"name": "Jane Smith"})
        
        response = client.get("/api/leads?search=john")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]['name'] == 'John Doe'
    
    def test_create_lead_minimal(self):
        """Create with minimal data."""
        response = client.post("/api/leads", json={"name": "Minimal"})
        assert response.status_code == 201
        data = response.json()
        assert data['success'] is True
        assert data['id'] == 1
    
    def test_create_lead_full(self):
        """Create with all fields."""
        response = client.post("/api/leads", json={
            "name": "Full Lead",
            "company": "Corp",
            "email": "test@test.com",
            "phone": "555-0100",
            "source": "LinkedIn",
            "value": 50000,
            "stage": "qualified",
            "notes": "Test notes"
        })
        assert response.status_code == 201
        data = response.json()
        assert data['success'] is True
    
    def test_create_lead_logged(self):
        """Created lead has activity logged."""
        client.post("/api/leads", json={"name": "Test"})
        
        response = client.get("/api/leads/1/activities")
        activities = response.json()
        assert len(activities) >= 1
    
    def test_get_lead_found(self):
        """Get existing lead."""
        client.post("/api/leads", json={"name": "Find Me"})
        response = client.get("/api/leads/1")
        assert response.status_code == 200
        assert response.json()['name'] == 'Find Me'
    
    def test_get_lead_not_found(self):
        """Get non-existent returns 404."""
        response = client.get("/api/leads/9999")
        assert response.status_code == 404
    
    def test_update_lead(self):
        """Update existing lead."""
        client.post("/api/leads", json={"name": "Original"})
        
        response = client.put("/api/leads/1", json={"name": "Updated"})
        assert response.status_code == 200
        assert response.json()['success'] is True
        
        get_response = client.get("/api/leads/1")
        assert get_response.json()['name'] == 'Updated'
    
    def test_update_lead_not_found(self):
        """Update non-existent returns 404."""
        response = client.put("/api/leads/9999", json={"name": "Test"})
        assert response.status_code == 404
    
    def test_delete_lead(self):
        """Delete existing lead."""
        client.post("/api/leads", json={"name": "Delete Me"})
        
        response = client.delete("/api/leads/1")
        assert response.status_code == 200
        
        get_response = client.get("/api/leads/1")
        assert get_response.status_code == 404
    
    def test_delete_lead_not_found(self):
        """Delete non-existent returns 404."""
        response = client.delete("/api/leads/9999")
        assert response.status_code == 404


class TestAPIStage:
    """Test stage movement endpoint."""
    
    def test_move_stage(self):
        """Can move stage."""
        client.post("/api/leads", json={"name": "Test"})
        
        response = client.post("/api/leads/1/stage", json={"stage": "contacted"})
        assert response.status_code == 200
        
        get_response = client.get("/api/leads/1")
        assert get_response.json()['stage'] == 'contacted'
    
    def test_move_stage_invalid(self):
        """Invalid stage returns 400."""
        client.post("/api/leads", json={"name": "Test"})
        
        response = client.post("/api/leads/1/stage", json={"stage": "invalid"})
        assert response.status_code == 400
    
    def test_move_stage_not_found(self):
        """Non-existent lead returns 404."""
        response = client.post("/api/leads/9999/stage", json={"stage": "new"})
        assert response.status_code == 404


class TestAPIActivity:
    """Test activity endpoints."""
    
    def test_log_activity(self):
        """Can log activity."""
        client.post("/api/leads", json={"name": "Test"})
        
        response = client.post("/api/leads/1/activity", json={
            "type": "call",
            "description": "Discovery call"
        })
        assert response.status_code == 200
    
    def test_get_activities(self):
        """Can get lead activities."""
        client.post("/api/leads", json={"name": "Test"})
        client.post("/api/leads/1/activity", json={"type": "call", "description": "Test"})
        
        response = client.get("/api/leads/1/activities")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
    
    def test_log_activity_not_found(self):
        """Log activity for non-existent lead returns 404."""
        response = client.post("/api/leads/9999/activity", json={"type": "call"})
        assert response.status_code == 404


class TestAPIPipelineStats:
    """Test pipeline and stats endpoints."""
    
    def test_pipeline(self):
        """Pipeline endpoint works."""
        client.post("/api/leads", json={"name": "L1", "stage": "new", "value": 10000})
        
        response = client.get("/api/pipeline")
        assert response.status_code == 200
        data = response.json()
        assert 'stages' in data
        assert 'totals' in data
    
    def test_stats(self):
        """Stats endpoint works."""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert 'total_leads' in data
    
    def test_activities(self):
        """Activities endpoint works."""
        response = client.get("/api/activities?days=7")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestAPIStatic:
    """Test static file serving."""
    
    def test_root_returns_html(self):
        """Root serves HTML."""
        response = client.get("/")
        assert response.status_code == 200
        assert 'CRM' in response.text
    
    def test_css_served(self):
        """CSS file is served."""
        response = client.get("/app.css")
        assert response.status_code == 200
        assert '.header' in response.text or 'header' in response.text.lower()
    
    def test_js_served(self):
        """JS file is served."""
        response = client.get("/app.js")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
