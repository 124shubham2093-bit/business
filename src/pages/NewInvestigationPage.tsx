import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ShieldAlert, Sparkles, Building, User, Target, Globe, Code2, FileText, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { uploadPitchDeck } from '../services/investigation/BackendInvestigationService';
import { MockInvestigationService } from '../services/investigation/MockInvestigationService';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [founderName, setFounderName] = useState('');
  const [sector, setSector] = useState('SaaS');
  const [fundingStage, setFundingStage] = useState('Seed');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // File state — store actual File object, not just the name
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [financialsFile, setFinancialsFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePitchDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPitchDeckFile(e.target.files[0]);
    }
  };

  const handleFinancialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFinancialsFile(e.target.files[0]);
    }
  };

  const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
    const match = url.trim().match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s#?]+)/i);
    if (match && match[1] && match[2]) {
      const repo = match[2].replace(/\.git$/i, '');
      return { owner: match[1], repo };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !founderName || !sector) {
      alert('Please fill in the required fields (Startup Name, Founder Name, Sector).');
      return;
    }

    if (!pitchDeckFile || !financialsFile) {
      alert('Please upload both the Pitch Deck and Financial Statement before launching the investigation.');
      return;
    }

    // Verify GitHub repository if provided
    if (githubUrl && githubUrl.trim()) {
      const parsed = parseGithubUrl(githubUrl);
      if (!parsed) {
        const msg = 'Repository Not Found or Not Publicly Accessible';
        setErrorMessage(msg);
        alert(msg);
        return;
      }

      try {
        const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
        if (response.status === 404) {
          const msg = 'Repository Not Found or Not Publicly Accessible';
          setErrorMessage(msg);
          alert(msg);
          return;
        } else if (response.status !== 200) {
          const msg = 'Unable to verify GitHub repository';
          setErrorMessage(msg);
          alert(msg);
          return;
        }
      } catch (err) {
        const msg = 'Unable to verify GitHub repository';
        setErrorMessage(msg);
        alert(msg);
        return;
      }
    }

    setIsUploading(true);
    let pitchDeckText = '';
    try {
      if (pitchDeckFile) {
        pitchDeckText = await uploadPitchDeck(pitchDeckFile);
      }
    } catch (err) {
      console.warn('Failed to upload pitch deck:', err);
    }

    let financialsText = '';
    try {
      if (financialsFile) {
        financialsText = await uploadPitchDeck(financialsFile);
      }
    } catch (err) {
      console.warn('Failed to upload financials:', err);
    }

    // Build creation payload
    const creationPayload: any = {
      name,
      logo: '🚀',
      elevatorPitch: description || 'No description provided.',
      sector,
      fundingStage,
      websiteUrl: websiteUrl || 'https://example.com',
      githubUrl: githubUrl || '',
      pitchDeckText,
      financialsText,
      details: {
        founderBackground: founderName,
      }
    };

    try {
      const generatedStartup = await MockInvestigationService.createInvestigation(creationPayload);
      setIsUploading(false);

      navigate('/investigations/pipeline', {
        state: {
          generatedStartup,
          name,
          founderName,
          sector,
          fundingStage,
          websiteUrl: websiteUrl || 'https://example.com',
          githubUrl: githubUrl || '',
          description: description || 'No description provided.',
          pitchDeckName: pitchDeckFile?.name || 'pitch_deck_executive.pdf',
          financialsName: financialsFile?.name || 'financial_statements_q2.xlsx',
        },
      });
    } catch (err) {
      setIsUploading(false);
      console.error(err);
      alert('Failed to launch investigation: ' + err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-wider">
              Due Diligence Intake
            </span>
            <span className="text-[var(--text-secondary)] text-xs font-mono">• Multi-Agent Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
            New Investigation
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Evaluate a startup using company identity, repository telemetry, and financial evidence documents.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2.5 shadow-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Company Profile & Background */}
        <Card className="border border-[var(--border-color)]">
          <CardHeader className="pb-3 border-b border-[var(--border-color)]">
            <CardTitle className="text-sm font-semibold">1. Company Profile &amp; Positioning</CardTitle>
            <p className="text-xs text-[var(--text-secondary)]">Essential entity attributes required for multi-agent diligence analysis.</p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Row 1: Name and Founder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Startup Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Health"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Founder / CEO Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Evelyn Zhang"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Sector and Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Industry Sector <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="SaaS" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">SaaS</option>
                  <option value="DevSecOps" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">DevSecOps</option>
                  <option value="Developer Tools" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Developer Tools</option>
                  <option value="Cloud Infrastructure" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Cloud Infrastructure</option>
                  <option value="FinTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">FinTech</option>
                  <option value="HealthTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">HealthTech</option>
                  <option value="BioTech / Life Sciences" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">BioTech / Life Sciences</option>
                  <option value="EdTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">EdTech</option>
                  <option value="E-Commerce" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">E-Commerce</option>
                  <option value="AI / Machine Learning" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">AI / Machine Learning</option>
                  <option value="Cybersecurity" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Cybersecurity</option>
                  <option value="Enterprise Software" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Enterprise Software</option>
                  <option value="ClimateTech / CleanTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">ClimateTech / CleanTech</option>
                  <option value="Logistics / Supply Chain" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Logistics / Supply Chain</option>
                  <option value="PropTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">PropTech</option>
                  <option value="Media / Entertainment" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Media / Entertainment</option>
                  <option value="Consumer Technology" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Consumer Technology</option>
                  <option value="DeepTech" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">DeepTech</option>
                  <option value="Other" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Target Funding Stage</span>
                </label>
                <select
                  value={fundingStage}
                  onChange={(e) => setFundingStage(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="Pre-Seed" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Pre-Seed</option>
                  <option value="Seed" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Seed</option>
                  <option value="Series A" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Series A</option>
                  <option value="Series B" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Series B</option>
                </select>
              </div>
            </div>

            {/* Row 3: Website and GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Company Website URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>GitHub Repository URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 4: Company Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Company Description &amp; Moat
              </label>
              <textarea
                placeholder="Describe the company's value proposition, operations, market differentiation, and technology moat..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Evidence Documents Ingestion */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">2. Evidence Documents Ingestion</h3>
            <p className="text-xs text-[var(--text-secondary)]">Required files for document parsing, Cognee knowledge graph creation, and financial audit analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pitch Deck File */}
            <Card className="border border-[var(--border-color)]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Pitch Deck (PDF) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Max 15MB</span>
                </div>
                <div className="relative border border-dashed border-[var(--border-color)] hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[var(--bg-subtle)]/70 group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePitchDeckChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-7 h-7 text-[var(--text-secondary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2" />
                  <span className="text-xs text-[var(--text-primary)] font-medium">
                    {pitchDeckFile ? pitchDeckFile.name : 'Select or drag pitch deck PDF'}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Parsed by Technology &amp; Market Agents</span>
                  {pitchDeckFile && (
                    <div className="mt-3 flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-md px-2.5 py-1 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ready for Ingestion</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Statements File */}
            <Card className="border border-[var(--border-color)]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Financial Audit Files <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Excel / PDF (Max 10MB)</span>
                </div>
                <div className="relative border border-dashed border-[var(--border-color)] hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[var(--bg-subtle)]/70 group">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf"
                    onChange={handleFinancialsChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-7 h-7 text-[var(--text-secondary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2" />
                  <span className="text-xs text-[var(--text-primary)] font-medium">
                    {financialsFile ? financialsFile.name : 'Select or drag financial records'}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Parsed by Financial &amp; Legal Agents</span>
                  {financialsFile && (
                    <div className="mt-3 flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-md px-2.5 py-1 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ready for Ingestion</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Action & Execution Seam */}
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-primary)]">
              <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>Multi-Agent Diligence Pipeline</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] max-w-xl">
              Launching initiates document parsing, Cognee knowledge graph creation, multi-agent committee scoring, and prepares the profile for failure risk evaluation.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isUploading || !name || !founderName || !sector || !pitchDeckFile || !financialsFile}
            className="flex-shrink-0 px-5 py-2.5 text-xs font-semibold shadow-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ingesting Evidence...
              </>
            ) : (
              <>
                Start Due Diligence Investigation
                <Sparkles className="w-3.5 h-3.5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default NewInvestigationPage;
