
export interface AnalysisResult {
  masterPrompt: string;
  negativePrompt: string;
}

export interface MediaFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  base64?: string;
}
