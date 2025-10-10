// Navbar.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Menu, X, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const navLinks = [
    { name: 'Home', path: 'Landing' },
    { name: 'Find Clinics', path: 'FindClinics' },
    { name: 'How It Works', path: 'Landing' },
    { name: 'About', path: 'Landing' },
  ];

  const handleNavPress = (path: string) => {
    // @ts-ignore
    navigation.navigate(path);
    setIsOpen(false);
  };

  return (
    <View 
      style={{
        position: 'absolute',
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
            onPress={() => handleNavPress('Home')}
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
              {navLinks.map((link) => (
                <TouchableOpacity
                  key={link.name}
                  onPress={() => handleNavPress(link.path)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
                    {link.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
              onPress={() => setIsOpen(!isOpen)}
              style={{ padding: 8, borderRadius: 6 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu */}
      <Modal
        visible={isOpen && isMobile}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View 
          style={{
            flex: 1,
            backgroundColor: 'white',
            marginTop: 64,
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
          }}
        >
          <ScrollView style={{ padding: 16, gap: 12 }}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.name}
                onPress={() => handleNavPress(link.path)}
                style={{ 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937' }}>
                  {link.name}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ paddingTop: 16, gap: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
              <TouchableOpacity 
                onPress={() => handleNavPress('Login')}
                style={{ 
                  padding: 12, 
                  borderWidth: 1, 
                  borderColor: '#d1d5db',
                  borderRadius: 6,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500' }}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleNavPress('Signup')}
                style={{ 
                  padding: 12, 
                  backgroundColor: '#3b82f6',
                  borderRadius: 6,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: 'white' }}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Navbar;