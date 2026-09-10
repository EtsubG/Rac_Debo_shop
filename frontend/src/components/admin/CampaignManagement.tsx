import { useState } from 'react';
import { Plus, Archive, Play, Calendar, TrendingUp, FolderOpen, Check } from 'lucide-react';
import type { Campaign } from '@/types';
import { Badge, Button, Input, Textarea } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface CampaignManagementProps {
  campaigns: Campaign[];
}

export function CampaignManagement({ campaigns }: CampaignManagementProps) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-brand-cranberry" />
          <h2 className="text-base font-bold text-navy-800">Campaign Management</h2>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Start New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border-2 shadow-soft overflow-hidden ${c.active ? 'border-brand-cranberry' : 'border-navy-100'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-navy-800 text-lg">{c.name}</h3>
                  <p className="text-sm text-navy-400 mt-0.5">{c.description}</p>
                </div>
                <Badge color={c.active ? 'emerald' : 'gray'}>
                  {c.active ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </>
                  ) : 'Archived'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-navy-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-navy-400 font-semibold">Orders</p>
                  <p className="text-lg font-extrabold text-navy-800">{c.orderCount}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-navy-400 font-semibold">Sales</p>
                  <p className="text-lg font-extrabold text-navy-800">{c.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-navy-400 font-semibold">Period</p>
                  <p className="text-xs font-bold text-navy-700 mt-1.5">
                    {c.startDate.split('-')[1]}/{c.startDate.split('-')[2]} → {c.endDate.split('-')[1]}/{c.endDate.split('-')[2]}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {!c.active && (
                  <Button variant="outline" size="sm" fullWidth onClick={() => toast.show('Campaign activated', 'success')} icon={<Play className="w-4 h-4" />}>
                    Activate
                  </Button>
                )}
                {c.active && (
                  <Button variant="outline" size="sm" fullWidth onClick={() => toast.show('Campaign archived', 'info')} icon={<Archive className="w-4 h-4" />}>
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal open={true} onClose={() => setShowAdd(false)} title="Start New Campaign" size="md">
          <div className="p-6 space-y-4">
            <Input label="Campaign Name" placeholder="e.g. Campaign 2" />
            <Textarea label="Description" placeholder="Brief description of this campaign..." rows={3} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Start Date" type="date" />
              <Input label="End Date" type="date" />
            </div>
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
              <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Starting a new campaign will archive the current active campaign. Existing orders will be preserved.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" fullWidth onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button fullWidth onClick={() => { toast.show('New campaign started!', 'success'); setShowAdd(false); }} icon={<Check className="w-5 h-5" />}>
                Start Campaign
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
