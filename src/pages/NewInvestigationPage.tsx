import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ShieldAlert, Sparkles, Building, User, Target, Globe, Code2, FileText, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { uploadPitchDeck } from '../services/investigation/BackendInvestigationService';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [founderName, setFounderName] = useState('');
  const [sector, setSector] = useState('BioTech AI');
  const [fundingStage, setFundingStage] = useState('Seed');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Simulated files
  // File state — store actual File object, not just the name
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [financialsName, setFinancialsName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePitchDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPitchDeckFile(e.target.files[0]);
    }
  };

  const handleFinancialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFinancialsName(e.target.files[0].name);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !founderName || !sector) {
      alert('Please fill in the required fields (Startup Name, Founder Name, Sector).');
      return;
    }

    // Upload pitch deck if one was selected; degrade gracefully on failure
    let pitchDeckText = '';
    if (pitchDeckFile) {
      setIsUploading(true);
      pitchDeckText = await uploadPitchDeck(pitchDeckFile);
      setIsUploading(false);
    }

    navigate('/investigations/pipeline', {
      state: {
        name,
        founderName,
        sector,
        fundingStage,
        websiteUrl: websiteUrl || 'https://example.com',
        githubUrl: githubUrl || 'https://github.com/example',
        description: description || 'No description provided.',
        pitchDeckName: pitchDeckFile?.name || 'pitch_deck_executive.pdf',
        financialsName: financialsName || 'financial_statements_q2.xlsx',
        pitchDeckText,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-purple/10 border border-brand-purple/20 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-6 h-6 text-brand-purple-light" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white m-0">
            Initiate New Due Diligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Feed pitch deck files and financials into Cognee Knowledge Graph parsing nodes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card glow className="border border-white/5">
          <CardHeader>
            <CardTitle>Startup Information</CardTitle>
            <p className="text-xs text-gray-400">Core parameters required for seed analysis</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grid 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Startup Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>Startup Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. HelixBio AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                />
              </div>

              {/* Founder Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>Founder / CEO Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Evelyn Zhang"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            {/* Grid 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sector Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>Industry Sector *</span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                >
                  <option value="BioTech AI" className="bg-dark-bg text-white">BioTech AI</option>
                  <option value="DevSecOps" className="bg-dark-bg text-white">DevSecOps</option>
                  <option value="Infrastructure" className="bg-dark-bg text-white">Infrastructure</option>
                  <option value="FinTech AI" className="bg-dark-bg text-white">FinTech AI</option>
                  <option value="LegalTech" className="bg-dark-bg text-white">LegalTech</option>
                  <option value="Cybersecurity" className="bg-dark-bg text-white">Cybersecurity</option>
                  <option value="EdTech AI" className="bg-dark-bg text-white">EdTech AI</option>
                  <option value="ClimateTech" className="bg-dark-bg text-white">ClimateTech</option>
                </select>
              </div>

              {/* Funding Stage Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>Funding Stage</span>
                </label>
                <select
                  value={fundingStage}
                  onChange={(e) => setFundingStage(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                >
                  <option value="Pre-Seed" className="bg-dark-bg text-white">Pre-Seed</option>
                  <option value="Seed" className="bg-dark-bg text-white">Seed</option>
                  <option value="Series A" className="bg-dark-bg text-white">Series A</option>
                  <option value="Series B" className="bg-dark-bg text-white">Series B</option>
                </select>
              </div>
            </div>

            {/* Grid 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>Website URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                />
              </div>

              {/* GitHub URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5 text-brand-purple-light" />
                  <span>GitHub Repository URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            {/* Company Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Company Description</label>
              <textarea
                placeholder="Describe the company's value proposition, operations, and technology moat..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Startup Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pitch Deck File */}
          <Card className="border border-white/5">
            <CardContent className="p-6">
              <span className="text-xs font-semibold text-gray-300 block mb-3">Pitch Deck Upload</span>
              <div className="relative border border-dashed border-white/10 hover:border-brand-purple/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white/1 group">
              <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePitchDeckChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-brand-purple-light transition-colors mb-2" />
                <span className="text-xs text-gray-300 font-medium">
                  {pitchDeckFile ? pitchDeckFile.name : 'Drag and drop pitch deck (PDF)'}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">Maximum file size: 15MB</span>
                {pitchDeckFile && (
                  <div className="mt-3 flex items-center space-x-1 bg-brand-purple/20 border border-brand-purple/30 rounded px-2 py-0.5 text-[10px] text-brand-purple-light">
                    <FileText className="w-3.5 h-3.5" />
                    <span>File Selected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Statements File */}
          <Card className="border border-white/5">
            <CardContent className="p-6">
              <span className="text-xs font-semibold text-gray-300 block mb-3">Financial Statements Upload</span>
              <div className="relative border border-dashed border-white/10 hover:border-brand-purple/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white/1 group">
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  onChange={handleFinancialsChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-brand-purple-light transition-colors mb-2" />
                <span className="text-xs text-gray-300 font-medium">
                  {financialsName ? financialsName : 'Drag and drop financial audit files (Excel/PDF)'}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">Maximum file size: 10MB</span>
                {financialsName && (
                  <div className="mt-3 flex items-center space-x-1 bg-brand-purple/20 border border-brand-purple/30 rounded px-2 py-0.5 text-[10px] text-brand-purple-light">
                    <FileText className="w-3.5 h-3.5" />
                    <span>File Selected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between p-4 bg-brand-purple/5 border border-brand-purple/10 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-brand-purple-light">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <p>InvestIQ will generate a due diligence knowledge graph on the next page.</p>
          </div>
          <Button type="submit" variant="primary" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Uploading Pitch Deck...
              </>
            ) : (
              <>
                Start Diligence Investigation
                <Sparkles className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default NewInvestigationPage;
