import * as THREE from 'three';

export interface GestureState {
  isTracking: boolean;
  twoHandPinchZoom: number;
  fistRotationQuat: THREE.Quaternion;
  palmPanOffset: THREE.Vector3;
  explosionFactor: number;
}

export class GestureCADController {
  private camera: THREE.Camera;
  private targetLookAt: THREE.Vector3;
  private isCameraConnected: boolean = false;

  constructor(camera: THREE.Camera, targetLookAt: THREE.Vector3) {
    this.camera = camera;
    this.targetLookAt = targetLookAt;
  }

  public initWebcamGestures(): Promise<boolean> {
    // If browser supports MediaStream and user enables webcam, hook up hand tracking
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          this.isCameraConnected = true;
          return true;
        })
        .catch(() => {
          this.isCameraConnected = false;
          return false;
        });
    }
    return Promise.resolve(false);
  }

  public isTracking(): boolean {
    return this.isCameraConnected;
  }
}
