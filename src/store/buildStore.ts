import { create } from 'zustand';
import type { Killer, Perk, Addon, Offering, Platform, Build } from '../types';
import { socketService } from './socketService';

interface BuildState {
  selectedKiller: Killer | null;
  selectedPerks: Perk[];
  selectedAddons: Addon[];
  selectedOffering: Offering | null;
  selectedPlatform: Platform | null;
  
  // Actions
  setKiller: (killer: Killer | null) => void;
  addPerk: (perk: Perk) => void;
  removePerk: (perkId: string) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addonId: string) => void;
  setOffering: (offering: Offering | null) => void;
  setPlatform: (platform: Platform | null) => void;
  reset: () => void;
  initializeSocket: () => void;
  syncBuild: () => void;
}

const initialState = {
  selectedKiller: null,
  selectedPerks: [],
  selectedAddons: [],
  selectedOffering: null,
  selectedPlatform: null,
};

export const useBuildStore = create<BuildState>((set, get) => ({
  ...initialState,

  setKiller: (killer) => {
    // Clear addons when killer changes since they may not be compatible
    set({ selectedKiller: killer, selectedAddons: [] });
  },

  addPerk: (perk) => {
    const { selectedPerks } = get();
    if (selectedPerks.length < 4 && !selectedPerks.find(p => p.id === perk.id)) {
      set({ selectedPerks: [...selectedPerks, perk] });
    }
  },

  removePerk: (perkId) => {
    const { selectedPerks } = get();
    set({ selectedPerks: selectedPerks.filter(p => p.id !== perkId) });
  },

  addAddon: (addon) => {
    const { selectedAddons, selectedKiller } = get();
    // Check if addon is compatible with selected killer
    if (addon.killer && selectedKiller && addon.killer !== selectedKiller.name) {
      return; // Ignore incompatible addon
    }
    if (selectedAddons.length < 2 && !selectedAddons.find(a => a.id === addon.id)) {
      set({ selectedAddons: [...selectedAddons, addon] });
    }
  },

  removeAddon: (addonId) => {
    const { selectedAddons } = get();
    set({ selectedAddons: selectedAddons.filter(a => a.id !== addonId) });
  },

  setOffering: (offering) => set({ selectedOffering: offering }),

  setPlatform: (platform) => set({ selectedPlatform: platform }),

  reset: () => {
    set(initialState);
    socketService.emitBuildReset();
  },

  initializeSocket: () => {
    socketService.connect();
    
    socketService.onBuildUpdate((build: Build) => {
      set({
        selectedKiller: build.killer,
        selectedPerks: build.perks,
        selectedAddons: build.addons,
        selectedOffering: build.offering,
        selectedPlatform: build.platform,
      });
    });

    socketService.onBuildReset(() => {
      set(initialState);
    });
  },

  syncBuild: () => {
    const state = get();
    const build: Build = {
      killer: state.selectedKiller,
      perks: state.selectedPerks,
      addons: state.selectedAddons,
      offering: state.selectedOffering,
      platform: state.selectedPlatform,
    };
    socketService.emitBuildUpdate(build);
  },
})); 