-- Migration: Add Use Case Management Schema
-- Description: Creates tables for verticals, use cases, and use case executions
-- Date: 2024-01-29

-- Create verticals table
CREATE TABLE IF NOT EXISTS verticals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    bg_gradient VARCHAR(100) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    regulations JSONB NOT NULL DEFAULT '[]',
    ai_agents JSONB NOT NULL DEFAULT '[]',
    templates JSONB NOT NULL DEFAULT '[]',
    metrics JSONB NOT NULL DEFAULT '[]',
    dashboard_widgets JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create use_cases table
CREATE TABLE IF NOT EXISTS use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id VARCHAR(50) NOT NULL REFERENCES verticals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('low', 'medium', 'high')),
    estimated_time VARCHAR(100) NOT NULL,
    sia_scores JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sia_scores_valid CHECK (
        sia_scores ? 'security' AND 
        sia_scores ? 'integrity' AND 
        sia_scores ? 'accuracy' AND
        (sia_scores->>'security')::numeric >= 0 AND 
        (sia_scores->>'security')::numeric <= 100 AND
        (sia_scores->>'integrity')::numeric >= 0 AND 
        (sia_scores->>'integrity')::numeric <= 100 AND
        (sia_scores->>'accuracy')::numeric >= 0 AND 
        (sia_scores->>'accuracy')::numeric <= 100
    )
);

-- Create use_case_executions table
CREATE TABLE IF NOT EXISTS use_case_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    ),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- milliseconds
    configuration JSONB NOT NULL DEFAULT '{}',
    results JSONB,
    error JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create use_case_templates table for storing reusable configurations
