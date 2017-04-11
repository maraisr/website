declare var __DEV__: boolean;
declare var __BUILD__: string;
declare var ga: any;
declare var fbq: any;

interface TrackingInterface {
	track(label: string, event: string, data: string): void;
}
