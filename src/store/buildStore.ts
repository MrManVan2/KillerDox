import { create } from 'zustand';
import type { Killer, Perk, Addon, Offering, Platform, Build } from '../types';
import { realtimeService } from './realtimeService';

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
  initializeRealtime: () => void;
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
    // Clear selected addons when killer changes since addons are killer-specific
    set({ selectedKiller: killer, selectedAddons: [] });
    get().syncBuild();
  },

  addPerk: (perk) => {
    const { selectedPerks } = get();
    if (selectedPerks.length < 4 && !selectedPerks.find(p => p.id === perk.id)) {
      set({ selectedPerks: [...selectedPerks, perk] });
      get().syncBuild();
    }
  },

  removePerk: (perkId) => {
    const { selectedPerks } = get();
    set({ selectedPerks: selectedPerks.filter(p => p.id !== perkId) });
    get().syncBuild();
  },

  addAddon: (addon) => {
    const { selectedAddons, selectedKiller } = get();
    // Check if addon is compatible with selected killer
    if (addon.killer && selectedKiller && addon.killer !== selectedKiller.name) {
      return; // Ignore incompatible addon
    }
    if (selectedAddons.length < 2 && !selectedAddons.find(a => a.id === addon.id)) {
      set({ selectedAddons: [...selectedAddons, addon] });
      get().syncBuild();
    }
  },

  removeAddon: (addonId) => {
    const { selectedAddons } = get();
    set({ selectedAddons: selectedAddons.filter(a => a.id !== addonId) });
    get().syncBuild();
  },

  setOffering: (offering) => {
    set({ selectedOffering: offering });
    get().syncBuild();
  },

  setPlatform: (platform) => {
    set({ selectedPlatform: platform });
    get().syncBuild();
  },

  reset: () => {
    set(initialState);
    realtimeService.broadcastBuildReset();
  },

  initializeRealtime: () => {
    realtimeService.connect();
    
    realtimeService.onBuildUpdate((build: Build) => {
      set({
        selectedKiller: build.killer,
        selectedPerks: build.perks,
        selectedAddons: build.addons,
        selectedOffering: build.offering,
        selectedPlatform: build.platform,
      });
    });

    realtimeService.onBuildReset(() => {
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
    realtimeService.broadcastBuildUpdate(build);
  },
})); 