import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{name}_MODULE: UNDER_SEALING</Text>
  </View>
);

export const ExploreScreen = () => <PlaceholderScreen name="EXPLORE" />;
export const CreateScreen = () => <PlaceholderScreen name="CREATE" />;
export const LibraryScreen = () => <PlaceholderScreen name="LIBRARY" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1614',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#3d322d',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});
