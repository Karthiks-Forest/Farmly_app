import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const SettingsScreen = () => {
  const {t, i18n} = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  // Change language and persist it
  const changeLanguage = async lang => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    await EncryptedStorage.setItem('appLanguage', lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Settings')}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguage('en')}>
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguage('hi')}>
        <Text style={styles.buttonText}>हिन्दी (Hindi)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguage('ta')}>
        <Text style={styles.buttonText}>தமிழ் (Tamil)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => changeLanguage('te')}>
        <Text style={styles.buttonText}>తెలుగు (Telugu)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212121',
  },
  button: {
    backgroundColor: '#008CBA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
