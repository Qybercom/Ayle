declare module '@qybercom/ayle' {}

declare module '@qybercom/ayle/bootstrap' {
	import type { AyleInstance } from './types';

	export class AyleBootstrap {
		constructor(options?: Record<string, any>);

		static Clone<T>(value: T): T;
		static Merge<T extends Record<string, any>, U extends Record<string, any>>(
			base: T,
			extra: U
		): T & U;
		static RegisterPreset(name: string, preset: Record<string, any>): typeof AyleBootstrap;
		static GetPreset(name: string): Record<string, any> | null;
		static HasPreset(name: string): boolean;
		static RemovePreset(name: string): boolean;
		static RegisterDriver(name: string, driver: Function): typeof AyleBootstrap;
		static GetDriver(name: string): Function | null;
		static HasDriver(name: string): boolean;
		static RemoveDriver(name: string): boolean;
		static CreateDriver(name: string, options?: Record<string, any>): any;
		static RegisterMediaProvider(name: string, provider: Function): typeof AyleBootstrap;
		static GetMediaProvider(name: string): Function | null;
		static HasMediaProvider(name: string): boolean;
		static RemoveMediaProvider(name: string): boolean;
		static CreateMediaProvider(
			name: string,
			player: any,
			options?: Record<string, any>
		): any;

		RegisterPreset(name: string, preset: Record<string, any>): this;
		GetPreset(name: string): Record<string, any> | null;
		HasPreset(name: string): boolean;
		RemovePreset(name: string): boolean;
		RegisterDriver(name: string, driver: Function): this;
		GetDriver(name: string): Function | null;
		HasDriver(name: string): boolean;
		RemoveDriver(name: string): boolean;
		CreateDriver(name: string, options?: Record<string, any>): any;
		RegisterMediaProvider(name: string, provider: Function): this;
		GetMediaProvider(name: string): Function | null;
		HasMediaProvider(name: string): boolean;
		RemoveMediaProvider(name: string): boolean;
		CreateMediaProvider(
			name: string,
			player: any,
			options?: Record<string, any>
		): any;

		Init(element: HTMLElement, config?: Record<string, any>): AyleInstance;
		Destroy(target: string | AyleInstance): boolean;
		Get(id: string): AyleInstance | null;
	}
}