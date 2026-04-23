import { create } from 'zustand';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'remiSkin' | 'streakShield' | 'timerSound' | 'theme' | 'badge';
  icon: string;
  owned: boolean;
}

interface ShopState {
  items: ShopItem[];
  purchasedItems: string[];
  equippedItems: {
    remiSkin: string | null;
    timerSound: string | null;
    theme: string | null;
  };
  
  // Actions
  purchaseItem: (itemId: string, availableCoins: number) => boolean;
  equipItem: (itemId: string) => void;
  getItemsByType: (type: ShopItem['type']) => ShopItem[];
  isOwned: (itemId: string) => boolean;
  isEquipped: (itemId: string) => boolean;
}

const DEFAULT_ITEMS: ShopItem[] = [
  // Remi Skins
  { id: 'remi_blue', name: 'Classic Blue', description: 'The original Remi', price: 0, type: 'remiSkin', icon: 'Ghost', owned: true },
  { id: 'remi_pink', name: 'Sakura Pink', description: 'Soft and lovely', price: 100, type: 'remiSkin', icon: 'Ghost', owned: false },
  { id: 'remi_gold', name: 'Golden Glow', description: 'Shine bright', price: 200, type: 'remiSkin', icon: 'Ghost', owned: false },
  
  // Timer Sounds
  { id: 'sound_bell', name: 'Gentle Bell', description: 'Soft chime', price: 50, type: 'timerSound', icon: 'Bell', owned: false },
  { id: 'sound_gong', name: 'Tibetan Gong', description: 'Deep resonance', price: 100, type: 'timerSound', icon: 'SpeakerHigh', owned: false },
  
  // Themes
  { id: 'theme_sunset', name: 'Sunset Vibes', description: 'Warm gradients', price: 150, type: 'theme', icon: 'Palette', owned: false },
  { id: 'theme_matcha', name: 'Matcha Calm', description: 'Zen greens', price: 150, type: 'theme', icon: 'Palette', owned: false },
  
  // Badges
  { id: 'badge_star', name: 'Star Collector', description: 'Shiny badge', price: 300, type: 'badge', icon: 'Star', owned: false },
  
  // Streak Shields
  { id: 'shield_1', name: 'Streak Shield', description: 'Protect your streak', price: 200, type: 'streakShield', icon: 'Shield', owned: false },
];

export const useShopStore = create<ShopState>((set, get) => ({
      items: DEFAULT_ITEMS,
      purchasedItems: ['remi_blue'],
      equippedItems: {
        remiSkin: 'remi_blue',
        timerSound: null,
        theme: null,
      },

      purchaseItem: (itemId, availableCoins) => {
        const { items, purchasedItems } = get();
        const item = items.find(i => i.id === itemId);
        
        if (!item || item.owned || availableCoins < item.price) {
          return false;
        }

        const updatedItems = items.map(i =>
          i.id === itemId ? { ...i, owned: true } : i
        );

        set({
          items: updatedItems,
          purchasedItems: [...purchasedItems, itemId],
        });

        return true;
      },

      equipItem: (itemId) => {
        const { items, equippedItems } = get();
        const item = items.find(i => i.id === itemId);
        
        if (!item || !item.owned) return;

        set({
          equippedItems: {
            ...equippedItems,
            [item.type]: itemId,
          },
        });
      },

      getItemsByType: (type) => {
        return get().items.filter(item => item.type === type);
      },

      isOwned: (itemId) => {
        return get().purchasedItems.includes(itemId);
      },

      isEquipped: (itemId) => {
        const { equippedItems } = get();
        return Object.values(equippedItems).includes(itemId);
      },
}));