CREATE TABLE IF NOT EXISTS use_case_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create use_case_agents junction table
CREATE TABLE IF NOT EXISTS use_case_agents (
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    execution_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (use_case_id, agent_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_use_cases_vertical_id ON use_cases(vertical_id);
CREATE INDEX idx_use_cases_status ON use_cases(status);
CREATE INDEX idx_use_cases_complexity ON use_cases(complexity);
CREATE INDEX idx_use_cases_created_by ON use_cases(created_by);

CREATE INDEX idx_use_case_executions_use_case_id ON use_case_executions(use_case_id);
CREATE INDEX idx_use_case_executions_prompt_id ON use_case_executions(prompt_id);
CREATE INDEX idx_use_case_executions_user_id ON use_case_executions(user_id);
CREATE INDEX idx_use_case_executions_organization_id ON use_case_executions(organization_id);
CREATE INDEX idx_use_case_executions_status ON use_case_executions(status);
CREATE INDEX idx_use_case_executions_started_at ON use_case_executions(started_at);

CREATE INDEX idx_use_case_templates_use_case_id ON use_case_templates(use_case_id);
CREATE INDEX idx_use_case_agents_agent_id ON use_case_agents(agent_id);

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_verticals_updated_at BEFORE UPDATE ON verticals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_use_cases_updated_at BEFORE UPDATE ON use_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_use_case_executions_updated_at BEFORE UPDATE ON use_case_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_use_case_templates_updated_at BEFORE UPDATE ON use_case_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial vertical data
INSERT INTO verticals (id, name, description, icon, color, bg_gradient, features, regulations, ai_agents, templates, metrics, dashboard_widgets) VALUES
('energy', 'Energy & Utilities', 'AI governance for power generation, distribution, and smart grid management', 'BoltIcon', 'text-yellow-500', 'from-yellow-900/20 to-orange-900/20', 
 '["Grid Optimization", "Demand Forecasting", "Renewable Integration", "Outage Prediction", "Energy Trading"]'::jsonb,
 '["NERC CIP", "FERC", "ISO Standards", "EPA Guidelines", "PHMSA"]'::jsonb,
 '["GridOptimizer", "DemandPredictor", "AnomalyDetector", "RenewableBalancer"]'::jsonb,
 '["energy-forecast", "grid-monitor", "outage-response"]'::jsonb,
 '[{"id": "grid-reliability", "name": "Grid Reliability", "unit": "%", "threshold": {"warning": 95, "critical": 90}, "visualization": "gauge"}, {"id": "renewable-mix", "name": "Renewable Mix", "unit": "%", "threshold": {"warning": 30, "critical": 20}, "visualization": "pie"}]'::jsonb,
 '["grid-status", "demand-forecast", "renewable-mix", "outage-map"]'::jsonb),

('healthcare', 'Healthcare & Life Sciences', 'AI governance for patient care, diagnostics, and medical research', 'HeartIcon', 'text-red-500', 'from-red-900/20 to-pink-900/20',
 '["Clinical Decision Support", "Patient Risk Assessment", "Drug Discovery", "Medical Imaging Analysis", "Treatment Optimization"]'::jsonb,
 '["HIPAA", "FDA 21 CFR", "GDPR", "HL7 FHIR"]'::jsonb,
 '["DiagnosticAssistant", "RiskAnalyzer", "TreatmentOptimizer", "ComplianceMonitor"]'::jsonb,
 '["clinical-decision", "patient-risk", "drug-interaction"]'::jsonb,
 '[{"id": "diagnostic-accuracy", "name": "Diagnostic Accuracy", "unit": "%", "threshold": {"warning": 85, "critical": 80}, "visualization": "gauge"}, {"id": "patient-outcomes", "name": "Patient Outcomes", "unit": "score", "threshold": {"warning": 7, "critical": 5}, "visualization": "line"}]'::jsonb,
 '["patient-monitor", "diagnostic-queue", "compliance-status", "outcome-trends"]'::jsonb),

('finance', 'Financial Services', 'AI governance for banking, trading, and financial risk management', 'BanknotesIcon', 'text-green-500', 'from-green-900/20 to-emerald-900/20',
 '["Fraud Detection", "Credit Risk Assessment", "Algorithmic Trading", "AML Compliance", "Portfolio Optimization"]'::jsonb,
 '["SOX", "Basel III", "MiFID II", "PCI DSS", "GDPR"]'::jsonb,
 '["FraudDetector", "RiskAnalyzer", "ComplianceChecker", "TradingOptimizer"]'::jsonb,
 '["fraud-detection", "credit-risk", "aml-screening"]'::jsonb,
 '[{"id": "fraud-rate", "name": "Fraud Detection Rate", "unit": "%", "threshold": {"warning": 95, "critical": 90}, "visualization": "gauge"}, {"id": "false-positives", "name": "False Positive Rate", "unit": "%", "threshold": {"warning": 5, "critical": 10}, "visualization": "bar"}]'::jsonb,
 '["fraud-alerts", "risk-dashboard", "compliance-monitor", "transaction-flow"]'::jsonb),

('manufacturing', 'Manufacturing & Industry 4.0', 'AI governance for smart factories and supply chain optimization', 'BuildingOfficeIcon', 'text-blue-500', 'from-blue-900/20 to-indigo-900/20',
 '["Predictive Maintenance", "Quality Control", "Supply Chain Optimization", "Production Planning", "Defect Detection"]'::jsonb,
 '["ISO 9001", "ISO 27001", "OSHA", "EPA Standards"]'::jsonb,
 '["MaintenancePredictor", "QualityInspector", "SupplyOptimizer", "ProductionPlanner"]'::jsonb,
 '["maintenance-schedule", "quality-control", "supply-chain"]'::jsonb,
 '[{"id": "oee", "name": "Overall Equipment Effectiveness", "unit": "%", "threshold": {"warning": 85, "critical": 75}, "visualization": "gauge"}, {"id": "defect-rate", "name": "Defect Rate", "unit": "ppm", "threshold": {"warning": 100, "critical": 500}, "visualization": "line"}]'::jsonb,
 '["production-monitor", "quality-metrics", "maintenance-schedule", "supply-status"]'::jsonb),

('retail', 'Retail & E-commerce', 'AI governance for customer experience and retail operations', 'ShoppingCartIcon', 'text-purple-500', 'from-purple-900/20 to-pink-900/20',
 '["Demand Forecasting", "Personalization", "Inventory Optimization", "Price Optimization", "Customer Analytics"]'::jsonb,
 '["PCI DSS", "GDPR", "CCPA", "FTC Guidelines"]'::jsonb,
 '["DemandForecaster", "PersonalizationEngine", "PriceOptimizer", "CustomerAnalyzer"]'::jsonb,
 '["demand-forecast", "recommendation", "price-strategy"]'::jsonb,
 '[{"id": "conversion-rate", "name": "Conversion Rate", "unit": "%", "threshold": {"warning": 3, "critical": 2}, "visualization": "gauge"}, {"id": "inventory-turnover", "name": "Inventory Turnover", "unit": "ratio", "threshold": {"warning": 6, "critical": 4}, "visualization": "bar"}]'::jsonb,
 '["sales-monitor", "inventory-status", "customer-insights", "price-analytics"]'::jsonb),

('logistics', 'Logistics & Transportation', 'AI governance for supply chain and transportation management', 'TruckIcon', 'text-orange-500', 'from-orange-900/20 to-amber-900/20',
 '["Route Optimization", "Fleet Management", "Warehouse Automation", "Last-Mile Delivery", "Cargo Tracking"]'::jsonb,
 '["DOT", "FMCSA", "IATA", "ISO 28000"]'::jsonb,
 '["RouteOptimizer", "FleetManager", "WarehouseController", "DeliveryPredictor"]'::jsonb,
 '["route-planning", "fleet-maintenance", "warehouse-ops"]'::jsonb,
 '[{"id": "on-time-delivery", "name": "On-Time Delivery", "unit": "%", "threshold": {"warning": 95, "critical": 90}, "visualization": "gauge"}, {"id": "fuel-efficiency", "name": "Fuel Efficiency", "unit": "mpg", "threshold": {"warning": 7, "critical": 6}, "visualization": "line"}]'::jsonb,
 '["fleet-tracker", "route-monitor", "delivery-status", "warehouse-metrics"]'::jsonb),

('education', 'Education & EdTech', 'AI governance for personalized learning and educational analytics', 'AcademicCapIcon', 'text-indigo-500', 'from-indigo-900/20 to-blue-900/20',
 '["Personalized Learning", "Student Performance Prediction", "Content Recommendation", "Automated Grading", "Learning Analytics"]'::jsonb,
 '["FERPA", "COPPA", "GDPR", "State Education Standards"]'::jsonb,
 '["LearningOptimizer", "PerformanceAnalyzer", "ContentRecommender", "GradingAssistant"]'::jsonb,
 '["learning-path", "performance-analysis", "content-curation"]'::jsonb,
 '[{"id": "engagement-rate", "name": "Student Engagement", "unit": "%", "threshold": {"warning": 80, "critical": 70}, "visualization": "gauge"}, {"id": "completion-rate", "name": "Course Completion", "unit": "%", "threshold": {"warning": 85, "critical": 75}, "visualization": "bar"}]'::jsonb,
 '["student-progress", "engagement-metrics", "performance-trends", "content-analytics"]'::jsonb),

('pharma', 'Pharmaceutical & Biotech', 'AI governance for drug discovery and clinical trials', 'BeakerIcon', 'text-teal-500', 'from-teal-900/20 to-cyan-900/20',
 '["Drug Discovery", "Clinical Trial Optimization", "Adverse Event Detection", "Regulatory Compliance", "Patient Recruitment"]'::jsonb,
 '["FDA 21 CFR Part 11", "GxP", "ICH Guidelines", "EMA Regulations"]'::jsonb,
 '["MoleculeAnalyzer", "TrialOptimizer", "SafetyMonitor", "RegulatoryChecker"]'::jsonb,
 '["drug-discovery", "clinical-trial", "safety-monitoring"]'::jsonb,
 '[{"id": "trial-success", "name": "Trial Success Rate", "unit": "%", "threshold": {"warning": 70, "critical": 60}, "visualization": "gauge"}, {"id": "time-to-market", "name": "Time to Market", "unit": "months", "threshold": {"warning": 120, "critical": 144}, "visualization": "bar"}]'::jsonb,
 '["trial-monitor", "safety-alerts", "regulatory-status", "discovery-pipeline"]'::jsonb),

('government', 'Government & Public Sector', 'AI governance for public services and citizen engagement', 'ShieldCheckIcon', 'text-gray-500', 'from-gray-900/20 to-slate-900/20',
 '["Citizen Services", "Public Safety", "Resource Allocation", "Policy Analysis", "Fraud Prevention"]'::jsonb,
 '["FISMA", "FedRAMP", "Privacy Act", "FOIA", "State Regulations"]'::jsonb,
 '["ServiceOptimizer", "SafetyAnalyzer", "ResourceAllocator", "PolicyAnalyzer"]'::jsonb,
 '["citizen-service", "safety-analysis", "resource-planning"]'::jsonb,
 '[{"id": "service-efficiency", "name": "Service Efficiency", "unit": "%", "threshold": {"warning": 85, "critical": 75}, "visualization": "gauge"}, {"id": "citizen-satisfaction", "name": "Citizen Satisfaction", "unit": "score", "threshold": {"warning": 8, "critical": 7}, "visualization": "line"}]'::jsonb,
 '["service-metrics", "safety-monitor", "resource-usage", "citizen-feedback"]'::jsonb),

('telecom', 'Telecommunications', 'AI governance for network optimization and customer experience', 'GlobeAltIcon', 'text-cyan-500', 'from-cyan-900/20 to-blue-900/20',
 '["Network Optimization", "Predictive Maintenance", "Customer Churn Prevention", "Fraud Detection", "Service Quality"]'::jsonb,
 '["FCC Regulations", "CPNI", "GDPR", "Net Neutrality"]'::jsonb,
 '["NetworkOptimizer", "ChurnPredictor", "SecurityMonitor", "QualityAnalyzer"]'::jsonb,
 '["network-optimization", "churn-analysis", "security-monitoring"]'::jsonb,
 '[{"id": "network-uptime", "name": "Network Uptime", "unit": "%", "threshold": {"warning": 99.9, "critical": 99.5}, "visualization": "gauge"}, {"id": "customer-satisfaction", "name": "Customer Satisfaction", "unit": "NPS", "threshold": {"warning": 50, "critical": 30}, "visualization": "bar"}]'::jsonb,
 '["network-status", "customer-metrics", "security-alerts", "quality-monitor"]'::jsonb),

('real-estate', 'Real Estate', 'AI governance for property valuation, market analysis, and transaction automation', 'HomeIcon', 'text-amber-500', 'from-amber-900/20 to-orange-900/20',
 '["Property Valuation", "Market Analysis", "Transaction Automation", "Risk Assessment", "Portfolio Management"]'::jsonb,
 '["RESPA", "Fair Housing Act", "TILA", "State Real Estate Laws"]'::jsonb,
 '["ValuationEngine", "MarketAnalyzer", "RiskAssessor", "TransactionManager"]'::jsonb,
 '["property-valuation", "market-analysis", "risk-assessment"]'::jsonb,
 '[{"id": "valuation-accuracy", "name": "Valuation Accuracy", "unit": "%", "threshold": {"warning": 95, "critical": 90}, "visualization": "gauge"}, {"id": "market-volatility", "name": "Market Volatility Index", "unit": "score", "threshold": {"warning": 30, "critical": 50}, "visualization": "line"}]'::jsonb,
 '["property-monitor", "market-trends", "valuation-accuracy", "risk-alerts"]'::jsonb);

-- Add comments for documentation
COMMENT ON TABLE verticals IS 'Industry verticals supported by the platform';
COMMENT ON TABLE use_cases IS 'Specific use cases within each vertical';
COMMENT ON TABLE use_case_executions IS 'Execution history and results for use cases';
COMMENT ON TABLE use_case_templates IS 'Reusable configuration templates for use cases';
COMMENT ON TABLE use_case_agents IS 'Mapping of agents to use cases with execution order';

COMMENT ON COLUMN use_cases.sia_scores IS 'Security, Integrity, and Accuracy scores (0-100)';
COMMENT ON COLUMN use_cases.complexity IS 'Implementation complexity: low, medium, or high';
COMMENT ON COLUMN use_cases.estimated_time IS 'Estimated implementation time as a string (e.g., "3-4 weeks")';
COMMENT ON COLUMN use_case_executions.duration IS 'Execution duration in milliseconds';
COMMENT ON COLUMN use_case_agents.execution_order IS 'Order in which agents are executed (lower numbers first)';