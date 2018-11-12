export declare const schema: Map<string, {
    entry: string;
    name: string;
    type: string;
    parent?: undefined;
    category?: undefined;
} | {
    entry: string;
    name: string;
    parent: string;
    type: string;
    category?: undefined;
} | {
    entry: string;
    name: string;
    parent: string;
    category: string;
    type: string;
}>;
export declare const keys: string[];
