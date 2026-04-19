import { create } from 'zustand';
import type { Template, EditorState, DesignState } from '@/types';

interface MockupStore extends EditorState {
  // Template actions
  setSelectedTemplate: (template: Template | null) => void;
  
  // User image actions
  setUserImage: (image: string | null, width?: number, height?: number) => void;
  
  // Design manipulation actions
  updateDesign: (updates: Partial<DesignState>) => void;
  resetDesign: () => void;
  
  // Color selection actions
  setColorSelection: (layerName: string, color: string) => void;
  resetColorSelections: () => void;
  
  // UI actions
  setActiveTab: (tab: 'gallery' | 'editor') => void;
  setIsLoading: (loading: boolean) => void;
  setCanvasReady: (ready: boolean) => void;
  
  // Full reset
  reset: () => void;
}

const defaultDesignState: DesignState = {
  x: 0.5, // Normalized 0-1
  y: 0.5, // Normalized 0-1
  scale: 0.3, // Relative to template width
  rotation: 0,
};

const initialState: EditorState = {
  selectedTemplate: null,
  userImage: null,
  userImageWidth: null,
  userImageHeight: null,
  design: { ...defaultDesignState },
  colorSelections: {},
  activeTab: 'gallery',
  isLoading: false,
  canvasReady: false,
};

export const useMockupState = create<MockupStore>((set, get) => ({
  ...initialState,
  
  setSelectedTemplate: (template) => {
    // Initialize color selections with default colors
    const colorSelections: Record<string, string> = {};
    if (template) {
      template.layers.forEach((layer) => {
        if (layer.isColorable && layer.defaultColor) {
          colorSelections[layer.name] = layer.defaultColor;
        }
      });
      
      template.colorOptions.forEach((option) => {
        const colors = option.colors as { name: string; hex: string }[];
        if (colors.length > 0) {
          colorSelections[option.layerName] = colors[0].hex;
        }
      });
    }
    
    set({
      selectedTemplate: template,
      colorSelections: { ...get().colorSelections, ...colorSelections },
      // Don't reset design pos/scale if we already have an image
      design: get().userImage ? get().design : { ...defaultDesignState },
      activeTab: template ? 'editor' : 'gallery',
    });
  },
  
  setUserImage: (image, width, height) => {
    console.log("📦 setUserImage called with:", image ? image.substring(0, 50) + "..." : "null");
    set({
      userImage: image,
      userImageWidth: width ?? null,
      userImageHeight: height ?? null,
    });
  },
  
  updateDesign: (updates) => {
    const currentDesign = get().design;
    set({
      design: { ...currentDesign, ...updates },
    });
  },
  
  resetDesign: () => {
    set({ design: { ...defaultDesignState } });
  },
  
  setColorSelection: (layerName, color) => {
    set((state) => ({
      colorSelections: { ...state.colorSelections, [layerName]: color },
    }));
  },
  
  resetColorSelections: () => {
    set({ colorSelections: {} });
  },
  
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  
  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setCanvasReady: (ready) => {
    set({ canvasReady: ready });
  },
  
  reset: () => {
    set({ ...initialState });
  },
}));
