export const nameof = <T>(name: Extract<KnownKeys<T>, string>): string => name;

type KnownKeys<T> = {
	[K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;
