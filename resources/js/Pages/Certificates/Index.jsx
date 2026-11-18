import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Award, Plus, Printer, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import CertificatePrintModal from './components/CertificatePrintModal';
import { cn } from '@/lib/utils';

export default function Index({ certificates, classes = [], filters = {} }) {
    const [selectedCertForPrint, setSelectedCertForPrint] = useState(null);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedStudentForIssue, setSelectedStudentForIssue] = useState(null);

    const handleFilterChange = (key, value) => {
        router.get(
            route('certificates.index'),
            {
                ...filters,
                [key]: value,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        router.get(route('certificates.index'), {}, { preserveState: true, replace: true });
    };

    const handleDelete = (cert) => {
        if (confirm(`Are you sure you want to delete certificate ${cert.document_number}?`)) {
            router.delete(route('certificates.destroy', cert.id));
        }
    };

    const getSubTypeBadge = (subType) => {
        switch (subType) {
            case 'leaving':
                return <Badge className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-0">School Leaving (SLC)</Badge>;
            case 'character':
                return <Badge className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-0">Character</Badge>;
            case 'bonafide':
                return <Badge className="bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-0">Bonafide Student</Badge>;
            case 'merit':
                return <Badge className="bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-0">Merit Certificate</Badge>;
            default:
                return <Badge variant="outline">{subType || 'Certificate'}</Badge>;
        }
    };

    const hasFilters = Boolean(filters.search || filters.sub_type || filters.type);

    return (
        <AppLayout title="Certificates & Document Archive">
            <Head title="Student Certificates" />

            <div className="space-y-6">
                <PageHeader
                    title="Student Certificates"
                    subtitle="Generate official institutional certificates, track print copies, and record reprints."
                    icon={Award}
                />

                {/* Filter Bar */}
                <FilterBar showReset={hasFilters} onReset={handleResetFilters}>
                    <SearchInput
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e?.target ? e.target.value : e)}
                        placeholder="Search by student name, roll #, certificate #..."
                        className="flex-1 min-w-[220px]"
                    />

                    <select
                        value={filters.sub_type || ''}
                        onChange={(e) => handleFilterChange('sub_type', e.target.value)}
                        className="h-10 px-3 py-2 text-xs rounded-xs border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Certificate Types</option>
                        <option value="character">Character Certificate</option>
                        <option value="leaving">School Leaving Certificate</option>
                        <option value="bonafide">Bonafide Student Certificate</option>
                        <option value="merit">Academic Merit Certificate</option>
                    </select>
                </FilterBar>

                {/* Certificates Table */}
                <Card className="border-border shadow-xs">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Certificate #</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Student</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Class</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Type</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Issue Date</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Print Count</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {certificates?.data?.length > 0 ? (
                                        certificates.data.map((cert) => {
                                            const student = cert.student || {};
                                            const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                                            const rollNo = student.roll_number || student.roll_no || student.admission_number || 'N/A';
                                            const className = student.current_enrollment?.school_class?.name || 'Class';

                                            return (
                                                <tr key={cert.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-bold text-primary text-xs">
                                                        {cert.document_number}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-foreground">
                                                        <div className="flex items-center gap-2.5">
                                                            <ProfileAvatar
                                                                src={student.photo_url}
                                                                name={studentName}
                                                                className="w-7 h-7"
                                                                iconClassName="w-3.5 h-3.5"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-semibold">{studentName}</div>
                                                                <div className="text-[11px] text-muted-foreground font-mono">Roll: {rollNo}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground text-xs">
                                                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                                            {className}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getSubTypeBadge(cert.sub_type)}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                                                        {cert.issue_date}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "font-mono font-bold text-[11px]",
                                                                cert.print_count === 1
                                                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                                                                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300"
                                                            )}
                                                        >
                                                            {cert.copy_label} ({cert.print_count}x)
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedCertForPrint(cert)}
                                                                className="h-7 px-2.5 font-semibold gap-1.5 text-xs whitespace-nowrap shrink-0 inline-flex items-center"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Print Copy</span>
                                                            </Button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(cert)}
                                                                className="p-1.5 text-muted-foreground hover:text-destructive rounded-xs hover:bg-destructive/10 transition-colors shrink-0"
                                                                title="Delete Certificate"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-muted-foreground">
                                                No issued certificates found. You can issue certificates from any student profile!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {certificates?.links && (
                            <Pagination
                                links={certificates.links}
                                from={certificates.from}
                                to={certificates.to}
                                total={certificates.total}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Printout Modal */}
                {selectedCertForPrint && (
                    <CertificatePrintModal
                        isOpen={Boolean(selectedCertForPrint)}
                        onClose={() => setSelectedCertForPrint(null)}
                        student={selectedCertForPrint.student}
                        certificate={selectedCertForPrint}
                        onCertificateSaved={() => {
                            router.reload({ preserveScroll: true });
                        }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
