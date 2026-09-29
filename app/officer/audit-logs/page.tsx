'use client';

import { useState } from 'react';
import { ScrollText, Search, Download, Shield } from 'lucide-react';
import { OfficerLayout } from '@/components/layout/officer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
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
import { ROLE_LABELS } from '@/lib/constants';
import { AUDIT_LOGS } from '@/lib/mock-data/seed';
import type { UserRole } from '@/types';
import { toast } from 'sonner';

const ROLE_COLORS: Record<UserRole, string> = {
  STUDENT: 'bg-primary/10 text-primary border-primary/30',
  INSTITUTION_OFFICER: 'bg-info/10 text-info border-info/30',
  STATE_OFFICER: 'bg-info/10 text-info border-info/30',
  MOTA_OFFICER: 'bg-accent/10 text-accent-foreground border-accent/30',
  HELPDESK_OFFICER: 'bg-warning/10 text-warning border-warning/30',
  ADMIN: 'bg-muted text-muted-foreground border-border',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const resources = Array.from(new Set(AUDIT_LOGS.map((l) => l.resource)));
  const roles = Array.from(new Set(AUDIT_LOGS.map((l) => l.role)));

  const filtered = AUDIT_LOGS.filter((l) => {
    if (search && !l.actor.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.metadata.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && l.role !== roleFilter) return false;
    if (resourceFilter !== 'all' && l.resource !== resourceFilter) return false;
    return true;
  });

  const handleExport = () => {
    toast.success('Audit log exported', { description: 'Log has been exported as CSV (prototype).' });
  };

  return (
    <OfficerLayout>
      <PageHeader
        title="Audit Logs"
        description="Append-only audit trail of all system and user actions"
        right={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="mb-4 rounded-lg border border-info/20 bg-info/5 p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          This audit log is append-only and cannot be modified. All actions — student consent grants, verification requests, officer decisions, and system events — are recorded here for accountability and compliance.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by actor, action, or metadata..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r as UserRole]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger><SelectValue placeholder="All resources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resources</SelectItem>
            {resources.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Log Entries</p>
            <p className="text-xl font-bold">{AUDIT_LOGS.length}</p>
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
            <p className="text-xs text-muted-foreground">Log Type</p>
            <p className="text-sm font-medium text-info">Append-only</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Audit Trail</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs">Actor</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Role</TableHead>
                <TableHead className="text-xs">Action</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Resource</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Metadata</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">IP / Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap font-mono">{log.timestamp}</TableCell>
                  <TableCell className="text-xs font-medium">{log.actor}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge label={ROLE_LABELS[log.role]} colorClass={ROLE_COLORS[log.role]} />
                  </TableCell>
                  <TableCell className="text-xs">{log.action}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">
                    <Badge variant="outline" className="text-[10px]">{log.resource}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell font-mono">{log.metadata}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{log.ipDevice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ScrollText className="h-8 w-8" />
              No audit log entries match your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </OfficerLayout>
  );
}
