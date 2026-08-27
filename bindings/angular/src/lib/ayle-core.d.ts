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

		Init(element: HTMLElement, config?: Record<string, any>): AyleInstance;
		Destroy(target: string | AyleInstance): boolean;
		Get(id: string): AyleInstance | null;
	}
}