import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useShopStore, ShopItem } from '../../store/useShopStore';
import { useFocusStore } from '../../store/useFocusStore';
import { Card } from '../../components/ui/Card';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Ghost, Bell, Palette, Star, Shield, Check, SpeakerHigh } from 'phosphor-react-native';

export default function Shop() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { items, purchaseItem, equipItem, equippedItems, isOwned, isEquipped } = useShopStore();
  const { totalCoins } = useFocusStore();

  const getIcon = (item: ShopItem) => {
    const props = { size: 32, color: theme.colors.primary };
    switch (item.icon) {
      case 'Ghost': return <Ghost {...props} />;
      case 'Bell':
        return <Bell {...props} />;
      case 'SpeakerHigh':
        return <SpeakerHigh {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Shield': return <Shield {...props} />;
      default: return <Star {...props} />;
    }
  };

  const getTypeLabel = (type: ShopItem['type']) => {
    switch (type) {
      case 'remiSkin':
        return t('shop.typeRemiSkin');
      case 'timerSound':
        return t('shop.typeTimerSound');
      case 'theme':
        return t('shop.typeTheme');
      case 'badge':
        return t('shop.typeBadge');
      case 'streakShield':
        return t('shop.typeStreakShield');
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (!item.owned && item.price > 0) {
      purchaseItem(item.id, totalCoins);
    } else if (item.owned) {
      equipItem(item.id);
    }
  };

  const filteredItems = items.filter(i => i.price > 0); // Hide default free items

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('shop.title')}
        </Text>
        <CoinDisplay amount={totalCoins} size="lg" />
      </View>

      {/* Shop Items */}
      <View style={styles.itemsGrid}>
        {filteredItems.map((item) => {
          const owned = isOwned(item.id);
          const equipped = isEquipped(item.id);
          const canAfford = totalCoins >= item.price;

          return (
            <Card key={item.id} style={[styles.itemCard, equipped && styles.equippedCard]}>
              <View style={styles.iconContainer}>
                {getIcon(item)}
              </View>
              
              <Text style={[styles.itemType, { color: theme.colors.textSecondary }]}>
                {getTypeLabel(item.type)}
              </Text>
              
              <Text style={[styles.itemName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                {item.description}
              </Text>

              <TouchableOpacity
                onPress={() => handlePurchase(item)}
                style={[
                  styles.buyButton,
                  {
                    backgroundColor: owned
                      ? equipped
                        ? theme.colors.success
                        : theme.colors.surface
                      : canAfford
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                disabled={!owned && !canAfford}
              >
                {owned ? (
                  equipped ? (
                    <View style={styles.ownedContainer}>
                      <Check size={16} color="#fff" weight="bold" />
                      <Text style={styles.ownedText}>{t('shop.equipped')}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.buyButtonText, { color: theme.colors.text }]}>{t('shop.equip')}</Text>
                  )
                ) : (
                  <CoinDisplay amount={item.price} size="sm" />
                )}
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 24,
  },
  itemCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  equippedCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  iconContainer: {
    marginBottom: 8,
  },
  itemType: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  buyButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  ownedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
