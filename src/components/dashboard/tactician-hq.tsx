import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { DASHBOARD_STATIONS, type DashboardStation } from '@/constants/dashboard';

type TacticianHqProps = {
  onStationPress?: (stationId: string) => void;
};

export function TacticianHq({ onStationPress }: TacticianHqProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Tactician's Headquarters</Text>
        <Text style={styles.hint}>Choose your next move...</Text>
      </View>

      <View style={styles.grid}>
        {chunkStations(DASHBOARD_STATIONS).map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onPress={() => onStationPress?.(station.id)}
              />
            ))}
            {row.length === 1 ? <View style={styles.cardSpacer} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function chunkStations(stations: DashboardStation[]) {
  const rows: DashboardStation[][] = [];
  for (let i = 0; i < stations.length; i += 2) {
    rows.push(stations.slice(i, i + 2));
  }
  return rows;
}

type StationCardProps = {
  station: DashboardStation;
  onPress?: () => void;
};

function StationCard({ station, onPress }: StationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: station.backgroundColor,
          borderColor: station.borderColor,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={station.title}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <SymbolView
            // Icon names are curated ChessVanguard station symbols.
            name={station.icon as { ios: 'person.2.fill'; android: 'group'; web: 'group' }}
            size={22}
            tintColor={station.iconColor}
          />
        </View>
        {station.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{station.badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{station.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {station.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    gap: 2,
  },
  title: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  hint: {
    color: Brand.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 140,
    justifyContent: 'space-between',
    gap: 14,
  },
  cardSpacer: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: Brand.gold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '55%',
  },
  badgeText: {
    color: Brand.white,
    fontSize: 9,
    fontWeight: '800',
  },
  cardCopy: {
    gap: 4,
  },
  cardTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardDescription: {
    color: Brand.subtitle,
    fontSize: 11,
    lineHeight: 15,
  },
});
