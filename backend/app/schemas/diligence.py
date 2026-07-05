from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EvidenceSchema(BaseModel):
    source: str
    confidence: str
    reason: str
    linkedEntities: List[str]
    timestamp: str

class DecisionSchema(BaseModel):
    recommendation: str # 'INVEST' | 'UNDER REVIEW' | 'PASS'
    confidence: str
    reasoning: str
    supportingEvidence: List[EvidenceSchema]
    riskFactors: List[str]
    strengths: List[str]
    weaknesses: List[str]

class MetricBreakdownSchema(BaseModel):
    financials: int
    marketSize: int
    team: int
    product: int

class FinancialSnapshotSchema(BaseModel):
    revenue: str
    burnRate: str
    runway: str
    valuation: str

class StartupDetailsSchema(BaseModel):
    summary: str
    strengths: List[str]
    risks: List[str]
    founderBackground: str
    financialSnapshot: FinancialSnapshotSchema
    marketOpportunity: str
    techStackRisk: str
    decision: Optional[DecisionSchema] = None
    evidenceList: Optional[List[EvidenceSchema]] = None

class StartupSchema(BaseModel):
    id: str
    name: str
    logo: str
    elevatorPitch: str
    sector: str
    investmentScore: int
    riskLevel: str # 'Low' | 'Medium' | 'High'
    status: str # 'Approved' | 'Under Review' | 'Flagged'
    dateInvestigated: str
    metrics: MetricBreakdownSchema
    details: StartupDetailsSchema

class UploadResponseSchema(BaseModel):
    filename: str
    status: str
    extracted_text: str

class InvestigationRequestSchema(BaseModel):
    name: str
    founderName: str
    sector: str
    fundingStage: str
    websiteUrl: str
    githubUrl: str
    description: str
    pitchDeckText: Optional[str] = ""
    financialsText: Optional[str] = ""
