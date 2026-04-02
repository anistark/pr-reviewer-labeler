import { Threshold, FileWeight } from "./config";
export interface FileChange {
    filename: string;
    additions: number;
    deletions: number;
}
export interface ReviewerResult {
    reviewerCount: number;
    totalLines: number;
    weightedLines: number;
    label: string;
}
export declare function calculateWeightedLines(files: FileChange[], fileWeights: FileWeight[]): {
    totalLines: number;
    weightedLines: number;
};
export declare function determineReviewerCount(lines: number, thresholds: Threshold[]): number;
export declare function getReviewerResult(files: FileChange[], thresholds: Threshold[], fileWeights: FileWeight[], labelPrefix: string): ReviewerResult;
