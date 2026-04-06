// mouse cursor style
import { atom } from 'jotai';

import type { MouseCalibration, MouseCalibrationProfile } from '@/types.ts';

export const mouseStyleAtom = atom('cursor-default');

// mouse mode: absolute or relative
export const mouseModeAtom = atom('absolute');

// mouse scroll direction: 1 or -1
export const scrollDirectionAtom = atom(-1);

// mouse scroll interval (unit: ms)
// mouse scroll interval (unit: ms)
export const scrollIntervalAtom = atom(0);

// mouse jiggler mode: enable or disable
export const mouseJigglerModeAtom = atom<'enable' | 'disable'>('disable');

export const defaultMouseCalibration: MouseCalibration = {
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0
};

export const defaultMouseCalibrationProfileId = 'default';
export const iPhoneMouseCalibrationProfileId = 'iphone';

export const defaultMouseCalibrationProfiles: MouseCalibrationProfile[] = [
  {
    id: defaultMouseCalibrationProfileId,
    name: 'Default',
    calibration: defaultMouseCalibration
  },
  {
    id: iPhoneMouseCalibrationProfileId,
    name: 'iPhone',
    calibration: {
      scaleX: 4.3,
      scaleY: 1.11,
      offsetX: 0,
      offsetY: 0
    }
  }
];

export const mouseCalibrationAtom = atom<MouseCalibration>(defaultMouseCalibration);
export const mouseCalibrationProfilesAtom = atom<MouseCalibrationProfile[]>(
  defaultMouseCalibrationProfiles
);
export const mouseCalibrationProfileIdAtom = atom(defaultMouseCalibrationProfileId);
