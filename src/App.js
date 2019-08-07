/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { create } from 'apisauce';

import Juno from  './services/juno';

const App = () => {

  let checkout = new Juno.DirectCheckout('4E8CA0B07CB95BB41017F60BC3F53EBC3BB0DF250A94F200E50E0A8F812BAAE4', false);

  console.log('directChekoutJuno', checkout);

  var cardData = {
    cardNumber: '5207156147520886',
    holderName: 'Fulano de talz',
    securityCode: '261',
    expirationMonth: '12',
    expirationYear: '2020'
  };

  checkout.getCardHash(cardData, function(cardHash) {
      console.log('OKOK', cardHash);

      const api = create({
        baseURL: 'https://sandbox.boletobancario.com/boletofacil/integration/api/v1'
      });

      api.get('/issue-charge', { 
        token: 'DF62060597236517F0367F3371C5C25675B5286CECA2A92F1295A3F09B3AA980',
        description: 'produto teste',
        reference: '1234567890',
        amount: 2.31,
        payerName: 'Fulano de talz',
        payerCpfCnpj: '01146438060',
        payerEmail: 'juniorschroder@gmail.com',
        payerPhone: '55996228692',
        billingAddressStreet: 'Rua sao paulo',
        billingAddressNumber: '144',
        billingAddressComplement: 'apto 201',
        billingAddressNeighborhood: 'centro',
        billingAddressCity: 'Tres de Maio',
        billingAddressState: 'RS',
        billingAddressPostcode: '98910000',
        paymentTypes: 'CREDIT_CARD',
        creditCardHash: cardHash
      }).then((dados) => {
        console.log('DEU CERTO', dados);
      }, (erro) => {
        console.log('nao rolou', erro);
      })

  }, function(error) {
    console.log('ERRRROUUU', error);
  });

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.js</Text> to change this
                screen and then come back to see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.sectionDescription}>
                Read the docs to discover what to do next:
              </Text>
            </View>
            <LearnMoreLinks />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
