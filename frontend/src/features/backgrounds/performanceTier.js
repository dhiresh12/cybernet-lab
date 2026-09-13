// Performance Tier Utility
// Centralizes device capability detection and provides renderer-friendly configs.

import { AnimationLoop } from './animationLoop';

const { TIERS } = AnimationLoop;

function getTier() {
  return AnimationLoop.getTier();
}

function getParticleScale() {
  return AnimationLoop.getParticleScale();
}

function isLowEnd() {
  return AnimationLoop.shared().isLowEnd();
}

function prefersReducedMotion() {
  return AnimationLoop.shared().prefersReducedMotion();
}

function getTierConfig(tier) {
  switch (tier) {
    case TIERS.LOW:
      return {
        particleMultiplier: 0.25,
        connectionDistance: 0,
        starCount: 40,
        nodeCount: 8,
        animationSpeed: 0.5,
        glowEnabled: false,
        labelEnabled: false,
        blurEnabled: false,
        postProcess: false,
      };
    case TIERS.MEDIUM:
      return {
        particleMultiplier: 0.5,
        connectionDistance: 120,
        starCount: 150,
        nodeCount: 20,
        animationSpeed: 0.75,
        glowEnabled: true,
        labelEnabled: true,
        blurEnabled: false,
        postProcess: false,
      };
    default:
      return {
        particleMultiplier: 1,
        connectionDistance: 200,
        starCount: 400,
        nodeCount: 50,
        animationSpeed: 1,
        glowEnabled: true,
        labelEnabled: true,
        blurEnabled: true,
        postProcess: true,
      };
  }
}

function applyTierToCount(baseCount, tier) {
  const scale = getParticleScale();
  return Math.max(1, Math.floor(baseCount * scale));
}

export {
  getTier,
  getParticleScale,
  isLowEnd,
  prefersReducedMotion,
  getTierConfig,
  applyTierToCount,
  TIERS,
};

export default {
  getTier,
  getParticleScale,
  isLowEnd,
  prefersReducedMotion,
  getTierConfig,
  applyTierToCount,
  TIERS,
};
