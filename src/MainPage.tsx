import React, {useEffect, useState, useMemo} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {FontStyle} from './FontStyle';
import Header from './Header';
import Constant from './MainUrl';
import String from './String';
import axios from 'axios';

const MainPage = () => {
  const windowHeight = Dimensions.get('window').height;
  const [sharelistdata, setsharelistdata] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const getMainPageData = async () => {
    try {
      const response = await axios.get(Constant.MainUrl);
      setsharelistdata(response.data.data.userHolding);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data: ', error);
      setLoading(false);
    }
  };

  const handleOpenBottomSheet = () => {
    setIsBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  useEffect(() => {
    getMainPageData();
  }, []);

  let currentValue = sharelistdata.reduce((accumulator, {ltp, quantity}) => {
    return accumulator + ltp * quantity;
  }, 0);
  let totalInvestment = sharelistdata.reduce(
    (accumulator, {avgPrice, quantity}) => {
      return accumulator + avgPrice * quantity;
    },
    0,
  );
  let totalPL = currentValue - totalInvestment;
  let todayPL = sharelistdata.reduce((accumulator, {close, ltp, quantity}) => {
    return accumulator + (close - ltp) * quantity;
  }, 0);

  const renderListItem = ({item}: {item: any}) => {
    let avgPrice = item.avgPrice;
    let stockQuantity = item.quantity;
    let stockltp = item.ltp;
    let profitLoss = stockQuantity * stockltp - stockQuantity * avgPrice;

    return (
      <View style={styles.stocksListingContainer}>
        <View>
          <Text style={FontStyle.B14black}>{item.symbol}</Text>
          <Text style={FontStyle.S14black}>{item.quantity}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={FontStyle.S14black}>
            {String.ltp}
            {String.rupees_symbol}
            {item.ltp.toFixed(2)}
          </Text>
          <Text style={FontStyle.S14black}>
            {String.pl}
            {String.rupees_symbol}
            {profitLoss.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#D3D3D3'}}>
      <Header />
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#930078" />
        </View>
      ) : (
        <View style={{flex: 1}}>
          <FlatList
            data={sharelistdata}
            renderItem={renderListItem}
            showsVerticalScrollIndicator={true}
            key={({index}: {index: number}) => index.toString()}
          />
          <TouchableOpacity onPress={handleOpenBottomSheet} activeOpacity={1}>
            <View
              style={styles.portfolioContainer}
              onPress={handleOpenBottomSheet}>
              <View style={styles.digit_inline}>
                <Text style={FontStyle.B16black}>{String.p_l}:</Text>
                {!isBottomSheetOpen ? (
                  <Text style={FontStyle.B18black}>⬆️</Text>
                ) : null}
                <Text style={FontStyle.S16black}>
                  {String.rupees_symbol}
                  {totalPL.toFixed(2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isBottomSheetOpen}
            onRequestClose={handleCloseBottomSheet}>
            <View
              style={[styles.bottomSheet, {height: windowHeight * 0.18}]}
              onTouchEnd={handleCloseBottomSheet}>
              <Text
                onPress={handleCloseBottomSheet}
                style={[FontStyle.B18black, {alignSelf: 'center'}]}>
                ⬇️
              </Text>
              <View style={styles.digit_inline}>
                <Text style={FontStyle.B16black}>{String.cur_value}:</Text>
                <Text style={FontStyle.S16black}>
                  {String.rupees_symbol}
                  {currentValue.toFixed(2)}
                </Text>
              </View>
              <View style={styles.digit_inline}>
                <Text style={FontStyle.B16black}>{String.total_inv}:</Text>
                <Text style={FontStyle.S16black}>
                  {String.rupees_symbol}
                  {totalInvestment.toFixed(2)}
                </Text>
              </View>
              <View style={styles.digit_inline}>
                <Text style={FontStyle.B16black}>{String.today_P_L}:</Text>
                <Text style={FontStyle.S16black}>
                  {String.rupees_symbol}
                  {todayPL.toFixed(2)}
                </Text>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MainPage;

const styles = StyleSheet.create({
  stocksListingContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    backgroundColor: '#ffffff',
    borderColor: '#D3D3D3',
  },
  portfolioContainer: {
    padding: 10,
    backgroundColor: '#dab4da',
  },
  digit_inline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom: 40,
    backgroundColor: '#dab4da',
  },
});
