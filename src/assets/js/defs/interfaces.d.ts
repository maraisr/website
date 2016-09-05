declare var __DEV__: boolean;
declare var ga: any;

interface TrackingInterface {
	track(label: string, event: string, data: string): void;
}
