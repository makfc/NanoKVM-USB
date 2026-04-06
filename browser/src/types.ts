export type Resolution = {
  width: number;
  height: number;
};

export type Rotation = 0 | 90 | 180 | 270;

export type MediaDevice = {
  videoId: string;
  videoName: string;
  audioId?: string;
  audioName?: string;
};

export type MouseCalibration = {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
};

export type MouseCalibrationProfile = {
  id: string;
  name: string;
  calibration: MouseCalibration;
};
