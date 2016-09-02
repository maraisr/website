declare var __DEV__: boolean;

interface TrackingInterface {
	track(label: string, event: string, data: string): void;
}
