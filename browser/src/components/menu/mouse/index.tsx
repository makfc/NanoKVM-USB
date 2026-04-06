import { useEffect, useState } from 'react';
import { Divider, Popover } from 'antd';
import { useAtom, useSetAtom } from 'jotai';
import { MouseIcon } from 'lucide-react';

import {
  defaultMouseCalibration,
  defaultMouseCalibrationProfileId,
  defaultMouseCalibrationProfiles,
  mouseCalibrationAtom,
  mouseCalibrationProfileIdAtom,
  mouseCalibrationProfilesAtom,
  mouseJigglerModeAtom,
  mouseModeAtom,
  mouseStyleAtom,
  scrollDirectionAtom,
  scrollIntervalAtom
} from '@/jotai/mouse.ts';
import { mouseJiggler } from '@/libs/mouse-jiggler';
import * as storage from '@/libs/storage';

import { Calibration } from './calibration.tsx';
import { Direction } from './direction.tsx';
import { Jiggler } from './jiggler.tsx';
import { Mode } from './mode.tsx';
import { Speed } from './speed.tsx';
import { Style } from './style.tsx';

export const Mouse = () => {
  const [mouseStyle, setMouseStyle] = useAtom(mouseStyleAtom);
  const [mouseMode, setMouseMode] = useAtom(mouseModeAtom);
  const setMouseCalibration = useSetAtom(mouseCalibrationAtom);
  const setMouseCalibrationProfileId = useSetAtom(mouseCalibrationProfileIdAtom);
  const setMouseCalibrationProfiles = useSetAtom(mouseCalibrationProfilesAtom);
  const setScrollDirection = useSetAtom(scrollDirectionAtom);
  const setScrollInterval = useSetAtom(scrollIntervalAtom);
  const setMouseJigglerMode = useSetAtom(mouseJigglerModeAtom);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    initMouse();
  }, []);

  function initMouse() {
    const style = storage.getMouseStyle();
    if (style && style !== mouseStyle) {
      setMouseStyle(style);
    }

    const mode = storage.getMouseMode();
    if (mode && mode !== mouseMode) {
      setMouseMode(mode);
    }

    const direction = storage.getMouseScrollDirection();
    if (direction) {
      setScrollDirection(direction > 0 ? 1 : -1);
    }

    const interval = storage.getMouseScrollInterval();
    if (interval) {
      setScrollInterval(interval);
    }

    const singleCalibration = storage.getMouseCalibration() || defaultMouseCalibration;
    const storageProfiles = storage.getMouseCalibrationProfiles();
    const fallbackProfiles = defaultMouseCalibrationProfiles.map((profile, index) =>
      index === 0 ? { ...profile, calibration: singleCalibration } : profile
    );
    const profiles =
      storageProfiles && storageProfiles.length > 0
        ? [
            ...storageProfiles,
            ...defaultMouseCalibrationProfiles.filter(
              (defaultProfile) =>
                !storageProfiles.some((profile) => profile.id === defaultProfile.id)
            )
          ]
        : fallbackProfiles;
    setMouseCalibrationProfiles(profiles);
    storage.setMouseCalibrationProfiles(profiles);

    const storageProfileId = storage.getMouseCalibrationProfileId();
    const activeProfileId =
      storageProfileId && profiles.some((profile) => profile.id === storageProfileId)
        ? storageProfileId
        : profiles[0]?.id || defaultMouseCalibrationProfileId;
    setMouseCalibrationProfileId(activeProfileId);
    storage.setMouseCalibrationProfileId(activeProfileId);

    const activeProfile =
      profiles.find((profile) => profile.id === activeProfileId) || defaultMouseCalibrationProfiles[0];
    setMouseCalibration(activeProfile.calibration);
    storage.setMouseCalibration(activeProfile.calibration);

    const jiggler = storage.getMouseJigglerMode();
    mouseJiggler.setMode(jiggler);
    setMouseJigglerMode(jiggler);
  }

  const content = (
    <div className="flex flex-col space-y-0.5">
      <Style />
      <Mode />
      {mouseMode === 'absolute' ? <Calibration /> : null}
      <Direction />
      <Speed />

      <Divider style={{ margin: '5px 0 5px 0' }} />
      <Jiggler />
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      trigger="click"
      arrow={false}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <div className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded text-neutral-300 hover:bg-neutral-700/70 hover:text-white">
        <MouseIcon size={18} />
      </div>
    </Popover>
  );
};
