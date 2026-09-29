'use client';

import { useState } from 'react';
import { LifeBuoy, Send, Search, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { OfficerLayout } from '@/components/layout/officer-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { GrievanceStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<GrievanceStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  OPEN: { label: 'Open', color: 'bg-info/10 text-info border-info/30', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-warning/10 text-warning border-warning/30', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
};

interface OfficerGrievance {
  id: string;
  studentName: string;
  category: string;
  subject: string;
  description: string;
  status: GrievanceStatus;
  createdAt: string;
  applicationId?: string;
  district: string;
  messages: { id: string; from: 'student' | 'officer'; message: string; timestamp: string }[];
}

const GRIEVANCES: OfficerGrievance[] = [
  {
    id: 'GRV-2026-0042',
    studentName: 'Asha Munda',
    category: 'Payment delay',
    subject: 'Pre-Matric payment delayed beyond expected timeline',
    description: 'My Pre-Matric Scholarship payment for 2024-25 was expected by 10 Aug 2026 but was credited on 18 Aug. Requesting clarification on the delay.',
    status: 'IN_PROGRESS',
    createdAt: '12 Aug 2026',
    applicationId: 'MOTA-PM-2024-00890',
    district: 'Khunti',
    messages: [
      { id: 'gm1', from: 'student', message: 'Payment was delayed by 8 days. Please clarify.', timestamp: '12 Aug 2026, 10:30 IST' },
      { id: 'gm2', from: 'officer', message: 'We have checked with PFMS. The delay was due to bank verification. Payment has now been credited.', timestamp: '14 Aug 2026, 15:00 IST' },
    ],
  },
  {
    id: 'GRV-2026-0055',
    studentName: 'Birsa Hembram',
    category: 'Document verification issue',
    subject: 'Name mismatch — unable to correct application',
    description: 'My name has a typo in the application form (missing last letter). The system shows a mismatch but I cannot edit it.',
    status: 'OPEN',
    createdAt: '20 Sep 2026',
    applicationId: 'MOTA-PMS-2026-00231',
    district: 'Gumla',
    messages: [
      { id: 'gm1', from: 'student', message: 'I made a typo in my name. Please help me correct it.', timestamp: '20 Sep 2026, 11:00 IST' },
    ],
  },
  {
    id: 'GRV-2026-0068',
    studentName: 'Suniti Kisku',
    category: 'Incorrect eligibility status',
    subject: 'Eligibility check says not eligible but I meet all criteria',
    description: 'The system shows me as not eligible for Post-Matric but my income is below 2.5 lakh and I am an ST student pursuing undergraduate studies.',
    status: 'OPEN',
    createdAt: '22 Sep 2026',
    applicationId: 'MOTA-PMS-2026-00345',
    district: 'Ranchi',
    messages: [
      { id: 'gm1', from: 'student', message: 'I believe the eligibility result is incorrect. Please review.', timestamp: '22 Sep 2026, 14:15 IST' },
    ],
  },
  {
    id: 'GRV-2026-0031',
    studentName: 'Dhananjay Soren',
    category: 'Application delay',
    subject: 'Application stuck at institution verification for 30 days',
    description: 'My Post-Matric application has been at institution verification for over 30 days. The college has not responded.',
    status: 'RESOLVED',
    createdAt: '01 Sep 2026',
    applicationId: 'MOTA-PMS-2026-00467',
    district: 'Dumka',
    messages: [
      { id: 'gm1', from: 'student', message: 'Application is stuck. Please escalate.', timestamp: '01 Sep 2026, 09:00 IST' },
      { id: 'gm2', from: 'officer', message: 'We have contacted the institution directly. Verification has been completed. Application is now proceeding to state review.', timestamp: '10 Sep 2026, 12:00 IST' },
    ],
  },
  {
    id: 'GRV-2026-0079',
    studentName: 'Pooja Tudu',
    category: 'Other',
    subject: 'Cannot upload bonafide certificate — file size error',
    description: 'I am trying to upload my bonafide certificate but the system keeps rejecting it saying the file is too large even though it is under 5MB.',
    status: 'IN_PROGRESS',
    createdAt: '24 Sep 2026',
    district: 'Simdega',
    messages: [
      { id: 'gm1', from: 'student', message: 'File upload is not working. Please help.', timestamp: '24 Sep 2026, 16:30 IST' },
    ],
  },
];

