import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Navbar from "../compontents/Navbar";
import Hero from "../compontents/landing/Hero";
import Features from "../compontents/landing/Features";
import HowItWorks from "../compontents/landing/HowItWorks";
import CTA from "../compontents/landing/CTA";
import Footer from "../compontents/landing/Footer";

const Landing = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff", // Replace with your theme color if needed
  },
});

export default Landing;
