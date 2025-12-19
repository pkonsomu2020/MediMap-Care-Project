import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NotFound = () => {
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", route.name);
  }, [route.name]);

  const handleGoHome = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <TouchableOpacity onPress={handleGoHome}>
          <Text style={styles.link}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#4b5563',
    marginBottom: 16,
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default NotFound;