import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = FileSystem.documentDirectory + 'photos/';

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

export async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    quality: 0.7,
    allowsEditing: true,
    aspect: [4, 3],
  });
  return result.canceled ? null : result.assets[0].uri;
}

export async function pickFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    quality: 0.7,
    allowsEditing: true,
    aspect: [4, 3],
  });
  return result.canceled ? null : result.assets[0].uri;
}

export async function savePhoto(tempUri: string): Promise<string> {
  await ensureDir();
  const filename = `${Date.now()}.jpg`;
  const dest = PHOTOS_DIR + filename;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
}

export async function deletePhoto(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}
