import { ReactElement, useState } from 'react';
import { Button, Input, InputNumber, Popover, Select } from 'antd';
import { useAtom } from 'jotai';
import { MousePointerIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  defaultMouseCalibration,
  mouseCalibrationAtom,
  mouseCalibrationProfileIdAtom,
  mouseCalibrationProfilesAtom
} from '@/jotai/mouse.ts';
import * as storage from '@/libs/storage';
import type { MouseCalibration, MouseCalibrationProfile } from '@/types.ts';

type FieldConfig = {
  key: keyof MouseCalibration;
  min: number;
  max: number;
  step: number;
  precision: number;
  labelKey: string;
};

const fields: FieldConfig[] = [
  { key: 'scaleX', min: 0.2, max: 10, step: 0.01, precision: 2, labelKey: 'mouse.calibration.scaleX' },
  { key: 'scaleY', min: 0.2, max: 10, step: 0.01, precision: 2, labelKey: 'mouse.calibration.scaleY' },
  {
    key: 'offsetX',
    min: -0.5,
    max: 0.5,
    step: 0.001,
    precision: 3,
    labelKey: 'mouse.calibration.offsetX'
  },
  {
    key: 'offsetY',
    min: -0.5,
    max: 0.5,
    step: 0.001,
    precision: 3,
    labelKey: 'mouse.calibration.offsetY'
  }
];

function createProfileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `profile-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export const Calibration = (): ReactElement => {
  const { t } = useTranslation();
  const [profileName, setProfileName] = useState('');
  const [mouseCalibration, setMouseCalibration] = useAtom(mouseCalibrationAtom);
  const [mouseCalibrationProfiles, setMouseCalibrationProfiles] = useAtom(mouseCalibrationProfilesAtom);
  const [mouseCalibrationProfileId, setMouseCalibrationProfileId] = useAtom(mouseCalibrationProfileIdAtom);

  const activeProfile =
    mouseCalibrationProfiles.find((profile) => profile.id === mouseCalibrationProfileId) ||
    mouseCalibrationProfiles[0];
  const profileOptions = mouseCalibrationProfiles.map((profile) => ({
    label: (
      <span className="block truncate" title={profile.name}>
        {profile.name}
      </span>
    ),
    value: profile.id
  }));

  function updateValue(key: keyof MouseCalibration, value: number | null): void {
    if (!activeProfile || value === null || !Number.isFinite(value)) {
      return;
    }

    const nextCalibration: MouseCalibration = {
      ...mouseCalibration,
      [key]: value
    };
    const nextProfiles = mouseCalibrationProfiles.map((profile) =>
      profile.id === activeProfile.id ? { ...profile, calibration: nextCalibration } : profile
    );

    setMouseCalibration(nextCalibration);
    setMouseCalibrationProfiles(nextProfiles);
    storage.setMouseCalibration(nextCalibration);
    storage.setMouseCalibrationProfiles(nextProfiles);
  }

  function reset(): void {
    if (!activeProfile) {
      return;
    }

    const nextCalibration = { ...defaultMouseCalibration };
    const nextProfiles = mouseCalibrationProfiles.map((profile) =>
      profile.id === activeProfile.id ? { ...profile, calibration: nextCalibration } : profile
    );

    setMouseCalibration(nextCalibration);
    setMouseCalibrationProfiles(nextProfiles);
    storage.setMouseCalibration(nextCalibration);
    storage.setMouseCalibrationProfiles(nextProfiles);
  }

  function switchProfile(profileId: string): void {
    const profile = mouseCalibrationProfiles.find((item) => item.id === profileId);
    if (!profile) {
      return;
    }

    setMouseCalibrationProfileId(profile.id);
    setMouseCalibration(profile.calibration);
    storage.setMouseCalibrationProfileId(profile.id);
    storage.setMouseCalibration(profile.calibration);
  }

  function saveProfile(): void {
    const name =
      profileName.trim() || `${t('mouse.calibration.profile')} ${mouseCalibrationProfiles.length + 1}`;
    const profile: MouseCalibrationProfile = {
      id: createProfileId(),
      name,
      calibration: { ...mouseCalibration }
    };
    const nextProfiles = [...mouseCalibrationProfiles, profile];

    setMouseCalibrationProfiles(nextProfiles);
    setMouseCalibrationProfileId(profile.id);
    setProfileName('');
    storage.setMouseCalibrationProfiles(nextProfiles);
    storage.setMouseCalibrationProfileId(profile.id);
  }

  function deleteProfile(): void {
    if (!activeProfile || mouseCalibrationProfiles.length <= 1) {
      return;
    }

    const nextProfiles = mouseCalibrationProfiles.filter((profile) => profile.id !== activeProfile.id);
    const nextActiveProfile = nextProfiles[0];
    if (!nextActiveProfile) {
      return;
    }

    setMouseCalibrationProfiles(nextProfiles);
    setMouseCalibrationProfileId(nextActiveProfile.id);
    setMouseCalibration(nextActiveProfile.calibration);
    storage.setMouseCalibrationProfiles(nextProfiles);
    storage.setMouseCalibrationProfileId(nextActiveProfile.id);
    storage.setMouseCalibration(nextActiveProfile.calibration);
  }

  const content = (
    <div className="w-[320px] space-y-3 px-1 py-1.5">
      <div className="space-y-2">
        <div className="space-y-1">
          <span className="text-xs text-neutral-300">{t('mouse.calibration.profile')}</span>
          <Select
            value={activeProfile?.id}
            options={profileOptions}
            title={activeProfile?.name}
            className="w-full"
            size="small"
            onChange={switchProfile}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Input
            value={profileName}
            size="small"
            placeholder={t('mouse.calibration.namePlaceholder')}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <Button size="small" type="default" onClick={saveProfile}>
            <PlusIcon size={12} />
            {t('mouse.calibration.saveProfile')}
          </Button>
          <Button
            size="small"
            danger
            disabled={mouseCalibrationProfiles.length <= 1}
            onClick={deleteProfile}
          >
            <Trash2Icon size={12} />
            {t('mouse.calibration.deleteProfile')}
          </Button>
        </div>
      </div>

      {fields.map((field) => (
        <div key={field.key} className="flex items-center justify-between space-x-3">
          <span className="text-xs text-neutral-300">{t(field.labelKey)}</span>
          <InputNumber
            value={mouseCalibration[field.key]}
            controls={false}
            min={field.min}
            max={field.max}
            step={field.step}
            precision={field.precision}
            className="w-[96px]"
            onChange={(value) => updateValue(field.key, value)}
          />
        </div>
      ))}

      <div className="flex justify-end">
        <Button size="small" onClick={reset}>
          {t('mouse.calibration.reset')}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} placement="rightTop" arrow={false} align={{ offset: [13, 0] }}>
      <div className="flex h-[32px] cursor-pointer items-center space-x-2 rounded px-3 text-neutral-300 hover:bg-neutral-700/50">
        <MousePointerIcon size={16} />
        <span>{t('mouse.calibration.title')}</span>
      </div>
    </Popover>
  );
};
