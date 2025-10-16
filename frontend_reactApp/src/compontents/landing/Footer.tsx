import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
} from "react-native";
import { MapPin, Mail, Phone } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";

const footerLinks = {
  product: [
    { name: "Find Clinics", path: "/dashboard/find-clinics" },
    { name: "Book Appointment", path: "/dashboard/appointments" },
    { name: "Reviews", path: "/dashboard/reviews" },
    { name: "Pricing", path: "#" },
  ],
  company: [
    { name: "About Us", path: "#about" },
    { name: "Careers", path: "#" },
    { name: "Blog", path: "#" },
    { name: "Contact", path: "#" },
  ],
  support: [
    { name: "Help Center", path: "#" },
    { name: "Privacy Policy", path: "#" },
    { name: "Terms of Service", path: "#" },
    { name: "FAQs", path: "#" },
  ],
};

type FontAwesomeName = React.ComponentProps<typeof FontAwesome>['name'];

const socialLinks: { name: FontAwesomeName; href: string ; label: string }[] = [
  { name: 'facebook', href: process.env.FACEBOOK_URL, label: 'Facebook' },
  { name: 'twitter', href: process.env.TWITTER_URL, label: 'Twitter' },
  { name: 'instagram', href: process.env.INSTAGRAM_URL, label: 'Instagram' },
  { name: 'linkedin', href: process.env.LINKEDIN_URL, label: 'LinkedIn' },
];

export default function Footer() {
  const openLink = (url: string) => Linking.openURL(url);

  return (
    <View style={styles.footerContainer}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Brand Info */}
          <View style={styles.brandContainer}>
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>MediMap Care</Text>
            </View>

            <Text style={styles.brandText}>
              Making healthcare accessible and efficient for everyone. Find
              quality clinics near you and book appointments with ease.
            </Text>

            <View style={styles.contactContainer}>
              <View style={styles.contactRow}>
                <Mail size={16} color="#6B7280" />
                <Text style={styles.contactText}>
                  {process.env.CONTACT_EMAIL}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Phone size={16} color="#6B7280" />
                <Text style={styles.contactText}>{process.env.CONTACT_PHONE}</Text>
              </View>
            </View>
          </View>

          {/* Links Columns */}
          <View style={styles.linksContainer}>
            <FooterColumn title="Product" links={footerLinks.product} />
            <FooterColumn title="Company" links={footerLinks.company} />
            <FooterColumn title="Support" links={footerLinks.support} />
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.copyText}>
            © 2025 MediMap Care. All rights reserved.
          </Text>

          <View style={styles.socialContainer}>
            {socialLinks.map((social) => {
              return (
                <TouchableOpacity
                  key={social.label}
                  onPress={() => openLink(social.href)}
                  accessibilityLabel={social.label}
                  style={styles.socialButton}
                >
                  <FontAwesome name={social.name} size={20} color="#374151" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* --- Subcomponent for link columns --- */
const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { name: string; path: string }[];
}) => {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.name}
          onPress={() => Linking.openURL(link.path)}
        >
          <Text style={styles.linkText}>{link.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* --- Styles --- */
const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  content: {
    padding: 20,
  },
  topSection: {
    flexDirection: "column",
    marginBottom: 30,
  },
  brandContainer: {
    marginBottom: 30,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },
  brandText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  contactContainer: {
    gap: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    color: "#6B7280",
    fontSize: 13,
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  column: {
    width: "30%",
    marginBottom: 20,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  linkText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  copyText: {
    fontSize: 12,
    color: "#6B7280",
  },
  socialContainer: {
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
