import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  MapPin,
  Github,
  Linkedin,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export const ApplicantProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || 'Aravind Kumar');
  const [headline, setHeadline] = useState(
    user?.headline || 'B.Tech CSE Senior | Full-Stack & Distributed Systems'
  );
  const [bio, setBio] = useState(
    user?.bio || 'Passionate engineer experienced in React, TypeScript, Node.js, and distributed pipelines.'
  );
  const [location, setLocation] = useState(user?.location || 'Chennai, India');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || 'https://github.com/aravind-k');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || 'https://linkedin.com/in/aravind-kumar');

  // Resume builder skills state
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Docker', 'Redis']);
  const [newSkill, setNewSkill] = useState('');

  // Profile strength calculation
  const computeProfileStrength = () => {
    let score = 40;
    if (fullName) score += 10;
    if (headline) score += 10;
    if (bio) score += 10;
    if (githubUrl) score += 10;
    if (skills.length >= 5) score += 20;
    return Math.min(100, score);
  };

  const strength = computeProfileStrength();

  const handleSaveProfile = async () => {
    await updateProfile({
      full_name: fullName,
      headline,
      bio,
      location,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
    });
    toast.success('Profile changes successfully updated.');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleExportResumePDF = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header with Profile Strength */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Student Profile & Resume Center
          </h1>
          <p className="text-xs text-muted-foreground">
            Maintain your verified placement credentials, skills taxonomy, and resume builder.
          </p>
        </div>

        {/* Profile Strength Meter */}
        <div className="rounded-xl border bg-card p-3.5 w-full md:w-64 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Profile Strength
            </span>
            <span className="font-mono font-bold text-primary">{strength}%</span>
          </div>
          <Progress value={strength} className="h-2" />
          <p className="text-[10px] text-muted-foreground">
            {strength >= 90 ? 'All sections completed!' : 'Add GitHub or skills to reach 100%'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Full Name</span>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Email Address</span>
                  <Input value={user?.email || 'aravind.k@college.edu'} disabled />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground">Professional Headline</span>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground">Summary & Objectives</span>
                <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Location</span>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">GitHub URL</span>
                  <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">LinkedIn URL</span>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} size="sm">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills Tag Management */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground">
                Core Competencies & Skills Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <Input
                  placeholder="Add a new skill (e.g. Next.js, Kubernetes)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button type="submit" size="sm" className="h-9 text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs py-1 px-2.5 gap-1.5 font-normal">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Resume Live Card & Actions */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Active Primary Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-foreground">Aravind_Kumar_2026.pdf</strong>
                  <Badge variant="success" className="text-[10px]">ATS: 92%</Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Uploaded on Oct 14, 2026 • 248 KB PDF
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full text-xs" onClick={handleExportResumePDF}>
                  <Download className="w-3.5 h-3.5 mr-2" /> Export Standardized PDF
                </Button>
                <Link to="/resume-analyzer" className="w-full block">
                  <Button className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Sparkles className="w-3.5 h-3.5 mr-2" /> Run 5-Agent Matcher
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
