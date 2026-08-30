import type {
	AyleConfig,
	AyleDriver,
	AyleInstance,
	AyleMediaProvider,
	AylePlayer,
	AylePresetConfig,
	AyleUnknownObject
} from './index.js';

export interface AyleBootstrapOptions extends AyleConfig {
	AssetBase?: string;
	AutoInit?: boolean;
	Selector?: string;
}

export class AyleBootstrap {
	constructor(options?: AyleBootstrapOptions);

	static Clone<T>(value: T): T;
	static Merge<T extends object, U extends object>(base: T, extra: U): T & U;
	static RegisterPreset(name: string, preset: AylePresetConfig): typeof AyleBootstrap;
	static GetPreset(name: string): AylePresetConfig | null;
	static HasPreset(name: string): boolean;
	static RemovePreset(name: string): boolean;
	static RegisterDriver(name: string, driver: Function): typeof AyleBootstrap;
	static GetDriver(name: string): Function | null;
	static HasDriver(name: string): boolean;
	static RemoveDriver(name: string): boolean;
	static CreateDriver(name: string, options?: unknown): AyleDriver;
	static RegisterMediaProvider(name: string, provider: Function): typeof AyleBootstrap;
	static GetMediaProvider(name: string): Function | null;
	static HasMediaProvider(name: string): boolean;
	static RemoveMediaProvider(name: string): boolean;
	static CreateMediaProvider(
		name: string,
		player: AylePlayer,
		options?: AyleUnknownObject
	): AyleMediaProvider;

	RegisterPreset(name: string, preset: AylePresetConfig): this;
	GetPreset(name: string): AylePresetConfig | null;
	HasPreset(name: string): boolean;
	RemovePreset(name: string): boolean;
	RegisterDriver(name: string, driver: Function): this;
	GetDriver(name: string): Function | null;
	HasDriver(name: string): boolean;
	RemoveDriver(name: string): boolean;
	CreateDriver(name: string, options?: unknown): AyleDriver;
	RegisterMediaProvider(name: string, provider: Function): this;
	GetMediaProvider(name: string): Function | null;
	HasMediaProvider(name: string): boolean;
	RemoveMediaProvider(name: string): boolean;
	CreateMediaProvider(
		name: string,
		player: AylePlayer,
		options?: AyleUnknownObject
	): AyleMediaProvider;

	Init(element: HTMLElement, config?: AyleConfig): AyleInstance;
	Destroy(target: string | AyleInstance): boolean;
	Get(id: string): AyleInstance | null;
}
