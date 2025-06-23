import { create } from 'zustand';
import type { Killer, Perk, Addon, Offering, Platform, Build } from '../types';
import { realtimeService } from './realtimeService';

interface BuildState {
  selectedKiller: Killer | null;
  selectedPerks: Perk[];
  selectedAddons: Addon[];
  selectedOffering: Offering | null;
  selectedPlatform: Platform | null;
  isReceivingUpdate: boolean;
  
  // Actions
  setKiller: (killer: Killer | null, skipSync?: boolean) => void;
  addPerk: (perk: Perk, skipSync?: boolean) => void;
  removePerk: (perkId: string, skipSync?: boolean) => void;
  addAddon: (addon: Addon, skipSync?: boolean) => void;
  removeAddon: (addonId: string, skipSync?: boolean) => void;
  setOffering: (offering: Offering | null, skipSync?: boolean) => void;
  setPlatform: (platform: Platform | null, skipSync?: boolean) => void;
  reset: (skipSync?: boolean) => void;
  initializeRealtime: () => void;
  syncBuild: () => void;
}

const initialState = {
  selectedKiller: null,
  selectedPerks: [],
  selectedAddons: [],
  selectedOffering: null,
  selectedPlatform: null,
  isReceivingUpdate: false,
};

export const useBuildStore = create<BuildState>((set, get) => ({
  ...initialState,

  setKiller: (killer, skipSync = false) => {
    // Clear selected addons when killer changes since addons are killer-specific
    set({ selectedKiller: killer, selectedAddons: [] });
    if (!skipSync) get().syncBuild();
  },

  addPerk: (perk, skipSync = false) => {
    const { selectedPerks } = get();
    if (selectedPerks.length < 4 && !selectedPerks.find(p => p.id === perk.id)) {
      set({ selectedPerks: [...selectedPerks, perk] });
      if (!skipSync) get().syncBuild();
    }
  },

  removePerk: (perkId, skipSync = false) => {
    const { selectedPerks } = get();
    set({ selectedPerks: selectedPerks.filter(p => p.id !== perkId) });
    if (!skipSync) get().syncBuild();
  },

  addAddon: (addon, skipSync = false) => {
    const { selectedAddons, selectedKiller } = get();
    // Check if addon is compatible with selected killer
    if (addon.killer && selectedKiller && addon.killer !== selectedKiller.name) {
      return; // Ignore incompatible addon
    }
    if (selectedAddons.length < 2 && !selectedAddons.find(a => a.id === addon.id)) {
      set({ selectedAddons: [...selectedAddons, addon] });
      if (!skipSync) get().syncBuild();
    }
  },

  removeAddon: (addonId, skipSync = false) => {
    const { selectedAddons } = get();
    set({ selectedAddons: selectedAddons.filter(a => a.id !== addonId) });
    if (!skipSync) get().syncBuild();
  },

  setOffering: (offering, skipSync = false) => {
    set({ selectedOffering: offering });
    if (!skipSync) get().syncBuild();
  },

  setPlatform: (platform, skipSync = false) => {
    set({ selectedPlatform: platform });
    if (!skipSync) get().syncBuild();
  },

  reset: (skipSync = false) => {
    set(initialState);
    if (!skipSync) realtimeService.broadcastBuildReset();
  },

  initializeRealtime: () => {
    realtimeService.connect();
    
    realtimeService.onBuildUpdate((build: Build) => {
      // Set flag to prevent sync loop
      set({ isReceivingUpdate: true });
      
      // Apply the received build state without syncing back
      set({
        selectedKiller: build.killer,
        selectedPerks: build.perks,
        selectedAddons: build.addons,
        selectedOffering: build.offering,
        selectedPlatform: build.platform,
        isReceivingUpdate: false,
      });
    });

    realtimeService.onBuildReset(() => {
      set({ ...initialState, isReceivingUpdate: false });
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