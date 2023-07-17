import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Today from './Today';
import Upcomming from './Upcomming';
import Results from './Results';
import Icon from 'react-native-vector-icons/Ionicons';
import { useWindowDimensions } from 'react-native';
import { AppState } from 'react-native';
import React, { useRef, useEffect } from 'react';  
import { AppOpenAd  } from 'react-native-google-mobile-ads';
import { useSelector } from 'react-redux';



const Tab = createBottomTabNavigator();

export default function HomeTab() {

  const data =  useSelector((state)=>state.data);
  const {fontScale} = useWindowDimensions();
  const appState = useRef(AppState.currentState);

  // const adUnitId = 'ca-app-pub-4487344159300856/6974388997' ;

  // let appOpenAd

  // if(data?.personal){
  //   try{
  //     if(!appOpenAd?.loaded){
  //       appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
  //         requestNonPersonalizedAdsOnly: !data.personal.allowed,
  //       });
  //       appOpenAd.load()
  //     }

  //   }catch(err){
  //     console.log(err)
  //   }

  // }
  
  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', nextAppState => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === 'active'
  //     ) {
  //       if(appOpenAd?.loaded){
  //         appOpenAd.show()
  //         appOpenAd.load()
  //       }else{
  //         appOpenAd?.load()
  //       }
  //     }
    
  //     appState.current = nextAppState;
  //   });
  
  //   return () => {
  //     subscription.remove();
  //   };
  // }, [appOpenAd]);


  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12/fontScale
        }
      }}
      >
        <Tab.Screen name="Today" component={Today} options={{
          tabBarIcon: ({})=>{
            return(
              <Icon name="today-outline" size={20/fontScale} color={'black'}></Icon>
            )
          }
        }} />
        <Tab.Screen name="Upcomming" component={Upcomming} options={{
          headerTitle: 'Upcomming - Next 20',
          tabBarIcon: ({})=>{
            return(
              <Icon name="arrow-redo-outline" size={20/fontScale} color={'black'}></Icon>
            )
          }
        }} />
        <Tab.Screen name="Results" component={Results} options={{
          headerTitle: 'Results - Last 20',
          tabBarIcon: ({})=>{
            return(
              <Icon name="newspaper-outline" size={20/fontScale} color={'black'}></Icon>
            )
          }
        }} />
  </Tab.Navigator>
  )
}
