declare var __DEV__: boolean;
declare var ga: any;
declare var fbq: any;

interface TrackingInterface {
	track(label: string, event: string, data: string): void;
}
