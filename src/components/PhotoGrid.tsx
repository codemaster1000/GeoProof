// Photo Grid Component
// FR-019: View project photos sequentially in a clean grid

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { format } from 'date-fns';
import { Photo } from '../db/schema';
import { Colors, Typography, Radius } from '../constants/theme';

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const ITEM_SIZE = (width - 4) / COLUMNS;

interface PhotoGridProps {
  photos: Photo[];
  onPhotoPress: (photo: Photo) => void;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
}

const PhotoItem: React.FC<{ photo: Photo; onPress: () => void }> = ({ photo, onPress }) => (
  <TouchableOpacity
    style={styles.photoItem}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={`Photo taken at ${photo.capturedAt}`}
  >
    <Image
      source={{ uri: photo.stampedUri }}
      style={styles.photo}
      resizeMode="cover"
    />
    {photo.notes ? (
      <View style={styles.noteBadge}>
        <Text style={styles.noteIcon}>📝</Text>
      </View>
    ) : null}
    <View style={styles.photoOverlay}>
      <Text style={styles.photoTime} numberOfLines={1}>
        {format(new Date(photo.capturedAt), 'HH:mm')}
      </Text>
    </View>
  </TouchableOpacity>
);

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoPress,
  ListHeaderComponent,
  ListEmptyComponent,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: Photo }) => (
      <PhotoItem photo={item} onPress={() => onPhotoPress(item)} />
    ),
    [onPhotoPress]
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={COLUMNS}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  row: {
    gap: 2,
    marginBottom: 2,
  },
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.sm,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIcon: {
    fontSize: 10,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  photoTime: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
  },
});
