// Navbar.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, X, MapPin, Calendar, Map, Star, User, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Dashboard menu items
  const dashboardNavItems = [
    { name: 'Home', route: 'Landing', icon: Map },
    { name: 'Find Clinics', route: 'FindClinics', icon: Map },
    { name: 'My Appointments', route: 'Appointments', icon: Calendar },
    { name: 'Clinic Directory', route: 'Directory', icon: MapPin },
    { name: 'Reviews', route: 'Reviews', icon: Star },
    { name: 'Profile', route: 'Profile', icon: User },
  ];

  const handleNavPress = (path: string) => {
    // @ts-ignore
    navigation.navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('Signed out', 'You have been signed out.', [
      { text: 'OK', onPress: () => navigation.navigate('Login' as never) },
    ]);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View 
      style={{
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View style={{ paddingHorizontal: 16, height: 64 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <TouchableOpacity 
            onPress={() => handleNavPress('Landing')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <View style={{ width: 32, height: 32, backgroundColor: '#3b82f6', borderRadius: 8 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
              MediMap Care
            </Text>
          </TouchableOpacity>

          {/* Desktop Navigation */}
          {!isMobile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
              <TouchableOpacity onPress={() => handleNavPress('Landing')}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavPress('FindClinics')}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
                  Find Clinics
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavPress('Directory')}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
                  Clinic Directory
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Desktop Auth Buttons */}
          {!isMobile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity 
                onPress={() => handleNavPress('Login')}
                style={{ paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleNavPress('Signup')}
                style={{ 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: 'white' }}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <TouchableOpacity
              onPress={toggleMenu}
              style={{ padding: 8, borderRadius: 6 }}
            >
              {isOpen ? <X size={24} color="#1f2937" /> : <Menu size={24} color="#1f2937" />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu */}
      <Modal
        visible={isOpen && isMobile}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.container}>
          {/* Header in modal */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, backgroundColor: '#3b82f6', borderRadius: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                MediMap Care
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={{ padding: 8, borderRadius: 6 }}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* Dashboard Navigation Items */}
          <ScrollView style={styles.navList}>
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.navItem}
                  onPress={() => handleNavPress(item.route)}
                >
                  <Icon size={20} color="#333" />
                  <Text style={styles.navText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Auth Section */}
            <View style={styles.authSection}>
              <TouchableOpacity 
                onPress={() => handleNavPress('Login')}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleNavPress('Signup')}
                style={styles.signupButton}
              >
                <Text style={styles.signupButtonText}>Get Started</Text>
              </TouchableOpacity>
              
              {/* Sign Out Option */}
              <TouchableOpacity 
                onPress={handleSignOut}
                style={styles.signOutButton}
              >
                <LogOut size={20} color="#6b7280" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navList: {
    flex: 1,
    paddingVertical: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  authSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 20,
    gap: 12,
  },
  loginButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  signupButton: {
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
});

export default Navbar;