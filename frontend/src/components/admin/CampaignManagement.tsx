import { useEffect, useState } from 'react';
import {
  Plus,
  Archive,
  Play,
  Calendar,
  TrendingUp,
  FolderOpen,
  Check,
} from 'lucide-react';

import type { Campaign } from '@/types';

import {
  Badge,
  Button,
  Input,
  Textarea,
} from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

import {
  createCampaign,
  activateCampaign,
  archiveCampaign,
  getCampaigns,
} from '@/api';

interface CampaignManagementProps {
  campaigns: Campaign[];
}

interface CampaignForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

const emptyForm: CampaignForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
};

export function CampaignManagement({
  campaigns,
}: CampaignManagementProps) {
  const toast = useToast();

  const [localCampaigns, setLocalCampaigns] =
    useState<Campaign[]>(campaigns);

  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] =
    useState<CampaignForm>(emptyForm);

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  // Keep local state synchronized with the parent.
  useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  const refreshCampaigns = async () => {
    try {
      const response = await getCampaigns();
      setLocalCampaigns(response.campaigns);
    } catch (error) {
      console.error('Failed to refresh campaigns:', error);
    }
  };

  const handleCreate = async () => {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.show('Campaign name is required', 'error');
      return;
    }

    if (!form.startDate) {
      toast.show('Start date is required', 'error');
      return;
    }

    if (!form.endDate) {
      toast.show('End date is required', 'error');
      return;
    }

    if (form.endDate < form.startDate) {
      toast.show(
        'End date must be after the start date',
        'error'
      );
      return;
    }

    try {
      setLoading(true);

      await createCampaign({
        name,
        description,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      toast.show(
        'New campaign started successfully',
        'success'
      );

      setForm(emptyForm);
      setShowAdd(false);

      await refreshCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to create campaign',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (campaign: Campaign) => {
    try {
      setActionLoading(campaign.id);

      const response = await activateCampaign(campaign.id);

      /*
       * The backend returns the newly active campaign.
       * Make every other campaign inactive locally.
       */
      setLocalCampaigns((current) =>
        current.map((item) => ({
          ...item,
          active: item.id === response.campaign.id,
        }))
      );

      toast.show(
        `"${campaign.name}" is now active`,
        'success'
      );

      // Refresh order counts and sales as well.
      await refreshCampaigns();
    } catch (error) {
      console.error('Failed to activate campaign:', error);

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to activate campaign',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (campaign: Campaign) => {
    try {
      setActionLoading(campaign.id);

      await archiveCampaign(campaign.id);

      setLocalCampaigns((current) =>
        current.map((item) =>
          item.id === campaign.id
            ? { ...item, active: false }
            : item
        )
      );

      toast.show(
        `"${campaign.name}" has been archived`,
        'info'
      );

      await refreshCampaigns();
    } catch (error) {
      console.error('Failed to archive campaign:', error);

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to archive campaign',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-brand-cranberry" />

          <div>
            <h2 className="text-base font-bold text-navy-800">
              Campaign Management
            </h2>

            <p className="text-xs text-navy-400 mt-0.5">
              Manage fundraising campaigns
            </p>
          </div>
        </div>

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setForm(emptyForm);
            setShowAdd(true);
          }}
        >
          Start New Campaign
        </Button>
      </div>

      {/* Campaign cards */}
      {localCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-navy-100 p-10 text-center">
          <FolderOpen className="w-10 h-10 mx-auto text-navy-200 mb-3" />

          <h3 className="font-bold text-navy-700">
            No campaigns yet
          </h3>

          <p className="text-sm text-navy-400 mt-1">
            Create your first fundraising campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {localCampaigns.map((campaign) => {
            const isLoading =
              actionLoading === campaign.id;

            return (
              <div
                key={campaign.id}
                className={`bg-white rounded-2xl border-2 shadow-soft overflow-hidden ${
                  campaign.active
                    ? 'border-brand-cranberry'
                    : 'border-navy-100'
                }`}
              >
                <div className="p-5">
                  {/* Campaign title */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-navy-800 text-lg">
                        {campaign.name}
                      </h3>

                      <p className="text-sm text-navy-400 mt-0.5">
                        {campaign.description ||
                          'No description provided.'}
                      </p>
                    </div>

                    <Badge
                      color={
                        campaign.active
                          ? 'emerald'
                          : 'gray'
                      }
                    >
                      {campaign.active ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </>
                      ) : (
                        'Archived'
                      )}
                    </Badge>
                  </div>

                  {/* Campaign statistics */}
                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="bg-navy-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-navy-400 font-semibold">
                        Orders
                      </p>

                      <p className="text-lg font-extrabold text-navy-800">
                        {campaign.orderCount}
                      </p>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-navy-400 font-semibold">
                        Sales
                      </p>

                      <p className="text-lg font-extrabold text-navy-800">
                        {campaign.totalSales.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-navy-400 font-semibold">
                        Period
                      </p>

                      <p className="text-xs font-bold text-navy-700 mt-1.5">
                        {campaign.startDate} →{' '}
                        {campaign.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-navy-400 mb-4">
                    <Calendar className="w-4 h-4" />

                    <span>
                      {campaign.startDate} to{' '}
                      {campaign.endDate}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!campaign.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        disabled={isLoading}
                        onClick={() =>
                          handleActivate(campaign)
                        }
                        icon={
                          <Play className="w-4 h-4" />
                        }
                      >
                        {isLoading
                          ? 'Activating...'
                          : 'Activate'}
                      </Button>
                    )}

                    {campaign.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        disabled={isLoading}
                        onClick={() =>
                          handleArchive(campaign)
                        }
                        icon={
                          <Archive className="w-4 h-4" />
                        }
                      >
                        {isLoading
                          ? 'Archiving...'
                          : 'Archive'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create campaign modal */}
      {showAdd && (
        <Modal
          open={true}
          onClose={() => {
            if (!loading) {
              setShowAdd(false);
            }
          }}
          title="Start New Campaign"
          size="md"
        >
          <div className="p-6 space-y-4">
            <Input
              label="Campaign Name"
              placeholder="e.g. Rotaract Fundraising Campaign 2026"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
            />

            <Textarea
              label="Description"
              placeholder="Brief description of this campaign..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    startDate: e.target.value,
                  }))
                }
              />

              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
              <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

              <p className="text-sm text-amber-700">
                Starting a new campaign will archive the
                current active campaign. Existing orders
                will be preserved.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                fullWidth
                disabled={loading}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>

              <Button
                fullWidth
                disabled={loading}
                onClick={handleCreate}
                icon={
                  <Check className="w-5 h-5" />
                }
              >
                {loading
                  ? 'Starting...'
                  : 'Start Campaign'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}