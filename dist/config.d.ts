export interface Threshold {
    lines: number;
    reviewers: number;
}
export interface FileWeight {
    glob: string;
    weight: number;
}
export interface Config {
    repoToken: string;
    thresholds: Threshold[];
    addLabel: boolean;
    addComment: boolean;
    labelPrefix: string;
    fileWeights: FileWeight[];
}
export declare function parseThresholds(input: string): Threshold[];
export declare function parseFileWeights(input: string): FileWeight[];
export declare function getConfig(): Config;
