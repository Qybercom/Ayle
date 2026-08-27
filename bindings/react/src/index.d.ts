import type {
	CSSProperties,
	ForwardRefExoticComponent,
	RefAttributes
} from 'react';

export interface AyleEventWrapper {
	Type: string;
	Data: unknown;
	Player: any;
	Instance: any;
	Element: HTMLElement;
}

export interface AylePlayerHandle {
	readonly Element: HTMLElement | null;
	readonly Instance: any;
	readonly Player: any;
	readonly UI: any;
	readonly HTTP: any;
	Reload(): any;
}

export interface AylePlayerProps {
	id?: string;
	preset?: string;
	file?: string;
	config?: Record<string, any>;
	playerConfig?: Record<string, any>;
	mediaConfig?: Record<string, any>;
	player?: Record<string, any>;
	http?: Record<string, any>;
	driver?: 'mse' | 'html5' | string;
	driverOptions?: Record<string, any>;
	localization?: string | Record<string, string> | null;
	settings?: 'localStorage' | 'sessionStorage' | 'cookie' | '' | null | false;
	debug?: boolean;
	events?: Record<string, (data: any, instance: any) => void>;
	onEvent?: (event: AyleEventWrapper) => void;
	onReady?: (instance: any) => void;
	onDestroy?: (instance: any) => void;
	reloadKey?: string | number;
	className?: string;
	style?: CSSProperties;
}

export declare const AYLE_EVENTS: readonly string[];
export declare const AylePlayer: ForwardRefExoticComponent<
	AylePlayerProps & RefAttributes<AylePlayerHandle>
>;