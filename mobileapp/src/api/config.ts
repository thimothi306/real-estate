import { Platform } from 'react-native';

/**
 * Where the Laravel API lives.
 *
 * A phone (or the Android emulator) cannot reach the dev machine's
 * "localhost" — that resolves to the device itself. So:
 *   - Android emulator: 10.0.2.2 is a special alias for the host machine.
 *   - Physical device:  use the dev machine's LAN IP, and start Laravel with
 *                       `php artisan serve --host=0.0.0.0` so it accepts
 *                       connections from outside localhost. Both the phone and
 *                       the computer must be on the same Wi-Fi network.
 *
 * Change LAN_HOST if your machine's IP changes.
 */
const LAN_HOST = '192.168.1.13';
const PORT = 8000;

const ANDROID_EMULATOR_HOST = '10.0.2.2';

/** Set to true only when running in an Android emulator rather than a real device. */
const USING_ANDROID_EMULATOR = false;

function resolveHost(): string {
  if (Platform.OS === 'android' && USING_ANDROID_EMULATOR) {
    return ANDROID_EMULATOR_HOST;
  }
  return LAN_HOST;
}

export const API_BASE_URL = `http://${resolveHost()}:${PORT}/api/v1`;
