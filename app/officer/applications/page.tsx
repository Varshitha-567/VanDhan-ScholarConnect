'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, ArrowRight, Download } from 'lucide-react';
import { OfficerLayout } from '@/components/layout/officer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import { MockSandboxBadge } from '@/components/shared/mock-badge';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS, ACADEMIC_YEAR } from '@/lib/constants';
import { MOCK_STUDENTS } from '@/lib/mock-data/seed';
import { formatINR } from '@/lib/utils/format';
import type { ApplicationStatus } from '@/types';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'verification', label: 'Under Verification' },
  { key: 'action', label: 'Action Required' },
  { key: 'sanctioned', label: 'Sanctioned' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

function matchesFilter(status: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'verification') return ['SUBMITTED', 'AUTO_VERIFICATION', 'INSTITUTION_REVIEW', 'STATE_REVIEW', 'MOTA_REVIEW'].includes(status);
  if (filter === 'action') return status === 'ACTION_REQUIRED';
  if (filter === 'sanctioned') return ['SANCTIONED', 'DBT_INITIATED'].includes(status);
  if (filter === 'completed') return ['COMPLETED', 'CREDITED'].includes(status);
  if (filter === 'rejected') return status === 'REJECTED';
  return true;
}

export default function OfficerApplicationsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  const districts = Array.from(new Set(MOCK_STUDENTS.map((s) => s.district)));
  const schemes = Array.from(new Set(MOCK_STUDENTS.map((s) => s.scheme)));

  const filtered = MOCK_STUDENTS.filter((s) => {
    if (!matchesFilter(s.status, filter)) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.applicationId.toLowerCase().includes(search.toLowerCase())) return false;
    if (schemeFilter !== 'all' && s.scheme !== schemeFilter) return false;
    if (districtFilter !== 'all' && s.district !== districtFilter) return false;
    return true;
  });

  const statusKey = (s: string) => s as ApplicationStatus;

  return (
    <OfficerLayout>
      <PageHeader
        title="Applications"
        description={`All scholarship applications for ${ACADEMIC_YEAR}`}
        right={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student or ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={schemeFilter} onValueChange={setSchemeFilter}>
          <SelectTrigger><SelectValue placeholder="All schemes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schemes</SelectItem>
            {schemes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger><SelectValue placeholder="All districts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center">
          <MockSandboxBadge />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.key} value={f.key} className="text-xs">{f.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Applications</p>
            <p className="text-xl font-bold">{MOCK_STUDENTS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Filtered Results</p>
            <p className="text-xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Action Required</p>
            <p className="text-xl font-bold text-warning">{MOCK_STUDENTS.filter((s) => s.status === 'ACTION_REQUIRED').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Application ID</TableHead>
                <TableHead className="text-xs">Student</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Age</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Scheme</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Education</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Income</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">District</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs font-mono">{s.applicationId}</TableCell>
                  <TableCell className="text-xs font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{s.age}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{s.scheme}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{s.education}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell">{formatINR(s.income)}</TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{s.district}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={APPLICATION_STATUS_LABELS[statusKey(s.status)] || s.status}
                      colorClass={APPLICATION_STATUS_COLORS[statusKey(s.status)] || 'bg-muted text-muted-foreground border-border'}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/officer/reviews/RC-2026-001`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-0.5">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <FileText className="h-8 w-8" />
              No applications match your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </OfficerLayout>
  );
}
