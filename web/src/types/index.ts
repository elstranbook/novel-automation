export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail: string;
  baseImage: string;
  width: number;
  height: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Book-specific fields
  coverWidth?: number | null;
  coverHeight?: number | null;
  spineWidth?: number | null;
  warpPreset?: string | null;
  layers: TemplateLayer[];
  colorOptions: ColorOption[];
}

export interface TemplateLayer {
  id: string;
  templateId: string;
  name: string;
  type: 'smart_object' | 'color_layer' | 'shadow' | 'texture' | 'overlay' | 'base' | 'spine' | 'pages';
  zIndex: number;
  transformX: number | null;
  transformY: number | null;
  transformScaleX: number | null;
  transformScaleY: number | null;
  transformRotation: number | null;
  boundsX: number | null;
  boundsY: number | null;
  boundsWidth: number | null;
  boundsHeight: number | null;
  bounds?: { x: number; y: number; width: number; height: number } | null;
  warpData: any | null;
  perspectiveData: any | null;
  perspectiveTransform?: any | null;
  maskPath: string | null;
  blendMode: string;
  opacity: number;
  defaultColor: string | null;
  isColorable: boolean;
  layerPart: string | null;
  compositeUrl: string | null;
  createdAt: Date;
}

export interface ColorOption {
  id: string;
  templateId: string;
  name: string;
  layerName: string;
  colors: ColorSwatch[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface DesignState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface EditorState {
  // Current template
  selectedTemplate: Template | null;
  
  // Uploaded design
  userImage: string | null;
  userImageWidth: number | null;
  userImageHeight: number | null;
  
  // Design manipulation
  design: DesignState;
  
  // Color selections per color option
  colorSelections: Record<string, string>;
  
  // UI state
  activeTab: 'gallery' | 'editor';
  isLoading: boolean;
  
  // Preview canvas ref
  canvasReady: boolean;
}

export interface RenderJob {
  id: string;
  templateId: string;
  userImage: string;
  designX: number;
  designY: number;
  designScale: number;
  designRotation: number;
  colorSelections: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl: string | null;
  progress?: number;
  createdAt: Date;
  completedAt: Date | null;
}

// Canvas rendering types
export interface CanvasLayer {
  type: string;
  image?: HTMLImageElement;
  color?: string;
  blendMode: string;
  opacity: number;
  transform?: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
  maskPath?: string;
  zIndex: number;
}

export interface TransformHandle {
  x: number;
  y: number;
  cursor: string;
}

// API response types
export interface TemplatesResponse {
  templates: Template[];
  total: number;
}

export interface UploadResponse {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export interface RenderResponse {
  id: string;
  status: string;
  resultUrl?: string;
  progress?: number;
}

// Category type
export type Category = {
  id: string;
  name: string;
  icon: string;
};

// Book-specific types
export interface BookDimensions {
  coverWidth: number; // in inches
  coverHeight: number; // in inches
  spineWidth: number; // in inches
}

export interface BookCoverState extends DesignState {
  // Spine-specific adjustments
  spineX: number;
  spineScale: number;
  spineRotation: number;
  
  // Page edge color
  pageColor: string;
  
  // Book finish
  finish: 'matte' | 'glossy' | 'soft_touch';
}

export interface BookTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverWidth: number;
  coverHeight: number;
  spineWidth: number;
  thumbnail: string;
  previewImage: string;
  baseImage: string;
  warpPreset: string;
  bookType: 'hardcover' | 'paperback' | 'dust_jacket';
  showPages: boolean;
  pageColor: string;
  showShadow: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Warp types for book covers
export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface WarpPreset {
  name: string;
  description: string;
  type: 'flatFront' | 'angledWithSpine' | 'stackedOnTable' | 'openSpread' | 'bookshelf' | 'handHeld' | 'floating';
  angle?: number; // for angled views
}

// PSD types
export interface ParsedPSD {
  width: number;
  height: number;
  layers: ParsedLayer[];
  smartObjects: SmartObject[];
  colorLayers: ColorLayer[];
  resolution: number;
}

export interface ParsedLayer {
  name: string;
  type: 'smart_object' | 'color_layer' | 'shadow' | 'texture' | 'adjustment' | 'group' | 'base';
  bounds: { x: number; y: number; width: number; height: number };
  transform?: PerspectiveTransform;
  warpData?: WarpMesh;
  blendMode: string;
  opacity: number;
  visible: boolean;
}

export interface PerspectiveTransform {
  corners: [
    { x: number; y: number }, // TL
    { x: number; y: number }, // TR
    { x: number; y: number }, // BR
    { x: number; y: number }  // BL
  ];
}

export interface WarpMesh {
  type: 'perspective' | 'mesh' | 'arc' | 'custom' | 'none';
  gridSize: { rows: number; cols: number };
  controlPoints: Array<{ x: number; y: number; offsetX: number; offsetY: number }>;
}

export interface SmartObject {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  transform?: PerspectiveTransform;
  warp?: WarpMesh;
  layerId: number;
}

export interface ColorLayer {
  name: string;
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
  blendMode: string;
  opacity: number;
}

// Queue types
export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  queueLength: number;
}

// Subcategory type for gallery
export interface Subcategory {
  id: string;
  name: string;
  parentCategory: string;
}
