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

		RegisterPreset(name: string, preset: Record<string, any>): this;
		GetPreset(name: string): Record<string, any> | null;
		HasPreset(name: string): boolean;
		RemovePreset(name: string): boolean;

		Init(element: HTMLElement, config?: Record<string, any>): AyleInstance;
		Destroy(target: string | AyleInstance): boolean;
		Get(id: string): AyleInstance | null;
	}
}