export default function OfficerGrievancesPage() {
  const [grievances, setGrievances] = useState<OfficerGrievance[]>(GRIEVANCES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState<OfficerGrievance | null>(null);
  const [reply, setReply] = useState('');

  const filtered = grievances.filter((g) => {
    if (search && !g.studentName.toLowerCase().includes(search.toLowerCase()) && !g.id.toLowerCase().includes(search.toLowerCase()) && !g.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    return true;
  });

  const openCount = grievances.filter((g) => g.status === 'OPEN').length;
  const inProgressCount = grievances.filter((g) => g.status === 'IN_PROGRESS').length;
  const resolvedCount = grievances.filter((g) => g.status === 'RESOLVED').length;

  const handleReply = () => {
    if (!reply.trim() || !selectedGrievance) {
      toast.error('Please enter a reply');
      return;
    }
    const newMsg = {
      id: `gm${Date.now()}`,
      from: 'officer' as const,
      message: reply,
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' IST',
    };
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === selectedGrievance.id
          ? { ...g, messages: [...g.messages, newMsg], status: 'IN_PROGRESS' as GrievanceStatus }
          : g
      )
    );
    setSelectedGrievance((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg], status: 'IN_PROGRESS' as GrievanceStatus } : null);
    setReply('');
    toast.success('Reply sent', { description: 'Student has been notified.' });
  };

  const handleResolve = (id: string) => {
    setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, status: 'RESOLVED' as GrievanceStatus } : g)));
    setSelectedGrievance((prev) => prev ? { ...prev, status: 'RESOLVED' as GrievanceStatus } : null);
    toast.success('Grievance resolved', { description: 'Ticket has been marked as resolved.' });
  };

  return (
    <OfficerLayout>
      <PageHeader title="Grievances" description="Manage and resolve student grievances" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="text-xl font-bold">{openCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Grievance List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  <LifeBuoy className="h-6 w-6 mx-auto mb-2" />
                  No grievances found.
                </CardContent>
              </Card>
            ) : (
              filtered.map((g) => {
                const statusConfig = STATUS_CONFIG[g.status];
                const StatusIcon = statusConfig.icon;
                const isSelected = selectedGrievance?.id === g.id;
                return (
                  <Card
                    key={g.id}
                    className={cn('cursor-pointer hover:shadow-sm transition-all', isSelected && 'border-primary ring-1 ring-primary/20')}
                    onClick={() => setSelectedGrievance(g)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                        <StatusBadge label={statusConfig.label} colorClass={statusConfig.color} />
                      </div>
                      <p className="text-sm font-semibold leading-tight">{g.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{g.studentName} · {g.district}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{g.createdAt}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MessageSquare className="h-3 w-3" /> {g.messages.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Grievance Detail */}
        <div className="lg:col-span-2">
          {!selectedGrievance ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3" />
                <p className="text-sm">Select a grievance from the list to view details.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{selectedGrievance.id}</span>
                      <StatusBadge label={STATUS_CONFIG[selectedGrievance.status].label} colorClass={STATUS_CONFIG[selectedGrievance.status].color} />
                    </div>
                    <CardTitle className="text-base">{selectedGrievance.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedGrievance.studentName} · {selectedGrievance.district} · Created {selectedGrievance.createdAt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grievance Details */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><span className="font-medium">{selectedGrievance.category}</span></div>
                  {selectedGrievance.applicationId && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Linked Application</span><span className="font-mono font-medium">{selectedGrievance.applicationId}</span></div>
                  )}
                </div>

                {/* Student Description */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Student Description:</p>
                  <p className="text-sm rounded-lg bg-muted/50 p-3">{selectedGrievance.description}</p>
                </div>

                {/* Conversation */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Conversation:</p>
                  <div className="space-y-2">
                    {selectedGrievance.messages.map((msg) => (
                      <div key={msg.id} className={cn('rounded-lg p-3', msg.from === 'student' ? 'bg-primary/5' : 'bg-info/5 ml-6')}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{msg.timestamp} · {msg.from === 'student' ? selectedGrievance.studentName : 'Officer'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Officer Reply */}
                {selectedGrievance.status !== 'RESOLVED' && (
                  <div className="space-y-2 border-t pt-4">
                    <Label className="text-xs">Officer Reply</Label>
                    <Textarea
                      rows={3}
                      placeholder="Type your response to the student..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleReply} className="gap-1.5">
                        <Send className="h-4 w-4" />
                        Send Reply
                      </Button>
                      <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10" onClick={() => handleResolve(selectedGrievance.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Mark as Resolved
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
}
