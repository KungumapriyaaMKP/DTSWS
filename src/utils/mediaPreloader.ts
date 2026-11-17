import { PHOTO_ASSETS } from '../data/dhoniData';

let preloadStarted = false;

/**
 * Warms all local editorial photography into the browser cache in small batches
 * so below-the-fold sections render instantaneously with zero grey placeholders.
 */
export function preloadEditorialMedia(): void {
  if (preloadStarted || typeof window === 'undefined') return;
  preloadStarted = true;

  const prioritizedKeys = [
    'chepaukNight',
    'csk2018Match',
    'chepaukYellowStands',
    'chepaukFloodlight',
    'chepaukCrowd2013',
    'cskChepaukKKR',
    'dhoniBatting',
    'dhoniJersey7',
    'dhoniEarlyPortrait',
    'dhoniKitBat',
  ];

  const orderedUrls: string[] = [];
  const seen = new Set<string>();

  for (const key of prioritizedKeys) {
    const asset = PHOTO_ASSETS[key];
    if (asset && !seen.has(asset.src)) {
      seen.add(asset.src);
      orderedUrls.push(asset.src);
    }
  }

  for (const asset of Object.values(PHOTO_ASSETS)) {
    if (!seen.has(asset.src)) {
      seen.add(asset.src);
      orderedUrls.push(asset.src);
    }
  }

  const warmSingle = (src: string): Promise<void> =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      };
      img.onerror = () => resolve();
      img.src = src;
    });

  const runQueue = async () => {
    const batchSize = 4;
    for (let i = 0; i < orderedUrls.length; i += batchSize) {
      await Promise.all(orderedUrls.slice(i, i + batchSize).map(warmSingle));
    }
  };

  window.setTimeout(() => {
    void runQueue();
  }, 450);
}
