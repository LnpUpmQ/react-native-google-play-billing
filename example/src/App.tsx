import * as React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  buy,
  isReady,
  onPurchasesUpdated,
  Purchase,
  queryProductDetails,
  startConnection,
} from 'react-native-google-play-billing';
import { useEffect } from 'react';

export default function App() {
  const [connecting, setConnecting] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<any>();
  const [error, setError] = React.useState<any>();
  const [productId, setProductId] = React.useState<string>('4500_test');
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);

  useEffect(() => {
    startConnection()
      .then(() => {
        setResult('连接成功');
      })
      .catch(setError)
      .finally(() => {
        setConnecting(false);
      });
  }, []);

  useEffect(() => {
    const sub = onPurchasesUpdated(setPurchases);
    return () => {
      sub.remove();
    };
  }, []);

  const onPressBuy = () => {
    (async () => {
      setLoading(true);
      try {
        if (productId) {
          const ready = await isReady();
          if (!ready) {
            await startConnection();
          }
          setResult(await buy(productId));
        }
      } catch (e) {
        console.log(e);
        setError(e);
      }
      setLoading(false);
    })();
  };

  const onPressDetail = () => {
    (async () => {
      setLoading(true);
      try {
        if (productId) {
          const ready = await isReady();
          if (!ready) {
            await startConnection();
          }
          setResult(JSON.stringify(await queryProductDetails([productId])));
        }
      } catch (e) {
        console.log(e);
        setError(e);
      }
      setLoading(false);
    })();
  };

  if (connecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputItem}>
        <TextInput
          style={styles.input}
          placeholder={'输入ProductID'}
          value={productId}
          onChangeText={setProductId}
          editable={!loading}
        />
        <Button title={'Detail'} onPress={onPressDetail} disabled={loading} />
        <Button title={'Buy'} onPress={onPressBuy} disabled={loading} />
      </View>

      <Text style={styles.result}>Result: {String(result)}</Text>
      <Text style={styles.error}>Error: {String(error)}</Text>

      <Modal visible={purchases?.length > 0}>
        <View style={styles.mask}>
          <View style={styles.modal}>
            <View style={styles.modal_header}>
              <Text style={styles.modal_title}>onPurchasesUpdated</Text>
            </View>
            <View style={styles.modal_body}>
              <Text>{JSON.stringify(purchases)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setPurchases([])}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 200,
    height: 38,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    lineHeight: 20,
  },

  result: {
    marginTop: 50,
    width: 300,
    height: 200,
    borderWidth: 1,
    padding: 10,
  },

  error: {
    marginTop: 10,
    width: 300,
    height: 200,
    borderWidth: 1,
    padding: 10,
  },

  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 300,
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  modal_title: {
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  modal_header: {
    padding: 10,
  },
  modal_body: {
    padding: 10,
  },

  close: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
});
